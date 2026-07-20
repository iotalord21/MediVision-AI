import sys
import asyncio
import time
import httpx

# Ensure UTF-8 output encoding for Windows terminal
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from app.main import app
from app.database.mongodb import db, init_db

BASE_URL = "http://test"

test_user_email = f"test_{int(time.time())}@example.com"
test_user_password = "SecurePassword123!"
test_user_name = "Test User"


async def run_tests():
    print("Starting Authentication & Database Verification...")

    # 1. Initialize DB (Index creation)
    await init_db()

    # Verify indexes on users collection
    indexes = await db.users.index_information()
    print("Current MongoDB 'users' Indexes:", list(indexes.keys()))
    assert any("email" in idx for idx in indexes.keys()), "Unique index on email not found!"
    print("SUCCESS: Index Check Passed - Unique index on email exists.")

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url=BASE_URL) as client:

        # 2. Register user
        print(f"\n1. Registering user with email: {test_user_email}")
        reg_payload = {
            "full_name": test_user_name,
            "email": test_user_email,
            "password": test_user_password
        }
        res = await client.post("/api/v1/auth/register", json=reg_payload)
        print("Registration status:", res.status_code)
        reg_data = res.json()
        print("Registration response:", reg_data)

        assert res.status_code == 201, f"Registration failed: {reg_data}"
        assert "access_token" in reg_data, "No access_token returned in registration"
        assert reg_data["user"]["email"] == test_user_email.lower()
        assert "created_at" in reg_data["user"], "created_at missing from user response"
        assert "updated_at" in reg_data["user"], "updated_at missing from user response"
        assert "role" not in reg_data["user"], "role should not be present in user response"
        print("SUCCESS: User Registration Passed!")

        # 3. Test Duplicate Registration Error
        print("\n2. Testing duplicate registration rejection...")
        res_dup = await client.post("/api/v1/auth/register", json=reg_payload)
        print("Duplicate registration status:", res_dup.status_code)
        assert res_dup.status_code == 400, "Duplicate email registration was not rejected!"
        print("SUCCESS: Duplicate Email Check Passed (HTTP 400 received).")

        # 4. Login with valid credentials
        print("\n3. Logging in with valid credentials...")
        login_payload = {
            "email": test_user_email,
            "password": test_user_password
        }
        res_login = await client.post("/api/v1/auth/login", json=login_payload)
        print("Login status:", res_login.status_code)
        login_data = res_login.json()
        assert res_login.status_code == 200, f"Login failed: {login_data}"
        token = login_data["access_token"]
        print("SUCCESS: Login Passed! Token generated successfully.")

        # 5. Login with invalid password
        print("\n4. Testing login with wrong password...")
        bad_login = await client.post("/api/v1/auth/login", json={
            "email": test_user_email,
            "password": "WrongPassword!"
        })
        print("Bad login status:", bad_login.status_code)
        assert bad_login.status_code == 401, "Invalid password was not rejected!"
        print("SUCCESS: Wrong Password Check Passed (HTTP 401 received).")

        # 6. Access /me protected endpoint with token
        print("\n5. Accessing protected /api/v1/auth/me with Bearer token...")
        headers = {"Authorization": f"Bearer {token}"}
        res_me = await client.get("/api/v1/auth/me", headers=headers)
        print("Profile status:", res_me.status_code)
        me_data = res_me.json()
        print("Profile data:", me_data)
        assert res_me.status_code == 200, f"/me failed: {me_data}"
        assert me_data["email"] == test_user_email.lower()
        print("SUCCESS: Protected Route Check Passed!")

        # 7. Access /me without token
        print("\n6. Accessing /me without Authorization header...")
        res_no_auth = await client.get("/api/v1/auth/me")
        assert res_no_auth.status_code in (401, 403), "Unauthenticated request was not blocked!"
        print("SUCCESS: Unauthenticated Request Check Passed!")

    # Cleanup test user from MongoDB
    print("\nCleaning up test user from MongoDB...")
    await db.users.delete_one({"email": test_user_email.lower()})
    print("SUCCESS: Cleanup finished.")
    print("\nALL AUTHENTICATION TESTS PASSED SUCCESSFULLY!")


if __name__ == "__main__":
    asyncio.run(run_tests())

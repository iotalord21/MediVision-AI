# MediVision AI 🚀 Deployment & Docker Guide

This guide provides step-by-step instructions to run **MediVision AI** locally with Docker Compose and deploy to production services:
- **Frontend** → Vercel
- **Backend** → Render or Railway
- **Database** → MongoDB Atlas

---

## 🐳 1. Running Locally with Docker Compose

To build and run all 3 services (Frontend, FastAPI Backend, MongoDB) locally in isolated containers:

```bash
# From the root project directory:
docker-compose up --build
```

### Local URLs:
- **Frontend App**: `http://localhost`
- **FastAPI REST API Docs**: `http://localhost:8000/docs`
- **MongoDB Database**: `mongodb://localhost:27017`

To stop containers:
```bash
docker-compose down
```

---

## 🍃 2. Database Setup: MongoDB Atlas

1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a **Shared / Free Tier Cluster** (M0).
3. **Database Access**: Create a Database User with a username and strong password.
4. **Network Access**: Add IP Address `0.0.0.0/0` (Allow access from anywhere) so cloud providers (Render/Railway) can connect.
5. **Connection String**: Click **Connect** → **Drivers** and copy your URI connection string:
   ```env
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

---

## ⚡ 3. Backend Deployment: Render or Railway

### Option A: Render
1. Push your code to GitHub.
2. Log in to [Render](https://render.com/).
3. Click **New +** → **Web Service**.
4. Connect your GitHub Repository:
   - **Root Directory**: `backend`
   - **Environment**: `Docker`
   - **Dockerfile Path**: `./Dockerfile`
5. Add **Environment Variables**:
   - `MONGODB_URL`: Your MongoDB Atlas connection URI string
   - `DATABASE_NAME`: `medivision_ai`
   - `SECRET_KEY`: `<Generate a random secret string>`
   - `ALGORITHM`: `HS256`
   - `ACCESS_TOKEN_EXPIRE_MINUTES`: `60`
6. Click **Create Web Service**. Your API live URL will look like:
   `https://medivision-backend.onrender.com`

### Option B: Railway
1. Log in to [Railway](https://railway.app/).
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select your repository.
4. In Service Settings:
   - **Root Directory**: `backend`
   - **Build**: Uses `backend/Dockerfile` automatically.
5. In **Variables**, add `MONGODB_URL`, `DATABASE_NAME`, `SECRET_KEY`, `ALGORITHM`.
6. Click **Generate Domain**. Your API live URL will look like:
   `https://medivision-production.up.railway.app`

---

## 📐 4. Frontend Deployment: Vercel

1. Log in to [Vercel](https://vercel.com/).
2. Click **Add New...** → **Project**.
3. Import your GitHub repository.
4. Framework Preset: **Vite**.
5. **Root Directory**: Click `Edit` and select `frontend`.
6. Expand **Environment Variables**:
   - `VITE_API_BASE_URL`: `https://medivision-backend.onrender.com/api/v1` (replace with your live backend API URL).
7. Click **Deploy**. Vercel will build your SPA and provide a custom live URL (e.g. `https://medivision-ai.vercel.app`).

---

## 🔐 Environment Variables Matrix

| Component | Variable | Purpose |
| :--- | :--- | :--- |
| **Backend** | `MONGODB_URL` | Connection string to MongoDB Atlas or local Mongo instance |
| **Backend** | `DATABASE_NAME` | Name of MongoDB database (default `medivision_ai`) |
| **Backend** | `SECRET_KEY` | Secret key for signing JWT tokens |
| **Backend** | `ALGORITHM` | JWT hashing algorithm (`HS256`) |
| **Frontend** | `VITE_API_BASE_URL` | Base REST API URL of deployed backend (e.g., `https://backend.onrender.com/api/v1`) |

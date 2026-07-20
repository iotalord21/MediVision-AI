from pydantic import BaseModel, Field


class KidneyRequest(BaseModel):
    age: float = Field(..., ge=0)
    bp: float = Field(..., ge=0)
    sg: float = Field(..., gt=0)
    al: float = Field(..., ge=0)
    su: float = Field(..., ge=0)
    rbc: str
    pc: str
    pcc: str
    ba: str
    bgr: float = Field(..., ge=0)
    bu: float = Field(..., ge=0)
    sc: float = Field(..., ge=0)
    sod: float = Field(..., ge=0)
    pot: float = Field(..., ge=0)
    hemo: float = Field(..., ge=0)
    pcv: str
    wc: str
    rc: str
    htn: str
    dm: str
    cad: str
    appet: str
    pe: str
    ane: str
from pydantic import BaseModel, Field


class LiverRequest(BaseModel):
    age: int = Field(..., ge=0)
    gender: str
    tot_bilirubin: float = Field(..., ge=0)
    direct_bilirubin: float = Field(..., ge=0)
    tot_proteins: float = Field(..., ge=0)
    albumin: float = Field(..., ge=0)
    ag_ratio: float = Field(..., ge=0)
    sgpt: float = Field(..., ge=0)
    sgot: float = Field(..., ge=0)
    alkphos: float = Field(..., ge=0)
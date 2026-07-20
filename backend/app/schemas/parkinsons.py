from pydantic import BaseModel, Field


class ParkinsonsRequest(BaseModel):
    mdvp_fo: float = Field(..., gt=0, alias="MDVP:Fo(Hz)")
    mdvp_fhi: float = Field(..., gt=0, alias="MDVP:Fhi(Hz)")
    mdvp_flo: float = Field(..., gt=0, alias="MDVP:Flo(Hz)")
    mdvp_jitter_percent: float = Field(..., ge=0, alias="MDVP:Jitter(%)")
    mdvp_jitter_abs: float = Field(..., ge=0, alias="MDVP:Jitter(Abs)")
    mdvp_rap: float = Field(..., ge=0, alias="MDVP:RAP")
    mdvp_ppq: float = Field(..., ge=0, alias="MDVP:PPQ")
    jitter_ddp: float = Field(..., ge=0, alias="Jitter:DDP")
    mdvp_shimmer: float = Field(..., ge=0, alias="MDVP:Shimmer")
    mdvp_shimmer_db: float = Field(..., ge=0, alias="MDVP:Shimmer(dB)")
    shimmer_apq3: float = Field(..., ge=0, alias="Shimmer:APQ3")
    shimmer_apq5: float = Field(..., ge=0, alias="Shimmer:APQ5")
    mdvp_apq: float = Field(..., ge=0, alias="MDVP:APQ")
    shimmer_dda: float = Field(..., ge=0, alias="Shimmer:DDA")
    nhr: float = Field(..., ge=0, alias="NHR")
    hnr: float = Field(..., ge=0, alias="HNR")
    rpde: float = Field(..., ge=0, alias="RPDE")
    dfa: float = Field(..., ge=0, alias="DFA")
    spread1: float
    spread2: float
    d2: float = Field(..., ge=0, alias="D2")
    ppe: float = Field(..., ge=0, alias="PPE")

    model_config = {
        "populate_by_name": True
    }
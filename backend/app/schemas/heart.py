from typing import Union, Optional
from pydantic import BaseModel, Field


class HeartRequest(BaseModel):
    age: float = Field(..., ge=0)
    sex: Union[int, str]
    cp: Union[int, str]
    trestbps: float = Field(..., ge=0)
    chol: float = Field(..., ge=0)
    fbs: Union[int, str, bool]
    restecg: Union[int, str]
    thalach: Optional[float] = None
    thalch: Optional[float] = None
    exang: Union[int, str, bool]
    oldpeak: float = Field(..., ge=0)
    slope: Optional[Union[int, str]] = 0
    ca: Optional[Union[int, str]] = 0
    thal: Optional[Union[int, str]] = 0

    model_config = {
        "populate_by_name": True
    }
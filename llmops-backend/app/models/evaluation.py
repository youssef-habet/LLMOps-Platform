from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class EvaluationCreate(BaseModel):
    name: str
    model_id: str
    dataset_id: str
    metrics: List[str]

class EvaluationResponse(BaseModel):
    id: str
    name: str
    model_id: str
    dataset_id: str
    metrics: List[str]
    status: str
    results: List[Dict[str, Any]]
    overall_score: float
    created_at: str
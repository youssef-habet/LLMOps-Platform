from pydantic import BaseModel
from typing import Optional, Dict, Any

class MetricBase(BaseModel):
    name: str
    metric_type: str
    description: Optional[str] = None
    config: Optional[Dict[str, Any]] = {}

class MetricCreate(MetricBase):
    pass

class MetricResponse(MetricBase):
    id: str
    created_at: str
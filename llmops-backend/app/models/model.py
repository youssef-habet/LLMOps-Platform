from pydantic import BaseModel
from typing import Optional, Dict, Any

class ModelBase(BaseModel):
    name: str
    provider: str
    version: str
    temperature: float = 0.7
    max_tokens: int = 1000
    top_p: float = 1.0
    endpoint_url: Optional[str] = None
    system_prompt: Optional[str] = None
    api_key_ref: Optional[str] = None
    default_params: Optional[Dict[str, Any]] = None

class ModelCreate(ModelBase):
    pass

class ModelResponse(ModelBase):
    id: str
    created_at: str
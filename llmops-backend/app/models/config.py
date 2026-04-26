from pydantic import BaseModel
from typing import Optional

class ConfigBase(BaseModel):
    name: str
    temperature: float = 0.7
    max_tokens: int = 1000
    top_p: float = 1.0
    system_prompt: Optional[str] = ""

class ConfigCreate(ConfigBase):
    pass

class ConfigResponse(ConfigBase):
    id: str
    created_at: str
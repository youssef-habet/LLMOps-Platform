from pydantic import BaseModel
from typing import Optional

class DatasetBase(BaseModel):
    name: str
    task_type: str

class DatasetCreate(DatasetBase):
    pass

class DatasetResponse(BaseModel):
    id: str
    name: str
    task_type: str
    file_path: str
    version: int
    row_count: Optional[int] = 0
    file_size_bytes: int
    file_ext: str
    is_valid: bool
    created_at: str
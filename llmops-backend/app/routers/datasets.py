from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from app.core.database import supabase
from app.models.dataset import DatasetResponse
import uuid
import csv
import json
from io import StringIO

router = APIRouter(prefix="/api/datasets", tags=["Datasets"])

@router.get("", response_model=list[DatasetResponse])
async def get_datasets():
    try:
        response = supabase.table("datasets").select("*").order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("", response_model=DatasetResponse)
async def upload_dataset(name: str = Form(...), task_type: str = Form(...), file: UploadFile = File(...)):
    try:
        file_bytes = await file.read()
        file_ext = file.filename.split('.')[-1].lower()
        storage_path = f"{task_type}/{uuid.uuid4()}.{file_ext}"
        
        file_size_bytes = len(file_bytes)
        
        supabase.storage.from_("datasets").upload(
            file=file_bytes, path=storage_path, file_options={"content-type": file.content_type}
        )
        
        db_response = supabase.table("datasets").insert({
            "name": name, 
            "task_type": task_type, 
            "file_path": storage_path, 
            "file_size_bytes": file_size_bytes,
            "file_ext": file_ext,
            "is_valid": True, 
            "version": 1
        }).execute()
        return db_response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{dataset_id}")
async def delete_dataset(dataset_id: str):
    try:
        db_res = supabase.table("datasets").select("file_path").eq("id", dataset_id).execute()
        if not db_res.data:
            raise HTTPException(status_code=404, detail="Dataset not found")
            
        file_path = db_res.data[0]["file_path"]
        supabase.storage.from_("datasets").remove([file_path])
        supabase.table("datasets").delete().eq("id", dataset_id).execute()
        return {"message": "Dataset deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{dataset_id}/preview")
async def preview_dataset(dataset_id: str):
    try:
        db_res = supabase.table("datasets").select("file_path, file_ext").eq("id", dataset_id).execute()
        if not db_res.data:
            raise HTTPException(status_code=404, detail="Dataset not found")
            
        file_path = db_res.data[0]["file_path"]
        file_ext = db_res.data[0].get("file_ext", "csv")
        
        file_bytes = supabase.storage.from_("datasets").download(file_path)
        content = file_bytes.decode("utf-8")
        
        # --- NEW JSON ROUTER ---
        if file_ext == 'json':
            data = json.loads(content)
            # If it's a huge array, just send the first 50 items so the browser doesn't freeze
            if isinstance(data, list) and len(data) > 50:
                data = data[:50]
            return {"type": "json", "data": data}
            
        # --- CSV ROUTER ---
        else:
            reader = csv.DictReader(StringIO(content))
            rows = []
            for i, row in enumerate(reader):
                if i >= 50: break 
                rows.append(row)
            return {"type": "csv", "columns": reader.fieldnames, "rows": rows}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{dataset_id}/download")
async def get_download_url(dataset_id: str):
    try:
        db_res = supabase.table("datasets").select("file_path").eq("id", dataset_id).execute()
        if not db_res.data:
            raise HTTPException(status_code=404, detail="Dataset not found")
            
        url = supabase.storage.from_("datasets").get_public_url(db_res.data[0]["file_path"])
        return {"url": url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
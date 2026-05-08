from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.core.auth import get_current_user
from app.core.database import supabase

router = APIRouter(prefix="/api/metrics", tags=["Metrics"])

class MetricCreate(BaseModel):
    name: str
    description: str
    custom_prompt: str

class MetricUpdate(BaseModel):
    name: str
    description: str
    custom_prompt: str

@router.get("")
async def get_all_metrics(current_user: dict[str, str] = Depends(get_current_user)):
    try:
        response = supabase.table("metrics").select("*").order("category", desc=True).execute()
        return [
            metric
            for metric in response.data
            if metric.get("category") != "custom" or metric.get("user_id") == current_user["id"]
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("")
async def create_custom_metric(metric: MetricCreate, current_user: dict[str, str] = Depends(get_current_user)):
    try:
        response = supabase.table("metrics").insert({
            "user_id": current_user["id"],
            "name": metric.name,
            "category": "custom",
            "method_name": "custom_llm",
            "description": metric.description,
            "custom_prompt": metric.custom_prompt
        }).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{metric_id}")
async def update_custom_metric(metric_id: str, metric: MetricUpdate, current_user: dict[str, str] = Depends(get_current_user)):
    try:
        # We only allow updating custom metrics
        response = supabase.table("metrics").update({
            "name": metric.name,
            "description": metric.description,
            "custom_prompt": metric.custom_prompt
        }).eq("id", metric_id).eq("category", "custom").eq("user_id", current_user["id"]).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Custom metric not found.")
            
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.delete("/{metric_id}")
async def delete_metric(metric_id: str, current_user: dict[str, str] = Depends(get_current_user)):
    try:
        supabase.table("metrics").delete().eq("id", metric_id).eq("category", "custom").eq("user_id", current_user["id"]).execute()
        return {"message": "Deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

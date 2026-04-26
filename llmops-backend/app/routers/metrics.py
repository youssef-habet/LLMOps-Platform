from fastapi import APIRouter, HTTPException
from app.core.database import supabase
from app.models.metric import MetricCreate, MetricResponse

router = APIRouter(prefix="/api/metrics", tags=["Metrics"])

@router.get("", response_model=list[MetricResponse])
async def get_metrics():
    try:
        response = supabase.table("metrics").select("*").order("created_at", desc=False).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("", response_model=MetricResponse)
async def create_metric(metric: MetricCreate):
    try:
        response = supabase.table("metrics").insert({
            "name": metric.name,
            "metric_type": metric.metric_type,
            "description": metric.description,
            "config": metric.config
        }).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{metric_id}")
async def delete_metric(metric_id: str):
    try:
        response = supabase.table("metrics").delete().eq("id", metric_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Metric not found")
        return {"message": "Metric deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
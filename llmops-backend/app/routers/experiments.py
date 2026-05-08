from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List
from app.core.auth import get_current_user
from app.core.database import supabase
from app.services.experiment_runner import run_experiment_background

router = APIRouter(prefix="/api/experiments", tags=["Experiments"])

class ExperimentCreate(BaseModel):
    name: str
    dataset_id: str
    model_ids: List[str] # Array of models!
    metrics: List[str]

@router.get("")
async def get_experiments(current_user: dict[str, str] = Depends(get_current_user)):
    res = (
        supabase.table("experiments")
        .select("*")
        .eq("user_id", current_user["id"])
        .order("created_at", desc=True)
        .execute()
    )
    return res.data

@router.post("")
async def create_experiment(exp_data: ExperimentCreate, current_user: dict[str, str] = Depends(get_current_user)):
    try:
        models_res = (
            supabase.table("models")
            .select("id")
            .in_("id", exp_data.model_ids)
            .eq("user_id", current_user["id"])
            .execute()
        )
        dataset_res = (
            supabase.table("datasets")
            .select("id")
            .eq("id", exp_data.dataset_id)
            .eq("user_id", current_user["id"])
            .execute()
        )
        if len(models_res.data) != len(exp_data.model_ids) or not dataset_res.data:
            raise HTTPException(status_code=404, detail="One or more models or the dataset were not found")

        response = supabase.table("experiments").insert({
            "user_id": current_user["id"],
            "name": exp_data.name,
            "dataset_id": exp_data.dataset_id,
            "model_ids": exp_data.model_ids,
            "metrics": exp_data.metrics,
            "status": "pending",
            "overall_score": 0.0
        }).execute()
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{exp_id}")
async def get_experiment(exp_id: str, current_user: dict[str, str] = Depends(get_current_user)):
    try:
        res = supabase.table("experiments").select("*").eq("id", exp_id).eq("user_id", current_user["id"]).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Experiment not found")
        return res.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.delete("/{exp_id}")
async def delete_experiment(exp_id: str, current_user: dict[str, str] = Depends(get_current_user)):
    try:
        supabase.table("experiments").delete().eq("id", exp_id).eq("user_id", current_user["id"]).execute()
        return {"message": "Experiment deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{exp_id}/run")
async def trigger_experiment_run(
    exp_id: str,
    background_tasks: BackgroundTasks,
    current_user: dict[str, str] = Depends(get_current_user),
):
    try:
        exp_res = supabase.table("experiments").select("*").eq("id", exp_id).eq("user_id", current_user["id"]).execute()
        if not exp_res.data:
            raise HTTPException(status_code=404, detail="Experiment not found")
            
        experiment = exp_res.data[0]
        
        background_tasks.add_task(
            run_experiment_background,
            exp_id=exp_id,
            model_ids=experiment['model_ids'],
            dataset_id=experiment['dataset_id'],
            metrics=experiment['metrics']
        )
        return {"message": "Experiment queued for execution."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

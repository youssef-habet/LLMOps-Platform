from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List
from app.core.auth import get_current_user
from app.core.database import supabase
from app.services.evaluator import run_evaluation_background

router = APIRouter(prefix="/api/evaluations", tags=["Evaluations"])

# Reverted to single model_id
class EvaluationCreate(BaseModel):
    name: str
    dataset_id: str
    model_id: str 
    metrics: List[str]

@router.get("")
async def get_evaluations(current_user: dict[str, str] = Depends(get_current_user)):
    res = (
        supabase.table("evaluations")
        .select("*")
        .eq("user_id", current_user["id"])
        .order("created_at", desc=True)
        .execute()
    )
    return res.data

@router.post("")
async def create_evaluation(eval_data: EvaluationCreate, current_user: dict[str, str] = Depends(get_current_user)):
    try:
        model_res = supabase.table("models").select("id").eq("id", eval_data.model_id).eq("user_id", current_user["id"]).execute()
        dataset_res = supabase.table("datasets").select("id").eq("id", eval_data.dataset_id).eq("user_id", current_user["id"]).execute()
        if not model_res.data or not dataset_res.data:
            raise HTTPException(status_code=404, detail="Model or dataset not found")

        response = supabase.table("evaluations").insert({
            "user_id": current_user["id"],
            "name": eval_data.name,
            "dataset_id": eval_data.dataset_id,
            "model_id": eval_data.model_id, # Single model
            "metrics": eval_data.metrics,
            "status": "pending",
            "overall_score": 0.0
        }).execute()
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{eval_id}/run")
async def trigger_evaluation_run(
    eval_id: str,
    background_tasks: BackgroundTasks,
    current_user: dict[str, str] = Depends(get_current_user),
):
    try:
        eval_res = supabase.table("evaluations").select("*").eq("id", eval_id).eq("user_id", current_user["id"]).execute()
        if not eval_res.data:
            raise HTTPException(status_code=404, detail="Evaluation not found")
            
        evaluation = eval_res.data[0]
        
        background_tasks.add_task(
            run_evaluation_background,
            eval_id=eval_id,
            model_id=evaluation['model_id'], # Pass single string
            dataset_id=evaluation['dataset_id'],
            metrics=evaluation['metrics']
        )
        return {"message": "Evaluation queued for execution."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{eval_id}")
async def delete_evaluation(eval_id: str, current_user: dict[str, str] = Depends(get_current_user)):
    try:
        supabase.table("evaluations").delete().eq("id", eval_id).eq("user_id", current_user["id"]).execute()
        return {"message": "Evaluation deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

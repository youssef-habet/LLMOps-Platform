from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.core.database import supabase
from app.models.evaluation import EvaluationCreate, EvaluationResponse
from app.services.evaluator import run_evaluation_background

router = APIRouter(prefix="/api/evaluations", tags=["Evaluations"])

@router.get("", response_model=list[EvaluationResponse])
async def get_evaluations():
    try:
        response = supabase.table("evaluations").select("*").order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("", response_model=EvaluationResponse)
async def create_and_run_evaluation(eval_data: EvaluationCreate, background_tasks: BackgroundTasks):
    try:
        # 1. Create the pending record
        db_response = supabase.table("evaluations").insert({
            "name": eval_data.name,
            "model_id": eval_data.model_id,
            "dataset_id": eval_data.dataset_id,
            "metrics": eval_data.metrics
        }).execute()
        
        new_eval = db_response.data[0]
        
        # 2. Start the background task!
        background_tasks.add_task(
            run_evaluation_background, 
            eval_id=new_eval["id"],
            model_id=eval_data.model_id,
            dataset_id=eval_data.dataset_id,
            metrics=eval_data.metrics
        )
        
        # 3. Return instantly so React can show a loading spinner
        return new_eval
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
@router.delete("/{eval_id}")
async def delete_evaluation(eval_id: str):
    try:
        supabase.table("evaluations").delete().eq("id", eval_id).execute()
        return {"message": "Evaluation deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
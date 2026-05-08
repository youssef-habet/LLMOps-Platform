from fastapi import APIRouter, Depends, HTTPException
from app.core.auth import get_current_user
from app.core.database import supabase
from app.models.model import ModelCreate, ModelResponse

router = APIRouter(prefix="/api/models", tags=["Models"])

@router.get("", response_model=list[ModelResponse])
async def get_models(current_user: dict[str, str] = Depends(get_current_user)):
    try:
        response = (
            supabase.table("models")
            .select("*")
            .eq("user_id", current_user["id"])
            .order("created_at", desc=False)
            .execute()
        )
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("", response_model=ModelResponse)
async def create_model(model: ModelCreate, current_user: dict[str, str] = Depends(get_current_user)):
    try:
        response = supabase.table("models").insert({
            "user_id": current_user["id"],
            "name": model.name,
            "provider": model.provider,
            "version": model.version,
            "temperature": model.temperature,
            "max_tokens": model.max_tokens,
            "top_p": model.top_p,
            "endpoint_url": model.endpoint_url, 
            "api_key_ref": model.api_key_ref,
            "system_prompt": model.system_prompt 
        }).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{model_id}", response_model=ModelResponse)
async def update_model(model_id: str, model: ModelCreate, current_user: dict[str, str] = Depends(get_current_user)):
    try:
        response = supabase.table("models").update({
            "name": model.name,
            "provider": model.provider,
            "version": model.version,
            "temperature": model.temperature,
            "max_tokens": model.max_tokens,
            "top_p": model.top_p,
            "endpoint_url": model.endpoint_url, 
            "api_key_ref": model.api_key_ref,
            "system_prompt": model.system_prompt 
        }).eq("id", model_id).eq("user_id", current_user["id"]).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Model not found")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.delete("/{model_id}")
async def delete_model(model_id: str, current_user: dict[str, str] = Depends(get_current_user)):
    try:
        supabase.table("models").delete().eq("id", model_id).eq("user_id", current_user["id"]).execute()
        return {"message": "Model deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/available")
async def get_available_models():
    """Returns only the two supported providers for the frontend UI."""
    return {
        "Google": ["gemini-2.5-flash", "gemini-2.5-pro"],
        "Custom": ["llama3", "mistral", "phi3"]
    }

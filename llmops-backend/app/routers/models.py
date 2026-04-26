from fastapi import APIRouter, HTTPException
from app.core.database import supabase
from app.models.model import ModelCreate, ModelResponse

router = APIRouter(prefix="/api/models", tags=["Models"])

@router.get("", response_model=list[ModelResponse])
async def get_models():
    try:
        response = supabase.table("models").select("*").order("created_at", desc=False).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("", response_model=ModelResponse)
async def create_model(model: ModelCreate):
    try:
        response = supabase.table("models").insert({
            "name": model.name,
            "provider": model.provider,
            "version": model.version,
            "temperature": model.temperature,
            "max_tokens": model.max_tokens,
            "top_p": model.top_p,
            "endpoint_url": model.endpoint_url, 
            "api_key_ref": model.api_key_ref 
        }).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{model_id}", response_model=ModelResponse)
async def update_model(model_id: str, model: ModelCreate):
    try:
        response = supabase.table("models").update({
            "name": model.name,
            "provider": model.provider,
            "version": model.version,
            "temperature": model.temperature,
            "max_tokens": model.max_tokens,
            "top_p": model.top_p,
            "endpoint_url": model.endpoint_url, 
            "api_key_ref": model.api_key_ref 
        }).eq("id", model_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Model not found")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.delete("/{model_id}")
async def delete_model(model_id: str):
    try:
        supabase.table("models").delete().eq("id", model_id).execute()
        return {"message": "Model deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/available")
async def get_available_models():
    return {
        "OpenAI": ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
        "Anthropic": ["claude-3-5-sonnet-20240620", "claude-3-opus-20240229", "claude-3-haiku-20240307"],
        "Google": ["gemini-1.5-pro", "gemini-1.5-flash"],
        "Ollama (Local)": ["llama3", "mistral", "gemma"]
    }
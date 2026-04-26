from litellm import completion
from fastapi import HTTPException
from app.core.database import supabase

def test_model_inference(model_id: str, prompt: str):
    # 1. Fetch the exact model configuration from Supabase
    db_response = supabase.table("models").select("*").eq("id", model_id).execute()
    
    if not db_response.data:
        raise HTTPException(status_code=404, detail="Model not found in database")
        
    model_config = db_response.data[0]
    
    # 2. Format the model string for LiteLLM
    provider = model_config["provider"].lower()
    version = model_config["version"]
    
    prefix_map = {
        "openai": "openai/",
        "anthropic": "anthropic/",
        "meta": "huggingface/",
        "google": "gemini/"
    }
    
    litellm_model = f"{prefix_map.get(provider, '')}{version}"

    # 3. Call the Real Provider using LiteLLM
    try:
        response = completion(
            model=litellm_model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=150
        )
        
        return {
            "status": "success",
            "model_used": litellm_model,
            "response": response.choices[0].message.content
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference failed: {str(e)}")
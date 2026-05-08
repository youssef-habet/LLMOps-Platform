import os
from dotenv import load_dotenv
from openai import AsyncOpenAI
import google.generativeai as genai

load_dotenv()

# Initialize Google client
genai.configure(api_key=os.getenv("GEMINI_API_KEY", "dummy"))

async def generate_response(
    provider: str, version: str, system_prompt: str, user_prompt: str, 
    temperature: float, max_tokens: int, 
    custom_base_url: str = None, custom_api_key: str = None
) -> str:
    try:
        if provider == "Google":
            model = genai.GenerativeModel(model_name=version, system_instruction=system_prompt)
            response = await model.generate_content_async(
                user_prompt, 
                generation_config=genai.types.GenerationConfig(
                    temperature=temperature, 
                    max_output_tokens=max_tokens
                )
            )
            return response.text

        elif provider == "Custom":
            if not custom_base_url or custom_base_url.strip() == "":
                return "ERROR: Missing Base URL! Please configure your model with 'http://localhost:11434/v1'"

            dynamic_client = AsyncOpenAI(
                api_key=custom_api_key if custom_api_key else "dummy-key",
                base_url=custom_base_url
            )
            response = await dynamic_client.chat.completions.create(
                model=version, 
                messages=[
                    {"role": "system", "content": system_prompt}, 
                    {"role": "user", "content": user_prompt}
                ],
                temperature=temperature, 
                max_tokens=max_tokens
            )
            return response.choices[0].message.content

        else:
            return f"ERROR: Unsupported provider {provider}. Only Google and Custom are supported."
            
    except Exception as e:
        print(f"API Error with {provider}: {str(e)}")
        return f"ERROR: {str(e)}"
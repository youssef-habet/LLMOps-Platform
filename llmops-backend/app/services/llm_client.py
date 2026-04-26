import os
from dotenv import load_dotenv
from openai import AsyncOpenAI
from anthropic import AsyncAnthropic
import google.generativeai as genai

load_dotenv()

openai_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY", "dummy"))
anthropic_client = AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY", "dummy"))
genai.configure(api_key=os.getenv("GEMINI_API_KEY", "dummy"))

async def generate_response(
    provider: str, version: str, system_prompt: str, user_prompt: str, 
    temperature: float, max_tokens: int, 
    custom_base_url: str = None, custom_api_key: str = None
) -> str:
    try:
        if provider == "OpenAI":
            response = await openai_client.chat.completions.create(
                model=version, messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
                temperature=temperature, max_tokens=max_tokens
            )
            return response.choices[0].message.content

        elif provider == "Anthropic":
            response = await anthropic_client.messages.create(
                model=version, system=system_prompt, messages=[{"role": "user", "content": user_prompt}],
                temperature=temperature, max_tokens=max_tokens
            )
            return response.content[0].text

        elif provider == "Google":
            model = genai.GenerativeModel(model_name=version, system_instruction=system_prompt)
            response = await model.generate_content_async(
                user_prompt, generation_config=genai.types.GenerationConfig(temperature=temperature, max_output_tokens=max_tokens)
            )
            return response.text

        # --- THE UNIVERSAL CUSTOM ROUTER ---
        elif provider == "Custom":
            # Build an on-the-fly client using the user's database settings
            dynamic_client = AsyncOpenAI(
                api_key=custom_api_key if custom_api_key else "dummy-key",
                base_url=custom_base_url
            )
            response = await dynamic_client.chat.completions.create(
                model=version, 
                messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
                temperature=temperature, 
                max_tokens=max_tokens
            )
            return response.choices[0].message.content

        else:
            raise ValueError(f"Unsupported provider: {provider}")
            
    except Exception as e:
        print(f"API Error with {provider}: {str(e)}")
        return f"ERROR: {str(e)}"
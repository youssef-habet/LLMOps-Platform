import string
from app.services.llm_client import generate_response

def normalize_text(text: str) -> str:
    """Helper: Lowercases and removes punctuation for fair comparisons."""
    text = str(text).lower().strip()
    return text.translate(str.maketrans('', '', string.punctuation))

def score_exact_match(expected: str, actual: str) -> float:
    """Returns 1.0 if strings match exactly (normalized), else 0.0"""
    return 1.0 if normalize_text(expected) == normalize_text(actual) else 0.0

def score_contains(expected: str, actual: str) -> float:
    """Returns 1.0 if the expected string is inside the actual string."""
    return 1.0 if normalize_text(expected) in normalize_text(actual) else 0.0

async def score_llm_judge(input_text: str, expected: str, actual: str) -> float:
    """Uses an advanced model to grade the output on a scale of 0 to 1."""
    
    system_prompt = """You are an expert evaluator. Grade the 'Actual Output' against the 'Expected Output' based on the 'Original Question'.
    Return ONLY a single float number between 0.0 (completely wrong) and 1.0 (perfectly correct). Do not include any other text."""
    
    user_prompt = f"""
    Original Question: {input_text}
    Expected Output: {expected}
    Actual Output: {actual}
    
    Score (0.0 to 1.0):"""

    # We typically use a fast, smart model for judging (GPT-4o or Claude 3.5 Sonnet)
    try:
        judge_score_str = await generate_response(
            provider="OpenAI", 
            version="gpt-4o", 
            system_prompt=system_prompt, 
            user_prompt=user_prompt, 
            temperature=0.0, # Must be 0 for deterministic judging
            max_tokens=10
        )
        return float(judge_score_str.strip())
    except ValueError:
        return 0.0 # Fallback if the judge returns something that isn't a number
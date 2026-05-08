import string
import json
import nltk
from nltk.translate.bleu_score import sentence_bleu, SmoothingFunction
from rouge_score import rouge_scorer
from app.services.llm_client import generate_response

try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

def normalize_text(text: str) -> str:
    text = str(text).lower().strip()
    return text.translate(str.maketrans('', '', string.punctuation))

# --- 1. NLP 

def score_exact_match(expected: str, actual: str) -> float:
    """Returns 1.0 if strings match exactly (normalized), else 0.0"""
    return 1.0 if normalize_text(expected) == normalize_text(actual) else 0.0

def score_contains(expected: str, actual: str) -> float:
    """Returns 1.0 if the expected string is inside the actual string."""
    return 1.0 if normalize_text(expected) in normalize_text(actual) else 0.0

def score_rouge_l(expected: str, actual: str) -> float:
    """ROUGE-L: Measures the longest common sequence of words. Great for summarization."""
    if not expected or not actual: return 0.0
    scorer = rouge_scorer.RougeScorer(['rougeL'], use_stemmer=True)
    scores = scorer.score(expected, actual)
    return float(scores['rougeL'].fmeasure) 

def score_bleu(expected: str, actual: str) -> float:
    """BLEU: Measures n-gram precision. Great for translation and strict phrasing."""
    if not expected or not actual: return 0.0
    reference = [normalize_text(expected).split()]
    candidate = normalize_text(actual).split()
    
    # We use a smoothing function so short answers don't get unfairly punished
    smoothie = SmoothingFunction().method4
    return float(sentence_bleu(reference, candidate, smoothing_function=smoothie))

# --- 2. RELIABILITY METRICS ---

def score_valid_json(actual: str) -> float:
    """Checks if the LLM successfully output pure, parsable JSON."""
    try:
        json.loads(actual.strip())
        return 1.0
    except ValueError:
        return 0.0

async def score_custom_llm(user_input: str, expected: str, actual: str, custom_prompt: str) -> float:
    system_prompt = f"""You are an expert evaluator. Your grading rubric is: "{custom_prompt}"
    Analyze the Actual Output based on this rubric.
    Return ONLY a single float number between 0.0 and 1.0. Do not include any other text."""
    
    user_prompt = f"Input: {user_input}\nExpected: {expected}\nActual Output: {actual}\nScore (0.0 to 1.0):"

    try:
        judge_score_str = await generate_response(
            provider="Google", 
            version="gemini-2.5-flash", 
            system_prompt=system_prompt, 
            user_prompt=user_prompt, 
            temperature=0.0, 
            max_tokens=10
        )
        
        if judge_score_str.startswith("ERROR"):
            print(f"Judge failed to grade: {judge_score_str}")
            return 0.0
            
        return float(judge_score_str.strip())
    except Exception as e:
        print(f"Judge Parsing Error: {e}")
        return 0.0
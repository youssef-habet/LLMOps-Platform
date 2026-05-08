import pandas as pd
import json
from io import StringIO
from app.core.database import supabase
from app.services.llm_client import generate_response

from app.services.metrics_engine import (
    score_exact_match, score_contains, score_rouge_l, 
    score_bleu, score_valid_json, score_custom_llm
)

async def run_evaluation_background(eval_id: str, model_id: str, dataset_id: str, metrics: list):
    try:
        supabase.table("evaluations").update({"status": "running"}).eq("id", eval_id).execute()
        
        # 1. Fetch SINGLE Model Data
        model_res = supabase.table("models").select("*").eq("id", model_id).execute()
        if not model_res.data:
            raise ValueError("Model not found in database.")
        model_info = model_res.data[0]
        
        # 2. Fetch Dataset Metadata
        dataset_res = supabase.table("datasets").select("*").eq("id", dataset_id).execute()
        file_path = dataset_res.data[0]["file_path"]
        file_ext = dataset_res.data[0].get("file_ext", "csv") 
        file_bytes = supabase.storage.from_("datasets").download(file_path)
        file_content = file_bytes.decode("utf-8")
        
        # 3. Fetch Metrics
        metrics_res = supabase.table("metrics").select("*").in_("id", metrics).execute()
        selected_metrics = metrics_res.data

        # 4. Parse Dataset
        if file_ext == 'json':
            df = pd.DataFrame(json.loads(file_content))
        else:
            df = pd.read_csv(StringIO(file_content))

        results = [] # BACK TO FLAT ARRAY!
        total_score = 0.0

        db_system_prompt = model_info.get('system_prompt')
        final_system_prompt = db_system_prompt if db_system_prompt else "You are a helpful assistant."

        # 5. Process Rows
        for index, row in df.iterrows():
            user_input = str(row['input'])
            expected_output = str(row['expected'])
            
            actual_output = await generate_response(
                provider=model_info['provider'],
                version=model_info['version'],
                system_prompt=final_system_prompt, 
                user_prompt=user_input,
                temperature=model_info['temperature'],
                max_tokens=model_info['max_tokens'],
                custom_base_url=model_info.get('endpoint_url'), 
                custom_api_key=model_info.get('api_key_ref') 
            )
            
            row_scores = {}
            row_aggregate = 0.0
            
            for metric in selected_metrics:
                metric_name = metric.get('name', '')
                method = metric.get('method_name', '')
                score = 0.0
                
                if method == "exact_match" or "exact" in metric_name.lower(): score = score_exact_match(expected_output, actual_output)
                elif method == "contains" or "contain" in metric_name.lower(): score = score_contains(expected_output, actual_output)
                elif method == "rouge_l" or "rouge" in metric_name.lower(): score = score_rouge_l(expected_output, actual_output)
                elif method == "bleu" or "bleu" in metric_name.lower(): score = score_bleu(expected_output, actual_output)
                elif method == "valid_json" or "json" in metric_name.lower(): score = score_valid_json(actual_output)
                elif method == "custom_llm" or metric.get('category') == 'custom':
                    custom_prompt = metric.get('custom_prompt') or "Grade this out of 1.0"
                    score = await score_custom_llm(user_input, expected_output, actual_output, custom_prompt)
                else: score = 0.0

                row_scores[metric_name] = score
                row_aggregate += score

            final_row_score = row_aggregate / len(selected_metrics) if selected_metrics else 0.0
            total_score += final_row_score

            results.append({
                "row": index + 1,
                "input": user_input,
                "expected": expected_output,
                "output": actual_output,
                "scores": row_scores
            })

        # 6. Final Calculation
        overall_score = total_score / len(df)
        supabase.table("evaluations").update({
            "status": "completed",
            "results": results, # Saves flat array
            "overall_score": overall_score
        }).eq("id", eval_id).execute()

    except Exception as e:
        print(f"Evaluation Failed: {str(e)}")
        supabase.table("evaluations").update({"status": "failed", "results": [{"error": str(e)}]}).eq("id", eval_id).execute()
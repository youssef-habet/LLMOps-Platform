import pandas as pd
import json
from io import StringIO
from datetime import datetime, timezone
from app.core.database import supabase
from app.services.llm_client import generate_response
from app.services.metrics_engine import (
    score_exact_match, score_contains, score_rouge_l, 
    score_bleu, score_valid_json, score_custom_llm
)

async def run_experiment_background(exp_id: str, model_ids: list, dataset_id: str, metrics: list):
    try:
        # Mark as running
        supabase.table("experiments").update({"status": "running"}).eq("id", exp_id).execute()
        
        # Fetch Models, Dataset, and Metrics
        models_res = supabase.table("models").select("*").in_("id", model_ids).execute()
        if not models_res.data:
            raise ValueError("No valid models found.")
        target_models = models_res.data
        
        dataset_res = supabase.table("datasets").select("*").eq("id", dataset_id).execute()
        file_path = dataset_res.data[0]["file_path"]
        file_ext = dataset_res.data[0].get("file_ext", "csv") 
        file_bytes = supabase.storage.from_("datasets").download(file_path)
        file_content = file_bytes.decode("utf-8")
        
        metrics_res = supabase.table("metrics").select("*").in_("id", metrics).execute()
        selected_metrics = metrics_res.data

        if file_ext == 'json':
            df = pd.DataFrame(json.loads(file_content))
        else:
            df = pd.read_csv(StringIO(file_content))

        # --- THE MULTI-MODEL TRACKING STRUCTURE ---
        multi_model_results = {}
        grand_total_score = 0.0

        # Loop through EACH model
        for model in target_models:
            model_results = []
            model_total_score = 0.0
            
            # SNAPSHOT METADATA (Fulfills your roadmap requirement!)
            metadata_snapshot = {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "parameters": {
                    "provider": model['provider'],
                    "version": model['version'],
                    "temperature": model.get('temperature', 0.7),
                    "max_tokens": model.get('max_tokens', 1000),
                    "system_prompt": model.get('system_prompt', '')
                }
            }

            db_system_prompt = model.get('system_prompt')
            final_system_prompt = db_system_prompt if db_system_prompt else "You are a helpful assistant."

            # Process Rows for this specific model
            for index, row in df.iterrows():
                user_input = str(row['input'])
                expected_output = str(row['expected'])
                
                actual_output = await generate_response(
                    provider=model['provider'],
                    version=model['version'],
                    system_prompt=final_system_prompt, 
                    user_prompt=user_input,
                    temperature=model.get('temperature', 0.7),
                    max_tokens=model.get('max_tokens', 1000),
                    custom_base_url=model.get('endpoint_url'), 
                    custom_api_key=model.get('api_key_ref') 
                )
                
                row_scores = {}
                row_aggregate = 0.0
                
                for metric in selected_metrics:
                    metric_name = metric.get('name', '')
                    method = metric.get('method_name', '')
                    
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
                model_total_score += final_row_score

                model_results.append({
                    "row": index + 1,
                    "input": user_input,
                    "expected": expected_output,
                    "output": actual_output,
                    "scores": row_scores
                })

            model_overall_score = model_total_score / len(df)
            grand_total_score += model_overall_score

            multi_model_results[model['id']] = {
                "model_name": model['name'],
                "metadata": metadata_snapshot,
                "overall_score": model_overall_score,
                "rows": model_results
            }

        final_aggregate = grand_total_score / len(target_models)
        
        # Save the massive dictionary to the experiments table
        supabase.table("experiments").update({
            "status": "completed",
            "results": multi_model_results, 
            "overall_score": final_aggregate
        }).eq("id", exp_id).execute()

    except Exception as e:
        print(f"Experiment Failed: {str(e)}")
        supabase.table("experiments").update({"status": "failed", "results": {"error": str(e)}}).eq("id", exp_id).execute()
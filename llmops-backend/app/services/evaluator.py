import pandas as pd
import json
from io import StringIO
from app.core.database import supabase
from app.services.llm_client import generate_response
from app.services.metrics_engine import score_exact_match, score_contains, score_llm_judge

async def run_evaluation_background(eval_id: str, model_id: str, dataset_id: str, metrics: list):
    try:
        # Mark evaluation as running
        supabase.table("evaluations").update({"status": "running"}).eq("id", eval_id).execute()
        
        # 1. Fetch Model Data
        model_res = supabase.table("models").select("*").eq("id", model_id).execute()
        model_info = model_res.data[0]
        
        # 2. Fetch Dataset Metadata
        dataset_res = supabase.table("datasets").select("*").eq("id", dataset_id).execute()
        file_path = dataset_res.data[0]["file_path"]
        file_ext = dataset_res.data[0].get("file_ext", "csv") # default to csv if missing
        
        # 3. Download and Decode File
        file_bytes = supabase.storage.from_("datasets").download(file_path)
        file_content = file_bytes.decode("utf-8")
        
        # 4. Parse Based on File Extension
        if file_ext == 'json':
            json_data = json.loads(file_content)
            df = pd.DataFrame(json_data)
        else:
            df = pd.read_csv(StringIO(file_content))
            
        # 5. Validate Columns
        if 'input' not in df.columns or 'expected' not in df.columns:
            raise ValueError("Dataset must contain 'input' and 'expected' fields.")

        results = []
        total_score = 0.0

        # 6. Process Each Row
        for index, row in df.iterrows():
            user_input = str(row['input'])
            expected_output = str(row['expected'])
            
            # Call the targeted LLM
            actual_output = await generate_response(
                provider=model_info['provider'],
                version=model_info['version'],
                system_prompt ="You are a strict data-extraction bot. You must reply with ONLY the exact answer to the user's question. Do not include any conversational filler, pleasantries, introductory phrases, or extra punctuation. Output the final answer and nothing else.",
                user_prompt=user_input,
                temperature=model_info['temperature'],
                max_tokens=model_info['max_tokens'],
                custom_base_url=model_info.get('endpoint_url'), 
                custom_api_key=model_info.get('api_key_ref') 
            )
            
            row_scores = {}
            row_aggregate = 0.0
            
            # 7. Run Metrics
            if "exact_match" in metrics:
                score = score_exact_match(expected_output, actual_output)
                row_scores["exact_match"] = score
                row_aggregate += score
                
            if "contains" in metrics:
                score = score_contains(expected_output, actual_output)
                row_scores["contains"] = score
                row_aggregate += score
                
            if "llm_judge" in metrics:
                score = await score_llm_judge(user_input, expected_output, actual_output)
                row_scores["llm_judge"] = score
                row_aggregate += score

            # Average score for this single row
            final_row_score = row_aggregate / len(metrics) if metrics else 0.0
            total_score += final_row_score

            results.append({
                "row": index + 1,
                "input": user_input,
                "expected": expected_output,
                "output": actual_output,
                "scores": row_scores
            })

        # 8. Final Calculation & Save
        overall_score = total_score / len(df)
        
        supabase.table("evaluations").update({
            "status": "completed",
            "results": results,
            "overall_score": overall_score
        }).eq("id", eval_id).execute()

    except Exception as e:
        print(f"Evaluation Failed: {str(e)}")
        supabase.table("evaluations").update({"status": "failed", "results": [{"error": str(e)}]}).eq("id", eval_id).execute()
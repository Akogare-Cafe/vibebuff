import json
import subprocess
import os
import time

def main():
    data_dir = os.path.join(os.path.dirname(__file__), "data")
    batches_path = os.path.join(data_dir, "articles_batches.json")
    
    if not os.path.exists(batches_path):
        print("No articles_batches.json found. Run sync_tools_batch.py first.")
        return
    
    with open(batches_path, "r") as f:
        batches = json.load(f)
    
    print(f"Total article batches: {len(batches)}")
    
    total_created = 0
    total_updated = 0
    total_linked = 0
    total_errors = []
    
    project_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    
    for i, batch in enumerate(batches):
        print(f"\nProcessing batch {i+1}/{len(batches)} ({len(batch)} articles)...")
        
        args_json = json.dumps({"articles": batch})
        
        cmd = [
            "npx", "convex", "run", "articles:bulkUpsertArticles",
            args_json
        ]
        
        try:
            result = subprocess.run(
                cmd,
                cwd=project_dir,
                capture_output=True,
                text=True,
                timeout=120
            )
            
            if result.returncode == 0:
                try:
                    output = json.loads(result.stdout.strip())
                    created = output.get("created", 0)
                    updated = output.get("updated", 0)
                    linked = output.get("linked", 0)
                    errors = output.get("errors", [])
                    
                    total_created += created
                    total_updated += updated
                    total_linked += linked
                    total_errors.extend(errors)
                    
                    print(f"  Created: {created}, Updated: {updated}, Linked: {linked}")
                except json.JSONDecodeError:
                    print(f"  Output: {result.stdout[:200]}")
            else:
                print(f"  Error: {result.stderr[:200]}")
        
        except subprocess.TimeoutExpired:
            print(f"  Timeout on batch {i+1}")
        except Exception as e:
            print(f"  Exception: {e}")
        
        time.sleep(0.5)
    
    print("\n" + "=" * 50)
    print("ARTICLE SYNC COMPLETE")
    print("=" * 50)
    print(f"Total created: {total_created}")
    print(f"Total updated: {total_updated}")
    print(f"Total linked: {total_linked}")
    print(f"Total errors: {len(total_errors)}")
    
    if total_errors[:10]:
        print("\nFirst 10 errors:")
        for err in total_errors[:10]:
            print(f"  - {err}")

if __name__ == "__main__":
    main()

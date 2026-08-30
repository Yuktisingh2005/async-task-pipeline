import requests
from concurrent.futures import ThreadPoolExecutor

URL = "http://127.0.0.1:8081/api/tasks/"
COUNT = 200
CONCURRENCY = 50

def fire_one(_):
    try:
        requests.post(URL, data={"task_type": "pdf_report"}, timeout=10)
    except Exception as e:
        print(f"error: {e}")

with ThreadPoolExecutor(max_workers=CONCURRENCY) as executor:
    list(executor.map(fire_one, range(COUNT)))

print(f"Fired {COUNT} requests.")
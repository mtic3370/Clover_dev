import requests
import json

url = "http://127.0.0.1:8000/api/chat"
payload = {
    "prompt": "전동킥보드 야간 주행 안전 팁 3줄",
    "temperature": 0.7,
    "max_new_tokens": 100
}

print("🔹 서버로 요청 중...")
response = requests.post(url, json=payload)

try:
    data = response.json()
    print("✅ 서버 응답:")
    print(json.dumps(data, ensure_ascii=False, indent=2))
except Exception as e:
    print("❌ 응답 파싱 오류:", e)
    print("서버에서 받은 원본 데이터:")
    print(response.text)

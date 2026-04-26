import requests

URL = "http://127.0.0.1:8000/api/chat"

def main():
    prompt = "전동킥보드 야간 주행 안전 팁 3줄"
    payload = {
        "prompt": prompt,
        "temperature": 0.7,
        "max_new_tokens": 150
    }

    print("🚀 EXAONE 로컬 API 호출 테스트")
    print("📤 prompt:", prompt)

    res = requests.post(URL, json=payload)
    print("📥 status_code:", res.status_code)
    print("📥 response JSON:", res.json())

if __name__ == "__main__":
    main()
    print("📦 모델 구성:", model.config)
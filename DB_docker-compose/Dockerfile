FROM python:3.11-slim

WORKDIR /app

# requirements 먼저 복사 (캐싱 최적화)
COPY requirements.txt .
RUN pip install -r requirements.txt

# 모든 Python 파일 복사
COPY *.py .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
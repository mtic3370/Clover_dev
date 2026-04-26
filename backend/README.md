# 클로버모빌리티 백엔드 서버

## 설치 방법

### 1. Python 가상환경 생성 (선택사항)
```bash
# 이미 venv 폴더에 있으므로 생략 가능
```

### 2. 필수 라이브러리 설치
```bash
cd d:\exaone_test\venv\backend
pip install -r requirements.txt
```

**예상 설치 시간**: 5-10분 (인터넷 속도에 따라 다름)

### 3. 설치 확인
```bash
python test_installation.py
```

## 주요 기능

### 1. 얼굴 인식 (DeepFace)
- 신분증 얼굴 vs 실시간 얼굴 동일인 검증
- 정확도: 95% 이상

### 2. OCR (EasyOCR)
- 운전면허증에서 생년월일 자동 추출
- 한글/영문/숫자 인식

### 3. API 서버 (Flask)
- `/api/verify-id`: 신분증 처리
- `/api/verify-face`: 얼굴 비교
- `/api/register`: 회원가입

## 파일 구조
```
backend/
├── app.py                    # Flask 메인 서버
├── face_verification.py      # DeepFace 얼굴 인식
├── ocr_processor.py          # EasyOCR 텍스트 추출
├── face_extractor.py         # 신분증에서 얼굴 추출
├── database.py               # SQL 데이터베이스
├── requirements.txt          # 필수 패키지
├── test_installation.py      # 설치 확인 테스트
└── README.md                 # 이 파일
```

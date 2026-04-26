# 데이터베이스 연결 설정을 담당합니다.
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# 1. 데이터베이스 연결 설정
# SQLALCHEMY_DATABASE_URL = "mysql+pymysql://root:1234@localhost/fastapi_todo"

# os를 활용해서 환경변수로 변경
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "mysql+pymysql://root:1234@localhost/fastapi_todo"
)

# SQLAlchemy 엔진 생성
engine = create_engine(DATABASE_URL)

# 데이터베이스 세션 생성을 위한 클래스
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# DB 모델의 기본 클래스
Base = declarative_base()
# 데이터베이스 테이블의 구조을 파이썬 클래스로 정의합니다.
from sqlalchemy import Column, Integer, String
from database import Base

# 'todos'라는 이름의 테이블을 정의하는 클래스
class Todo(Base):
    __tablename__ = "todos"

    id = Column(Integer, primary_key=True, index=True) # 자동 증가하는 기본 키
    text = Column(String(255), index=True) # 할 일 내용 (최대 255자)
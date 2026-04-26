# API의 입출력 데이터 형식(모양)을 정의합니다. 클라이언트(프론트엔드)와 서버가 주고받을 데이터에 대한 약속
from pydantic import BaseModel
from typing import Optional

class TodoSchema(BaseModel):
    # id는 DB에서 읽어올 때는 있지만, 새로 만들 때는 없으므로 Optional로 지정합니다.
    id: Optional[int] = None 
    text: str

    # SQLAlchemy 모델과 연동하기 위한 설정 (이전과 동일)
    class Config:
        orm_mode = True
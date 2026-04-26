from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import models
import schemas
from database import engine, SessionLocal

# DB 테이블 생성
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS 설정 (이전과 동일)
origins = ["*"]
app.add_middleware(
    CORSMiddleware, 
    allow_origins=origins, 
    allow_methods=["*"], 
    allow_headers=["*"]
    )

# (R) 모든 할 일 목록 가져오기
@app.get("/todos/", response_model=List[schemas.TodoSchema])
def read_todos():
    with SessionLocal() as db:
        todos = db.query(models.Todo).all()
        return todos

# (C) 새로운 할 일 생성하기
@app.post("/todos/", response_model=schemas.TodoSchema, status_code=201)
def create_new_todo(todo: schemas.TodoSchema):
    with SessionLocal() as db:
        # Pydantic 모델을 SQLAlchemy 모델로 변환하여 DB에 저장합니다.
        db_todo = models.Todo(text=todo.text)
        db.add(db_todo)
        db.commit()
        db.refresh(db_todo) # DB에 저장된 최신 정보(id 포함)를 다시 불러옵니다.
        return db_todo

# (U) 할 일 수정하기
@app.put("/todos/{todo_id}", response_model=schemas.TodoSchema)
def update_existing_todo(todo_id: int, todo_update: schemas.TodoSchema):
    with SessionLocal() as db:
        db_todo = db.query(models.Todo).filter(models.Todo.id == todo_id).first() # 리스트에서 하나만
        if db_todo is None:
            raise HTTPException(status_code=404, detail="Todo not found")
        
        db_todo.text = todo_update.text
        db.commit()
        db.refresh(db_todo)
        return db_todo

# (D) 할 일 삭제하기
@app.delete("/todos/{todo_id}")
def delete_existing_todo(todo_id: int):
    with SessionLocal() as db:
        db_todo = db.query(models.Todo).filter(models.Todo.id == todo_id).first()
        if db_todo is None:
            raise HTTPException(status_code=404, detail="Todo not found")
            
        db.delete(db_todo)
        db.commit()
        return {"ok": True}
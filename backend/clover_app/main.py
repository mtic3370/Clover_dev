from fastapi import FastAPI
from routes_chat import router as chat_router, model

app = FastAPI(title="Clover Local AI")

@app.get("/healthz")
def healthz():
    return {"status": "ok"}

@app.get("/model_info")
def model_info():
    return model.config.to_dict()

app.include_router(chat_router, prefix="/api")

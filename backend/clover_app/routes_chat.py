import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

router = APIRouter()

MODEL_NAME = os.getenv("MODEL_NAME", "LGAI-EXAONE/EXAONE-3.5-2.4B-Instruct")

print("🔹 [API] 모델 로딩 중...", MODEL_NAME)
torch.set_float32_matmul_precision("high")
torch.backends.cuda.matmul.allow_tf32 = True

tok = AutoTokenizer.from_pretrained(MODEL_NAME, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME, device_map="auto", dtype="float16", trust_remote_code=True
)
print("✅ [API] 모델 로드 완료!")

class ChatReq(BaseModel):
    prompt: str
    temperature: float = 0.7
    max_new_tokens: int = 128

@router.post("/chat")
def chat(req: ChatReq):
    try:
        sys_prefix = (
            "You are a helpful assistant for Clover Mobility. "
            "Answer concisely with bullet points if possible."
        )
        full_prompt = f"{sys_prefix}\nUser: {req.prompt}\nAssistant:"
        inputs = tok(full_prompt, return_tensors="pt").to(model.device)

        with torch.inference_mode():
            out = model.generate(
                **inputs,
                max_new_tokens=req.max_new_tokens,
                do_sample=True,
                temperature=req.temperature,
                top_p=0.9,
                repetition_penalty=1.1,
                eos_token_id=tok.eos_token_id,
            )
        text = tok.decode(out[0], skip_special_tokens=True)
        return {"answer": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
print("📦 모델 구성:", model.config)

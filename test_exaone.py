from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
MODEL_NAME = r"C:\Users\user\.cache\huggingface\hub\models--LGAI-EXAONE--EXAONE-3.5-2.4B-Instruct\snapshots\e949c91dec92095908d34e6b560af77dd0c993f8"
def main():
    print("🔹 모델 로딩 중...", MODEL_NAME)
    torch.set_float32_matmul_precision("high")
    torch.backends.cuda.matmul.allow_tf32 = True
    tok = AutoTokenizer.from_pretrained(MODEL_NAME, trust_remote_code=True)
    model = AutoModelForCausalLM.from_pretrained(
        MODEL_NAME,device_map="auto",torch_dtype=torch.float16,# ← 메모리/속도 최적
        trust_remote_code=True)
    print("✅ 모델 로드 완료!")

    prompt = (
        "당신은 전동 모빌리티 전문가입니다.\n"
        "질문: 전동모빌리티 유저들의 안면인식 기능추가에 대한 필요성 3줄로 핵심만.\n"
        "답변:"
    )
    print("📝 Prompt:", prompt)

    inputs = tok(prompt, return_tensors="pt").to(model.device)
    with torch.inference_mode():
        out = model.generate(**inputs, max_new_tokens=96, do_sample=True,
            temperature=0.7, top_p=0.9, repetition_penalty=1.1, 
            eos_token_id=tok.eos_token_id, pad_token_id=tok.pad_token_id)

    print("\n🤖 응답:\n", tok.decode(out[0], skip_special_tokens=True))

if __name__ == "__main__":
    main()
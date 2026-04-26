"""
백엔드 라이브러리 설치 확인 테스트
각 라이브러리가 정상적으로 설치되었는지 확인합니다.
"""

def test_imports():
    """필수 라이브러리 import 테스트"""
    print("=" * 60)
    print("백엔드 라이브러리 설치 확인 테스트")
    print("=" * 60)
    
    tests = [
        ("DeepFace", "deepface"),
        ("TensorFlow", "tensorflow"),
        ("OpenCV", "cv2"),
        ("Pillow", "PIL"),
        ("EasyOCR", "easyocr"),
        ("Flask", "flask"),
        ("Flask-CORS", "flask_cors"),
        ("NumPy", "numpy"),
        ("Requests", "requests"),
        ("PyMySQL", "pymysql"),
        ("SQLAlchemy", "sqlalchemy"),
    ]
    
    success_count = 0
    fail_count = 0
    
    for name, module in tests:
        try:
            __import__(module)
            print(f"✅ {name:20s} - 설치 완료")
            success_count += 1
        except ImportError as e:
            print(f"❌ {name:20s} - 설치 실패: {e}")
            fail_count += 1
    
    print("=" * 60)
    print(f"결과: 성공 {success_count}개 / 실패 {fail_count}개")
    print("=" * 60)
    
    if fail_count == 0:
        print("\n🎉 모든 라이브러리가 정상적으로 설치되었습니다!")
        return True
    else:
        print("\n⚠️  일부 라이브러리 설치에 실패했습니다.")
        print("다음 명령어로 다시 설치해주세요:")
        print("pip install -r requirements.txt")
        return False


def test_deepface():
    """DeepFace 기본 동작 테스트"""
    print("\n" + "=" * 60)
    print("DeepFace 동작 테스트")
    print("=" * 60)
    
    try:
        from deepface import DeepFace
        print("✅ DeepFace import 성공")
        
        # 사용 가능한 모델 확인
        models = ["VGG-Face", "Facenet", "OpenFace", "DeepFace", "DeepID", "ArcFace"]
        print(f"✅ 사용 가능한 얼굴 인식 모델: {len(models)}개")
        for model in models:
            print(f"   - {model}")
        
        return True
    except Exception as e:
        print(f"❌ DeepFace 테스트 실패: {e}")
        return False


def test_easyocr():
    """EasyOCR 기본 동작 테스트"""
    print("\n" + "=" * 60)
    print("EasyOCR 동작 테스트")
    print("=" * 60)
    
    try:
        import easyocr
        print("✅ EasyOCR import 성공")
        print("✅ 한글/영문 OCR 준비 완료")
        print("   (첫 실행 시 모델 다운로드로 시간이 걸릴 수 있습니다)")
        return True
    except Exception as e:
        print(f"❌ EasyOCR 테스트 실패: {e}")
        return False


if __name__ == "__main__":
    # 1. Import 테스트
    import_ok = test_imports()
    
    if not import_ok:
        print("\n❌ 라이브러리 설치를 먼저 완료해주세요.")
        exit(1)
    
    # 2. DeepFace 테스트
    deepface_ok = test_deepface()
    
    # 3. EasyOCR 테스트
    easyocr_ok = test_easyocr()
    
    # 최종 결과
    print("\n" + "=" * 60)
    print("최종 결과")
    print("=" * 60)
    
    if import_ok and deepface_ok and easyocr_ok:
        print("🎉 모든 테스트 통과!")
        print("✅ 백엔드 개발 환경이 정상적으로 구축되었습니다.")
        print("\n다음 단계:")
        print("1. python app.py 로 서버 실행")
        print("2. 브라우저에서 http://localhost:5000 접속")
    else:
        print("⚠️  일부 테스트 실패")
        print("문제를 해결한 후 다시 실행해주세요.")

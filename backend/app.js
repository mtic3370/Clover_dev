let faceDetector = null;
let faceCanvas = null;
let faceCtx = null;
let faceSupportWarned = false;

const USE_DEMO_FACE_ON_UNSUPPORTED = true; // ★ 휴대폰 등 FaceDetector 미지원 환경에서 데모용 미션 진행 허용 여부
// ===== 상태값 =====
const state = {
  fullRrn: null,
  dob: null,
  faceActions: [],
  currentFaceIndex: 0,
  faceVerified: false,
  stream: null,
  faceCheckTimer: null,
  faceOkCount: 0, // ★ 추가: 연속 OK 카운트
  isRealFaceDetection: false, // ★ 추가
  lastDistanceMessageTime: 0, // ★ 추가: 거리 메시지 디바운스용 타임스탬프
};

// ===== DOM =====
const logEl = document.getElementById("log");
const rrnFrontEl = document.getElementById("rrn-front");
const rrnBackFirstEl = document.getElementById("rrn-back-first");
const rrnBackMaskedEl = document.getElementById("rrn-back-masked");
const dobEl = document.getElementById("dob");
const btnSubmit = document.getElementById("btn-submit");

const btnOpenIdModal = document.getElementById("btn-open-id-modal");
const idModal = document.getElementById("id-modal");
const idModalContent = document.getElementById("id-modal-content");
const btnCloseIdModal = document.getElementById("btn-close-id-modal");
const btnMockOcr = document.getElementById("btn-mock-ocr");
const inputIdNumber = document.getElementById("input-id-number");
const btnConfirmId = document.getElementById("btn-confirm-id");
const idModalMessage = document.getElementById("id-modal-message");

const faceModal = document.getElementById("face-modal");
const btnCloseFaceModal = document.getElementById("btn-close-face-modal");
const faceActionsListEl = document.getElementById("face-actions-list");
const faceStatusEl = document.getElementById("face-status");
const faceErrorEl = document.getElementById("face-error");
const faceAreaEl = document.getElementById("face-area");
const faceCompleteIconEl = document.getElementById("face-complete-icon");
const videoEl = document.getElementById("video");
const faceSuccessOverlayEl = document.getElementById("face-success-overlay");
const faceSuccessTextEl = document.getElementById("face-success-text");

// ===== 안내선(타원) 위치/크기 동적 조정 =====
function updateFaceAreaLayout() {
  if (!videoEl) return;

  const containerRect = videoEl.getBoundingClientRect();
  const containerWidth = containerRect.width;
  const containerHeight = containerRect.height;
  if (!containerWidth || !containerHeight) return;

  // 가로/세로 중 짧은 변 기준으로 안내선 크기 설정
  const shorter = Math.min(containerWidth, containerHeight);

  const areaWidth = shorter * 0.4; // 짧은 변의 40%
  const areaHeight = shorter * 0.7; // 짧은 변의 60%

  // 카메라 중앙에 오도록 위치 계산
  const left = (containerWidth - areaWidth) / 2;
  const top = (containerHeight - areaHeight) / 2;

  faceAreaEl.style.width = areaWidth + "px";
  faceAreaEl.style.height = areaHeight + "px";
  faceAreaEl.style.left = left + "px";
  faceAreaEl.style.top = top + "px";
}

// ===== 유틸 =====
function log(msg) {
  logEl.textContent += msg + "\n";
}

function isValidRrn(rrn) {
  return /^\d{6}-\d{7}$/.test(rrn);
}

function parseDobFromRrn(rrn) {
  const [front, back] = rrn.split("-");
  const yy = front.substring(0, 2);
  const mm = front.substring(2, 4);
  const dd = front.substring(4, 6);
  const genderDigit = back.charAt(0);
  let century = "19";
  if (
    genderDigit === "3" ||
    genderDigit === "4" ||
    genderDigit === "7" ||
    genderDigit === "8"
  ) {
    century = "20";
  }
  const year = century + yy;
  return `${year}-${mm}-${dd}`;
}

// ===== MOCK: OCR =====
function mockOcr() {
  const sample = "900101-1234567";
  log("[MOCK OCR] " + sample);
  return sample;
}

// ===== MOCK: 얼굴 위치 + 거리 =====
// ===== 얼굴 위치 + 거리 계산 (Chrome FaceDetector) =====
async function getFaceMetrics() {
  try {
    // 1) FaceDetector 지원 여부 로그 (디버그)
    log("[FaceDetector 지원 여부] " + ("FaceDetector" in window));

    // 2) 지원 안 될 경우 데모 모드 처리
    if (!("FaceDetector" in window)) {
      if (USE_DEMO_FACE_ON_UNSUPPORTED) {
        // 데모: 항상 정상으로 간주
        return { inArea: true, distance: "ok" };
      }
      // 지원 안 함 → 실패
      return { inArea: false, distance: "unknown" };
    }

    // 3) FaceDetector 인스턴스 생성 (한 번만)
    if (!faceDetector) {
      faceDetector = new FaceDetector({ fastMode: true });
    }

    // 4) 비디오 프레임 캔버스로 복사
    const vw = videoEl.videoWidth;
    const vh = videoEl.videoHeight;
    if (!vw || !vh) return { inArea: false, distance: "unknown" };

    if (!faceCanvas) {
      faceCanvas = document.createElement("canvas");
      faceCtx = faceCanvas.getContext("2d");
    }
    faceCanvas.width = vw;
    faceCanvas.height = vh;
    faceCtx.drawImage(videoEl, 0, 0, vw, vh);

    // 5) 얼굴 검출
    const faces = await faceDetector.detect(faceCanvas);
    log("[FaceDetector faces length] " + faces.length);
    if (!faces || faces.length === 0) {
      return { inArea: false, distance: "unknown" };
    }

    // 6) 첫 번째 얼굴 사용
    const box = faces[0].boundingBox;
    const faceCenterX = box.x + box.width / 2;
    const faceCenterY = box.y + box.height / 2;

    const videoRect = videoEl.getBoundingClientRect();
    const areaRect  = faceAreaEl.getBoundingClientRect();

    const scaleX = videoRect.width / vw;
    const scaleY = videoRect.height / vh;

    // 7) 화면 좌표 변환
    const cx = videoRect.left + window.scrollX + faceCenterX * scaleX;
    const cy = videoRect.top  + window.scrollY + faceCenterY * scaleY;

    log("[FaceMetrics ERROR] " + e);
    return { inArea: false, distance: "unknown" };
  }
}
function pickRandomFaceActions() {
  const actions = [
    "정면을 바라보세요",
    "고개를 아래로 숙이세요",
    "고개를 왼쪽으로 돌리세요",
    "고개를 오른쪽으로 돌리세요",
    "고개를 위로 들어보세요",
  ];
  const shuffled = actions.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 2);
}

async function startCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    const msg = "이 브라우저에서는 카메라를 사용할 수 없습니다.";
    faceErrorEl.textContent = msg;
    alert(msg);
    log("[CAMERA] mediaDevices not available");
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
    });
    state.stream = stream;
    videoEl.srcObject = stream;
    log("[CAMERA] started");

    videoEl.onloadedmetadata = () => {
      updateFaceAreaLayout();
    };
  } catch (err) {
    const msg =
      "카메라를 사용할 수 없습니다.\n" +
      "1) 크롬 카메라 권한\n" +
      "2) HTTPS(또는 localhost) 접속 여부를 확인해 주세요.\n\n" +
      "에러: " +
      err;
    faceErrorEl.textContent = msg;
    alert(msg);
    log("[CAMERA ERROR] " + err);
  }
}

function stopCamera() {
  if (state.stream) {
    state.stream.getTracks().forEach((t) => t.stop());
    state.stream = null;
    log("[CAMERA] stopped");
  }
  if (state.faceCheckTimer) {
    clearInterval(state.faceCheckTimer);
    state.faceCheckTimer = null;
  }
}

function setFaceAreaError(on) {
  if (on) faceAreaEl.classList.add("face-area-error");
  else faceAreaEl.classList.remove("face-area-error");
}

// ===== 신분확인 팝업 열기 (버튼 위치 기준) =====
btnOpenIdModal.addEventListener("click", (e) => {
  idModal.style.display = "block";

  // 클릭 좌표 기준 위치 계산 (조금 오른쪽/아래로)
  const offsetX = 40; // 약 1cm
  const offsetY = 10;
  const x = e.clientX + window.scrollX + offsetX;
  const y = e.clientY + window.scrollY + offsetY;

  idModalContent.style.left = x + "px";
  idModalContent.style.top = y + "px";

  idModalMessage.textContent = "";
});

btnCloseIdModal.addEventListener("click", () => {
  idModal.style.display = "none";
});

btnMockOcr.addEventListener("click", () => {
  const rrn = mockOcr();
  inputIdNumber.value = rrn;
  idModalMessage.textContent = "OCR로 자동 인식된 값입니다. 필요시 수정하세요.";
});

// ===== ID 확인 → 안면인식 풀스크린으로 전환 =====
btnConfirmId.addEventListener("click", async () => {
  const rrn = inputIdNumber.value.trim();
  if (!isValidRrn(rrn)) {
    idModalMessage.textContent =
      "주민번호 형식이 올바르지 않습니다. 예: 900101-1234567";
    return;
  }

  state.fullRrn = rrn;
  state.dob = parseDobFromRrn(rrn);

  const [front, back] = rrn.split("-");
  rrnFrontEl.value = front;
  rrnBackFirstEl.value = back.charAt(0);
  rrnBackMaskedEl.textContent = "******";

  log("[ID CONFIRM] fullRrn=" + state.fullRrn + ", dob=" + state.dob);

  idModal.style.display = "none";
  await startFaceVerification();
});

/** ========== 랜덤 미션 기반 안면인식 ========== **/

// 1) 미션 목록
const FACE_ACTIONS = [
  "정면을 바라보세요",
  "고개를 아래로 숙이세요",
  "고개를 왼쪽으로 돌리세요",
  "고개를 오른쪽으로 돌리세요",
  "고개를 위로 들어보세요",
];

// 2) 2개 미션 랜덤 뽑기
function pickFaceMissions() {
  const shuffled = FACE_ACTIONS.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 2);
}

// 3) 미션 기준 얼굴 움직임 판정
function checkMissionPass(action, metrics) {
  // 공통 기본 조건
  const baseOK = metrics.inArea && metrics.distance === "ok";
  log("[CheckPass] action:", action, "metrics:", metrics, "baseOK:", baseOK);
  if (!baseOK) return false;

  // ★ 여기서는 아직 pitch/yaw 판단 불가능 → 임시로 모두 baseOK로 처리
  switch (action) {
    case "정면을 바라보세요":
    case "고개를 아래로 숙이세요":
    case "고개를 왼쪽으로 돌리세요":
    case "고개를 오른쪽으로 돌리세요":
    case "고개를 위로 들어보세요":
      return baseOK;

    default:
      return false;
  }
}

// 4) 미션 기반 안면인식 시작
async function startFaceVerification() {
  state.faceActions = pickFaceMissions(); // 미션 2개 선택
  state.currentFaceIndex = 0; // 첫 미션부터 시작
  state.faceVerified = false;
  state.faceOkCount = 0;
  //state.isRealFaceDetection = "FaceDetector" in window; // ★ 추가

  faceActionsListEl.innerHTML = "";
  state.faceActions.forEach((a, i) => {
    const li = document.createElement("li");
    li.textContent = a;
    if (i === 0) li.style.fontWeight = "bold";
    faceActionsListEl.appendChild(li);
  });

  faceSuccessOverlayEl.classList.add("hidden");
  faceErrorEl.textContent = "";
  faceStatusEl.textContent = "미션 수행을 시작합니다.";

  // ★ 추가: 카메라 모달 열기
  faceModal.style.display = "block";

  await startCamera();
  updateFaceAreaLayout();

  runMissionLoop();
}
// 미션별로 필요한 연속 성공 횟수
function requiredPassCount(index) {
  // if (index === 0) return 2; // 1번째 동작은 2번 연속 OK
  // if (index === 1) return 2; // 2번째 동작은 4번 연속 OK (좀 더 깐깐하게)
  return 1; // 혹시 대비해서 기본값
}

// 5) 미션 체크 타이머
function runMissionLoop() {
  if (state.faceCheckTimer) clearInterval(state.faceCheckTimer);

  state.faceCheckTimer = setInterval(async () => {
    if (!state.stream || state.faceVerified) return;

    const metrics = await getFaceMetrics();

    // 안내 타원 밖 = 실패
    if (!metrics.inArea) {
      faceErrorEl.textContent = "타원 영역 안에 얼굴을 맞춰주세요.";
      setFaceAreaError(true);
      return;
    } else {
      setFaceAreaError(false);
    }

    // ---------- 거리 체크 (디바운스 적용) ----------
 
    const now = Date.now(); // ← 먼저 현재 시각을 구함
    // 거리 체크
    if (metrics.distance === "too_far") {
      if (now - state.lastDistanceMessageTime > 2000) {
      faceErrorEl.textContent = "조금 더 가까이 와주세요.";
      setTimeout(() => (faceErrorEl.textContent = ""), 2000);
      state.lastDistanceMessageTime = now;
    }
      return;
  }else if (metrics.distance === "too_close") {
     if (now - state.lastDistanceMessageTime > 2000) {
      faceErrorEl.textContent = "조금 더 멀어져주세요.";
      setTimeout(() => (faceErrorEl.textContent = ""), 2000);
      state.lastDistanceMessageTime = now;
     }
      return;
    }
    // ---------- 거리 체크 끝 ----------
    faceErrorEl.textContent = "";

    /** ★ 핵심: 현재 미션 수행했는지 판정 */
    const currentAction = state.faceActions[state.currentFaceIndex];
    const needCount = requiredPassCount(state.currentFaceIndex);
    const passed = checkMissionPass(currentAction, metrics);
    if (!passed) return;// 아직 미션 조건을 만족하지 않음

    // 미션 성공 카운트 증가
    state.currentFaceIndex += 1;
    if (state.faceOkCount < needCount) {
      // 연속 성공이 부족하면 진행 상황 표시
      faceAreaEl.textContent = `현재동작 유지중...(${state.faceOkCount}/${needCount})`;
      return;
    }

    // 두 개 모두 완료 → 최종 인증 성공
    if (state.currentFaceIndex >= state.faceActions.length) {
      finishFaceVerification();
      return;
    }
    // 여기까지 오면 한 번 성공
    state.faceOkCount += 1;
    if (state.faceOkCount < needCount) {
      // 연속 성공이 부족하면 진행 상황 표시
      faceAreaEl.textContent = `현재동작 유지중...(${state.faceOkCount}/${needCount})`;
      return;
    }
    // 연속 성공이 부족하면 진행 상황 표시
    state.faceOkCount = 0;
    const items = faceActionsListEl.querySelectorAll("li");
    items[state.currentFaceIndex].style.fontWeight = "normal";
    items[state.currentFaceIndex].style.textDecoration = "line-through";
    
    // 다음 미션 인덱스 증가
    state.currentFaceIndex += 1;

    if (state.currentFaceIndex >= state.faceActions.length) {
      // 모든 미션 완료 → 인증 성공 처리
      finishFaceVerification();
      return;
    }

    // 다음 미션 글씨 강조
    items[state.currentFaceIndex].style.fontWeight = "bold";
    faceStatusEl.textContent = "다음 미션을 수행하세요.";
  }, 600);
}

// 6) 최종 성공 처리
function finishFaceVerification() {
  stopCamera();

  //   // ★ 실제 FaceDetector가 동작하는 환경에서만 인증 성공 / 가입 허용
  //   if (!state.isRealFaceDetection) {
  //     // 데모용 성공 표시만 보여주고, 가입은 막아둠
  //     faceStatusEl.textContent =
  //       "현재 기기/브라우저에서는 안면인식 데모만 가능하며, 가입 완료는 비활성화됩니다.";
  //     faceSuccessTextEl.textContent = "안면인식 (데모)";
  //     faceSuccessOverlayEl.classList.remove("hidden");
  //     // 여기서는 state.faceVerified = true; 안 함
  //     // 여기서는 btnSubmit.disabled = false; 안 함
  //     return;
  //   }

  // ★ 여기부터는 ‘진짜 인식 환경’에서만 실행됨
  state.faceVerified = true;
  faceStatusEl.textContent = "";
  faceSuccessTextEl.textContent =
    "안면인식 성공,  가입 완료 버튼을 눌러주세요!";
  faceSuccessOverlayEl.classList.remove("hidden");

  dobEl.value = state.dob;
  btnSubmit.disabled = false;
}

// 안면인식 팝업 닫기
btnCloseFaceModal.addEventListener("click", () => {
  faceModal.style.display = "none";
  stopCamera();
});

// 가입 완료
btnSubmit.addEventListener("click", () => {
  if (!state.faceVerified) {
    alert("안면인식 2단계 인증을 먼저 완료해 주세요.");
    return;
  }
  const name = document.getElementById("name").value.trim();
  if (!name) {
    alert("이름을 입력해 주세요.");
    return;
  }

  alert(
    "가입 완료 (데모)\n" +
      "이름: " +
      name +
      "\n" +
      "주민번호: " +
      rrnFrontEl.value +
      "-" +
      rrnBackFirstEl.value +
      "******\n" +
      "생년월일: " +
      dobEl.value
  );
});
window.addEventListener("resize", updateFaceAreaLayout);
window.addEventListener("orientationchange", updateFaceAreaLayout);
window.addEventListener("beforeunload", stopCamera);

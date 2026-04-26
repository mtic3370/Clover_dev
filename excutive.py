import matplotlib.pyplot as plt
import matplotlib.font_manager as fm

plt.rcParams['font.family'] = 'NanumGothic'   # 나눔고딕 사용
plt.rcParams['axes.unicode_minus'] = False   # 마이너스(-) 깨짐 방지

# 설치된 폰트 확인 (선택사항)
[f.name for f in fm.fontManager.ttflist if 'Nanum' in f.name]

# 예시 데이터 (희종님 IR용이니까 '추세' 느낌만 전달용)
years = [2021, 2022, 2023, 2024, 2025]
pm_usage = [100, 140, 190, 250, 330]        # PM 이용량 증가 (지수)
battery_incidents = [10, 18, 26, 41, 60]    # 배터리 사고 증가 (지수)

plt.figure(figsize=(8, 5))

plt.plot(years, pm_usage, marker='o', label='PM 이용량 증가 추세')
plt.plot(years, battery_incidents, marker='o', label='배터리 사고 증가 추세')

plt.title('PM 이용량 및 배터리 사고 증가 추세')
plt.xlabel('연도')
plt.ylabel('지수(예시)')
plt.legend()

plt.grid(True)
plt.tight_layout()
plt.show()

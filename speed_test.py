import speedtest

def test_internet_speed():
    print("🌐 Testing internet speed... (this may take some seconds)\n")

    st = speedtest.Speedtest()

    # 1) 가장 빠른 서버 자동 선택
    st.get_best_server()

    # 2) 다운로드 / 업로드 속도 측정 (bit per second로 반환됨)
    download_bps = st.download()
    upload_bps = st.upload()

    # 3) Mbps 단위로 변환
    download_mbps = download_bps / (1024 * 1024)
    upload_mbps = upload_bps / (1024 * 1024)

    # 4) 핑 (ms)
    ping_ms = st.results.ping

    print(f"Ping     : {ping_ms:.2f} ms")
    print(f"Download : {download_mbps:.2f} Mbps")
    print(f"Upload   : {upload_mbps:.2f} Mbps")

if __name__ == "__main__":
    test_internet_speed()

#!/usr/bin/env python3
import os
import sys
import requests

def main():
    # Desteklenen dosya isimleri ve DefectDojo'da kullanılacak scan_type değerleri
    valid_files = {
        "results.sarif": "SARIF",
        "semgrep.sarif": "SARIF",
        "zap-report.xml": "ZAP Scan",
    }

    # Eğer komut satırı argümanları verilmişse, onları kullan; aksi halde çalışma dizininde bulunan dosyalar üzerinden devam et.
    if len(sys.argv) > 1:
        files_to_import = sys.argv[1:]
    else:
        files_to_import = [f for f in valid_files if os.path.exists(f)]
    
    if not files_to_import:
        print("İşlenecek uygun tarama çıktısı dosyası bulunamadı. Çıkılıyor.")
        sys.exit(1)

    # DefectDojo URL ve kimlik doğrulama bilgileri
    url = "http://34.28.145.76:8080/api/v2/import-scan/"

    # GitHub Actions'dan gelecek token bilgisini ortam değişkeninden okuyun
    token = os.environ.get("DEFECTDOJO_API_TOKEN")
    if not token:
        print("DEFECTDOJO_API_TOKEN ortam değişkeni ayarlanmamış. Çıkılıyor.")
        sys.exit(1)

    headers = {
        "Authorization": f"Token {token}"
    }

    # Ortak data bilgileri: aktif, doğrulanmış, minimum seviye ve engagement id (1)
    base_data = {
        "active": True,
        "verified": True,
        "minimum_severity": "Low",
        "engagement": 4
    }

    for file_name in files_to_import:
        if file_name not in valid_files:
            print(f"Bilinmeyen dosya, atlanıyor: {file_name}")
            continue

        scan_type = valid_files[file_name]
        data = base_data.copy()
        data["scan_type"] = scan_type

        print(f"{file_name} dosyası '{scan_type}' tipi ile DefectDojo'ya gönderiliyor...")
        try:
            with open(file_name, "rb") as f:
                files_payload = {"file": f}
                # allow_redirects=False ekleyerek yönlendirmelerden kaynaklanan hataların önüne geçiyoruz
                response = requests.post(url, headers=headers, data=data, files=files_payload, allow_redirects=False)
            
            if response.status_code == 201:
                print(f"Başarıyla içe aktarıldı: {file_name}")
            else:
                print(f"{file_name} içe aktarılırken hata oluştu (Status Code: {response.status_code}): {response.content}")
        except Exception as e:
            print(f"{file_name} dosyası işlenirken hata: {e}")

if __name__ == "__main__":
    main()

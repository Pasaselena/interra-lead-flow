# Interra LeadFlow

Kampanya ve potansiyel müşteri takip uygulaması. Önce frontend demo verilerle geliştirilecek, ardından backend ve API bağlantısı hazırlanacak.

## Frontend'i çalıştırma

Node.js ve npm kurulu olmalıdır. Proje ana klasöründe:

```bash
cd "FrontEnd"
npm ci
npm run dev
```

Terminalde gösterilen yerel adresi tarayıcıda açın.

## Kontroller

Frontend klasöründe:

```bash
npm run build
npm run lint
```

## Çalışma düzeni

- `main`: Kontrol edilmiş değişikliklerin birleştirildiği ana dal.
- `feature/frontend-setup`: Frontend başlangıç kurulumu.
- `git status`: Geçerli dalı ve dosya değişikliklerini gösterir.
- `git diff`: Takip edilen dosyalardaki değişiklikleri gösterir.
- `git add`: Bir sonraki commit'e eklenecek değişiklikleri seçer.
- `git commit`: Seçilen değişiklikleri bilgisayardaki Git geçmişine kaydeder.
- `git push`: Commit'leri GitHub'a gönderir.

## Mevcut aşama

React + TypeScript + Vite başlangıç kurulumu. Backend bağlantısı henüz yoktur.

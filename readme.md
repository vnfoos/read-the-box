# 🚀 Dự án Text To Speech (Chrome Extension = Gleam & Lustre & Saola)

Dự án phát triển Chrome Extension sử dụng ngôn ngữ lập trình **Gleam**, framework **Lustre** và công cụ build **Just**. Hỗ trợ tự động theo dõi thay đổi file (Hot-reload) trong quá trình phát triển.

---

## 🛠 Yêu cầu hệ thống & Cài đặt môi trường

Để chạy được dự án này trên **Windows 11**, bạn cần cài đặt các công cụ global sau đây.

### Cài đặt các công cụ hệ thống (Global)
Mở Terminal (PowerShell hoặc Command Prompt với quyền Admin) và chạy các lệnh sau:

```bash
# Bước 1: Cài đặt Erlang (Nền tảng bắt buộc để chạy Gleam)
winget install Ericsson.Erlang

# Bước 2: Cài đặt ngôn ngữ Gleam
winget install Gleam.Gleam

# Bước 3: Cài đặt trình quản lý tác vụ Just (Casey.Just)
winget install Casey.Just

# Bước 4: Cài đặt công cụ tự động reload file (Yêu cầu đã cài Node.js)
npm install -g chokidar-cli
```

## ▶️ Hướng dẫn sử dụng

Sau khi Extension đã được nạp vào Chrome, bạn làm theo các bước sau:

1. **Mở các trang web mục tiêu:**
   * 📄 [Việt Nam Thư Quán](ví dụ http://vietnamthuquan.eu/(X(1)S(v5xxuh45u3svbsjc1o3dp155))/truyen/truyen.aspx?tid=2qtqv3m3237n1nnn0n3n1n31n343tq83a3q3m3237nvn#phandau)
   * 🤖 [Google Gemini AI](https://gemini.google.com/)
2. **Kích hoạt:** Click vào icon extension, nhấn **Load** rồi nhấn **Play**.
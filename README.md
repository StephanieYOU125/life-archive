# Life Archive

A private life archive for organizing photos, memories, stories, and book drafts.

## 私人書稿工作室 v8 + PWA

Life Archive 用照片作為記憶入口：上傳以前的照片，再記錄時間、人生階段、地點與「那時候，我在做什麼？」。目前已加入 PWA 支援，可在 HTTPS 部署後加入 iPhone / Android 主畫面，像 App 一樣獨立開啟。

### PWA 檔案

- `index.html`：照片回憶主程式
- `app.html`：手機 App / PWA 入口
- `manifest.webmanifest`：App 名稱、圖示、顯示模式
- `service-worker.js`：離線 App shell
- `app-icon.svg`：Life Archive 圖示

### 隱私原則

- Repository 應維持 **Private**。
- 真正私人書稿不要 commit 到 GitHub。
- 照片與回憶內容儲存在使用該網站的瀏覽器 IndexedDB，不會由網站主動上傳 GitHub。
- 換手機、清除 Safari 網站資料或移除瀏覽器資料，都可能失去本機內容；請定期使用「匯出 JSON」備份。

### 本機使用

```bash
python3 -m http.server 8765 --bind 127.0.0.1
```

電腦版：`http://127.0.0.1:8765/`

PWA 入口：`http://127.0.0.1:8765/app.html`

### iPhone 安裝

部署到 HTTPS 網址後，用 Safari 開啟 `app.html`，選「分享」→「加入主畫面」。安裝後會以獨立 App 視窗啟動。

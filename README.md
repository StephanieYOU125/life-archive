# Life Archive

A private life archive for organizing photos, memories, stories, and book drafts.

## 私人書稿工作室 v8

這個 repository 用來保存「私人書稿工作室」的程式碼版本。v8 新增「照片回憶」：可以上傳以前的照片，並在每張照片下記錄時間、人生階段、地點，以及「那時候，我在做什麼？」。

### 隱私原則

- Repository 應維持 **Private**。
- 真正的私人書稿 `draft-data.js` 不放進 GitHub；repo 中只保留空白 placeholder。
- 照片本身與回憶資料預設儲存在瀏覽器 IndexedDB，不會由網站主動上傳 GitHub。
- 請另外定期下載網站的 JSON 備份。

### 本機使用

在 repository 根目錄啟動簡單 HTTP server，例如：

```bash
python3 -m http.server 8765 --bind 127.0.0.1
```

然後開啟：`http://127.0.0.1:8765/`

> 不建議直接以 `file://` 開啟，因為 GitHub-safe 版本會載入拆分後的本機程式碼檔案。

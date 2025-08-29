# 設計文件

## 概述

這個網頁應用程式將使用純 HTML、CSS 和 JavaScript 建立，提供簡潔的標籤頁介面。應用程式將包含兩個主要區域：標籤頁導航和內容顯示區域。設計重點在於簡單性、響應式佈局和可靠的 Power BI 嵌入功能。

## 架構

### 技術堆疊
- **前端：** HTML5, CSS3, Vanilla JavaScript
- **嵌入技術：** HTML iframe 用於 Power BI 報表
- **樣式框架：** 自訂 CSS（無外部依賴）

### 檔案結構
```
/
├── index.html          # 主要 HTML 檔案
├── styles.css          # 樣式表
├── script.js           # JavaScript 功能
└── README.md           # 專案說明
```

## 元件和介面

### 1. 標籤頁導航元件
**功能：** 提供兩個可點擊的標籤頁
- 歡迎標籤頁（預設選中）
- Power BI 報表標籤頁

**介面：**
```html
<div class="tab-container">
  <div class="tab-nav">
    <button class="tab-button active" data-tab="welcome">歡迎</button>
    <button class="tab-button" data-tab="powerbi">Power BI 報表</button>
  </div>
</div>
```

### 2. 內容顯示區域
**功能：** 根據選中的標籤頁顯示對應內容

**歡迎頁面內容：**
```html
<div class="tab-content active" id="welcome">
  <h1>歡迎使用報表儀表板</h1>
  <p>請選擇 Power BI 報表標籤頁來查看資料分析內容。</p>
</div>
```

**Power BI 內容：**
```html
<div class="tab-content" id="powerbi">
  <iframe class="powerbi-frame" 
          src="https://app.powerbi.com/reportEmbed?reportId=d79fa9cc-0415-4121-87eb-f3635d9f13c4&autoAuth=true&ctid=305675df-dc39-4b66-8034-b8e7a8cb798c&filterPaneEnabled=false&language=en&formatlocale=en-US"
          frameborder="0" 
          allowFullScreen="true">
  </iframe>
  <div class="error-message" style="display: none;">
    <p>無法載入 Power BI 報表。請檢查網路連線或聯絡系統管理員。</p>
  </div>
</div>
```

### 3. JavaScript 控制器
**功能：** 處理標籤頁切換邏輯和錯誤處理

**主要方法：**
- `initializeTabs()`: 初始化標籤頁事件監聽器
- `switchTab(tabName)`: 切換到指定標籤頁
- `handlePowerBIError()`: 處理 Power BI 載入錯誤

## 資料模型

### 標籤頁狀態
```javascript
const tabState = {
  currentTab: 'welcome',
  tabs: ['welcome', 'powerbi'],
  powerBILoaded: false
}
```

### Power BI 設定
```javascript
const powerBIConfig = {
  embedUrl: 'https://app.powerbi.com/reportEmbed?reportId=d79fa9cc-0415-4121-87eb-f3635d9f13c4&autoAuth=true&ctid=305675df-dc39-4b66-8034-b8e7a8cb798c&filterPaneEnabled=false&language=en&formatlocale=en-US',
  loadTimeout: 10000 // 10 秒載入超時
}
```

## 錯誤處理

### Power BI 載入錯誤
1. **網路連線問題：** 顯示友善的錯誤訊息，建議檢查網路連線
2. **權限問題：** 提示使用者可能需要登入或聯絡管理員
3. **載入超時：** 在 10 秒後顯示超時訊息

### 瀏覽器相容性
1. **舊版瀏覽器：** 提供基本功能降級
2. **JavaScript 停用：** 顯示靜態內容和說明

## 測試策略

### 單元測試
- 標籤頁切換功能測試
- 錯誤處理邏輯測試
- 響應式佈局測試

### 整合測試
- Power BI 嵌入載入測試
- 跨瀏覽器相容性測試
- 行動裝置響應式測試

### 使用者驗收測試
- 標籤頁導航流暢性
- Power BI 報表顯示正確性
- 錯誤情況下的使用者體驗

## 樣式設計

### CSS 架構
```css
/* 主要佈局 */
.container { /* 主容器 */ }
.tab-container { /* 標籤頁容器 */ }
.tab-nav { /* 導航區域 */ }
.tab-content { /* 內容區域 */ }

/* 響應式設計 */
@media (max-width: 768px) { /* 平板和手機樣式 */ }
@media (max-width: 480px) { /* 手機樣式 */ }
```

### 設計原則
- **簡潔性：** 最小化視覺干擾
- **可用性：** 清晰的標籤頁狀態指示
- **響應式：** 適應不同螢幕尺寸
- **無障礙：** 支援鍵盤導航和螢幕閱讀器
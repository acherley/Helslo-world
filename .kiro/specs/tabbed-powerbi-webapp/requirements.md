# 需求文件

## 介紹

這個功能是建立一個簡單的網頁應用程式，包含兩個標籤頁介面。第一個標籤頁顯示歡迎訊息，第二個標籤頁嵌入指定的 Power BI 報表。這個應用程式將提供簡潔的使用者介面，讓使用者可以輕鬆在歡迎頁面和 Power BI 報表之間切換。

## 需求

### 需求 1

**使用者故事：** 作為一個使用者，我想要看到一個有標籤頁的網頁介面，這樣我就可以在不同的內容區域之間切換

#### 驗收標準

1. WHEN 使用者載入網頁 THEN 系統 SHALL 顯示兩個標籤頁（歡迎頁和 Power BI 報表頁）
2. WHEN 使用者點擊任一標籤頁 THEN 系統 SHALL 切換到對應的內容區域
3. WHEN 標籤頁被選中時 THEN 系統 SHALL 以視覺方式突出顯示該標籤頁
4. WHEN 網頁首次載入時 THEN 系統 SHALL 預設顯示歡迎頁標籤

### 需求 2

**使用者故事：** 作為一個使用者，我想要在歡迎標籤頁中看到友善的歡迎訊息，這樣我就能了解這個網頁的用途

#### 驗收標準

1. WHEN 使用者選擇歡迎標籤頁 THEN 系統 SHALL 顯示歡迎標題
2. WHEN 歡迎頁面顯示時 THEN 系統 SHALL 包含簡潔的說明文字
3. WHEN 歡迎頁面載入時 THEN 系統 SHALL 使用清晰易讀的字體和適當的間距

### 需求 3

**使用者故事：** 作為一個使用者，我想要在 Power BI 標籤頁中查看嵌入的報表，這樣我就可以分析資料和視覺化內容

#### 驗收標準

1. WHEN 使用者選擇 Power BI 標籤頁 THEN 系統 SHALL 載入指定的 Power BI 報表
2. WHEN Power BI 報表載入時 THEN 系統 SHALL 使用提供的 URL：https://app.powerbi.com/reportEmbed?reportId=d79fa9cc-0415-4121-87eb-f3635d9f13c4&autoAuth=true&ctid=305675df-dc39-4b66-8034-b8e7a8cb798c&filterPaneEnabled=false&language=en&formatlocale=en-US
3. WHEN Power BI 報表顯示時 THEN 系統 SHALL 確保報表佔滿整個標籤頁內容區域
4. IF Power BI 報表載入失敗 THEN 系統 SHALL 顯示適當的錯誤訊息

### 需求 4

**使用者故事：** 作為一個使用者，我想要網頁在不同裝置上都能正常顯示，這樣我就可以在桌面和行動裝置上使用

#### 驗收標準

1. WHEN 使用者在桌面瀏覽器中開啟網頁 THEN 系統 SHALL 適當調整標籤頁和內容的大小
2. WHEN 使用者在行動裝置上開啟網頁 THEN 系統 SHALL 保持標籤頁功能的可用性
3. WHEN 視窗大小改變時 THEN 系統 SHALL 動態調整 Power BI 報表的顯示尺寸
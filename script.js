// 標籤頁狀態管理
const tabState = {
    currentTab: 'welcome',
    tabs: ['welcome', 'powerbi'],
    powerBILoaded: false
};

// Power BI 設定
const powerBIConfig = {
    embedUrl: 'https://app.powerbi.com/reportEmbed?reportId=d79fa9cc-0415-4121-87eb-f3635d9f13c4&autoAuth=true&ctid=305675df-dc39-4b66-8034-b8e7a8cb798c&filterPaneEnabled=false&language=en&formatlocale=en-US',
    loadTimeout: 10000, // 10 秒載入超時
    retryAttempts: 3, // 重試次數
    retryDelay: 2000 // 重試延遲時間（毫秒）
};

// 錯誤處理狀態
const errorState = {
    currentAttempt: 0,
    lastError: null,
    errorTypes: {
        NETWORK_ERROR: 'network',
        TIMEOUT_ERROR: 'timeout',
        PERMISSION_ERROR: 'permission',
        UNKNOWN_ERROR: 'unknown'
    }
};

/**
 * 初始化標籤頁功能
 */
function initializeTabs() {
    // 獲取所有標籤頁按鈕
    const tabButtons = document.querySelectorAll('.tab-button');
    
    // 為每個標籤頁按鈕添加點擊事件監聽器
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
    
    // 確保預設選中歡迎標籤頁
    switchTab('welcome');
}

/**
 * 切換到指定的標籤頁
 * @param {string} tabName - 要切換到的標籤頁名稱
 */
function switchTab(tabName) {
    // 驗證標籤頁名稱是否有效
    if (!tabState.tabs.includes(tabName)) {
        console.error(`Invalid tab name: ${tabName}`);
        return;
    }
    
    // 更新當前標籤頁狀態
    tabState.currentTab = tabName;
    
    // 移除所有標籤頁按鈕的 active 類別
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    // 為當前選中的標籤頁按鈕添加 active 類別
    const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    // 隱藏所有內容區域
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // 顯示選中的內容區域
    const activeContent = document.getElementById(tabName);
    if (activeContent) {
        activeContent.classList.add('active');
    }
    
    // 如果切換到 Power BI 標籤頁，處理特殊邏輯
    if (tabName === 'powerbi') {
        handlePowerBITabSwitch();
        // 開始健康檢查
        setTimeout(() => {
            startPowerBIHealthCheck();
        }, 1000);
    }
}

/**
 * 處理 Power BI 標籤頁切換的特殊邏輯
 */
function handlePowerBITabSwitch() {
    if (!tabState.powerBILoaded) {
        // 重置錯誤狀態，準備新的載入嘗試
        if (errorState.currentAttempt === 0) {
            errorState.lastError = null;
        }
        setupPowerBILoadingHandlers();
    } else {
        // 如果已經載入成功，確保顯示正確的內容
        const powerBIContent = document.getElementById('powerbi');
        const loadingOverlay = powerBIContent.querySelector('.loading-overlay');
        const errorMessage = powerBIContent.querySelector('.error-message');
        const powerBIFrame = powerBIContent.querySelector('.powerbi-frame');
        
        if (loadingOverlay) loadingOverlay.style.display = 'none';
        if (errorMessage) errorMessage.style.display = 'none';
        if (powerBIFrame) powerBIFrame.style.opacity = '1';
    }
}

/**
 * 設定 Power BI 載入處理器
 */
function setupPowerBILoadingHandlers() {
    const powerBIFrame = document.querySelector('.powerbi-frame');
    
    if (!powerBIFrame) {
        console.error('Power BI iframe not found');
        handlePowerBIError('系統錯誤：找不到 Power BI 報表容器', errorState.errorTypes.UNKNOWN_ERROR);
        return;
    }
    
    // 重置錯誤狀態
    errorState.currentAttempt++;
    errorState.lastError = null;
    
    // 顯示載入狀態
    showPowerBILoadingState();
    
    // 設定載入超時處理
    const loadTimeout = setTimeout(() => {
        if (!tabState.powerBILoaded) {
            handleLoadTimeout();
        }
    }, powerBIConfig.loadTimeout);
    
    // 檢查網路連線狀態
    if (!navigator.onLine) {
        clearTimeout(loadTimeout);
        handlePowerBIError('網路連線錯誤：請檢查您的網路連線狀態', errorState.errorTypes.NETWORK_ERROR);
        return;
    }
    
    // 檢查 iframe 是否已經載入完成
    if (powerBIFrame.contentDocument && powerBIFrame.contentDocument.readyState === 'complete') {
        // 如果已經載入完成，直接處理成功
        clearTimeout(loadTimeout);
        setTimeout(() => {
            validatePowerBIContent(powerBIFrame);
        }, 1000);
    } else {
        // 監聽 iframe 載入事件
        powerBIFrame.onload = function() {
            clearTimeout(loadTimeout);
            // 延遲一點時間確保內容完全載入
            setTimeout(() => {
                validatePowerBIContent(powerBIFrame);
            }, 2000);
        };
    }
    
    // 監聽 iframe 錯誤事件
    powerBIFrame.onerror = function(event) {
        clearTimeout(loadTimeout);
        console.error('Power BI iframe error:', event);
        handlePowerBIError('載入錯誤：Power BI 報表載入失敗', errorState.errorTypes.NETWORK_ERROR);
    };
    
    // 監聽網路狀態變化
    window.addEventListener('online', handleNetworkReconnect);
    window.addEventListener('offline', handleNetworkDisconnect);
    
    console.log(`Power BI 載入處理器已設定 (嘗試 ${errorState.currentAttempt}/${powerBIConfig.retryAttempts})`);
}

/**
 * 顯示 Power BI 載入狀態
 */
function showPowerBILoadingState() {
    const powerBIContent = document.getElementById('powerbi');
    const powerBIFrame = powerBIContent.querySelector('.powerbi-frame');
    const existingLoader = powerBIContent.querySelector('.loading-overlay');
    
    // 如果載入覆蓋層不存在，則建立一個
    if (!existingLoader) {
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <p>正在載入 Power BI 報表，請稍候...</p>
            </div>
        `;
        
        // 插入到內容區域
        powerBIContent.appendChild(loadingOverlay);
    }
    
    // 顯示載入覆蓋層，隱藏錯誤訊息
    const loadingOverlay = powerBIContent.querySelector('.loading-overlay');
    const errorMessage = powerBIContent.querySelector('.error-message');
    
    if (loadingOverlay) loadingOverlay.style.display = 'flex';
    if (errorMessage) errorMessage.style.display = 'none';
    
    // 隱藏 iframe 直到載入完成
    if (powerBIFrame) powerBIFrame.style.opacity = '0';
}

/**
 * 處理 Power BI 載入成功
 */
function handlePowerBILoadSuccess() {
    const powerBIContent = document.getElementById('powerbi');
    const loadingOverlay = powerBIContent.querySelector('.loading-overlay');
    const errorMessage = powerBIContent.querySelector('.error-message');
    const powerBIFrame = powerBIContent.querySelector('.powerbi-frame');
    
    // 隱藏載入覆蓋層和錯誤訊息
    if (loadingOverlay) loadingOverlay.style.display = 'none';
    if (errorMessage) errorMessage.style.display = 'none';
    
    // 顯示 iframe
    if (powerBIFrame) {
        powerBIFrame.style.opacity = '1';
        powerBIFrame.style.transition = 'opacity 0.3s ease-in-out';
    }
    
    // 標記為已載入
    tabState.powerBILoaded = true;
    
    console.log('Power BI 報表載入成功');
}

/**
 * 驗證 Power BI 內容是否正確載入
 * @param {HTMLIFrameElement} iframe - Power BI iframe 元素
 */
function validatePowerBIContent(iframe) {
    try {
        // 檢查 iframe 是否可訪問
        if (!iframe.contentWindow) {
            throw new Error('無法訪問 Power BI 內容');
        }
        
        // 檢查 iframe 的 src 是否正確
        if (!iframe.src || !iframe.src.includes('powerbi.com')) {
            throw new Error('Power BI URL 無效');
        }
        
        // 如果所有檢查都通過，標記為載入成功
        handlePowerBILoadSuccess();
        
    } catch (error) {
        console.error('Power BI 內容驗證失敗:', error);
        // 嘗試重新載入或顯示錯誤
        if (errorState.currentAttempt < powerBIConfig.retryAttempts) {
            retryPowerBILoad();
        } else {
            handlePowerBIError('驗證錯誤：Power BI 報表內容無法正確載入', errorState.errorTypes.PERMISSION_ERROR);
        }
    }
}

/**
 * 處理載入超時
 */
function handleLoadTimeout() {
    console.warn('Power BI 載入超時');
    errorState.lastError = errorState.errorTypes.TIMEOUT_ERROR;
    
    if (errorState.currentAttempt < powerBIConfig.retryAttempts) {
        retryPowerBILoad();
    } else {
        handlePowerBIError(
            `載入超時：Power BI 報表載入時間過長，已嘗試 ${powerBIConfig.retryAttempts} 次。請檢查網路連線或稍後再試。`,
            errorState.errorTypes.TIMEOUT_ERROR
        );
    }
}

/**
 * 重試載入 Power BI
 */
function retryPowerBILoad() {
    console.log(`準備重試載入 Power BI (${errorState.currentAttempt}/${powerBIConfig.retryAttempts})`);
    
    // 顯示重試訊息
    showRetryMessage();
    
    // 延遲後重試
    setTimeout(() => {
        const powerBIFrame = document.querySelector('.powerbi-frame');
        if (powerBIFrame) {
            // 重新設定 iframe src 觸發重新載入
            const originalSrc = powerBIFrame.src;
            powerBIFrame.src = '';
            setTimeout(() => {
                powerBIFrame.src = originalSrc;
                setupPowerBILoadingHandlers();
            }, 500);
        }
    }, powerBIConfig.retryDelay);
}

/**
 * 顯示重試訊息
 */
function showRetryMessage() {
    const powerBIContent = document.getElementById('powerbi');
    const loadingOverlay = powerBIContent.querySelector('.loading-overlay');
    
    if (loadingOverlay) {
        const loadingContent = loadingOverlay.querySelector('.loading-content p');
        if (loadingContent) {
            loadingContent.textContent = `載入失敗，正在重試... (${errorState.currentAttempt}/${powerBIConfig.retryAttempts})`;
        }
        loadingOverlay.style.display = 'flex';
    }
}

/**
 * 處理網路重新連線
 */
function handleNetworkReconnect() {
    console.log('網路已重新連線');
    if (errorState.lastError === errorState.errorTypes.NETWORK_ERROR && !tabState.powerBILoaded) {
        // 如果之前是網路錯誤且尚未載入成功，嘗試重新載入
        errorState.currentAttempt = 0; // 重置嘗試次數
        retryPowerBILoad();
    }
}

/**
 * 處理網路斷線
 */
function handleNetworkDisconnect() {
    console.warn('網路連線已斷開');
    if (tabState.currentTab === 'powerbi' && !tabState.powerBILoaded) {
        handlePowerBIError('網路連線已斷開，請檢查您的網路連線', errorState.errorTypes.NETWORK_ERROR);
    }
}

/**
 * 處理 Power BI 載入錯誤
 * @param {string} errorText - 錯誤訊息文字
 * @param {string} errorType - 錯誤類型
 */
function handlePowerBIError(errorText = '無法載入 Power BI 報表。請檢查網路連線或聯絡系統管理員。', errorType = errorState.errorTypes.UNKNOWN_ERROR) {
    const powerBIContent = document.getElementById('powerbi');
    const loadingOverlay = powerBIContent.querySelector('.loading-overlay');
    const errorMessage = powerBIContent.querySelector('.error-message');
    const powerBIFrame = powerBIContent.querySelector('.powerbi-frame');
    
    // 記錄錯誤狀態
    errorState.lastError = errorType;
    
    // 隱藏載入覆蓋層
    if (loadingOverlay) loadingOverlay.style.display = 'none';
    
    // 更新錯誤訊息內容
    if (errorMessage) {
        errorMessage.style.display = 'block';
        
        // 建立詳細的錯誤訊息
        const errorContent = createErrorMessageContent(errorText, errorType);
        errorMessage.innerHTML = errorContent;
    }
    
    // 隱藏 iframe
    if (powerBIFrame) powerBIFrame.style.opacity = '0';
    
    console.error('Power BI 載入錯誤:', errorText, '類型:', errorType);
}

/**
 * 建立錯誤訊息內容
 * @param {string} errorText - 錯誤訊息
 * @param {string} errorType - 錯誤類型
 * @returns {string} HTML 錯誤內容
 */
function createErrorMessageContent(errorText, errorType) {
    let actionButton = '';
    let additionalInfo = '';
    
    switch (errorType) {
        case errorState.errorTypes.NETWORK_ERROR:
            actionButton = '<button class="retry-button" onclick="handleRetryClick()">重試載入</button>';
            additionalInfo = '<small>請確認網路連線正常，或稍後再試。</small>';
            break;
        case errorState.errorTypes.TIMEOUT_ERROR:
            actionButton = '<button class="retry-button" onclick="handleRetryClick()">重新載入</button>';
            additionalInfo = '<small>載入時間過長，可能是網路速度較慢或伺服器繁忙。</small>';
            break;
        case errorState.errorTypes.PERMISSION_ERROR:
            additionalInfo = '<small>可能需要登入 Power BI 帳戶或聯絡系統管理員取得存取權限。</small>';
            break;
        default:
            actionButton = '<button class="retry-button" onclick="handleRetryClick()">重試</button>';
            additionalInfo = '<small>如果問題持續發生，請聯絡技術支援。</small>';
    }
    
    return `
        <div class="error-content">
            <div class="error-icon">⚠️</div>
            <p class="error-main-text">${errorText}</p>
            ${additionalInfo ? `<p class="error-additional-info">${additionalInfo}</p>` : ''}
            <div class="error-actions">
                ${actionButton}
                <button class="refresh-button" onclick="handleRefreshClick()">重新整理頁面</button>
            </div>
        </div>
    `;
}

/**
 * 處理重試按鈕點擊
 */
function handleRetryClick() {
    errorState.currentAttempt = 0; // 重置嘗試次數
    tabState.powerBILoaded = false; // 重置載入狀態
    setupPowerBILoadingHandlers();
}

/**
 * 處理重新整理按鈕點擊
 */
function handleRefreshClick() {
    window.location.reload();
}

/**
 * 獲取當前選中的標籤頁
 * @returns {string} 當前標籤頁名稱
 */
function getCurrentTab() {
    return tabState.currentTab;
}

/**
 * 檢查指定標籤頁是否為當前選中的標籤頁
 * @param {string} tabName - 要檢查的標籤頁名稱
 * @returns {boolean} 是否為當前標籤頁
 */
function isActiveTab(tabName) {
    return tabState.currentTab === tabName;
}

// 當 DOM 載入完成後初始化標籤頁功能
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeResponsiveHandlers();
});

/**
 * 初始化響應式處理器
 */
function initializeResponsiveHandlers() {
    // 監聽視窗大小變化
    let resizeTimeout;
    window.addEventListener('resize', function() {
        // 使用防抖動技術避免過度觸發
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            handleWindowResize();
        }, 250);
    });
    
    // 監聽螢幕方向變化（行動裝置）
    window.addEventListener('orientationchange', function() {
        setTimeout(function() {
            handleOrientationChange();
        }, 500); // 延遲以確保方向變化完成
    });
    
    // 初始化時調整一次
    handleWindowResize();
}

/**
 * 處理視窗大小變化
 */
function handleWindowResize() {
    const currentBreakpoint = getCurrentBreakpoint();
    adjustPowerBIFrameSize();
    adjustLayoutForBreakpoint(currentBreakpoint);
    
    // 如果 Power BI 標籤頁是活動的，重新調整 iframe
    if (tabState.currentTab === 'powerbi' && tabState.powerBILoaded) {
        refreshPowerBIFrame();
    }
}

/**
 * 處理螢幕方向變化
 */
function handleOrientationChange() {
    // 強制重新計算佈局
    handleWindowResize();
    
    // 如果是 Power BI 標籤頁，給一點時間讓 iframe 適應新尺寸
    if (tabState.currentTab === 'powerbi') {
        setTimeout(function() {
            adjustPowerBIFrameSize();
        }, 300);
    }
}

/**
 * 獲取當前斷點
 * @returns {string} 當前斷點名稱
 */
function getCurrentBreakpoint() {
    const width = window.innerWidth;
    
    if (width >= 1200) return 'xl';
    if (width >= 992) return 'lg';
    if (width >= 768) return 'md';
    if (width >= 576) return 'sm';
    if (width >= 320) return 'xs';
    return 'xxs';
}

/**
 * 根據斷點調整佈局
 * @param {string} breakpoint - 當前斷點
 */
function adjustLayoutForBreakpoint(breakpoint) {
    const container = document.querySelector('.container');
    const tabNav = document.querySelector('.tab-nav');
    const welcomeFeatures = document.querySelector('.welcome-features');
    
    if (!container || !tabNav) return;
    
    // 根據斷點調整容器類別
    container.className = container.className.replace(/\s*breakpoint-\w+/g, '');
    container.classList.add(`breakpoint-${breakpoint}`);
    
    // 調整標籤頁導航佈局
    if (breakpoint === 'xs' || breakpoint === 'xxs') {
        tabNav.classList.add('mobile-layout');
    } else {
        tabNav.classList.remove('mobile-layout');
    }
    
    // 調整歡迎頁面功能列表佈局
    if (welcomeFeatures) {
        const featuresList = welcomeFeatures.querySelector('.features-list');
        if (featuresList) {
            if (breakpoint === 'md') {
                featuresList.classList.add('grid-layout');
            } else {
                featuresList.classList.remove('grid-layout');
            }
        }
    }
}

/**
 * 動態調整 Power BI iframe 尺寸
 */
function adjustPowerBIFrameSize() {
    const powerBIFrame = document.querySelector('.powerbi-frame');
    const powerBIContent = document.getElementById('powerbi');
    
    if (!powerBIFrame || !powerBIContent) return;
    
    const breakpoint = getCurrentBreakpoint();
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    
    // 根據不同斷點計算適當的高度
    let frameHeight;
    let minHeight;
    
    switch (breakpoint) {
        case 'xl':
            frameHeight = Math.max(windowHeight - 180, 600);
            minHeight = 600;
            break;
        case 'lg':
            frameHeight = Math.max(windowHeight - 190, 550);
            minHeight = 550;
            break;
        case 'md':
            frameHeight = Math.max(windowHeight - 220, 400);
            minHeight = 400;
            break;
        case 'sm':
            frameHeight = Math.max(windowHeight - 240, 350);
            minHeight = 350;
            break;
        case 'xs':
            frameHeight = Math.max(windowHeight - 280, 300);
            minHeight = 300;
            break;
        case 'xxs':
            frameHeight = Math.max(windowHeight - 300, 250);
            minHeight = 250;
            break;
        default:
            frameHeight = Math.max(windowHeight - 200, 400);
            minHeight = 400;
    }
    
    // 應用計算出的尺寸
    powerBIFrame.style.height = `${frameHeight}px`;
    powerBIFrame.style.minHeight = `${minHeight}px`;
    powerBIFrame.style.width = '100%';
    
    // 調整容器高度
    powerBIContent.style.height = `${frameHeight + 20}px`;
    
    console.log(`Power BI frame 尺寸已調整: ${windowWidth}x${frameHeight} (斷點: ${breakpoint})`);
}

/**
 * 刷新 Power BI iframe（在尺寸變化後）
 */
function refreshPowerBIFrame() {
    const powerBIFrame = document.querySelector('.powerbi-frame');
    
    if (!powerBIFrame || !tabState.powerBILoaded) return;
    
    // 觸發 iframe 重新調整大小
    try {
        // 發送調整大小訊息給 Power BI iframe
        if (powerBIFrame.contentWindow) {
            powerBIFrame.contentWindow.postMessage({
                action: 'resize',
                width: powerBIFrame.offsetWidth,
                height: powerBIFrame.offsetHeight
            }, '*');
        }
    } catch (error) {
        console.warn('無法向 Power BI iframe 發送調整大小訊息:', error);
    }
}

/**
 * 檢查是否為行動裝置
 * @returns {boolean} 是否為行動裝置
 */
function isMobileDevice() {
    const breakpoint = getCurrentBreakpoint();
    return breakpoint === 'xs' || breakpoint === 'xxs';
}

/**
 * 檢查是否為平板裝置
 * @returns {boolean} 是否為平板裝置
 */
function isTabletDevice() {
    const breakpoint = getCurrentBreakpoint();
    return breakpoint === 'sm' || breakpoint === 'md';
}

/**
 * 檢查是否為桌面裝置
 * @returns {boolean} 是否為桌面裝置
 */
function isDesktopDevice() {
    const breakpoint = getCurrentBreakpoint();
    return breakpoint === 'lg' || breakpoint === 'xl';
}

/**
 * 檢查 Power BI 報表是否正確載入
 * @returns {boolean} 是否載入成功
 */
function checkPowerBIStatus() {
    const powerBIFrame = document.querySelector('.powerbi-frame');
    if (!powerBIFrame) return false;
    
    try {
        // 檢查 iframe 是否可訪問
        const frameWindow = powerBIFrame.contentWindow;
        if (!frameWindow) return false;
        
        // 檢查 iframe 的載入狀態
        if (powerBIFrame.contentDocument && powerBIFrame.contentDocument.readyState === 'complete') {
            return true;
        }
        
        return false;
    } catch (error) {
        console.warn('無法檢查 Power BI 狀態:', error);
        return false;
    }
}

/**
 * 定期檢查 Power BI 載入狀態
 */
function startPowerBIHealthCheck() {
    if (tabState.currentTab === 'powerbi' && !tabState.powerBILoaded) {
        const healthCheckInterval = setInterval(() => {
            if (tabState.powerBILoaded || tabState.currentTab !== 'powerbi') {
                clearInterval(healthCheckInterval);
                return;
            }
            
            // 檢查是否有載入問題
            const powerBIFrame = document.querySelector('.powerbi-frame');
            if (powerBIFrame && powerBIFrame.style.opacity === '0') {
                // iframe 被隱藏，可能有錯誤
                clearInterval(healthCheckInterval);
                return;
            }
            
            // 檢查載入時間是否過長
            if (errorState.currentAttempt > 0) {
                const loadingOverlay = document.querySelector('.loading-overlay');
                if (loadingOverlay && loadingOverlay.style.display === 'flex') {
                    // 仍在載入中，繼續等待
                    return;
                }
            }
        }, 2000); // 每2秒檢查一次
        
        // 30秒後停止健康檢查
        setTimeout(() => {
            clearInterval(healthCheckInterval);
        }, 30000);
    }
}

// 導出函數供測試使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeTabs,
        switchTab,
        getCurrentTab,
        isActiveTab,
        handlePowerBITabSwitch,
        setupPowerBILoadingHandlers,
        handlePowerBIError,
        validatePowerBIContent,
        handleLoadTimeout,
        retryPowerBILoad,
        handleRetryClick,
        handleRefreshClick,
        checkPowerBIStatus,
        startPowerBIHealthCheck,
        initializeResponsiveHandlers,
        handleWindowResize,
        handleOrientationChange,
        getCurrentBreakpoint,
        adjustLayoutForBreakpoint,
        adjustPowerBIFrameSize,
        refreshPowerBIFrame,
        isMobileDevice,
        isTabletDevice,
        isDesktopDevice,
        tabState,
        powerBIConfig,
        errorState
    };
}
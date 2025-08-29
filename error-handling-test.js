/**
 * 錯誤處理功能測試腳本
 * 這個腳本用於驗證 Power BI 錯誤處理機制的各個方面
 */

// 測試結果記錄
const testResults = {
    passed: 0,
    failed: 0,
    tests: []
};

/**
 * 執行測試並記錄結果
 * @param {string} testName - 測試名稱
 * @param {Function} testFunction - 測試函數
 */
function runTest(testName, testFunction) {
    try {
        console.log(`\n🧪 執行測試: ${testName}`);
        const result = testFunction();
        if (result) {
            console.log(`✅ 測試通過: ${testName}`);
            testResults.passed++;
            testResults.tests.push({ name: testName, status: 'PASSED' });
        } else {
            console.log(`❌ 測試失敗: ${testName}`);
            testResults.failed++;
            testResults.tests.push({ name: testName, status: 'FAILED' });
        }
    } catch (error) {
        console.error(`💥 測試錯誤: ${testName}`, error);
        testResults.failed++;
        testResults.tests.push({ name: testName, status: 'ERROR', error: error.message });
    }
}

/**
 * 測試錯誤狀態初始化
 */
function testErrorStateInitialization() {
    return errorState && 
           errorState.currentAttempt === 0 &&
           errorState.lastError === null &&
           errorState.errorTypes &&
           Object.keys(errorState.errorTypes).length === 4;
}

/**
 * 測試 Power BI 設定
 */
function testPowerBIConfig() {
    return powerBIConfig &&
           powerBIConfig.loadTimeout === 10000 &&
           powerBIConfig.retryAttempts === 3 &&
           powerBIConfig.retryDelay === 2000 &&
           powerBIConfig.embedUrl.includes('powerbi.com');
}

/**
 * 測試錯誤訊息建立功能
 */
function testErrorMessageCreation() {
    const testErrorText = '測試錯誤訊息';
    const errorContent = createErrorMessageContent(testErrorText, errorState.errorTypes.NETWORK_ERROR);
    
    return errorContent.includes(testErrorText) &&
           errorContent.includes('retry-button') &&
           errorContent.includes('refresh-button') &&
           errorContent.includes('error-icon');
}

/**
 * 測試不同錯誤類型的處理
 */
function testErrorTypeHandling() {
    const errorTypes = Object.values(errorState.errorTypes);
    let allTypesHandled = true;
    
    errorTypes.forEach(errorType => {
        const errorContent = createErrorMessageContent('測試', errorType);
        if (!errorContent || errorContent.length === 0) {
            allTypesHandled = false;
        }
    });
    
    return allTypesHandled;
}

/**
 * 測試重試機制
 */
function testRetryMechanism() {
    const originalAttempt = errorState.currentAttempt;
    
    // 模擬重試
    errorState.currentAttempt = 1;
    const canRetry = errorState.currentAttempt < powerBIConfig.retryAttempts;
    
    // 恢復原始狀態
    errorState.currentAttempt = originalAttempt;
    
    return canRetry;
}

/**
 * 測試載入超時處理
 */
function testTimeoutHandling() {
    // 檢查超時處理函數是否存在
    return typeof handleLoadTimeout === 'function';
}

/**
 * 測試網路狀態處理
 */
function testNetworkStatusHandling() {
    return typeof handleNetworkReconnect === 'function' &&
           typeof handleNetworkDisconnect === 'function';
}

/**
 * 測試 Power BI 內容驗證
 */
function testPowerBIValidation() {
    return typeof validatePowerBIContent === 'function' &&
           typeof checkPowerBIStatus === 'function';
}

/**
 * 測試健康檢查機制
 */
function testHealthCheckMechanism() {
    return typeof startPowerBIHealthCheck === 'function';
}

/**
 * 測試錯誤處理函數的存在性
 */
function testErrorHandlingFunctions() {
    const requiredFunctions = [
        'handlePowerBIError',
        'createErrorMessageContent',
        'handleRetryClick',
        'handleRefreshClick',
        'retryPowerBILoad',
        'showRetryMessage'
    ];
    
    return requiredFunctions.every(funcName => typeof window[funcName] === 'function');
}

/**
 * 執行所有測試
 */
function runAllTests() {
    console.log('🚀 開始執行錯誤處理功能測試...\n');
    
    // 執行各項測試
    runTest('錯誤狀態初始化', testErrorStateInitialization);
    runTest('Power BI 設定檢查', testPowerBIConfig);
    runTest('錯誤訊息建立', testErrorMessageCreation);
    runTest('錯誤類型處理', testErrorTypeHandling);
    runTest('重試機制', testRetryMechanism);
    runTest('超時處理', testTimeoutHandling);
    runTest('網路狀態處理', testNetworkStatusHandling);
    runTest('Power BI 驗證', testPowerBIValidation);
    runTest('健康檢查機制', testHealthCheckMechanism);
    runTest('錯誤處理函數', testErrorHandlingFunctions);
    
    // 顯示測試結果摘要
    console.log('\n📊 測試結果摘要:');
    console.log(`✅ 通過: ${testResults.passed}`);
    console.log(`❌ 失敗: ${testResults.failed}`);
    console.log(`📈 成功率: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
    
    // 顯示詳細結果
    console.log('\n📋 詳細測試結果:');
    testResults.tests.forEach(test => {
        const icon = test.status === 'PASSED' ? '✅' : test.status === 'FAILED' ? '❌' : '💥';
        console.log(`${icon} ${test.name}: ${test.status}`);
        if (test.error) {
            console.log(`   錯誤: ${test.error}`);
        }
    });
    
    return testResults;
}

// 如果在瀏覽器環境中，自動執行測試
if (typeof window !== 'undefined') {
    // 等待 DOM 載入完成後執行測試
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runAllTests);
    } else {
        runAllTests();
    }
}

// 導出測試函數供外部使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        runAllTests,
        runTest,
        testResults
    };
}
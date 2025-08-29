/**
 * 綜合測試執行器
 * 這個腳本整合所有測試功能，提供完整的測試報告
 */

// 測試結果收集器
class TestRunner {
    constructor() {
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            tests: [],
            categories: {}
        };
        this.startTime = null;
        this.endTime = null;
    }

    /**
     * 開始測試執行
     */
    start() {
        this.startTime = performance.now();
        console.log('🚀 開始執行綜合整合測試...\n');
    }

    /**
     * 結束測試執行
     */
    end() {
        this.endTime = performance.now();
        const duration = ((this.endTime - this.startTime) / 1000).toFixed(2);
        console.log(`\n⏱️ 測試執行完成，總耗時: ${duration} 秒`);
    }

    /**
     * 記錄測試結果
     * @param {string} category - 測試類別
     * @param {string} testName - 測試名稱
     * @param {boolean} passed - 是否通過
     * @param {string} details - 詳細資訊
     */
    logTest(category, testName, passed, details = '') {
        this.results.total++;
        
        if (passed) {
            this.results.passed++;
        } else {
            this.results.failed++;
        }

        const testResult = {
            category,
            name: testName,
            passed,
            details,
            timestamp: new Date().toISOString()
        };

        this.results.tests.push(testResult);

        // 按類別統計
        if (!this.results.categories[category]) {
            this.results.categories[category] = { total: 0, passed: 0, failed: 0 };
        }
        this.results.categories[category].total++;
        if (passed) {
            this.results.categories[category].passed++;
        } else {
            this.results.categories[category].failed++;
        }

        const icon = passed ? '✅' : '❌';
        console.log(`${icon} [${category}] ${testName}: ${passed ? '通過' : '失敗'} ${details}`);
    }

    /**
     * 生成測試報告
     */
    generateReport() {
        const successRate = this.results.total > 0 ? 
            ((this.results.passed / this.results.total) * 100).toFixed(1) : 0;

        console.log('\n📊 ===== 綜合測試報告 =====');
        console.log(`總測試數: ${this.results.total}`);
        console.log(`通過: ${this.results.passed}`);
        console.log(`失敗: ${this.results.failed}`);
        console.log(`成功率: ${successRate}%`);

        // 按類別顯示結果
        console.log('\n📋 各類別測試結果:');
        Object.entries(this.results.categories).forEach(([category, stats]) => {
            const categoryRate = stats.total > 0 ? 
                ((stats.passed / stats.total) * 100).toFixed(1) : 0;
            console.log(`  ${category}: ${stats.passed}/${stats.total} (${categoryRate}%)`);
        });

        // 顯示失敗的測試
        const failedTests = this.results.tests.filter(test => !test.passed);
        if (failedTests.length > 0) {
            console.log('\n❌ 失敗的測試:');
            failedTests.forEach(test => {
                console.log(`  - [${test.category}] ${test.name}: ${test.details}`);
            });
        }

        console.log('\n========================\n');
        
        return this.results;
    }

    /**
     * 執行所有整合測試
     */
    async runAllTests() {
        this.start();

        try {
            // 1. 基本功能測試
            await this.runBasicFunctionTests();
            
            // 2. 標籤頁功能測試
            await this.runTabFunctionTests();
            
            // 3. Power BI 功能測試
            await this.runPowerBITests();
            
            // 4. 錯誤處理測試
            await this.runErrorHandlingTests();
            
            // 5. 響應式設計測試
            await this.runResponsiveTests();
            
            // 6. 跨瀏覽器相容性測試
            await this.runCompatibilityTests();
            
            // 7. 效能測試
            await this.runPerformanceTests();

        } catch (error) {
            console.error('測試執行過程中發生錯誤:', error);
            this.logTest('系統', '測試執行', false, error.message);
        }

        this.end();
        return this.generateReport();
    }

    /**
     * 基本功能測試
     */
    async runBasicFunctionTests() {
        console.log('\n🔧 執行基本功能測試...');

        // 檢查核心函數存在性
        const coreFunctions = [
            'initializeTabs',
            'switchTab',
            'getCurrentTab',
            'isActiveTab',
            'handlePowerBITabSwitch',
            'setupPowerBILoadingHandlers',
            'handlePowerBIError'
        ];

        coreFunctions.forEach(funcName => {
            this.logTest('基本功能', `函數存在: ${funcName}`, 
                typeof window[funcName] === 'function');
        });

        // 檢查全域物件
        this.logTest('基本功能', 'tabState 物件存在', typeof tabState !== 'undefined');
        this.logTest('基本功能', 'powerBIConfig 物件存在', typeof powerBIConfig !== 'undefined');
        this.logTest('基本功能', 'errorState 物件存在', typeof errorState !== 'undefined');

        // 檢查 DOM 結構
        const requiredElements = [
            '.container',
            '.tab-container',
            '.tab-nav',
            '.tab-button[data-tab="welcome"]',
            '.tab-button[data-tab="powerbi"]',
            '.content-container',
            '#welcome',
            '#powerbi',
            '.powerbi-frame'
        ];

        requiredElements.forEach(selector => {
            const element = document.querySelector(selector);
            this.logTest('基本功能', `DOM 元素存在: ${selector}`, !!element);
        });
    }

    /**
     * 標籤頁功能測試
     */
    async runTabFunctionTests() {
        console.log('\n📑 執行標籤頁功能測試...');

        // 測試初始狀態
        const initialTab = getCurrentTab();
        this.logTest('標籤頁', '初始標籤頁為歡迎頁', initialTab === 'welcome');

        // 測試標籤頁切換
        switchTab('powerbi');
        const switchedToPowerBI = getCurrentTab() === 'powerbi';
        this.logTest('標籤頁', '切換到 Power BI 標籤頁', switchedToPowerBI);

        switchTab('welcome');
        const switchedBackToWelcome = getCurrentTab() === 'welcome';
        this.logTest('標籤頁', '切換回歡迎標籤頁', switchedBackToWelcome);

        // 測試無效標籤頁處理
        const beforeInvalid = getCurrentTab();
        switchTab('invalid');
        const afterInvalid = getCurrentTab();
        this.logTest('標籤頁', '無效標籤頁處理', beforeInvalid === afterInvalid);

        // 測試 isActiveTab 函數
        switchTab('welcome');
        this.logTest('標籤頁', 'isActiveTab 函數正確', 
            isActiveTab('welcome') && !isActiveTab('powerbi'));
    }

    /**
     * Power BI 功能測試
     */
    async runPowerBITests() {
        console.log('\n📊 執行 Power BI 功能測試...');

        // 檢查 Power BI 設定
        this.logTest('Power BI', 'Power BI 設定存在', !!powerBIConfig);
        this.logTest('Power BI', 'Power BI URL 正確', 
            powerBIConfig && powerBIConfig.embedUrl.includes('powerbi.com'));
        this.logTest('Power BI', '載入超時設定正確', 
            powerBIConfig && powerBIConfig.loadTimeout === 10000);
        this.logTest('Power BI', '重試次數設定正確', 
            powerBIConfig && powerBIConfig.retryAttempts === 3);

        // 檢查載入處理函數
        const powerBIFunctions = [
            'setupPowerBILoadingHandlers',
            'handlePowerBILoadSuccess',
            'validatePowerBIContent',
            'handleLoadTimeout',
            'retryPowerBILoad',
            'checkPowerBIStatus',
            'startPowerBIHealthCheck'
        ];

        powerBIFunctions.forEach(funcName => {
            this.logTest('Power BI', `函數存在: ${funcName}`, 
                typeof window[funcName] === 'function');
        });
    }

    /**
     * 錯誤處理測試
     */
    async runErrorHandlingTests() {
        console.log('\n🚨 執行錯誤處理測試...');

        // 檢查錯誤狀態
        this.logTest('錯誤處理', '錯誤狀態物件存在', !!errorState);
        this.logTest('錯誤處理', '錯誤類型定義完整', 
            errorState && Object.keys(errorState.errorTypes).length === 4);

        // 檢查錯誤處理函數
        const errorFunctions = [
            'handlePowerBIError',
            'createErrorMessageContent',
            'handleRetryClick',
            'handleRefreshClick',
            'handleNetworkReconnect',
            'handleNetworkDisconnect'
        ];

        errorFunctions.forEach(funcName => {
            this.logTest('錯誤處理', `函數存在: ${funcName}`, 
                typeof window[funcName] === 'function');
        });

        // 測試錯誤訊息建立
        try {
            const errorContent = createErrorMessageContent('測試錯誤', errorState.errorTypes.NETWORK_ERROR);
            this.logTest('錯誤處理', '錯誤訊息建立功能', 
                errorContent && errorContent.includes('測試錯誤'));
        } catch (e) {
            this.logTest('錯誤處理', '錯誤訊息建立功能', false, e.message);
        }
    }

    /**
     * 響應式設計測試
     */
    async runResponsiveTests() {
        console.log('\n📱 執行響應式設計測試...');

        // 檢查響應式函數
        const responsiveFunctions = [
            'getCurrentBreakpoint',
            'isMobileDevice',
            'isTabletDevice',
            'isDesktopDevice',
            'adjustPowerBIFrameSize',
            'handleWindowResize',
            'initializeResponsiveHandlers'
        ];

        responsiveFunctions.forEach(funcName => {
            this.logTest('響應式', `函數存在: ${funcName}`, 
                typeof window[funcName] === 'function');
        });

        // 測試斷點檢測
        const originalWidth = window.innerWidth;
        const testCases = [
            { width: 1400, expected: 'xl' },
            { width: 1000, expected: 'lg' },
            { width: 800, expected: 'md' },
            { width: 600, expected: 'sm' },
            { width: 400, expected: 'xs' },
            { width: 300, expected: 'xxs' }
        ];

        testCases.forEach(testCase => {
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: testCase.width
            });

            const result = getCurrentBreakpoint();
            this.logTest('響應式', `斷點檢測 ${testCase.width}px`, 
                result === testCase.expected, `預期: ${testCase.expected}, 實際: ${result}`);
        });

        // 恢復原始寬度
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: originalWidth
        });
    }

    /**
     * 跨瀏覽器相容性測試
     */
    async runCompatibilityTests() {
        console.log('\n🌐 執行跨瀏覽器相容性測試...');

        // 檢查基本 API 支援
        this.logTest('相容性', 'querySelector 支援', typeof document.querySelector === 'function');
        this.logTest('相容性', 'addEventListener 支援', typeof document.addEventListener === 'function');
        this.logTest('相容性', 'classList 支援', 'classList' in document.createElement('div'));
        this.logTest('相容性', 'JSON 支援', typeof JSON !== 'undefined');
        this.logTest('相容性', 'localStorage 支援', typeof localStorage !== 'undefined');

        // 檢查 ES6 功能
        this.logTest('相容性', 'const/let 支援', true);
        this.logTest('相容性', '箭頭函數支援', typeof (() => {}) === 'function');
        this.logTest('相容性', 'Promise 支援', typeof Promise !== 'undefined');

        // 檢查 CSS 功能
        const testDiv = document.createElement('div');
        document.body.appendChild(testDiv);

        testDiv.style.display = 'flex';
        this.logTest('相容性', 'Flexbox 支援', testDiv.style.display === 'flex');

        testDiv.style.display = 'grid';
        this.logTest('相容性', 'CSS Grid 支援', testDiv.style.display === 'grid');

        testDiv.style.transform = 'translateX(10px)';
        this.logTest('相容性', 'CSS Transform 支援', testDiv.style.transform.includes('translateX'));

        document.body.removeChild(testDiv);
    }

    /**
     * 效能測試
     */
    async runPerformanceTests() {
        console.log('\n⚡ 執行效能測試...');

        // 測試標籤頁切換效能
        const switchStart = performance.now();
        for (let i = 0; i < 100; i++) {
            switchTab(i % 2 === 0 ? 'welcome' : 'powerbi');
        }
        const switchEnd = performance.now();
        const switchTime = switchEnd - switchStart;

        this.logTest('效能', '標籤頁切換效能', switchTime < 1000, 
            `100次切換耗時: ${switchTime.toFixed(2)}ms`);

        // 測試響應式調整效能
        const resizeStart = performance.now();
        for (let i = 0; i < 50; i++) {
            handleWindowResize();
        }
        const resizeEnd = performance.now();
        const resizeTime = resizeEnd - resizeStart;

        this.logTest('效能', '響應式調整效能', resizeTime < 500, 
            `50次調整耗時: ${resizeTime.toFixed(2)}ms`);

        // 重置到歡迎標籤頁
        switchTab('welcome');
    }
}

// 導出供外部使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TestRunner;
}
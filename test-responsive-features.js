// 響應式設計功能測試
// 這個檔案用於測試響應式設計的各項功能

/**
 * 測試響應式斷點檢測
 */
function testBreakpointDetection() {
    console.log('=== 測試響應式斷點檢測 ===');
    
    const testCases = [
        { width: 1400, expected: 'xl' },
        { width: 1200, expected: 'xl' },
        { width: 1100, expected: 'lg' },
        { width: 992, expected: 'lg' },
        { width: 900, expected: 'md' },
        { width: 768, expected: 'md' },
        { width: 700, expected: 'sm' },
        { width: 576, expected: 'sm' },
        { width: 400, expected: 'xs' },
        { width: 320, expected: 'xs' },
        { width: 300, expected: 'xxs' }
    ];
    
    // 模擬不同的視窗寬度
    const originalInnerWidth = window.innerWidth;
    
    testCases.forEach(testCase => {
        // 模擬視窗寬度
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: testCase.width
        });
        
        const result = getCurrentBreakpoint();
        const passed = result === testCase.expected;
        
        console.log(`寬度 ${testCase.width}px: 預期 ${testCase.expected}, 實際 ${result} ${passed ? '✓' : '✗'}`);
    });
    
    // 恢復原始視窗寬度
    Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: originalInnerWidth
    });
    
    console.log('斷點檢測測試完成\n');
}

/**
 * 測試裝置類型檢測
 */
function testDeviceTypeDetection() {
    console.log('=== 測試裝置類型檢測 ===');
    
    const testCases = [
        { width: 1400, mobile: false, tablet: false, desktop: true },
        { width: 1000, mobile: false, tablet: false, desktop: true },
        { width: 800, mobile: false, tablet: true, desktop: false },
        { width: 600, mobile: false, tablet: true, desktop: false },
        { width: 400, mobile: true, tablet: false, desktop: false },
        { width: 320, mobile: true, tablet: false, desktop: false }
    ];
    
    const originalInnerWidth = window.innerWidth;
    
    testCases.forEach(testCase => {
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: testCase.width
        });
        
        const isMobile = isMobileDevice();
        const isTablet = isTabletDevice();
        const isDesktop = isDesktopDevice();
        
        const mobilePass = isMobile === testCase.mobile;
        const tabletPass = isTablet === testCase.tablet;
        const desktopPass = isDesktop === testCase.desktop;
        const allPass = mobilePass && tabletPass && desktopPass;
        
        console.log(`寬度 ${testCase.width}px: 手機 ${isMobile} ${mobilePass ? '✓' : '✗'}, 平板 ${isTablet} ${tabletPass ? '✓' : '✗'}, 桌面 ${isDesktop} ${desktopPass ? '✓' : '✗'} ${allPass ? '✓' : '✗'}`);
    });
    
    Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: originalInnerWidth
    });
    
    console.log('裝置類型檢測測試完成\n');
}

/**
 * 測試 Power BI iframe 尺寸調整
 */
function testPowerBIFrameResize() {
    console.log('=== 測試 Power BI iframe 尺寸調整 ===');
    
    // 建立測試用的 iframe 元素
    const testFrame = document.createElement('iframe');
    testFrame.className = 'powerbi-frame';
    testFrame.style.position = 'absolute';
    testFrame.style.top = '-9999px';
    document.body.appendChild(testFrame);
    
    const testContent = document.createElement('div');
    testContent.id = 'powerbi';
    testContent.style.position = 'absolute';
    testContent.style.top = '-9999px';
    testContent.appendChild(testFrame);
    document.body.appendChild(testContent);
    
    const testCases = [
        { width: 1400, height: 800, expectedMinHeight: 600 },
        { width: 1000, height: 700, expectedMinHeight: 550 },
        { width: 800, height: 600, expectedMinHeight: 400 },
        { width: 600, height: 500, expectedMinHeight: 350 },
        { width: 400, height: 600, expectedMinHeight: 300 },
        { width: 320, height: 500, expectedMinHeight: 250 }
    ];
    
    const originalInnerWidth = window.innerWidth;
    const originalInnerHeight = window.innerHeight;
    
    testCases.forEach(testCase => {
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: testCase.width
        });
        
        Object.defineProperty(window, 'innerHeight', {
            writable: true,
            configurable: true,
            value: testCase.height
        });
        
        adjustPowerBIFrameSize();
        
        const frameHeight = parseInt(testFrame.style.height);
        const minHeight = parseInt(testFrame.style.minHeight);
        
        const heightPass = frameHeight >= testCase.expectedMinHeight;
        const minHeightPass = minHeight === testCase.expectedMinHeight;
        
        console.log(`${testCase.width}x${testCase.height}: 高度 ${frameHeight}px ${heightPass ? '✓' : '✗'}, 最小高度 ${minHeight}px ${minHeightPass ? '✓' : '✗'}`);
    });
    
    // 清理測試元素
    document.body.removeChild(testFrame);
    document.body.removeChild(testContent);
    
    // 恢復原始視窗尺寸
    Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: originalInnerWidth
    });
    
    Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: originalInnerHeight
    });
    
    console.log('Power BI iframe 尺寸調整測試完成\n');
}

/**
 * 測試佈局調整功能
 */
function testLayoutAdjustment() {
    console.log('=== 測試佈局調整功能 ===');
    
    // 建立測試用的 DOM 元素
    const testContainer = document.createElement('div');
    testContainer.className = 'container';
    
    const testTabNav = document.createElement('div');
    testTabNav.className = 'tab-nav';
    
    const testWelcomeFeatures = document.createElement('div');
    testWelcomeFeatures.className = 'welcome-features';
    
    const testFeaturesList = document.createElement('ul');
    testFeaturesList.className = 'features-list';
    testWelcomeFeatures.appendChild(testFeaturesList);
    
    document.body.appendChild(testContainer);
    document.body.appendChild(testTabNav);
    document.body.appendChild(testWelcomeFeatures);
    
    const testCases = ['xl', 'lg', 'md', 'sm', 'xs', 'xxs'];
    
    testCases.forEach(breakpoint => {
        adjustLayoutForBreakpoint(breakpoint);
        
        const hasBreakpointClass = testContainer.classList.contains(`breakpoint-${breakpoint}`);
        const hasMobileLayout = testTabNav.classList.contains('mobile-layout');
        const hasGridLayout = testFeaturesList.classList.contains('grid-layout');
        
        const expectedMobile = breakpoint === 'xs' || breakpoint === 'xxs';
        const expectedGrid = breakpoint === 'md';
        
        const mobilePass = hasMobileLayout === expectedMobile;
        const gridPass = hasGridLayout === expectedGrid;
        
        console.log(`斷點 ${breakpoint}: 斷點類別 ${hasBreakpointClass ? '✓' : '✗'}, 手機佈局 ${hasMobileLayout} ${mobilePass ? '✓' : '✗'}, 網格佈局 ${hasGridLayout} ${gridPass ? '✓' : '✗'}`);
    });
    
    // 清理測試元素
    document.body.removeChild(testContainer);
    document.body.removeChild(testTabNav);
    document.body.removeChild(testWelcomeFeatures);
    
    console.log('佈局調整功能測試完成\n');
}

/**
 * 執行所有響應式設計測試
 */
function runAllResponsiveTests() {
    console.log('開始執行響應式設計功能測試...\n');
    
    try {
        testBreakpointDetection();
        testDeviceTypeDetection();
        testPowerBIFrameResize();
        testLayoutAdjustment();
        
        console.log('✓ 所有響應式設計測試完成！');
    } catch (error) {
        console.error('✗ 測試執行過程中發生錯誤:', error);
    }
}

// 如果在瀏覽器環境中，自動執行測試
if (typeof window !== 'undefined') {
    // 等待 DOM 載入完成後執行測試
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(runAllResponsiveTests, 1000);
        });
    } else {
        setTimeout(runAllResponsiveTests, 1000);
    }
}

// 導出測試函數供外部使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        testBreakpointDetection,
        testDeviceTypeDetection,
        testPowerBIFrameResize,
        testLayoutAdjustment,
        runAllResponsiveTests
    };
}
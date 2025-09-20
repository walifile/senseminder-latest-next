import { Before, After, BeforeAll, AfterAll } from '@cucumber/cucumber';
import { CustomWorld } from './world';
import { SensePCPage } from '../pages/sensePCPage';
import { apiLogger } from '../utils/apiLogger';

BeforeAll(async function() {
    console.log('Starting test suite...');
});

Before({ timeout: 60000 }, async function(this: CustomWorld) {
    console.log('🚀 Starting new test - initializing clean state...');
    
    // Clear previous API calls log
    apiLogger.clearApiCalls();
    
    // Wait a bit to ensure previous test cleanup is complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Add retry logic for critical state initialization
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
        try {
            console.log('🔄 Initializing browser and page objects...');
            await this.init();
            console.log('✅ Browser and page objects initialized successfully');
            break; // Success, exit retry loop
        } catch (error) {
            retryCount++;
            console.log(`⚠️ Initialization attempt ${retryCount} failed:`, error);
            if (retryCount >= maxRetries) {
                throw new Error(`Failed to initialize after ${maxRetries} attempts: ${error}`);
            }
            console.log(`🔄 Retrying initialization (attempt ${retryCount + 1}/${maxRetries})...`);
            await new Promise(resolve => setTimeout(resolve, 2000 * retryCount)); // Exponential backoff
        }
    }
    
    // Reset all world state BEFORE creating new context
    this.capturedAccessToken = undefined;
    this.secretCode = undefined;
    this.email = undefined;
    this.password = undefined;
    this.token = undefined;
    this.computerName = undefined;
    this.capturedUserId = undefined;
    this.newPassword = undefined;
    
    // Reset page objects to ensure clean state
    this.loginPage = undefined;
    this.sensePCPage = undefined;
    this.dashboardPage = undefined;
    this.apiCreatePCPage = undefined;
    this.apiBillingPage = undefined;
    
    // Ensure clean state by creating a new browser context for each test
    if (this.browser && this.context) {
        try {
            // Close existing context to ensure complete isolation
            await this.context.close();
            console.log('✅ Closed existing browser context for clean test state');
            
            // Get test data for baseURL configuration
            const { getTestData } = await import('../config/environment');
            const testData = getTestData();
            
            // Create a new context for this test with proper configuration
            this.context = await this.browser.newContext({
                viewport: { width: 1280, height: 720 },
                ignoreHTTPSErrors: true,
                acceptDownloads: true,
                baseURL: testData.application.baseURL,
                httpCredentials: {
                    username: process.env.HTTP_USERNAME || '',
                    password: process.env.HTTP_PASSWORD || ''
                },
                // Allow popups and new tabs
                permissions: ['clipboard-read', 'clipboard-write']
            });
            
            // Create a new page in the new context
            this.page = await this.context.newPage();
            
            // Set default timeouts
            this.page.setDefaultTimeout(testData.application.timeout);
            this.page.setDefaultNavigationTimeout(testData.application.timeout);
            
            // Reinitialize page objects with the new page
            const { LoginPage } = await import('../pages/loginPage');
            const { HomePage } = await import('../pages/homePage');
            const { SignUpPage } = await import('../pages/signUpPage');
            const { SensePCPage } = await import('../pages/sensePCPage');
            const { BillingPage } = await import('../pages/billingPage');
            const { DashboardPage } = await import('../pages/dashboardPage');
            const { SupportPage } = await import('../pages/supportPage');
            const { LandingPage } = await import('../pages/landingPage');
            const { UserManagementPage } = await import('../pages/userManagementPage');
            const { SenseStoragePage } = await import('../pages/senseStoragePage');
            const { ApiCreatePCPage } = await import('../pages/apiCreatePCPage');
            const { ApiBillingPage } = await import('../pages/apiBillingPage');
            
            this.loginPage = new LoginPage(this.page);
            this.homePage = new HomePage(this.page);
            this.signUpPage = new SignUpPage(this.page);
            this.sensePCPage = new SensePCPage(this.page);
            this.billingPage = new BillingPage(this.page);
            this.dashboardPage = new DashboardPage(this.page);
            this.supportPage = new SupportPage(this.page);
            this.landingPage = new LandingPage(this.page);
            this.userManagementPage = new UserManagementPage(this.page);
            this.senseStoragePage = new SenseStoragePage(this.page);
            this.apiCreatePCPage = new ApiCreatePCPage(testData.application.baseURL, '');
            this.apiBillingPage = new ApiBillingPage(testData.application.baseURL, '');
            
            console.log('✅ Created new browser context and page for clean test state');
        } catch (error) {
            console.log('⚠️ Could not create new browser context:', error);
        }
    }
    
    console.log('✅ Test initialization completed with clean state');
    
    // Add a delay to prevent race conditions between tests
    // Longer delay for ProfileAndSecurity tests to ensure MFA state cleanup
    const delay = this.page?.url().includes('profile') || this.page?.url().includes('security') ? 5000 : 2000;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Additional cleanup for API tests to ensure fresh tokens
    if (this.page?.url().includes('api') || this.page?.url().includes('billing')) {
        console.log('🔄 Performing additional cleanup for API tests...');
        this.capturedAccessToken = undefined;
        this.lastApiResponse = undefined;
        this.lastApiError = undefined;
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
});

After({ timeout: 120000 }, async function(this: CustomWorld, scenario) {
    console.log('🚀 Main After hook starting...');
    console.log('🔍 Main After hook: World object available =', !!this);
    console.log('🔍 Main After hook: SensePCPage available =', !!this.sensePCPage);
    console.log('🔍 Main After hook: Computer name =', this.sensePCPage?.getComputerName());
    
    // Log API call summary
    console.log('\n📊 ===== API CALLS SUMMARY FOR THIS TEST =====');
    apiLogger.getApiCallSummary();
    console.log('===============================================\n');
    
    // Capture screenshot if test failed
    if (scenario.result?.status === 'FAILED') {
        console.log('❌ Test failed - capturing screenshot for debugging...');
        await this.captureScreenshot(scenario.pickle.name, 'failure');
    }
    
    // Add a shorter delay to ensure specific After hooks have time to run
    console.log('⏳ Main After hook - waiting for specific cleanup hooks to complete...');
    await new Promise(resolve => setTimeout(resolve, 5000)); // Reduced to 5 seconds delay
    
    // CRITICAL: Ensure PC cleanup happens regardless of specific hook success
    console.log('🛡️ Main After hook - ensuring PC cleanup...');
    try {
        if (this.sensePCPage && this.sensePCPage.getComputerName()) {
            console.log('🔍 Main After hook - found PC to clean up, attempting guaranteed cleanup...');
            const mainCleanupSuccess = await this.sensePCPage.guaranteedCleanup();
            if (mainCleanupSuccess) {
                console.log('✅ Main After hook - guaranteed cleanup successful');
            } else {
                console.log('⚠️ Main After hook - guaranteed cleanup failed, but continuing...');
            }
        } else {
            console.log('ℹ️ Main After hook - no PC to clean up');
        }
    } catch (mainCleanupError) {
        console.log('❌ Main After hook - cleanup error:', mainCleanupError);
        // Don't throw error to avoid masking test results
    }
    
    try {
        // Clean up any active routes before closing the page
        if (this.page && !this.page.isClosed()) {
            await this.page.unrouteAll({ behavior: 'ignoreErrors' });
        }
        
        // Clear all browser storage and cookies
        if (this.context) {
            try {
                // Use Playwright's built-in context clearing
                await this.context.clearCookies();
                await this.context.clearPermissions();
                console.log('✅ Cleared browser context (cookies, permissions)');
            } catch (storageError) {
                console.log('⚠️ Could not clear browser context:', storageError);
            }
        }
        
        // Close all pages in the context
        if (this.context) {
            const pages = this.context.pages();
            for (const page of pages) {
                if (!page.isClosed()) {
                    try {
                        await page.close();
                        console.log('✅ Closed page');
                    } catch (pageError) {
                        console.log('⚠️ Error closing page:', pageError);
                    }
                }
            }
        }
        
    } catch (error) {
        console.log('Error during cleanup:', error);
    }
    
    // Now call cleanup to close browser
    console.log('🧹 Main After hook - calling cleanup to close browser...');
    await this.cleanup();
    console.log('✅ Main After hook completed - browser closed');
});

// After hook specifically for failed scenarios to capture additional debugging info
After({ tags: '@assign-pc or @createANewPC or @login or @signup or @billings or @sensestorage or @usermanagement or @support or @landing' }, async function(this: CustomWorld, scenario) {
    if (scenario.result?.status === 'FAILED') {
        console.log('❌ Failed scenario detected - capturing additional debugging information...');
        await this.captureDebugArtifacts(scenario.pickle.name, 'failure');
    }
});

AfterAll(async function() {
    console.log('Test suite completed - performing final cleanup...');
    
    // Final cleanup - this will close the browser
    try {
        // Get the world instance if available
        const world = this as any;
        
        // FINAL SAFETY NET: Try one last PC cleanup if possible
        if (world && world.sensePCPage && world.sensePCPage.getComputerName()) {
            console.log('🚨 Final safety net - attempting last PC cleanup...');
            try {
                if (world.page && !world.page.isClosed()) {
                    // Navigate to sense-pc page for final cleanup
                    await world.page.goto('/dashboard/sense-pc');
                    await world.page.waitForTimeout(3000);
                    
                    // Try guaranteed cleanup one more time
                    const finalCleanupSuccess = await world.sensePCPage.guaranteedCleanup();
                    if (finalCleanupSuccess) {
                        console.log('✅ Final safety net cleanup successful');
                    } else {
                        console.log('⚠️ Final safety net cleanup failed');
                    }
                }
            } catch (finalCleanupError) {
                console.log('❌ Final safety net cleanup error:', finalCleanupError);
            }
        }
        
        if (world && world.cleanup) {
            await world.cleanup();
            console.log('✅ Final cleanup completed');
        }
    } catch (error) {
        console.log('⚠️ Error during final cleanup:', error);
    }
});

// After hook specifically for @assign-pc scenarios to clean up created PCs
After({ tags: '@assign-pc', timeout: 120000 }, async function(this: CustomWorld) {
    console.log('🧹 @assign-pc After hook triggered - starting cleanup...');
    console.log('🔍 @assign-pc hook: Computer name =', this.sensePCPage?.getComputerName());
    console.log('🔍 @assign-pc hook: Page context available =', !!(this.page && !this.page.isClosed()));
    
    try {
        if (!this.sensePCPage) {
            console.log('⚠️ SensePCPage is not initialized, skipping cleanup');
            return;
        }
        
        console.log('🧹 Starting PC cleanup after assign-pc scenario...');
        
        // Click on more button for that PC
        await this.sensePCPage.clickMoreButton();
        console.log('✅ Clicked more button for PC');
        
        // Verify delete button is visible
        const isDeleteButtonVisible = await this.sensePCPage.isDeleteButtonVisible();
        if (isDeleteButtonVisible) {
            console.log('✅ Delete PC button is visible');
            
            // Click delete button
            await this.sensePCPage.clickDeleteButton();
            console.log('✅ Clicked delete button for PC');
            
            // Confirm delete PC
            await this.sensePCPage.confirmDeletePC();
            console.log('✅ Confirmed PC deletion');
            
            // Verify success message
            const isSuccessMessageVisible = await this.sensePCPage.isDeleteSuccessMessageVisible();
            if (isSuccessMessageVisible) {
                console.log('✅ PC deleted successfully message is visible');
            } else {
                console.log('⚠️ PC deleted successfully message is not visible');
            }
            
            // Verify PC is not present in the list
            const isPCNotPresent = await this.sensePCPage.verifyPCNotInList();
            if (isPCNotPresent) {
                console.log('✅ PC is not present in the list - deletion successful');
            } else {
                console.log('⚠️ PC is still present in the list');
            }
        } else {
            console.log('⚠️ Delete PC button is not visible - PC may already be deleted');
        }
        
        console.log('✅ PC cleanup completed');
    } catch (error) {
        console.log('⚠️ Error during PC cleanup:', error);
        // Continue execution even if cleanup fails
    }
});

// After hook specifically for @profileAndSecurity scenarios to clean up MFA state
After({ tags: '@profileAndSecurity', timeout: 120000 }, async function(this: CustomWorld, scenario) {
    console.log('🔒 @profileAndSecurity After hook - cleaning up MFA state...');
    
    try {
        // If test failed, capture screenshot for debugging
        if (scenario.result?.status === 'FAILED') {
            console.log('❌ ProfileAndSecurity test failed - capturing screenshot...');
            await this.captureScreenshot(scenario.pickle.name, 'failure');
        }
        
        // Clean up MFA state if user is still logged in
        if (this.page && !this.page.isClosed()) {
            try {
                // Navigate to Security and Privacy page to disable MFA if enabled
                await this.page.goto('/dashboard/profile/security');
                await this.page.waitForTimeout(2000);
                
                // Check if MFA is enabled and disable it
                const disableButton = this.page.locator('button:has-text("Disable")');
                if (await disableButton.isVisible()) {
                    console.log('🔒 Disabling MFA before test cleanup...');
                    await disableButton.click();
                    await this.page.waitForTimeout(2000);
                    console.log('✅ MFA disabled successfully');
                }
            } catch (mfaCleanupError) {
                console.log('⚠️ Could not clean up MFA state:', mfaCleanupError);
            }
        }
        
        // Reset all MFA-related state
        this.mfaEnabled = undefined;
        this.mfaSecret = undefined;
        this.mfaBackupCodes = undefined;
        this.capturedAccessToken = undefined;
        this.secretCode = undefined;
        
        console.log('✅ @profileAndSecurity MFA state cleanup completed');
    } catch (error) {
        console.log('⚠️ Error during @profileAndSecurity cleanup:', error);
    }
    
    // Add delay to ensure cleanup completes
    await new Promise(resolve => setTimeout(resolve, 3000));
});

// After hook specifically for @createANewPC scenarios to clean up created PCs
// This will run regardless of test outcome (pass/fail) and BEFORE browser closes
After({ tags: '@createANewPC', timeout: 120000 }, async function(this: CustomWorld) {
    console.log('🧹 @createANewPC After hook triggered - starting cleanup...');
    console.log('🔍 @createANewPC hook: Computer name =', this.sensePCPage?.getComputerName());
    console.log('🔍 @createANewPC hook: Page context available =', !!(this.page && !this.page.isClosed()));
    console.log('🔍 @createANewPC hook: Browser context available =', !!(this.browser && this.browser.contexts().length > 0));
    
    // Direct cleanup without Promise.race to avoid complexity
    try {
        console.log('🔄 Starting @createANewPC cleanup process...');
        await cleanupCreatedPC(this);
        console.log('✅ @createANewPC cleanup completed successfully');
    } catch (error) {
        console.log('❌ @createANewPC cleanup failed:', error);
        // Take a screenshot for debugging
        try {
            if (this.page && !this.page.isClosed()) {
                await this.page.screenshot({ path: `after-hook-cleanup-error-${Date.now()}.png`, fullPage: true });
                console.log('📸 Screenshot saved for after hook cleanup error');
            }
        } catch (screenshotError) {
            console.log('📸 Could not take screenshot for after hook cleanup error');
        }
    }
    
    // Add a longer delay to ensure cleanup completes
    await new Promise(resolve => setTimeout(resolve, 10000)); // Increased to 10 seconds delay
    console.log('⏳ @createANewPC cleanup delay completed');
});

// Before hook specifically for @profileAndSecurity scenarios to ensure clean state
Before({ tags: '@profileAndSecurity' }, async function(this: CustomWorld) {
    console.log('🔒 @profileAndSecurity Before hook - ensuring clean authentication state...');
    
    // Wait longer to ensure previous test cleanup is complete
    await new Promise(resolve => setTimeout(resolve, 5000)); // Increased delay
    
    // Reset ALL authentication-related state
    this.capturedAccessToken = undefined;
    this.secretCode = undefined;
    this.email = undefined;
    this.password = undefined;
    this.token = undefined;
    this.newPassword = undefined;
    this.capturedUserId = undefined;
    
    // Reset MFA-related state
    this.mfaEnabled = undefined;
    this.mfaSecret = undefined;
    this.mfaBackupCodes = undefined;
    
    // Force close any existing browser context to ensure complete isolation
    if (this.context) {
        try {
            await this.context.close();
            console.log('✅ Closed existing browser context for complete isolation');
        } catch (error) {
            console.log('⚠️ Error closing existing context:', error);
        }
    }
    
    // Create a completely new browser context
    if (this.browser) {
        try {
            const { getTestData } = await import('../config/environment');
            const testData = getTestData();
            
            this.context = await this.browser.newContext({
                viewport: { width: 1280, height: 720 },
                ignoreHTTPSErrors: true,
                acceptDownloads: true,
                baseURL: testData.application.baseURL,
                httpCredentials: {
                    username: process.env.HTTP_USERNAME || '',
                    password: process.env.HTTP_PASSWORD || ''
                },
                // Allow popups and new tabs
                permissions: ['clipboard-read', 'clipboard-write']
            });
            
            this.page = await this.context.newPage();
            this.page.setDefaultTimeout(testData.application.timeout);
            this.page.setDefaultNavigationTimeout(testData.application.timeout);
            
            console.log('✅ Created new browser context for ProfileAndSecurity test');
        } catch (error) {
            console.log('⚠️ Error creating new browser context:', error);
        }
    }
    
    // Ensure we start from a clean login state
    if (this.page && !this.page.isClosed()) {
        try {
            // Clear all storage first
            await this.page.evaluate(() => {
                localStorage.clear();
                sessionStorage.clear();
                document.cookie.split(";").forEach(function(c) { 
                    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
                });
            });
            
            // Navigate to login page to ensure clean state
            await this.page.goto('/login');
            await this.page.waitForTimeout(3000); // Increased wait time
            console.log('✅ Navigated to login page for clean authentication state');
        } catch (error) {
            console.log('⚠️ Could not navigate to login page:', error);
        }
    }
    
    console.log('✅ @profileAndSecurity clean state initialization completed');
});

// Before hook for @billings scenarios
Before({ tags: '@billings' }, async function(this: CustomWorld) {
    console.log('💰 @billings Before hook - ensuring clean billing state...');
    
    // Wait to ensure previous test cleanup is complete
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Reset billing-related state
    this.capturedAccessToken = undefined;
    this.email = undefined;
    this.password = undefined;
    this.token = undefined;
    
    console.log('✅ @billings clean state initialization completed');
});

// Before hook for @createANewPC scenarios
Before({ tags: '@createANewPC' }, async function(this: CustomWorld) {
    console.log('💻 @createANewPC Before hook - ensuring clean PC state...');
    
    // Wait to ensure previous test cleanup is complete
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Reset PC-related state
    this.computerName = undefined;
    this.capturedAccessToken = undefined;
    this.email = undefined;
    this.password = undefined;
    this.token = undefined;
    
    console.log('✅ @createANewPC clean state initialization completed');
});

// Simplified: Only one cleanup hook to avoid conflicts
// The main @createANewPC hook above should handle all cleanup scenarios

// Centralized cleanup function that can be called from multiple hooks
async function cleanupCreatedPC(world: CustomWorld) {
    try {
        console.log('🧹 Starting cleanup for @createANewPC scenario...');
        console.log('🔍 Cleanup: World object available =', !!world);
        console.log('🔍 Cleanup: SensePCPage available =', !!world.sensePCPage);
        console.log('🔍 Cleanup: Page available =', !!(world.page && !world.page.isClosed()));
        console.log('🔍 Cleanup: Browser available =', !!(world.browser && world.browser.contexts().length > 0));
        
        // Check if we have the necessary components for cleanup
        if (!world.sensePCPage) {
            console.log('⚠️ No sensePCPage available for cleanup - skipping');
            return;
        }
        
        const computerName = world.sensePCPage.getComputerName();
        console.log('🔍 Cleanup: Computer name =', computerName);
        
        if (!computerName) {
            console.log('⚠️ No computer name available for cleanup - skipping');
            return;
        }
        
        // Ensure we have a valid page context
        if (!world.page || world.page.isClosed()) {
            console.log('⚠️ Page context is invalid or closed, attempting to recover...');
            // Try to get a new page context if possible
            if (world.browser && world.browser.contexts().length > 0) {
                const contexts = world.browser.contexts();
                if (contexts.length > 0) {
                    const pages = contexts[0].pages();
                    if (pages.length > 0) {
                        world.page = pages[0];
                        console.log('✅ Recovered page context for cleanup');
                    }
                }
            }
        }
        
        if (!world.page || world.page.isClosed()) {
            console.log('❌ No valid page context available for cleanup');
            return;
        }
        
        // CRITICAL: Switch back to original tab if we're on the connected tab
        try {
            console.log('🔄 Ensuring we are on the original tab for cleanup...');
            const switchSuccess = await world.sensePCPage.switchToOriginalTab();
            if (switchSuccess) {
                console.log('✅ Successfully switched to original tab for cleanup');
                // Update world.page reference to the original tab
                const allPages = world.page.context().pages();
                for (const page of allPages) {
                    const pageUrl = await page.url();
                    if (!pageUrl.includes('/pc-viewer?session=')) {
                        world.page = page;
                        break;
                    }
                }
            } else {
                console.log('⚠️ Could not switch to original tab, continuing with current tab');
            }
        } catch (tabSwitchError) {
            console.log('⚠️ Error switching tabs during cleanup:', tabSwitchError);
            // Continue with cleanup even if tab switching fails
        }
        
        // Check if we have a sensePCPage and computer name to clean up
        if (world.sensePCPage && world.sensePCPage.getComputerName()) {
            const computerName = world.sensePCPage.getComputerName();
            console.log(`🔍 Looking for PC to clean up: ${computerName}`);
            
            // Ensure we have a valid page context
            if (!world.page || world.page.isClosed()) {
                console.log('⚠️ Page context is invalid or closed, attempting to recover...');
                // Try to get a new page context if possible
                if (world.browser && world.browser.contexts().length > 0) {
                    const contexts = world.browser.contexts();
                    if (contexts.length > 0) {
                        const pages = contexts[0].pages();
                        if (pages.length > 0) {
                            world.page = pages[0];
                            console.log('✅ Recovered page context for cleanup');
                        }
                    }
                }
            }
            
            // Navigate to Sense PC page first
            try {
                if (world.page && !world.page.isClosed()) {
                    console.log('🔄 Navigating to Sense PC page for cleanup...');
                    
                    // Try multiple navigation approaches
                    let navigationSuccess = false;
                    
                    // Approach 1: Try sidebar navigation
                    try {
                        await world.sensePCPage.clickSensePCFromSidebar();
                        await world.page?.waitForTimeout(3000);
                        navigationSuccess = true;
                        console.log('✅ Navigation via sidebar successful');
                    } catch (sidebarError) {
                        console.log('⚠️ Sidebar navigation failed:', sidebarError);
                    }
                    
                    // Approach 2: Try direct URL navigation if sidebar failed
                    if (!navigationSuccess) {
                        try {
                            console.log('🔄 Trying direct URL navigation...');
                            await world.page?.goto('/dashboard/sense-pc');
                            await world.page?.waitForTimeout(3000);
                            navigationSuccess = true;
                            console.log('✅ Direct URL navigation successful');
                        } catch (urlError) {
                            console.log('⚠️ Direct URL navigation failed:', urlError);
                        }
                    }
                    
                    // Approach 3: Try smart-pc URL if sense-pc failed
                    if (!navigationSuccess) {
                        try {
                            console.log('🔄 Trying smart-pc URL navigation...');
                            await world.page?.goto('/dashboard/smart-pc');
                            await world.page?.waitForTimeout(3000);
                            navigationSuccess = true;
                            console.log('✅ Smart-PC URL navigation successful');
                        } catch (smartPcError) {
                            console.log('⚠️ Smart-PC URL navigation failed:', smartPcError);
                        }
                    }
                    
                    if (!navigationSuccess) {
                        console.log('❌ All navigation approaches failed - cannot proceed with cleanup');
                        return;
                    }
                    
                    // Debug: Check how many PCs are visible before cleanup
                    console.log('🔍 Checking PCs before cleanup...');
                    const pcCardsBefore = await world.page?.locator('.rounded-lg.border.bg-card').count();
                    console.log(`🔍 Found ${pcCardsBefore} PC cards before cleanup`);
                    
                    if (pcCardsBefore === 0) {
                        console.log('✅ No PCs found - cleanup not needed');
                        return;
                    }
                    
                    // Use the guaranteed cleanup method that tries multiple strategies
                    console.log('🛡️ Starting guaranteed PC cleanup...');
                    let cleanupSuccess = false;
                    try {
                        cleanupSuccess = await world.sensePCPage.guaranteedCleanup();
                    } catch (cleanupError) {
                        console.log('❌ Guaranteed cleanup failed:', cleanupError);
                        // Take a screenshot for debugging
                        try {
                            await world.page?.screenshot({ path: `guaranteed-cleanup-error-${Date.now()}.png`, fullPage: true });
                            console.log('📸 Screenshot saved for guaranteed cleanup error');
                        } catch (screenshotError) {
                            console.log('📸 Could not take screenshot for guaranteed cleanup error');
                        }
                    }
                    
                    // Debug: Check how many PCs are visible after cleanup
                    let pcCardsAfter = 0;
                    try {
                        if (world.page && !world.page.isClosed()) {
                            await world.page?.waitForTimeout(2000);
                            pcCardsAfter = await world.page?.locator('.rounded-lg.border.bg-card').count() || 0;
                            console.log(`🔍 Found ${pcCardsAfter} PC cards after cleanup`);
                        } else {
                            console.log('⚠️ Page context is closed, cannot check remaining PCs');
                        }
                    } catch (checkError) {
                        console.log('⚠️ Error checking remaining PCs:', checkError);
                    }
                    
                    if (cleanupSuccess && pcCardsAfter === 0) {
                        console.log(`✅ Comprehensive cleanup completed successfully - all PCs deleted`);
                    } else if (pcCardsAfter > 0) {
                        console.log(`⚠️ Comprehensive cleanup completed but ${pcCardsAfter} PCs still remain`);
                        // Take a screenshot for debugging
                        try {
                            await world.page?.screenshot({ path: `cleanup-incomplete-${Date.now()}.png`, fullPage: true });
                            console.log('📸 Screenshot saved for incomplete cleanup debugging');
                        } catch (screenshotError) {
                            console.log('📸 Could not take screenshot for incomplete cleanup');
                        }
                        
                        // Try force delete any remaining PCs
                        console.log('🔄 Attempting force delete for remaining PCs...');
                        try {
                            const forceDeleteSuccess = await world.sensePCPage.forceDeleteAnyPC();
                            if (forceDeleteSuccess) {
                                console.log('✅ Force delete completed successfully');
                            } else {
                                console.log('⚠️ Force delete may have failed');
                            }
                        } catch (forceDeleteError) {
                            console.log('❌ Force delete failed:', forceDeleteError);
                        }
                    } else {
                        console.log(`⚠️ Comprehensive cleanup may have failed`);
                        // Take a screenshot for debugging
                        try {
                            await world.page?.screenshot({ path: `cleanup-failed-${Date.now()}.png`, fullPage: true });
                            console.log('📸 Screenshot saved for cleanup failure debugging');
                        } catch (screenshotError) {
                            console.log('📸 Could not take screenshot for cleanup failure');
                        }
                    }
                } else {
                    console.log('⚠️ Page context is not available for cleanup');
                }
                
            } catch (navigationError) {
                console.log(`⚠️ Failed to navigate to Sense PC page for cleanup:`, navigationError);
                // Try alternative cleanup approach if navigation fails
                try {
                    if (world.page && !world.page.isClosed()) {
                        console.log('🔄 Attempting alternative cleanup approach...');
                        await world.page?.goto('/dashboard/sense-pc');
                        await world.page?.waitForTimeout(3000);
                        const alternativeCleanup = await world.sensePCPage.safeDeletePC();
                        if (alternativeCleanup) {
                            console.log(`✅ Alternative cleanup successful for PC: ${computerName}`);
                        }
                    } else {
                        console.log('⚠️ Page context not available for alternative cleanup');
                    }
                } catch (altError) {
                    console.log(`❌ Alternative cleanup also failed:`, altError);
                }
            }
        } else {
            console.log('ℹ️ No PC to clean up (sensePCPage not initialized or no computer name)');
        }
        
        console.log('🧹 Cleanup for @createANewPC scenario completed');
        
    } catch (error) {
        console.log('❌ Error during @createANewPC cleanup:', error);
        // Don't throw the error to avoid masking the actual test result
        // But ensure we log it for debugging
        try {
            if (world.page && !world.page.isClosed()) {
                await world.page?.screenshot({ path: `cleanup-error-${Date.now()}.png`, fullPage: true });
                console.log('📸 Screenshot saved for cleanup error debugging');
            } else {
                console.log('📸 Could not take screenshot - page context not available');
            }
        } catch (screenshotError) {
            console.log('📸 Could not take screenshot for cleanup error');
        }
    }
}

// Specific After hook for API tests to ensure PC cleanup
After({ tags: '@api' }, async function(this: CustomWorld) {
    console.log('🧹 API After hook - cleaning up created PCs...');
    if (this.createdPCs && this.createdPCs.length > 0) {
        console.log(`🧹 Found ${this.createdPCs.length} PCs to clean up:`, this.createdPCs);
        await this.cleanupCreatedPCs();
    } else {
        console.log('🧹 No created PCs found in API After hook');
    }
}); 
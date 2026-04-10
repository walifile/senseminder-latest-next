import { test as base, Browser, BrowserContext, Page } from '@playwright/test';
import { LoginPage } from './pages/loginPage';
import { HomePage } from './pages/homePage';
import { SignUpPage } from './pages/signUpPage';
import { SensePCPage } from './pages/sensePCPage';
import { BillingPage } from './pages/billingPage';
import { DashboardPage } from './pages/dashboardPage';
import { ApiCreatePCPage } from './pages/apiCreatePCPage';
import { ApiBillingPage } from './pages/apiBillingPage';
import { SenseStoragePage } from './pages/senseStoragePage';
import { UserManagementPage } from './pages/userManagementPage';
import { SupportPage } from './pages/supportPage';
import { LandingPage } from './pages/landingPage';
import { config, getTestData, isCI } from './config/environment';
import { errorHandler } from './utils/errorHandler';
import { TimeoutManager } from './utils/timeoutUtils';
import { apiLogger } from './utils/apiLogger';
import { adminAuthAPI } from './utils/adminAuthAPI';
import { userDeletionAPI } from './utils/userDeletionAPI';

// Test context to share state across fixtures
class TestContext {
    email?: string;
    mailPassword?: string;
    token?: string;
    password?: string;
    computerName?: string;
    capturedAccessToken?: string;
    capturedIdToken?: string;
    capturedUserId?: string;
    createdPCs: string[] = [];
    createdUsers: string[] = [];
    userSignupOccurred: boolean = false;
    [key: string]: any;
}

export interface TestFixtures {
    testContext: TestContext;
    loginPage: LoginPage;
    homePage: HomePage;
    signUpPage: SignUpPage;
    billingPage: BillingPage;
    sensePCPage: SensePCPage;
    dashboardPage: DashboardPage;
    apiCreatePCPage: ApiCreatePCPage;
    apiBillingPage: ApiBillingPage;
    senseStoragePage: SenseStoragePage;
    userManagementPage: UserManagementPage;
    supportPage: SupportPage;
    landingPage: LandingPage;
    
    // Helper methods
    addCreatedPC: (instanceId: string) => void;
    cleanupCreatedPCs: () => Promise<void>;
    addCreatedUser: (email: string) => void;
    cleanupCreatedUsers: () => Promise<void>;
    captureScreenshot: (scenarioName: string, type?: 'failure' | 'debug' | 'error' | 'failure_fallback') => Promise<string | null>;
}

export const test = base.extend<TestFixtures>({
    testContext: async ({}, use) => {
        const context = new TestContext();
        await use(context);
        // Cleanup is handled in afterEach hook to ensure it runs after test completes
    },
    
    loginPage: async ({ page }, use) => {
        const loginPage = new LoginPage(page);
        await use(loginPage);
    },
    
    homePage: async ({ page }, use) => {
        const homePage = new HomePage(page);
        await use(homePage);
    },
    
    signUpPage: async ({ page }, use) => {
        const signUpPage = new SignUpPage(page);
        await use(signUpPage);
    },
    
    billingPage: async ({ page }, use) => {
        const billingPage = new BillingPage(page);
        await use(billingPage);
    },
    
    sensePCPage: async ({ page }, use) => {
        const sensePCPage = new SensePCPage(page);
        await use(sensePCPage);
    },
    
    dashboardPage: async ({ page }, use) => {
        const dashboardPage = new DashboardPage(page);
        await use(dashboardPage);
    },
    
    apiCreatePCPage: async ({}, use) => {
        const testData = getTestData();
        const apiCreatePCPage = new ApiCreatePCPage(testData.application.baseURL, '');
        await use(apiCreatePCPage);
    },
    
    apiBillingPage: async ({}, use) => {
        const testData = getTestData();
        const apiBillingPage = new ApiBillingPage(testData.application.baseURL, '');
        await use(apiBillingPage);
    },
    
    senseStoragePage: async ({ page }, use) => {
        const senseStoragePage = new SenseStoragePage(page);
        await use(senseStoragePage);
    },
    
    userManagementPage: async ({ page }, use) => {
        const userManagementPage = new UserManagementPage(page);
        await use(userManagementPage);
    },
    
    supportPage: async ({ page }, use) => {
        const supportPage = new SupportPage(page);
        await use(supportPage);
    },
    
    landingPage: async ({ page }, use) => {
        const landingPage = new LandingPage(page);
        await use(landingPage);
    },
    
    addCreatedPC: async ({ testContext, apiCreatePCPage }, use) => {
        const addCreatedPC = (instanceId: string) => {
            testContext.createdPCs.push(instanceId);
            console.log(`📝 Added PC to cleanup list: ${instanceId}`);
        };
        await use(addCreatedPC);
    },
    
    cleanupCreatedPCs: async ({ testContext, apiCreatePCPage }, use) => {
        const cleanupCreatedPCs = async () => {
            if (!testContext.createdPCs || testContext.createdPCs.length === 0) {
                console.log('🧹 No created PCs to clean up');
                return;
            }
            
            console.log(`🧹 Cleaning up ${testContext.createdPCs.length} created PCs...`);
            try {
                await apiCreatePCPage.deleteMultiplePCs(testContext.createdPCs, 'virginia');
                console.log(`✅ Successfully deleted ${testContext.createdPCs.length} PCs`);
            } catch (error) {
                console.log('⚠️ Error during PC cleanup:', error);
            }
            testContext.createdPCs = [];
        };
        await use(cleanupCreatedPCs);
    },
    
    addCreatedUser: async ({ testContext }, use) => {
        const addCreatedUser = (email: string) => {
            testContext.createdUsers.push(email);
            testContext.userSignupOccurred = true;
            console.log(`📝 Added user to cleanup list: ${email}`);
        };
        await use(addCreatedUser);
    },
    
    cleanupCreatedUsers: async ({ testContext }, use) => {
        const cleanupCreatedUsers = async () => {
            if (!testContext.createdUsers || testContext.createdUsers.length === 0) {
                console.log('🧹 No created users to clean up');
                return;
            }
            
            console.log(`🧹 Cleaning up ${testContext.createdUsers.length} created users...`);
            try {
                const { userDeletionAPI } = await import('./utils/userDeletionAPI');
                const isTokenValid = await userDeletionAPI.validateToken();
                if (!isTokenValid) {
                    console.error('❌ Admin token is invalid or expired. Skipping user cleanup.');
                    return;
                }
                
                const deleteResponses = await userDeletionAPI.deleteMultipleUsers(testContext.createdUsers);
                const successCount = deleteResponses.filter(r => r.success).length;
                const failureCount = deleteResponses.filter(r => !r.success).length;
                console.log(`✅ User cleanup completed: ${successCount} successful, ${failureCount} failed`);
            } catch (error) {
                console.log('⚠️ Error during user cleanup:', error);
            }
            testContext.createdUsers = [];
        };
        await use(cleanupCreatedUsers);
    },
    
    captureScreenshot: async ({ page }, use) => {
        const captureScreenshot = async (scenarioName: string, type: 'failure' | 'debug' | 'error' | 'failure_fallback' = 'debug'): Promise<string | null> => {
            try {
                if (!page || page.isClosed()) {
                    console.log('⚠️ Page context not available for screenshot capture');
                    return null;
                }
                
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const cleanScenarioName = scenarioName.replace(/[^a-zA-Z0-9]/g, '_');
                const screenshotPath = `screenshots/${type}_${cleanScenarioName}_${timestamp}.png`;
                
                await page.screenshot({
                    path: screenshotPath,
                    fullPage: true
                });
                
                console.log(`📸 Screenshot saved: ${screenshotPath}`);
                return screenshotPath;
            } catch (error) {
                console.log('❌ Error capturing screenshot:', error);
                return null;
            }
        };
        await use(captureScreenshot);
    },
});

// Global error handlers - migrated from Cucumber hooks.ts
process.on('unhandledRejection', async (reason, promise) => {
    console.log('❌ Unhandled rejection detected - capturing screenshot...');
    const world = (global as any).currentWorld;
    if (world && world.page && !world.page.isClosed()) {
        try {
            await errorHandler.handleTestFailure(
                new Error(`Unhandled rejection: ${reason}`),
                'Unhandled rejection',
                `Promise: ${promise}`
            );
        } catch (error) {
            console.log('❌ Error capturing screenshot for unhandled rejection:', error);
        }
    }
});

process.on('uncaughtException', async (error) => {
    console.log('❌ Uncaught exception detected - capturing screenshot...');
    const world = (global as any).currentWorld;
    if (world && world.page && !world.page.isClosed()) {
        try {
            await errorHandler.handleTestFailure(
                error,
                'Uncaught exception',
                `Error: ${error.message}`
            );
        } catch (screenshotError) {
            console.log('❌ Error capturing screenshot for uncaught exception:', screenshotError);
        }
    }
});

// Initialize error handler and API logger on page creation
test.beforeEach(async ({ page, testContext }) => {
    errorHandler.setWorld({ page, testContext } as any);
    (global as any).currentWorld = { page, testContext };
    apiLogger.clearApiCalls();
    
    // Reset test context state for clean test
    testContext.email = undefined;
    testContext.mailPassword = undefined;
    testContext.token = undefined;
    testContext.password = undefined;
    testContext.computerName = undefined;
    testContext.capturedAccessToken = undefined;
    testContext.capturedIdToken = undefined;
    testContext.capturedUserId = undefined;
    testContext.createdPCs = [];
    testContext.createdUsers = [];
    testContext.userSignupOccurred = false;
    
    const defaultTimeout = TimeoutManager.getDefaultTimeout();
    const navigationTimeout = TimeoutManager.getNavigationTimeout();
    page.setDefaultTimeout(defaultTimeout);
    page.setDefaultNavigationTimeout(navigationTimeout);
});

// Cleanup after each test - migrated from Cucumber hooks.ts
test.afterEach(async ({ testContext, apiCreatePCPage, page, sensePCPage, captureScreenshot }, testInfo) => {
    console.log('🚀 Main After hook starting - COMPREHENSIVE CLEANUP SEQUENCE...');
    console.log('🔍 Main After hook: Created PCs =', testContext.createdPCs);
    console.log('🔍 Main After hook: User signup occurred =', testContext.userSignupOccurred);
    console.log('🔍 Main After hook: Created users =', testContext.createdUsers);
    console.log('📋 CLEANUP SEQUENCE: 1) PC deletion for ALL methods, 2) Admin-side user deletion');
    console.log('⚠️ IMPORTANT: PC cleanup MUST happen before user deletion to avoid conflicts');
    
    // Log API call summary
    console.log('\n📊 ===== API CALLS SUMMARY FOR THIS TEST =====');
    apiLogger.getApiCallSummary();
    console.log('===============================================\n');
    
    // Capture screenshot if test failed
    if (testInfo.status === 'failed' || testInfo.status === 'timedOut') {
        console.log('❌ Test failed - capturing screenshot for debugging...');
        await captureScreenshot(testInfo.title, 'failure');
    }
    
    // STEP 1: CRITICAL - Ensure PC cleanup happens first for ALL test methods
    console.log('🛡️ Main After hook - ensuring PC cleanup for all methods...');
    console.log('🔍 Main After hook - checking PC data availability...');
    console.log('🔍 - createdPCs:', testContext.createdPCs);
    console.log('🔍 - sensePCPage available:', !!sensePCPage);
    console.log('🔍 - page available:', !!(page && !page.isClosed()));
    
    try {
        // ALWAYS attempt PC cleanup regardless of data availability
        console.log('🔄 Main After hook - attempting PC cleanup regardless of data state...');
        
        // First try UI-based cleanup if page context is available
        // Check if there's a computer name to clean up (from sensePCPage or testContext)
        const computerName = sensePCPage?.getComputerName?.(testContext) || testContext.computerName;
        console.log('🔍 Main After hook - Computer name =', computerName);
        
        if (sensePCPage && page && !page.isClosed()) {
            console.log('🔄 Attempting UI-based PC cleanup...');
            try {
                // Navigate to Sense PC page for cleanup
                console.log('🔄 Navigating to Sense PC page for cleanup...');
                await page.goto('/dashboard/sense-pc');
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                console.log('🔄 Calling guaranteedCleanup...');
                // Pass testContext so guaranteedCleanup can access computerName if needed
                // Note: guaranteedCleanup doesn't take parameters, but deleteAllPCs (called internally) does
                const mainCleanupSuccess = await sensePCPage.guaranteedCleanup();
                if (mainCleanupSuccess) {
                    console.log('✅ Main After hook - UI-based PC cleanup successful');
                } else {
                    console.log('⚠️ Main After hook - UI-based PC cleanup failed, trying API fallback...');
                    // Fallback to API-based cleanup
                    if (testContext.createdPCs.length > 0) {
                        await apiCreatePCPage.deleteMultiplePCs(testContext.createdPCs, 'virginia');
                        console.log('✅ Main After hook - API-based PC cleanup completed');
                    }
                }
            } catch (uiCleanupError) {
                console.log('⚠️ UI-based PC cleanup failed:', uiCleanupError);
                console.log('🔄 Falling back to API-based PC cleanup...');
                try {
                    if (testContext.createdPCs.length > 0) {
                        await apiCreatePCPage.deleteMultiplePCs(testContext.createdPCs, 'virginia');
                        console.log('✅ Main After hook - API-based PC cleanup completed');
                    }
                } catch (apiCleanupError) {
                    console.log('⚠️ API-based PC cleanup also failed:', apiCleanupError);
                }
            }
        } else {
            console.log('⚠️ SensePCPage or page context not available for UI cleanup');
            console.log('🔄 Attempting API-based PC cleanup...');
            try {
                if (testContext.createdPCs.length > 0) {
                    await apiCreatePCPage.deleteMultiplePCs(testContext.createdPCs, 'virginia');
                    console.log('✅ Main After hook - API-based PC cleanup completed');
                }
            } catch (apiCleanupError) {
                console.log('⚠️ API-based PC cleanup failed:', apiCleanupError);
            }
        }
        
        // Clear the created PCs list
        testContext.createdPCs = [];
    } catch (mainCleanupError) {
        console.log('❌ Main After hook - PC cleanup error:', mainCleanupError);
        // Don't throw error to avoid masking test results
    }
    
    // STEP 2: Then attempt user cleanup if user signup occurred (API-based)
    console.log('👤 Main After hook - checking for user cleanup...');
    try {
        if (testContext.userSignupOccurred && testContext.createdUsers && testContext.createdUsers.length > 0) {
            // Deduplicate user list to avoid deleting the same user twice
            const uniqueUsers = [...new Set(testContext.createdUsers)];
            console.log(`🧹 Starting user cleanup for ${uniqueUsers.length} unique users via API...`);
            
            try {
                // Check if admin credentials are configured
                if (!adminAuthAPI.isConfigured()) {
                    console.error('❌ Admin credentials or MFA_SECRET not found in environment variables. Skipping user cleanup.');
                    console.error('ℹ️ Required in .env: ADMIN_USERNAME, ADMIN_PASSWORD, MFA_SECRET');
                } else {
                    // Step 1: Authenticate with Admin using API (3 steps: login → select MFA → confirm MFA)
                    console.log('\n🔐 ===== ADMIN API AUTHENTICATION =====');
                    const idToken = await adminAuthAPI.authenticate();
                    console.log('✅ ===== AUTHENTICATION SUCCESSFUL =====\n');
        
                    // // DEBUG: Log the idToken received
                    // console.log('🔍 ===== DEBUG: ID TOKEN CHECK =====');
                    // console.log(`📌 idToken type: ${typeof idToken}`);
                    // console.log(`📌 idToken length: ${idToken ? idToken.length : 'null'}`);
                    // console.log(`📌 idToken value (first 50 chars): ${idToken ? idToken.substring(0, 50) + '...' : 'EMPTY'}`);
                    // console.log(`📌 idToken value (last 50 chars): ${idToken ? '...' + idToken.substring(idToken.length - 50) : 'EMPTY'}`);

                    // Step 2: Use the access token to delete users via API
                    console.log('\n🗑️ ===== USER DELETION VIA API =====');
                    console.log(`🧹 Deleting ${uniqueUsers.length} users via API...`);

                    // IMPORTANT: Set the ADMIN_TOKEN BEFORE creating UserDeletionAPI
                    // so that the constructor can read the token from environment
                    process.env.ADMIN_TOKEN = idToken;
                    
                    // // DEBUG: Log that ADMIN_TOKEN has been set
                    // console.log('🔍 ===== DEBUG: ADMIN_TOKEN CHECK =====');
                    // console.log(`📌 process.env.ADMIN_TOKEN type: ${typeof process.env.ADMIN_TOKEN}`);
                    // console.log(`📌 process.env.ADMIN_TOKEN length: ${process.env.ADMIN_TOKEN ? process.env.ADMIN_TOKEN.length : 'null'}`);
                    // console.log(`📌 process.env.ADMIN_TOKEN value (first 50 chars): ${process.env.ADMIN_TOKEN ? process.env.ADMIN_TOKEN.substring(0, 50) + '...' : 'EMPTY'}`);
                    // console.log(`📌 process.env.ADMIN_TOKEN value (last 50 chars): ${process.env.ADMIN_TOKEN ? '...' + process.env.ADMIN_TOKEN.substring(process.env.ADMIN_TOKEN.length - 50) : 'EMPTY'}`);
                    // console.log(`✅ Admin token stored in ADMIN_TOKEN environment variable\n`);

                    // Create UserDeletionAPI AFTER setting the token
                    const updatedUserDeletionAPI = new (await import('./utils/userDeletionAPI')).UserDeletionAPI();

                    // Delete all created users
                    const deleteResponses = await updatedUserDeletionAPI.deleteMultipleUsers(uniqueUsers);
                    const successCount = deleteResponses.filter(r => r.success).length;
                    const failureCount = deleteResponses.filter(r => !r.success).length;

                    console.log(`\n📊 User deletion summary: ${successCount} successful, ${failureCount} failed`);
                    console.log('✅ ===== USER CLEANUP COMPLETED =====\n');
                }
                
                console.log('✅ Main After hook - user cleanup completed');
            } catch (apiCleanupError) {
                console.error('⚠️ API-based user cleanup failed:', apiCleanupError);
                console.log('ℹ️ User cleanup skipped due to API authentication failure');
                // Don't throw error - user cleanup failure shouldn't fail the test
            }
        } else {
            console.log('ℹ️ Main After hook - no users to clean up');
        }
    } catch (userCleanupError) {
        console.log('❌ Main After hook - user cleanup error:', userCleanupError);
        // Don't throw error to avoid masking test results
    }
    
    // Clear the created users list
    testContext.createdUsers = [];
    testContext.userSignupOccurred = false;
    
    // Clean up any active routes before closing
    try {
        if (page && !page.isClosed()) {
            await page.unrouteAll({ behavior: 'ignoreErrors' });
        }
    } catch (error) {
        console.log('⚠️ Error during route cleanup:', error);
    }
    
    console.log('✅ Main After hook completed');
});

export { expect } from '@playwright/test';

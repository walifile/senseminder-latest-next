import { World, IWorldOptions, setWorldConstructor } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import { config, getTestData, isCI } from '../config/environment';
import { HomePage } from '../pages/homePage';
import { SignUpPage } from '../pages/signUpPage';
import { SensePCPage } from '../pages/sensePCPage';
import { BillingPage } from '../pages/billingPage';
import { SecurityAndPrivacyPage } from '../pages/securityAndPrivacyPage';
import { DashboardPage } from '../pages/dashboardPage';
import { ProfileInformationPage } from '../pages/profileInformationPage';
import { ApiCreatePCPage, CreatePCRequest, DeletePCRequest, CheckPCStatusRequest, StartPCRequest, StopPCRequest, ResizePCRequest } from '../pages/apiCreatePCPage';
import { ApiBillingPage } from '../pages/apiBillingPage';
import { SenseStoragePage } from '../pages/senseStoragePage';
import { UserManagementPage } from '../pages/userManagementPage';
import { SupportPage } from '../pages/supportPage';
import { LandingPage } from '../pages/landingPage';

export interface CustomWorld extends World {
    browser?: Browser;
    context?: BrowserContext;
    page?: Page;
    loginPage?: LoginPage;
    homePage?: HomePage;
    signUpPage?: SignUpPage;
    billingPage?: BillingPage;
    sensePCPage?: SensePCPage;
    securityAndPrivacyPage?: SecurityAndPrivacyPage;
    dashboardPage?: DashboardPage;
    profileInformationPage?: ProfileInformationPage;
    apiCreatePCPage?: ApiCreatePCPage;
    apiBillingPage?: ApiBillingPage;
    senseStoragePage?: SenseStoragePage;
    userManagementPage?: UserManagementPage;
    supportPage?: SupportPage;
    landingPage?: LandingPage;
    invitedUserName?: string;
    invitedUserEmail?: string;
    invitedUserTimestamp?: number;
    invitedUserToken?: string;
    invitationEmailContent?: string;
    tempUsername?: string;
    tempPassword?: string;
    loginUrl?: string;
    newPassword?: string;
    ticketSubject?: string;
    replyMessage?: string;
    ticketId?: string;
    currentPCRequest?: CreatePCRequest;
    currentStatusRequest?: CheckPCStatusRequest;
    currentStartRequest?: StartPCRequest;
    currentStopRequest?: StopPCRequest;
    currentResizeRequest?: ResizePCRequest; // Resize PC request
    currentBillingRequest?: any; // Billing request
    addedPaymentMethodId?: string; // Track added payment method ID
    multiplePCRequests?: CreatePCRequest[];
    lastApiResponse?: any;
    lastApiError?: any;
    multipleApiResponses?: any[];
    multipleApiErrors?: any[];
    createdPCs?: string[]; // Track instance IDs of created PCs for cleanup
    testInstanceId?: string; // For testing with specific instance IDs
    addCreatedPC(instanceId: string): void; // Method to add PC to cleanup list
    cleanupCreatedPCs(): Promise<void>; // Method to clean up created PCs
    captureScreenshot(scenarioName: string, type?: 'failure' | 'debug' | 'error'): Promise<string | null>; // Method to capture screenshots
    captureDebugArtifacts(scenarioName: string, type?: 'failure' | 'debug' | 'error'): Promise<void>; // Method to capture debug artifacts
    email?: string;
    mailPassword?: string;
    token?: string;
    password?: string;
    newFullName?: string;
    newCountry?: string;
    computerName?: string;
    secretCode?: string;
    capturedAccessToken?: string;
    capturedIdToken?: string;
    capturedUserId?: string;
    mfaEnabled?: boolean;
    mfaSecret?: string;
    mfaBackupCodes?: string[];
    mfaQrCode?: string;
    isPostStopStatusCheck?: boolean;
    init(): Promise<void>;
    cleanup(): Promise<void>;
}

export class CustomWorldClass extends World implements CustomWorld {
    browser?: Browser;
    context?: BrowserContext;
    page?: Page;
    loginPage?: LoginPage;
    homePage?: HomePage;
    signUpPage?: SignUpPage;
    billingPage?: BillingPage;
    sensePCPage?: SensePCPage;
    securityAndPrivacyPage?: SecurityAndPrivacyPage;
    dashboardPage?: DashboardPage;
    profileInformationPage?: ProfileInformationPage;
    apiCreatePCPage?: ApiCreatePCPage;
    apiBillingPage?: ApiBillingPage;
    senseStoragePage?: SenseStoragePage;
    userManagementPage?: UserManagementPage;
    supportPage?: SupportPage;
    landingPage?: LandingPage;
    invitedUserName?: string;
    invitedUserEmail?: string;
    invitedUserTimestamp?: number;
    invitedUserToken?: string;
    invitationEmailContent?: string;
    tempUsername?: string;
    tempPassword?: string;
    loginUrl?: string;
    newPassword?: string;
    ticketSubject?: string;
    replyMessage?: string;
    ticketId?: string;
    currentPCRequest?: CreatePCRequest;
    currentStatusRequest?: CheckPCStatusRequest;
    currentStartRequest?: StartPCRequest;
    currentStopRequest?: StopPCRequest;
    currentResizeRequest?: ResizePCRequest; // Resize PC request
    currentBillingRequest?: any; // Billing request
    addedPaymentMethodId?: string; // Track added payment method ID
    multiplePCRequests?: CreatePCRequest[];
    lastApiResponse?: any;
    lastApiError?: any;
    multipleApiResponses?: any[];
    multipleApiErrors?: any[];
    createdPCs?: string[]; // Track instance IDs of created PCs for cleanup
    testInstanceId?: string; // For testing with specific instance IDs
    secretCode?: string;
    capturedAccessToken?: string;
    capturedIdToken?: string;
    capturedUserId?: string;
    mfaEnabled?: boolean;
    mfaSecret?: string;
    mfaBackupCodes?: string[];
    mfaQrCode?: string;
    isPostStopStatusCheck?: boolean;

    constructor(options: IWorldOptions) {
        super(options);
    }

    async init() {
        try {
            console.log('🔄 Getting test data...');
            const testData = getTestData();
            
            console.log('🔄 Launching browser...');
            // Force headless mode in CI or when explicitly configured
            // Additional check for common CI environment variables
            const isInCI = isCI() || process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true' || !!process.env.BITBUCKET_BUILD_NUMBER;
            const shouldRunHeadless = isInCI || testData.browser.headless;
            console.log(`🔄 Environment check - CI: ${isCI()}, NODE_ENV: ${process.env.NODE_ENV}, CI env var: ${process.env.CI}`);
            console.log(`🔄 Additional CI checks - GITHUB_ACTIONS: ${process.env.GITHUB_ACTIONS}, BITBUCKET_BUILD_NUMBER: ${process.env.BITBUCKET_BUILD_NUMBER}`);
            console.log(`🔄 TestData headless: ${testData.browser.headless}, Final headless: ${shouldRunHeadless}`);
            console.log(`🔄 Running in ${shouldRunHeadless ? 'headless' : 'headed'} mode`);
            
            this.browser = await chromium.launch({ 
                headless: shouldRunHeadless,
                slowMo: testData.browser.slowMo,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu',
                    '--disable-web-security',
                    '--disable-features=VizDisplayCompositor'
                ]
            });
            console.log('✅ Browser launched successfully');
            
            console.log('🔄 Creating browser context...');
            // Create context with HTTP credentials for basic authentication
            this.context = await this.browser.newContext({
                // This will inherit the baseURL from playwright.config.ts when running with Playwright
                // For Cucumber standalone, we'll set it manually
                baseURL: testData.application.baseURL,
                httpCredentials: {
                    username: config.HTTP_USERNAME,
                    password: config.HTTP_PASSWORD
                }
            });
            console.log('✅ Browser context created successfully');
            
            console.log('🔄 Creating new page...');
            const page = await this.context.newPage();
            this.page = page;
            console.log('✅ New page created successfully');
            
            console.log('🔄 Setting page timeouts...');
            // Set default timeout
            this.page.setDefaultTimeout(testData.application.timeout);
            this.page.setDefaultNavigationTimeout(testData.application.timeout);
            console.log('✅ Page timeouts set successfully');
            
            console.log('🔄 Initializing page objects...');
            // Initialize page objects
            this.loginPage = new LoginPage(this.page);
            this.homePage = new HomePage(this.page);
            this.signUpPage = new SignUpPage(this.page);
            this.billingPage = new BillingPage(this.page);
            this.sensePCPage = new SensePCPage(this.page);
            this.dashboardPage = new DashboardPage(this.page);
            this.supportPage = new SupportPage(this.page);
            this.landingPage = new LandingPage(this.page);
            // SecurityAndPrivacyPage will be initialized when needed with the captured access token
            console.log('✅ All page objects initialized successfully');
        } catch (error) {
            console.error('❌ Error during initialization:', error);
            throw error;
        }
    }

    async cleanup() {
        try {
            // Clean up created PCs via API first
            await this.cleanupCreatedPCs();
            
            // Close all pages first
            if (this.context) {
                const pages = this.context.pages();
                for (const page of pages) {
                    if (!page.isClosed()) {
                        try {
                            await page.close();
                        } catch (error) {
                            console.log('⚠️ Error closing page during cleanup:', error);
                        }
                    }
                }
                
                // Close the context
                await this.context.close();
                console.log('✅ Browser context closed');
            }
            
            // Close the browser
            if (this.browser) {
                await this.browser.close();
                console.log('✅ Browser closed');
            }
            
            // Reset all references
            this.page = undefined;
            this.context = undefined;
            this.browser = undefined;
            this.loginPage = undefined;
            this.homePage = undefined;
            this.signUpPage = undefined;
            this.billingPage = undefined;
            this.sensePCPage = undefined;
            this.dashboardPage = undefined;
            this.securityAndPrivacyPage = undefined;
            this.profileInformationPage = undefined;
            this.apiCreatePCPage = undefined;
            this.apiBillingPage = undefined;
            this.senseStoragePage = undefined;
            this.currentPCRequest = undefined;
            this.currentStatusRequest = undefined;
            this.currentStartRequest = undefined;
            this.currentStopRequest = undefined;
            this.currentResizeRequest = undefined;
            this.currentBillingRequest = undefined;
            this.multiplePCRequests = undefined;
            this.lastApiResponse = undefined;
            this.lastApiError = undefined;
            this.multipleApiResponses = undefined;
            this.multipleApiErrors = undefined;
            this.createdPCs = undefined;
            this.testInstanceId = undefined;
            this.capturedUserId = undefined;
            
        } catch (error) {
            console.log('⚠️ Error during cleanup:', error);
        }
    }

    /**
     * Clean up created PCs via API
     */
    async cleanupCreatedPCs() {
        if (!this.apiCreatePCPage || !this.createdPCs || this.createdPCs.length === 0) {
            console.log('🧹 No created PCs to clean up');
            return;
        }

        console.log(`🧹 Cleaning up ${this.createdPCs.length} created PCs...`);
        
        try {
            const deleteResponses = await this.apiCreatePCPage.deleteMultiplePCs(this.createdPCs, 'virginia');
            console.log(`✅ Successfully deleted ${deleteResponses.length} PCs`);
        } catch (error) {
            console.log('⚠️ Error during PC cleanup:', error);
        }
        
        // Clear the created PCs list
        this.createdPCs = [];
    }

    /**
     * Add a created PC instance ID to the cleanup list
     */
    addCreatedPC(instanceId: string) {
        if (!this.createdPCs) {
            this.createdPCs = [];
        }
        this.createdPCs.push(instanceId);
        console.log(`📝 Added PC to cleanup list: ${instanceId}`);
    }

    /**
     * Capture screenshot with timestamp and scenario name
     */
    async captureScreenshot(scenarioName: string, type: 'failure' | 'debug' | 'error' = 'debug'): Promise<string | null> {
        try {
            if (!this.page || this.page.isClosed()) {
                console.log('⚠️ Page context not available for screenshot capture');
                return null;
            }

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const cleanScenarioName = scenarioName.replace(/[^a-zA-Z0-9]/g, '_');
            const screenshotPath = `screenshots/${type}_${cleanScenarioName}_${timestamp}.png`;
            
            await this.page.screenshot({ 
                path: screenshotPath, 
                fullPage: true 
            });
            
            console.log(`📸 Screenshot saved: ${screenshotPath}`);
            return screenshotPath;
        } catch (error) {
            console.log('❌ Error capturing screenshot:', error);
            return null;
        }
    }

    /**
     * Capture multiple debugging artifacts (screenshots, logs, page source)
     */
    async captureDebugArtifacts(scenarioName: string, type: 'failure' | 'debug' | 'error' = 'debug'): Promise<void> {
        try {
            if (!this.page || this.page.isClosed()) {
                console.log('⚠️ Page context not available for debug capture');
                return;
            }

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const cleanScenarioName = scenarioName.replace(/[^a-zA-Z0-9]/g, '_');
            
            // Capture full page screenshot
            const fullPageScreenshot = `screenshots/${type}_${cleanScenarioName}_fullpage_${timestamp}.png`;
            await this.page.screenshot({ 
                path: fullPageScreenshot, 
                fullPage: true 
            });
            console.log(`📸 Full page screenshot saved: ${fullPageScreenshot}`);
            
            // Capture viewport screenshot
            const viewportScreenshot = `screenshots/${type}_${cleanScenarioName}_viewport_${timestamp}.png`;
            await this.page.screenshot({ 
                path: viewportScreenshot, 
                fullPage: false 
            });
            console.log(`📸 Viewport screenshot saved: ${viewportScreenshot}`);
            
            // Capture page source
            try {
                const pageSource = await this.page.content();
                const sourcePath = `screenshots/${type}_${cleanScenarioName}_source_${timestamp}.html`;
                const fs = require('fs');
                fs.writeFileSync(sourcePath, pageSource);
                console.log(`📄 Page source saved: ${sourcePath}`);
            } catch (sourceError) {
                console.log('⚠️ Could not capture page source:', sourceError);
            }
            
        } catch (error) {
            console.log('❌ Error capturing debug artifacts:', error);
        }
    }
}

setWorldConstructor(CustomWorldClass); 
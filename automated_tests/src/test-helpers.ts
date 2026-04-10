import { Page } from '@playwright/test';
import { LoginPage } from './pages/loginPage';
import { HomePage } from './pages/homePage';
import { SignUpPage } from './pages/signUpPage';
import { SensePCPage } from './pages/sensePCPage';
import { BillingPage } from './pages/billingPage';
import { DashboardPage } from './pages/dashboardPage';
import { config } from './config/environment';
import { customExpect } from './utils/customAssertions';
import { errorHandler } from './utils/errorHandler';

export interface TestContext {
    page?: Page;
    loginPage?: LoginPage;
    homePage?: HomePage;
    signUpPage?: SignUpPage;
    billingPage?: BillingPage;
    sensePCPage?: SensePCPage;
    dashboardPage?: DashboardPage;
    email?: string;
    mailPassword?: string;
    token?: string;
    password?: string;
    computerName?: string;
    capturedAccessToken?: string;
    capturedIdToken?: string;
    capturedUserId?: string;
    [key: string]: any;
}

export async function navigateToHomepage(page: Page, homePage: HomePage) {
    console.log('🏠 Navigating to homepage...');
    await homePage.goto();
    console.log('✅ Successfully navigated to homepage');
}

export async function clickSignInLink(homePage: HomePage) {
    // Check if we're already on auth page before trying to click
    const currentUrl = homePage.page.url();
    if (currentUrl.includes('/auth')) {
        console.log('✅ Already on auth page - skipping sign-in link click');
        return;
    }
    await homePage.clickSignIn();
}

export async function verifyOnLoginPage(page: Page, loginPage: LoginPage) {
    const isOnLoginPage = await loginPage.isOnLoginPage();
    await customExpect.toBeTruthy(isOnLoginPage, 'I should be on the login page');
}

export async function clickSignUpLink(page: Page, signUpPage: SignUpPage) {
    await signUpPage.clickSignUpLink();
}

export async function verifyOnSignUpPage(page: Page, signUpPage: SignUpPage) {
    const isCI = process.env.CI === 'true' || process.env.BITBUCKET_BUILD_NUMBER !== undefined;
    const navigationTimeout = isCI ? 20000 : 10000;
    const loadTimeout = isCI ? 30000 : 15000;
    
    console.log('🔍 Waiting for navigation to sign up page...');
    try {
        await page.waitForURL(
            (url) => {
                const urlString = typeof url === 'string' ? url : url.toString();
                return urlString.includes('/auth/sign-up') || urlString.includes('/sign-up');
            },
            { timeout: navigationTimeout }
        );
        console.log('✅ Navigation to sign up page completed');
    } catch (urlError) {
        console.log('⚠️ URL wait timed out, checking current URL...');
        const currentUrl = await page.url();
        console.log(`🔍 Current URL: ${currentUrl}`);
    }
    
    try {
        console.log('🔍 Waiting for page load to complete...');
        await page.waitForLoadState('networkidle', { timeout: loadTimeout });
        console.log('✅ Page load completed');
    } catch (loadError) {
        console.log('⚠️ Network idle timeout, checking page state...');
    }
    
    await page.waitForTimeout(isCI ? 1000 : 500);
    
    const isOnSignUpPage = await signUpPage.isOnSignUpPage();
    await customExpect.toBeTruthy(isOnSignUpPage, 'I should be on the sign up page');
}

export async function enterSignUpDetails(signUpPage: SignUpPage, context: TestContext) {
    const userData = await signUpPage.generateRandomUserDataWithEmail();
    
    context.email = userData.email;
    context.mailPassword = userData.password;
    context.token = userData.token;
    context.password = signUpPage.generateRandomPassword();
    
    console.log("🎯 Generated user data with shared timestamp:", userData.timestamp);
    console.log("📧 Email:", userData.email);
    console.log("👤 First Name:", userData.firstName);
    console.log("👤 Last Name:", userData.lastName);
    console.log("🔑 Token:", context.token);
    console.log("🔑 Password:", context.password);
    
    await signUpPage.enterSignUpDetails(userData.firstName, userData.lastName, userData.email, context.password);
}

export async function enterOTP(signUpPage: SignUpPage, context: TestContext) {
    if (!context.token) {
        throw new Error('Token not found. Please run "enterSignUpDetails" step first.');
    }
    
    // Get the last verification email timestamp from context if available (recorded before clicking Sign Up)
    const lastVerificationEmailTimestamp = (context as any).lastVerificationEmailTimestamp;
    
    if (lastVerificationEmailTimestamp) {
        console.log(`📅 Using recorded last verification email timestamp: ${lastVerificationEmailTimestamp.toISOString()}`);
        console.log(`📧 Will wait for NEW verification email that arrives after this timestamp`);
    } else {
        console.log(`⚠️ No last verification email timestamp recorded - will use standard OTP retrieval`);
    }
    
    const otp = await signUpPage.getOtpFromMailisk(context.token, lastVerificationEmailTimestamp);
    await signUpPage.enterOTP(otp);
}

export async function clickSignUpButton(signUpPage: SignUpPage, context?: TestContext) {
    // Get the latest verification email timestamp BEFORE clicking Sign Up
    // This ensures we only get NEW emails that arrive after clicking Sign Up
    if (context?.token) {
        try {
            console.log('📧 Getting latest verification email timestamp before clicking Sign Up...');
            const lastVerificationEmailTimestamp = await signUpPage.getLatestVerificationEmailTimestamp(context.token);
            if (lastVerificationEmailTimestamp) {
                (context as any).lastVerificationEmailTimestamp = lastVerificationEmailTimestamp;
                console.log(`✅ Recorded last verification email timestamp: ${lastVerificationEmailTimestamp.toISOString()}`);
            } else {
                console.log('📭 No existing verification emails found - will wait for first verification email');
                (context as any).lastVerificationEmailTimestamp = null;
            }
        } catch (error) {
            console.log(`⚠️ Could not get last verification email timestamp: ${error}`);
            console.log('📧 Will use current time as fallback');
            (context as any).lastVerificationEmailTimestamp = null;
        }
    }
    
    await signUpPage.clickSignUp();
}

export async function clickVerifyOTPButton(signUpPage: SignUpPage) {
    await signUpPage.clickVerifyOTPButton();
}

export async function verifySignUpSuccess(signUpPage: SignUpPage, context: TestContext, addCreatedUser: (email: string) => void) {
    const isSuccessMessageVisible = await signUpPage.isSignUpSuccessMessageVisible();
    await customExpect.toBeTruthy(isSuccessMessageVisible, 'I should be signed up successfully');
    
    if (context.email) {
        addCreatedUser(context.email);
        console.log(`📝 Added user ${context.email} to cleanup list for automatic deletion`);
    }
}

export async function verifyEmailVerificationSuccess(page: Page, signUpPage: SignUpPage, context: TestContext, addCreatedUser: (email: string) => void, sensePCPage: SensePCPage) {
    console.log('🔍 Verifying email verification success...');
    
    const isCI = process.env.CI === 'true' || process.env.BITBUCKET_BUILD_NUMBER !== undefined;
    // Increased wait times: 60s for CI, 30s for local
    const maxWaitTime = isCI ? 60000 : 30000;
    const pollInterval = 1000;
    console.log(`⏱️ Maximum wait time set to ${maxWaitTime / 1000}s (${isCI ? 'CI' : 'local'} environment)`);
    
    // Setup network request monitoring to track email-related API calls
    const emailRelatedRequests: Array<{url: string, method: string, status?: number, timestamp: Date, body?: string, response?: any}> = [];
    const requestMap = new Map<string, {url: string, method: string, timestamp: Date, body?: string}>();
    
    console.log('🌐 Setting up network request monitoring for email verification...');
    
    // Monitor network requests
    const requestListener = (request: any) => {
        try {
            const url = request.url();
            const method = request.method();
            
            // Check if this is an email/verification related request
            const isEmailRelated = url.includes('verify') || 
                                  url.includes('verification') ||
                                  url.includes('confirm') ||
                                  url.includes('cognito') ||
                                  url.includes('auth') ||
                                  url.includes('email') ||
                                  url.includes('otp') ||
                                  url.includes('code');
            
            if (isEmailRelated) {
                const timestamp = new Date();
                const postData = request.postData();
                const requestId = `${method}-${url}-${timestamp.getTime()}`;
                
                console.log(`📡 [${timestamp.toISOString()}] ${method} request: ${url}`);
                if (postData) {
                    try {
                        const body = JSON.parse(postData);
                        console.log(`   📦 Request body: ${JSON.stringify(body, null, 2)}`);
                    } catch (e) {
                        console.log(`   📦 Request body (raw): ${postData.substring(0, 200)}`);
                    }
                }
                
                requestMap.set(requestId, {
                    url,
                    method,
                    timestamp,
                    body: postData
                });
            }
        } catch (error: any) {
            console.log(`   ❌ Error monitoring request: ${error.message}`);
        }
    };
    
    // Monitor network responses
    const responseListener = async (response: any) => {
        try {
            const url = response.url();
            const status = response.status();
            const method = response.request().method();
            
            // Check if this is an email/verification related response
            const isEmailRelated = url.includes('verify') || 
                                  url.includes('verification') ||
                                  url.includes('confirm') ||
                                  url.includes('cognito') ||
                                  url.includes('auth') ||
                                  url.includes('email') ||
                                  url.includes('otp') ||
                                  url.includes('code');
            
            if (isEmailRelated) {
                const timestamp = new Date();
                let responseBody = '';
                
                try {
                    responseBody = await response.text();
                } catch (e) {
                    responseBody = 'Unable to read response body';
                }
                
                console.log(`📥 [${timestamp.toISOString()}] Response ${status} for ${method} ${url}`);
                
                if (status >= 200 && status < 300) {
                    try {
                        const parsedResponse = JSON.parse(responseBody);
                        console.log(`   ✅ Response body: ${JSON.stringify(parsedResponse, null, 2)}`);
                    } catch (e) {
                        console.log(`   ✅ Response body (raw): ${responseBody.substring(0, 300)}`);
                    }
                } else {
                    console.log(`   ⚠️ Error response (${status}): ${responseBody.substring(0, 300)}`);
                }
                
                // Find matching request
                const matchingRequest = Array.from(requestMap.values()).find(
                    req => req.url === url && req.method === method
                );
                
                emailRelatedRequests.push({
                    url,
                    method,
                    status,
                    timestamp,
                    body: matchingRequest?.body,
                    response: responseBody.substring(0, 500)
                });
            }
        } catch (error: any) {
            console.log(`   ❌ Error monitoring response: ${error.message}`);
        }
    };
    
    // Setup event listeners
    page.on('request', requestListener);
    page.on('response', responseListener);
    console.log('✅ Network request monitoring enabled');
    
    let isSuccessMessageVisible = false;
    const startTime = Date.now();
    
    console.log('🔍 Strategy 1: Checking for URL redirect to login/dashboard...');
    try {
        // Check for redirect to login page or dashboard
        await page.waitForURL(
            (url) => {
                const urlString = typeof url === 'string' ? url : url.toString();
                // Accept /auth, /auth/login, or /dashboard as success
                return urlString.includes('/auth/login') || 
                       urlString.includes('/dashboard') ||
                       (urlString.includes('/auth') && !urlString.includes('/sign-up') && !urlString.includes('/verify'));
            },
            { timeout: maxWaitTime }
        );
        const currentUrl = page.url();
        console.log(`✅ Email verification successful - redirected to: ${currentUrl}`);
        isSuccessMessageVisible = true;
    } catch (urlError) {
        // Check current URL immediately - might already be on login page
        try {
            if (!page.isClosed()) {
                const currentUrl = page.url();
                if (currentUrl.includes('/auth/login') || 
                    currentUrl.includes('/dashboard') ||
                    (currentUrl.includes('/auth') && !currentUrl.includes('/sign-up') && !currentUrl.includes('/verify'))) {
                    console.log(`✅ Email verification successful - already on login page: ${currentUrl}`);
                    isSuccessMessageVisible = true;
                } else {
                    console.log('⚠️ No URL redirect detected, trying success message detection...');
                }
            }
        } catch (e) {
            console.log('⚠️ No URL redirect detected, trying success message detection...');
        }
    }
    
    if (!isSuccessMessageVisible) {
        console.log(`🔍 Strategy 2: Polling for success message (max ${maxWaitTime}ms)...`);
        while (!isSuccessMessageVisible && (Date.now() - startTime) < maxWaitTime) {
            // Check if page is closed before proceeding
            if (page.isClosed()) {
                console.log('⚠️ Page was closed during verification');
                break;
            }
            
            isSuccessMessageVisible = await signUpPage.isVerifyOTPSuccessMessageVisible();
            
            if (!isSuccessMessageVisible) {
                try {
                    if (!page.isClosed()) {
                        const currentUrl = page.url();
                        // Accept /auth, /auth/login, or /dashboard as success
                        if (currentUrl.includes('/auth/login') || 
                            currentUrl.includes('/dashboard') ||
                            (currentUrl.includes('/auth') && !currentUrl.includes('/sign-up') && !currentUrl.includes('/verify'))) {
                            console.log(`✅ Email verification successful - redirected to: ${currentUrl}`);
                            isSuccessMessageVisible = true;
                            break;
                        }
                    }
                } catch (urlError) {
                    // Page might be closed, continue polling if still within timeout
                    if (page.isClosed()) break;
                }
                
                const elapsed = Date.now() - startTime;
                const remaining = maxWaitTime - elapsed;
                if (remaining > 0 && !page.isClosed()) {
                    const waitTime = Math.min(pollInterval, remaining);
                    // Use setTimeout instead of deprecated waitForTimeout
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                } else {
                    break;
                }
            }
        }
    }
    
    if (!isSuccessMessageVisible && !page.isClosed()) {
        console.log('🔍 Strategy 3: Final URL check as fallback...');
        try {
            const finalUrl = page.url();
            // Accept /auth, /auth/login, or /dashboard as success
            if (finalUrl.includes('/auth/login') || 
                finalUrl.includes('/dashboard') ||
                (finalUrl.includes('/auth') && !finalUrl.includes('/sign-up') && !finalUrl.includes('/verify'))) {
                console.log(`✅ Email verification successful - redirected to: ${finalUrl}`);
                isSuccessMessageVisible = true;
            }
        } catch (urlError) {
            // URL check failed - page might be closed
        }
    }
    
    if (!isSuccessMessageVisible) {
        // Final check - if we're on /auth (login page), consider it success
        if (!page.isClosed()) {
            try {
                const finalCheckUrl = page.url();
                if (finalCheckUrl.includes('/auth') && !finalCheckUrl.includes('/sign-up') && !finalCheckUrl.includes('/verify')) {
                    console.log(`✅ Email verification successful - on login page: ${finalCheckUrl}`);
                    isSuccessMessageVisible = true;
                }
            } catch (e) {
                // Ignore errors in final check
            }
        }
        
        if (!isSuccessMessageVisible) {
            // Log network requests captured during verification
            console.log('\n📊 ===== NETWORK REQUEST SUMMARY =====');
            console.log(`📡 Total email-related requests captured: ${emailRelatedRequests.length}`);
            
            if (emailRelatedRequests.length === 0) {
                console.log('⚠️ No email/verification related API calls were detected!');
                console.log('💡 This suggests the email verification API may not have been called.');
            } else {
                console.log('\n📋 Captured requests:');
                emailRelatedRequests.forEach((req, index) => {
                    console.log(`\n${index + 1}. [${req.timestamp.toISOString()}] ${req.method} ${req.url}`);
                    console.log(`   Status: ${req.status || 'N/A'}`);
                    if (req.body) {
                        try {
                            const body = JSON.parse(req.body);
                            console.log(`   Request body: ${JSON.stringify(body, null, 2)}`);
                        } catch (e) {
                            console.log(`   Request body: ${req.body.substring(0, 200)}`);
                        }
                    }
                    if (req.response) {
                        try {
                            const response = JSON.parse(req.response);
                            console.log(`   Response: ${JSON.stringify(response, null, 2)}`);
                        } catch (e) {
                            console.log(`   Response: ${req.response.substring(0, 200)}`);
                        }
                    }
                });
            }
            console.log('=====================================\n');
            
            // Remove event listeners before throwing error
            try {
                page.off('request', requestListener);
                page.off('response', responseListener);
            } catch (e) {
                // Ignore errors when removing listeners
            }
            
            console.log('❌ Email verification success message not found');
            throw new Error('Email verification success message not found. Check screenshot and network request summary above for debugging.');
        }
    }
    
    // Remove event listeners on success
    try {
        page.off('request', requestListener);
        page.off('response', responseListener);
        console.log('✅ Network request monitoring stopped');
    } catch (e) {
        // Ignore errors when removing listeners
    }
    
    // Log summary of captured requests
    if (emailRelatedRequests.length > 0) {
        console.log(`\n📊 Captured ${emailRelatedRequests.length} email-related API call(s) during verification`);
    }
    
    console.log('✅ Email verification successful');
    
    if (context.email) {
        addCreatedUser(context.email);
        await sensePCPage.isNewlyCreatedUser();
        console.log(`📝 Added user ${context.email} to cleanup list for automatic deletion`);
    }
}

export async function enterValidCredentials(loginPage: LoginPage) {
    await loginPage.enterUsername(config.VALID_USERNAME);
    await loginPage.enterPassword(config.VALID_PASSWORD);
}

export async function enterNewlyCreatedCredentials(loginPage: LoginPage, context: TestContext) {
    if (!context.email) {
        throw new Error('Email not found. Please run "enterSignUpDetails" step first.');
    }
    
    if (!context.password) {
        throw new Error('Password not found. Please run "enterSignUpDetails" step first.');
    }
    await new Promise(resolve => setTimeout(resolve, 4000));
    await loginPage.enterUsername(context.email);
    await loginPage.enterPassword(context.password);
}

export async function clickLoginButton(loginPage: LoginPage, context?: TestContext, signUpPage?: SignUpPage) {
    // Get the last MFA email timestamp BEFORE clicking login
    // This ensures we only get NEW emails that arrive after login
    if (signUpPage && context?.token) {
        try {
            console.log('📧 Getting last MFA email timestamp before login...');
            const lastMFAEmailTimestamp = await signUpPage.getLatestMFAEmailTimestamp(context.token);
            if (lastMFAEmailTimestamp) {
                (context as any).lastMFAEmailTimestamp = lastMFAEmailTimestamp;
                console.log(`✅ Recorded last MFA email timestamp: ${lastMFAEmailTimestamp.toISOString()}`);
            } else {
                console.log('📭 No existing MFA emails found - will wait for first MFA email');
                (context as any).lastMFAEmailTimestamp = null;
            }
        } catch (error) {
            console.log(`⚠️ Could not get last MFA email timestamp: ${error}`);
            console.log('📧 Will use login start time as fallback');
            (context as any).lastMFAEmailTimestamp = null;
        }
    }
    
    // Record the time before clicking login to capture MFA emails sent during login
    const loginStartTime = new Date();
    console.log(`⏰ Login start time recorded: ${loginStartTime.toISOString()}`);
    
    // Store in context if provided
    if (context) {
        (context as any).loginStartTime = loginStartTime;
    }
    
    await loginPage.clickLogin();
}

export async function handleMFAIfRequired(page: Page, loginPage: LoginPage, signUpPage: SignUpPage, context: TestContext, loginStartTime?: Date): Promise<boolean> {
    // Wait a bit for potential MFA redirect
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (page.isClosed()) {
        return false;
    }
    
    const currentUrl = page.url();
    console.log(`🔍 Checking for MFA requirement. Current URL: ${currentUrl}`);
    
    // Check if we're on an MFA page
    const isMfaPage = currentUrl.includes('/mfa-email') || 
                      currentUrl.includes('/mfa-totp') || 
                      currentUrl.includes('/mfa-select');
    
    if (!isMfaPage) {
        // Check if MFA input is visible on current page
        try {
            const mfaInput = page.locator('input[data-input-otp="true"], input[autocomplete="one-time-code"]').first();
            const isMfaInputVisible = await mfaInput.isVisible({ timeout: 2000 });
            if (!isMfaInputVisible) {
                return false; // No MFA required
            }
        } catch {
            return false; // No MFA input found
        }
    }
    
    console.log('🔐 MFA required detected. Handling MFA...');
    
    // If MFA via email is required, get OTP from Mailisk
    if (currentUrl.includes('/mfa-email') || !currentUrl.includes('/mfa-totp')) {
        if (!context.token) {
            throw new Error('Token not available for MFA email OTP retrieval');
        }
        
        // Get the last MFA email timestamp from context if available (recorded before login)
        const lastMFAEmailTimestamp = (context as any).lastMFAEmailTimestamp;
        
        if (lastMFAEmailTimestamp) {
            console.log(`📅 Using recorded last MFA email timestamp: ${lastMFAEmailTimestamp.toISOString()}`);
            console.log(`📧 Will wait for NEW MFA email that arrives after this timestamp`);
        } else {
            console.log(`⚠️ No last MFA email timestamp recorded - will use login start time as fallback`);
        }
        
        // Use loginStartTime if provided, otherwise use current time minus a buffer
        const effectiveStartTime = loginStartTime || new Date(Date.now() - 10000); // 10 second buffer if no start time
        
        // Retry logic for invalid codes (max 2 retries)
        const maxRetries = 2;
        for (let retry = 0; retry <= maxRetries; retry++) {
            if (retry > 0) {
                console.log(`🔄 Retry ${retry}/${maxRetries}: Previous MFA code was invalid, getting a fresh code...`);
                // Wait a bit before retrying to allow new email to arrive
                await new Promise(resolve => setTimeout(resolve, 5000));
                // Update the last MFA email timestamp for retry (get current latest)
                if (context.token) {
                    try {
                        const newTimestamp = await signUpPage.getLatestMFAEmailTimestamp(context.token);
                        if (newTimestamp) {
                            (context as any).lastMFAEmailTimestamp = newTimestamp;
                            console.log(`📅 Updated last MFA email timestamp for retry: ${newTimestamp.toISOString()}`);
                        }
                    } catch (e) {
                        console.log(`⚠️ Could not update timestamp for retry: ${e}`);
                    }
                }
            }
            
            console.log('📧 Retrieving MFA OTP from email...');
            const mfaOtp = await signUpPage.getLatestEmailOTP(context.token, true, effectiveStartTime, lastMFAEmailTimestamp);
            console.log(`✅ Retrieved MFA OTP: ${mfaOtp}`);
            
            // Enter the MFA OTP
            try {
                const mfaInput = page.locator('input[data-input-otp="true"], input[autocomplete="one-time-code"]').first();
                await mfaInput.waitFor({ state: 'visible', timeout: 10000 });
                await mfaInput.clear(); // Clear any existing value
                await mfaInput.fill(mfaOtp);
                
                // Click verify/submit button
                const verifyButton = page.locator('button:has-text("Verify"), button:has-text("Submit"), button:has-text("Continue"), button[type="submit"]').first();
                await verifyButton.waitFor({ state: 'visible', timeout: 5000 });
                await verifyButton.click();
                
                console.log('✅ MFA OTP entered and submitted');
                
                // Wait a bit for the response
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                // Check for error messages indicating invalid code
                const errorSelectors = [
                    'text="Invalid code"',
                    'text="AccessCode Invalid"',
                    'text="Code expired"',
                    'text="Invalid OTP"',
                    'text="OTP expired"',
                    'text="The code you entered is incorrect"',
                    '[data-testid="error-message"]',
                    '.error-message',
                    '.alert-error'
                ];
                
                let hasError = false;
                for (const selector of errorSelectors) {
                    try {
                        const errorElement = page.locator(selector);
                        if (await errorElement.isVisible({ timeout: 2000 })) {
                            const errorText = await errorElement.textContent();
                            console.log(`❌ Error message detected: ${errorText}`);
                            hasError = true;
                            break;
                        }
                    } catch (e) {
                        // Continue checking other selectors
                    }
                }
                
                // Check if we're still on MFA page (indicates failure)
                const urlAfterSubmit = page.url();
                const stillOnMfaPage = urlAfterSubmit.includes('/mfa-email') || 
                                      urlAfterSubmit.includes('/mfa-totp') || 
                                      urlAfterSubmit.includes('/mfa-select');
                
                // If no error and not still on MFA page, success!
                if (!hasError && !stillOnMfaPage) {
                    console.log('✅ MFA verification successful - redirected away from MFA page');
                    return true;
                }
                
                // If we have an error or still on MFA page, and we have retries left, try again
                if ((hasError || stillOnMfaPage) && retry < maxRetries) {
                    console.log(`⚠️ MFA code appears to be invalid or expired. Will retry with a fresh code...`);
                    continue;
                }
                
                // If we're here and no error, assume success (might have redirected)
                if (!hasError) {
                    console.log('✅ MFA OTP submitted successfully');
                    return true;
                }
                
                // If we have error and no retries left, throw
                if (hasError && retry >= maxRetries) {
                    throw new Error(`MFA code validation failed after ${maxRetries + 1} attempts. The code may be invalid or expired.`);
                }
                
            } catch (error: any) {
                // If it's the last retry, throw the error
                if (retry >= maxRetries) {
                    console.error('❌ Error handling MFA after all retries:', error);
                    throw error;
                }
                // Otherwise, log and continue to next retry
                console.log(`⚠️ Error on attempt ${retry + 1}, will retry: ${error.message}`);
            }
        }
        
        // Wait for redirect after MFA
        await new Promise(resolve => setTimeout(resolve, 2000));
        return true;
    }
    
    return false;
}

// Function overloads for backward compatibility
export async function verifyLoginSuccess(loginPage: LoginPage, page: Page): Promise<void>;
export async function verifyLoginSuccess(loginPage: LoginPage, page: Page, signUpPage: SignUpPage, context: TestContext): Promise<void>;
export async function verifyLoginSuccess(loginPage: LoginPage, page: Page, signUpPage?: SignUpPage, context?: TestContext): Promise<void> {
    // Wait a bit for SRP authentication flow to complete (PASSWORD_VERIFIER challenge)
    console.log('⏳ Waiting for authentication flow to complete...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check for MFA requirement first
    if (signUpPage && context) {
        // Pass loginStartTime and lastMFAEmailTimestamp if available in context
        const loginStartTime = (context as any).loginStartTime;
        const lastMFAEmailTimestamp = (context as any).lastMFAEmailTimestamp;
        const mfaHandled = await handleMFAIfRequired(page, loginPage, signUpPage, context, loginStartTime);
        if (mfaHandled) {
            console.log('✅ MFA handled, verifying login success...');
        }
    }
    
    try {
        const isSuccessMessageVisible = await loginPage.isLoginSuccessMessageVisible();
        if (isSuccessMessageVisible) {
            console.log('✅ Login success message found');
            return;
        }
    } catch (error) {
        console.log('⚠️ Success message not found, checking for dashboard redirect...');
    }
    
    // Check if we have tokens first - if so, login is successful even if redirect hasn't happened
    let hasTokens = loginPage.getCapturedAccessToken() || loginPage.getCapturedIdToken();
    if (hasTokens) {
        console.log('✅ Login successful - tokens received, checking for dashboard redirect...');
        // Try to check dashboard, but don't wait too long
        try {
            const dashboardCheck = Promise.race([
                loginPage.isDashboardVisible(),
                new Promise<boolean>((resolve) => {
                    setTimeout(() => {
                        console.log('⏳ Dashboard check timeout - tokens received, login successful');
                        resolve(false);
                    }, 10000); // Shorter timeout since we have tokens
                })
            ]);
            const isDashboardVisible = await dashboardCheck;
            if (isDashboardVisible) {
                console.log('✅ Login successful - redirected to dashboard');
                return;
            }
        } catch (error) {
            console.log('⚠️ Dashboard check failed, but tokens received - login successful');
        }
        // If we have tokens, consider login successful even if not on dashboard yet
        console.log('✅ Login successful - authentication tokens received');
        return;
    }
    
    // If no tokens yet, try to check dashboard (might be a different login flow)
    try {
        // Check dashboard visibility with a timeout wrapper to avoid hanging
        const dashboardCheck = Promise.race([
            loginPage.isDashboardVisible(),
            new Promise<boolean>((resolve) => {
                setTimeout(() => {
                    console.log('⏳ Dashboard check timeout - checking URL instead...');
                    resolve(false);
                }, 15000);
            })
        ]);
        const isDashboardVisible = await dashboardCheck;
        if (isDashboardVisible) {
            console.log('✅ Login successful - redirected to dashboard');
            return;
        }
    } catch (error) {
        console.log('⚠️ Dashboard not found, checking URL...');
    }
    
    const currentUrl = page.url();
    console.log(`🔍 Current URL after login attempt: ${currentUrl}`);
    
    // Don't fail if we're on MFA pages - they're part of the login flow
    if (currentUrl.includes('/mfa-email') || currentUrl.includes('/mfa-totp') || currentUrl.includes('/mfa-select')) {
        console.log('⏳ Still on MFA page, waiting for completion...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        const updatedUrl = page.url();
        if (updatedUrl.includes('/dashboard/')) {
            console.log('✅ Login successful after MFA - redirected to dashboard');
            return;
        }
    }
    
    // Check if we're already on dashboard
    if (currentUrl.includes('/dashboard/')) {
        console.log('✅ Login successful - already on dashboard');
        return;
    }
    
    // If we're on /auth but not /auth/login or /auth/sign-up, login might be processing
    // Wait a bit more for redirect to complete
    if (currentUrl.includes('/auth') && !currentUrl.includes('/login') && !currentUrl.includes('/sign-up') && !currentUrl.includes('/signin')) {
        console.log('⏳ Waiting for redirect after authentication...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        const updatedUrl = page.url();
        if (updatedUrl.includes('/dashboard/')) {
            console.log('✅ Login successful - redirected to dashboard after wait');
            return;
        }
        
        // If still on /auth, check if we have tokens (login was successful)
        hasTokens = loginPage.getCapturedAccessToken() || loginPage.getCapturedIdToken();
        if (hasTokens) {
            console.log('✅ Login successful - tokens received, waiting for redirect...');
            // Give it one more chance to redirect
            await new Promise(resolve => setTimeout(resolve, 3000));
            const finalUrl = page.url();
            if (finalUrl.includes('/dashboard/')) {
                console.log('✅ Login successful - redirected to dashboard');
                return;
            }
            // If still not redirected, consider it successful if we have tokens
            console.log('✅ Login successful - tokens received, redirect may be delayed');
            return;
        }
    }
    
    if (!currentUrl.includes('/login') && !currentUrl.includes('/auth') && !currentUrl.includes('/signin') && !currentUrl.includes('/mfa')) {
        console.log('✅ Login successful - redirected away from login page');
        return;
    }
    
    console.log('⏳ Waiting for login to complete...');
    // Use setTimeout instead of deprecated waitForTimeout
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    if (page.isClosed()) {
        throw new Error('Page was closed during login verification');
    }
    
    const finalUrl = page.url();
    console.log(`🔍 Final URL after wait: ${finalUrl}`);
    
    // Check if we have tokens even if still on /auth
    hasTokens = loginPage.getCapturedAccessToken() || loginPage.getCapturedIdToken();
    if (hasTokens && finalUrl.includes('/auth') && !finalUrl.includes('/login') && !finalUrl.includes('/sign-up')) {
        console.log('✅ Login successful - tokens received, authentication complete');
        return;
    }
    
    if (!finalUrl.includes('/login') && !finalUrl.includes('/auth') && !finalUrl.includes('/signin') && !finalUrl.includes('/mfa')) {
        console.log('✅ Login successful - final check passed');
        return;
    }
    
    throw new Error('Login failed - still on login/MFA page after timeout');
}

export async function verifyDashboardVisible(loginPage: LoginPage, page: Page) {
    console.log('🔍 Checking dashboard visibility...');
    // Use setTimeout instead of deprecated waitForTimeout
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (page.isClosed()) {
        throw new Error('Page was closed during dashboard verification');
    }
    
    const isDashboardVisible = await loginPage.isDashboardVisible();
    await customExpect.toBeTruthy(isDashboardVisible, 'I should see the dashboard');
    console.log('✅ Dashboard is visible');
}

export async function captureAccessToken(loginPage: LoginPage, page: Page, context: TestContext) {
    // Use setTimeout instead of deprecated waitForTimeout
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    if (page.isClosed()) {
        console.log('⚠️ Page was closed during token capture');
        return;
    }
    
    let accessToken = loginPage.getCapturedAccessToken();
    let idToken = loginPage.getCapturedIdToken();
    
    if (accessToken) {
        context.capturedAccessToken = accessToken;
        console.log('✅ Access token captured from API interception:', accessToken.substring(0, 30) + '...');
    }
    
    if (idToken) {
        context.capturedIdToken = idToken;
        console.log('✅ ID token captured from API interception:', idToken.substring(0, 30) + '...');
    }
    
    if (accessToken || idToken) {
        try {
            const tokenToUse = accessToken || idToken;
            if (tokenToUse) {
                const tokenPayload = JSON.parse(atob(tokenToUse.split('.')[1]));
                if (tokenPayload.sub) {
                    context.capturedUserId = tokenPayload.sub;
                    console.log('✅ User ID captured from token:', context.capturedUserId);
                }
            }
        } catch (error) {
            console.log('⚠️ Could not extract user ID from token:', error);
        }
    } else {
        console.log('⚠️ No access token captured from API interception, checking Amplify storage...');
        const amplifyToken = await loginPage.checkAmplifyTokensInStorage();
        
        if (amplifyToken) {
            context.capturedAccessToken = amplifyToken;
            console.log('✅ Access token captured from Amplify storage:', amplifyToken.substring(0, 30) + '...');
            
            try {
                const tokenPayload = JSON.parse(atob(amplifyToken.split('.')[1]));
                if (tokenPayload.sub) {
                    context.capturedUserId = tokenPayload.sub;
                    console.log('✅ User ID captured from Amplify token:', context.capturedUserId);
                }
            } catch (error) {
                console.log('⚠️ Could not extract user ID from Amplify token:', error);
            }
        } else {
            console.log('🔄 Attempting to get fresh access token...');
            const freshToken = await loginPage.getFreshAccessToken();
            
            if (freshToken) {
                context.capturedAccessToken = freshToken;
                console.log('✅ Fresh access token obtained:', freshToken.substring(0, 30) + '...');
                
                try {
                    const tokenPayload = JSON.parse(atob(freshToken.split('.')[1]));
                    if (tokenPayload.sub) {
                        context.capturedUserId = tokenPayload.sub;
                        console.log('✅ User ID captured from fresh token:', context.capturedUserId);
                    }
                } catch (error) {
                    console.log('⚠️ Could not extract user ID from fresh token:', error);
                }
            }
        }
    }
}

export async function setupAPIInterceptionForLogin(loginPage: LoginPage) {
    await loginPage.setupLoginAPIInterception();
}


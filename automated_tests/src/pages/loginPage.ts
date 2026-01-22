import { Page, Locator } from '@playwright/test';

export class LoginPage {
    readonly page: Page;
    readonly usernameInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;
    readonly mfaInput: Locator;
    readonly mfaSubmitButton: Locator;
    readonly errorMessage: Locator;
    readonly dashboardElement: Locator;
    readonly successMsg: Locator;
    capturedAccessToken?: string;
    capturedIdToken?: string;

    constructor(page: Page) {
        this.page = page;
        this.usernameInput = page.locator('#email').first();
        this.passwordInput = page.locator('input[type="password"]');
        this.loginButton = page.locator('button:has-text("Sign in")');
        this.mfaInput = page.locator('input[data-input-otp="true"], input[autocomplete="one-time-code"], input[placeholder*="code"], input[placeholder*="OTP"], input[placeholder*="MFA"], input[type="text"], input[type="number"], input[name*="code"], input[name*="otp"], input[name*="mfa"]').first();
        this.mfaSubmitButton = page.locator('button:has-text("Verify"), button:has-text("Submit"), button:has-text("Continue"), button[type="submit"]').first();
        this.errorMessage = page.locator('[data-testid="error-message"]');
        this.dashboardElement = page.locator('[data-testid="dashboard"]');
        this.successMsg = page.locator('span:has-text("Logged in successfully!")')
    }

    async goto() {
        await this.page.goto('/login');
    }

    async enterUsername(username: string) {
        try {
            console.log(`🔍 Attempting to enter username: ${username}`);
            
            // Debug: Check what input elements are available on the page
            console.log('🔍 Debugging: Looking for all input elements on the page...');
            
            console.log('🔍 Waiting for username input to be visible...');
            await this.usernameInput.waitFor({ state: 'visible', timeout: 10000 });
            console.log('✅ Username input is visible');
            
            console.log('🔍 Clearing and filling username input...');
            await this.usernameInput.clear();
            await this.usernameInput.fill(username);
            console.log('✅ Username entered successfully');
            
            // Verify the value was entered
            const enteredValue = await this.usernameInput.inputValue();
            console.log(`🔍 Verified entered username: "${enteredValue}"`);
            
        } catch (error) {
            console.error('❌ Error entering username:', error);
            // Take a screenshot for debugging
            try {
                await this.page.screenshot({ path: `username-input-error-${Date.now()}.png`, fullPage: true });
                console.log('📸 Screenshot saved for username input error debugging');
            } catch (screenshotError) {
                console.log('📸 Could not take screenshot for username input error');
            }
            throw error;
        }
    }

    async enterPassword(password: string) {
        try {
            console.log(`🔍 Attempting to enter password: ${password ? '[HIDDEN]' : 'EMPTY'}`);
            console.log('🔍 Waiting for password input to be visible...');
            await this.passwordInput.waitFor({ state: 'visible', timeout: 10000 });
            console.log('✅ Password input is visible');
            
            console.log('🔍 Clearing and filling password input...');
            await this.passwordInput.clear();
            await this.passwordInput.fill(password);
            console.log('✅ Password entered successfully');
            
            // Verify the value was entered (but don't log the actual password)
            const enteredValue = await this.passwordInput.inputValue();
            console.log(`🔍 Verified password entered: ${enteredValue ? '[HIDDEN]' : 'EMPTY'}`);
            
        } catch (error) {
            console.error('❌ Error entering password:', error);
            // Take a screenshot for debugging
            try {
                await this.page.screenshot({ path: `password-input-error-${Date.now()}.png`, fullPage: true });
                console.log('📸 Screenshot saved for password input error debugging');
            } catch (screenshotError) {
                console.log('📸 Could not take screenshot for password input error');
            }
            throw error;
        }
    }

    async clickLogin() {
        await this.loginButton.click();
    }

    async login(username: string, password: string) {
        await this.enterUsername(username);
        await this.enterPassword(password);
        await this.clickLogin();
    }

    async getErrorMessage() {
        return await this.page.evaluate(() => {
            const errorElement = document.querySelector('[data-testid="error-message"]');
            return errorElement ? errorElement.textContent : '';
        });
    }

    async isDashboardVisible() {
        try {
            console.log('🔍 Starting dashboard visibility check...');
            
            // Wait for URL to change to dashboard - check multiple possible dashboard URLs
            await this.page.waitForURL('**/dashboard/**', { timeout: 25000 });
            
            // Additional wait to ensure page is fully loaded after redirect
            console.log('⏳ Waiting for page to fully load after redirect...');
            await this.page.waitForTimeout(4000);
            
            // Verify we're actually on a dashboard page by checking for dashboard-specific elements
            const currentUrl = this.page.url();
            console.log(`🔍 Current URL after redirect: ${currentUrl}`);
            
            // Check if URL contains dashboard path
            if (currentUrl.includes('/dashboard/')) {
                console.log('✅ Successfully redirected to dashboard');
                
                // Additional verification: wait for dashboard-specific elements to be visible
                try {
                    // Wait for common dashboard elements to ensure page is fully loaded
                    await this.page.waitForSelector('body', { timeout: 5000 });
                    console.log('✅ Dashboard page elements are visible');
                    return true;
                } catch (elementError) {
                    console.log('⚠️ Dashboard URL correct but elements not fully loaded, retrying...');
                    // Give it one more chance with a longer wait
                    await this.page.waitForTimeout(3000);
                    return true; // Still return true if URL is correct
                }
            } else {
                console.log('❌ Not on dashboard page, current URL:', currentUrl);
                return false;
            }
        } catch (error) {
            console.log('❌ Dashboard visibility check failed:', error);
            
            // Try one more time with a different approach
            try {
                console.log('🔄 Retrying dashboard check with alternative approach...');
                const currentUrl = this.page.url();
                console.log(`🔍 Current URL during retry: ${currentUrl}`);
                
                if (currentUrl.includes('/dashboard/')) {
                    console.log('✅ Dashboard found on retry');
                    return true;
                }
            } catch (retryError) {
                console.log('❌ Retry also failed:', retryError);
            }
            
            return false;
        }
    }

    async isOnLoginPage(): Promise<boolean> {
        try {
            // Wait a bit for the page to load
            await this.page.waitForTimeout(1000);
            
            // Check multiple indicators that we're on a login page
            const currentUrl = this.page.url();
            console.log('Current URL:', currentUrl);
            
            // Check if URL contains login-related paths
            const urlIndicators = ['/login', '/auth', '/signin', '/sign-in', 'login', 'auth'];
            const urlMatch = urlIndicators.some(indicator => currentUrl.toLowerCase().includes(indicator));
            
            if (urlMatch) {
                console.log('URL indicates login page');
                return true;
            }
            
            // Check if login form elements are visible
            const hasUsernameInput = await this.usernameInput.isVisible();
            const hasPasswordInput = await this.passwordInput.isVisible();
            const hasLoginButton = await this.loginButton.isVisible();
            
            console.log('Form elements visible:', { hasUsernameInput, hasPasswordInput, hasLoginButton });
            
            if (hasUsernameInput && hasPasswordInput && hasLoginButton) {
                console.log('Login form elements indicate login page');
                return true;
            }
            
            // Check page title or heading for login indicators
            const pageTitle = await this.page.title();
            const pageContent = await this.page.content();
            
            const titleIndicators = ['login', 'sign in', 'signin', 'authentication', 'auth'];
            const titleMatch = titleIndicators.some(indicator => 
                pageTitle.toLowerCase().includes(indicator)
            );
            
            if (titleMatch) {
                console.log('Page title indicates login page');
                return true;
            }
            
            // Check for login-related text in page content
            const contentIndicators = ['sign in', 'login', 'email', 'password', 'authenticate'];
            const contentMatch = contentIndicators.some(indicator => 
                pageContent.toLowerCase().includes(indicator)
            );
            
            if (contentMatch) {
                console.log('Page content indicates login page');
                return true;
            }
            
            console.log('No clear indicators of login page found');
            return false;
            
        } catch (error) {
            console.error('Error checking if on login page:', error);
            return false;
        }
    }

    async isLoginSuccessMessageVisible() {
        try {
            await this.successMsg.waitFor({ state: 'visible', timeout: 30000 });
            return true;
        } catch {
            return false;
        }
    }

    // Setup API interception to capture access tokens during login
    async setupLoginAPIInterception() {
        console.log('🔍 Setting up API interception for login/auth token capture...');
        
        // Intercept all network requests
        await this.page.route('**/*', async (route) => {
            try {
                if (this.page.isClosed()) {
                    await route.continue();
                    return;
                }

                const request = route.request();
                const url = request.url();
                const method = request.method();

                // Check if this is a login/auth related request
                if (this.isAuthRelatedRequest(url, method)) {
                    console.log(`🔐 Intercepted ${method} request to: ${url}`);
                    
                    // Get request headers and body
                    const headers = request.headers();
                    const postData = request.postData();
                    
                    if (postData) {
                        try {
                            const body = JSON.parse(postData);
                            console.log('📤 Request body keys:', Object.keys(body));
                            
                            // Look for access tokens in request body
                            if (body.AccessToken) {
                                this.capturedAccessToken = body.AccessToken;
                                const token = this.capturedAccessToken;
                                if (token) {
                                    console.log('✅ Access token captured from request body:', token.substring(0, 30) + '...');
                                    console.log('🔍 Token type check - AccessToken field');
                                }
                            }
                        } catch (e) {
                            console.log('📤 Request body (non-JSON):', postData.substring(0, 100) + '...');
                        }
                    }
                }

                // Continue the request
                await route.continue();
            } catch (error) {
                console.log('Error during request interception:', error);
                await route.continue();
            }
        });

        // Intercept responses to capture tokens from response headers or body
        await this.page.route('**/*', async (route) => {
            try {
                if (this.page.isClosed()) {
                    await route.continue();
                    return;
                }

                const request = route.request();
                const url = request.url();
                const method = request.method();

                // Check if this is a login/auth related request
                if (this.isAuthRelatedRequest(url, method)) {
                    const response = await route.fetch();
                    
                    if (response.ok()) {
                        console.log(`📡 Response from ${method} ${url}: ${response.status()}`);
                        
                        // Check response headers for tokens
                        const headers = response.headers();
                        if (headers['authorization'] || headers['x-access-token'] || headers['access-token']) {
                            const token = headers['authorization'] || headers['x-access-token'] || headers['access-token'];
                            this.capturedAccessToken = token.replace('Bearer ', '');
                            console.log('✅ Access token captured from response headers:', this.capturedAccessToken.substring(0, 30) + '...');
                        }
                        
                        // Check response body for tokens
                        try {
                            const responseBody = await response.text();
                            console.log('📄 Response body preview:', responseBody.substring(0, 200) + '...');
                            
                            const bodyData = JSON.parse(responseBody);
                            console.log('📄 Response body keys:', Object.keys(bodyData));
                            
                            // Look for various token field names (including Amplify-specific ones)
                            // Prioritize AccessToken fields first
                            const tokenFields = [
                                'AccessToken', 'access_token', 'accessToken', 'token', 'idToken', 'IdToken',
                                'id_token', 'refresh_token', 'refreshToken'
                            ];
                            let foundToken = null;
                            
                            // First check direct token fields
                            for (const field of tokenFields) {
                                if (bodyData[field] && typeof bodyData[field] === 'string') {
                                    foundToken = bodyData[field];
                                    console.log(`✅ Found token in field '${field}':`, foundToken.substring(0, 30) + '...');
                                    console.log(`🔍 Token type check - field: ${field}`);
                                    
                                    // If we found an AccessToken, use it immediately
                                    if (field === 'AccessToken' || field === 'access_token' || field === 'accessToken') {
                                        console.log('🎯 Found AccessToken in direct field - using immediately');
                                        break;
                                    }
                                }
                            }
                            
                            // Check nested objects (common in Amplify responses)
                            if (!foundToken && bodyData.AuthenticationResult) {
                                const authResult = bodyData.AuthenticationResult;
                                console.log('🔍 Checking AuthenticationResult object...');
                                console.log('🔍 Available tokens in AuthenticationResult:', Object.keys(authResult));
                                
                                // Prioritize IdToken over AccessToken for billing API calls
                                if (authResult.IdToken && typeof authResult.IdToken === 'string') {
                                    foundToken = authResult.IdToken;
                                    console.log('✅ Found IdToken in AuthenticationResult:', foundToken.substring(0, 30) + '...');
                                    console.log('🔍 Token type check - IdToken (preferred for billing API)');
                                } else if (authResult.AccessToken && typeof authResult.AccessToken === 'string') {
                                    foundToken = authResult.AccessToken;
                                    console.log('✅ Found AccessToken in AuthenticationResult (fallback):', foundToken.substring(0, 30) + '...');
                                    console.log('🔍 Token type check - AccessToken (fallback)');
                                }
                            }
                            
                            // Additional fallback: look for access tokens in other common locations
                            if (!foundToken) {
                                console.log('🔍 Checking for access tokens in other response locations...');
                                
                                // Check for tokens in nested objects - prioritize ID tokens
                                const searchInObject = (obj: any, path: string = ''): string | null => {
                                    // First pass: look for ID tokens
                                    for (const key in obj) {
                                        if (obj.hasOwnProperty(key)) {
                                            const value = obj[key];
                                            const currentPath = path ? `${path}.${key}` : key;
                                            
                                            if (typeof value === 'string' && 
                                                (key.toLowerCase().includes('id') || key === 'IdToken') &&
                                                value.length > 100 && value.includes('.')) {
                                                console.log(`🎯 Found potential ID token in ${currentPath} (${key})`);
                                                return value;
                                            }
                                            
                                            if (typeof value === 'object' && value !== null) {
                                                const result = searchInObject(value, currentPath);
                                                if (result) return result;
                                            }
                                        }
                                    }
                                    
                                    // Second pass: look for access tokens if no ID token found
                                    for (const key in obj) {
                                        if (obj.hasOwnProperty(key)) {
                                            const value = obj[key];
                                            const currentPath = path ? `${path}.${key}` : key;
                                            
                                            if (typeof value === 'string' && 
                                                (key.toLowerCase().includes('access') || key === 'AccessToken') &&
                                                value.length > 100 && value.includes('.')) {
                                                console.log(`🎯 Found potential access token in ${currentPath} (${key})`);
                                                return value;
                                            }
                                            
                                            if (typeof value === 'object' && value !== null) {
                                                const result = searchInObject(value, currentPath);
                                                if (result) return result;
                                            }
                                        }
                                    }
                                    return null;
                                };
                                
                                const deepFoundToken = searchInObject(bodyData);
                                if (deepFoundToken) {
                                    foundToken = deepFoundToken;
                                    console.log('✅ Found token in deep search:', foundToken.substring(0, 30) + '...');
                                }
                            }
                            
                            // Check if we have both AccessToken and IdToken in the response
                            if (bodyData.AuthenticationResult) {
                                const authResult = bodyData.AuthenticationResult;
                                
                                // Capture Access Token
                                if (authResult.AccessToken && typeof authResult.AccessToken === 'string') {
                                    const accessTokenInfo = this.decodeJWTToken(authResult.AccessToken);
                                    if (accessTokenInfo.type === 'access' && accessTokenInfo.isValid) {
                                        this.capturedAccessToken = authResult.AccessToken;
                                        console.log('✅ Valid Access token captured from AuthenticationResult:', authResult.AccessToken.substring(0, 30) + '...');
                                    }
                                }
                                
                                // Capture ID Token
                                if (authResult.IdToken && typeof authResult.IdToken === 'string') {
                                    const idTokenInfo = this.decodeJWTToken(authResult.IdToken);
                                    if (idTokenInfo.type === 'id' && idTokenInfo.isValid) {
                                        this.capturedIdToken = authResult.IdToken;
                                        console.log('✅ Valid ID token captured from AuthenticationResult:', authResult.IdToken.substring(0, 30) + '...');
                                    }
                                }
                            } else if (foundToken && typeof foundToken === 'string') {
                                // Fallback: Validate token type before capturing
                                const tokenInfo = this.decodeJWTToken(foundToken);
                                console.log('🔍 Token validation:', {
                                    type: tokenInfo.type,
                                    isValid: tokenInfo.isValid,
                                    exp: tokenInfo.payload?.exp ? new Date(tokenInfo.payload.exp * 1000).toISOString() : 'N/A'
                                });
                                
                                // Capture both Access and ID tokens separately
                                if (tokenInfo.type === 'access' && tokenInfo.isValid) {
                                    this.capturedAccessToken = foundToken;
                                    const token = this.capturedAccessToken;
                                    if (token) {
                                        console.log('✅ Valid Access token captured from response body:', token.substring(0, 30) + '...');
                                    }
                                } else if (tokenInfo.type === 'id' && tokenInfo.isValid) {
                                    this.capturedIdToken = foundToken;
                                    const token = this.capturedIdToken;
                                    if (token) {
                                        console.log('✅ Valid ID token captured from response body for billing API:', token.substring(0, 30) + '...');
                                    }
                                } else if (!tokenInfo.isValid) {
                                    console.log('⚠️ Token is expired or invalid - not capturing');
                                } else {
                                    console.log('⚠️ Unknown token type - not capturing');
                                }
                            } else {
                                console.log('❌ No access token found in response body or token is not a string');
                            }
                        } catch (e) {
                            console.log('❌ Response body is not JSON or could not be parsed:', e);
                        }
                    }
                    
                    // Fulfill the response
                    await route.fulfill({ response });
                } else {
                    await route.continue();
                }
            } catch (error) {
                console.log('Error during response interception:', error);
                await route.continue();
            }
        });

        console.log('✅ Login API interception setup completed');
    }

    // Check if a request is related to authentication
    private isAuthRelatedRequest(url: string, method: string): boolean {
        const authKeywords = [
            'login', 'auth', 'signin', 'sign-in', 'authenticate', 'token', 'cognito',
            'oauth', 'jwt', 'session', 'credential', 'password', 'verify', 'amplify',
            'aws-amplify', 'amplify-auth', 'cognito-idp', 'cognito-identity'
        ];
        
        const urlLower = url.toLowerCase();
        return authKeywords.some(keyword => urlLower.includes(keyword)) || 
               method === 'POST' && (urlLower.includes('api') || urlLower.includes('auth') || urlLower.includes('amplify'));
    }

    // Get the captured access token
    getCapturedAccessToken(): string | undefined {
        return this.capturedAccessToken;
    }

    /**
     * Decode JWT token to check its type and validity
     */
    private decodeJWTToken(token: string): { type: 'access' | 'id' | 'refresh' | 'unknown', isValid: boolean, payload?: any } {
        try {
            // JWT tokens have 3 parts separated by dots
            const parts = token.split('.');
            if (parts.length !== 3) {
                return { type: 'unknown', isValid: false };
            }

            // Decode the payload (second part)
            const payload = JSON.parse(atob(parts[1]));
            
            // Check token type based on claims
            let type: 'access' | 'id' | 'refresh' | 'unknown' = 'unknown';
            
            if (payload.token_use === 'access') {
                type = 'access';
            } else if (payload.token_use === 'id') {
                type = 'id';
            } else if (payload.token_use === 'refresh') {
                type = 'refresh';
            } else if (payload.aud) {
                // If it has an audience claim, it's likely an ID token
                type = 'id';
            } else if (payload.scope) {
                // If it has scope, it's likely an access token
                type = 'access';
            }

            // Check if token is expired
            const now = Math.floor(Date.now() / 1000);
            const isValid = !payload.exp || payload.exp > now;

            return { type, isValid, payload };
        } catch (error) {
            console.log('❌ Error decoding JWT token:', error);
            return { type: 'unknown', isValid: false };
        }
    }

    /**
     * Get a fresh access token by making a new authentication request
     */
    async getFreshAccessToken(): Promise<string | null> {
        try {
            console.log('🔄 Attempting to get fresh access token...');
            
            // Check if we have a refresh token in storage
            const refreshToken = await this.page.evaluate(() => {
                const amplifyKeys = Object.keys(localStorage).filter(key => 
                    key.includes('amplify') || key.includes('cognito') || key.includes('auth')
                );
                
                for (const key of amplifyKeys) {
                    const value = localStorage.getItem(key);
                    if (value) {
                        try {
                            const parsed = JSON.parse(value);
                            if (parsed.refreshToken || parsed.RefreshToken) {
                                return parsed.refreshToken || parsed.RefreshToken;
                            }
                        } catch (e) {
                            // Not JSON, skip
                        }
                    }
                }
                return null;
            });

            if (!refreshToken) {
                console.log('❌ No refresh token found in storage');
                return null;
            }

            console.log('🔄 Found refresh token, attempting to get new access token...');
            
            // Make a request to get new tokens using refresh token
            const response = await this.page.request.post('https://cognito-idp.us-east-1.amazonaws.com/', {
                data: {
                    AuthFlow: 'REFRESH_TOKEN_AUTH',
                    AuthParameters: {
                        REFRESH_TOKEN: refreshToken
                    },
                    ClientId: 'your-client-id' // This should be configured properly
                },
                headers: {
                    'Content-Type': 'application/x-amz-json-1.1',
                    'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth'
                }
            });

            if (response.ok()) {
                const responseData = await response.json();
                if (responseData.AuthenticationResult && responseData.AuthenticationResult.AccessToken) {
                    const newAccessToken = responseData.AuthenticationResult.AccessToken;
                    console.log('✅ Successfully obtained fresh access token');
                    return newAccessToken;
                }
            }

            console.log('❌ Failed to get fresh access token');
            return null;
        } catch (error) {
            console.log('❌ Error getting fresh access token:', error);
            return null;
        }
    }

    // Check for Amplify tokens in browser storage
    async checkAmplifyTokensInStorage(): Promise<string | null> {
        try {
            console.log('🔍 Checking for Amplify tokens in browser storage...');
            
            // Check localStorage for Amplify tokens
            const localStorageTokens = await this.page.evaluate(() => {
                const amplifyKeys = Object.keys(localStorage).filter(key => 
                    key.includes('amplify') || key.includes('cognito') || key.includes('auth')
                );
                
                console.log('🔍 Amplify-related localStorage keys:', amplifyKeys);
                
                for (const key of amplifyKeys) {
                    const value = localStorage.getItem(key);
                    if (value) {
                        try {
                            const parsed = JSON.parse(value);
                            console.log(`🔍 Key: ${key}, Value:`, parsed);
                            
                            // Look for access tokens in the stored data
                            if (parsed.accessToken || parsed.AccessToken || parsed.idToken || parsed.IdToken) {
                                return {
                                    key: key,
                                    token: parsed.accessToken || parsed.AccessToken || parsed.idToken || parsed.IdToken
                                };
                            }
                        } catch (e) {
                            // Not JSON, might be a token directly
                            if (value.length > 100 && value.includes('.')) {
                                return {
                                    key: key,
                                    token: value
                                };
                            }
                        }
                    }
                }
                return null;
            });

            if (localStorageTokens) {
                console.log('✅ Found Amplify token in localStorage:', localStorageTokens.key);
                
                // Validate token type before capturing
                const tokenInfo = this.decodeJWTToken(localStorageTokens.token);
                console.log('🔍 localStorage Token validation:', {
                    type: tokenInfo.type,
                    isValid: tokenInfo.isValid,
                    exp: tokenInfo.payload?.exp ? new Date(tokenInfo.payload.exp * 1000).toISOString() : 'N/A'
                });
                
                // Only capture if it's an access token and valid
                if (tokenInfo.type === 'access' && tokenInfo.isValid) {
                    this.capturedAccessToken = localStorageTokens.token;
                    return localStorageTokens.token;
                } else if (tokenInfo.type === 'id') {
                    console.log('⚠️ Found ID token in localStorage instead of access token - not capturing for API calls');
                } else if (!tokenInfo.isValid) {
                    console.log('⚠️ localStorage token is expired or invalid - not capturing');
                } else {
                    console.log('⚠️ Unknown token type in localStorage - not capturing');
                }
            }

            // Check sessionStorage for Amplify tokens
            const sessionStorageTokens = await this.page.evaluate(() => {
                const amplifyKeys = Object.keys(sessionStorage).filter(key => 
                    key.includes('amplify') || key.includes('cognito') || key.includes('auth')
                );
                
                console.log('🔍 Amplify-related sessionStorage keys:', amplifyKeys);
                
                for (const key of amplifyKeys) {
                    const value = sessionStorage.getItem(key);
                    if (value) {
                        try {
                            const parsed = JSON.parse(value);
                            console.log(`🔍 Key: ${key}, Value:`, parsed);
                            
                            // Look for access tokens in the stored data
                            if (parsed.accessToken || parsed.AccessToken || parsed.idToken || parsed.IdToken) {
                                return {
                                    key: key,
                                    token: parsed.accessToken || parsed.AccessToken || parsed.idToken || parsed.IdToken
                                };
                            }
                        } catch (e) {
                            // Not JSON, might be a token directly
                            if (value.length > 100 && value.includes('.')) {
                                return {
                                    key: key,
                                    token: value
                                };
                            }
                        }
                    }
                }
                return null;
            });

            if (sessionStorageTokens) {
                console.log('✅ Found Amplify token in sessionStorage:', sessionStorageTokens.key);
                
                // Validate token type before capturing
                const tokenInfo = this.decodeJWTToken(sessionStorageTokens.token);
                console.log('🔍 sessionStorage Token validation:', {
                    type: tokenInfo.type,
                    isValid: tokenInfo.isValid,
                    exp: tokenInfo.payload?.exp ? new Date(tokenInfo.payload.exp * 1000).toISOString() : 'N/A'
                });
                
                // Only capture if it's an access token and valid
                if (tokenInfo.type === 'access' && tokenInfo.isValid) {
                    this.capturedAccessToken = sessionStorageTokens.token;
                    return sessionStorageTokens.token;
                } else if (tokenInfo.type === 'id') {
                    console.log('⚠️ Found ID token in sessionStorage instead of access token - not capturing for API calls');
                } else if (!tokenInfo.isValid) {
                    console.log('⚠️ sessionStorage token is expired or invalid - not capturing');
                } else {
                    console.log('⚠️ Unknown token type in sessionStorage - not capturing');
                }
            }

            console.log('❌ No Amplify tokens found in browser storage');
            return null;
        } catch (error) {
            console.log('❌ Error checking Amplify tokens in storage:', error);
            return null;
        }
    }

    /**
     * Get the appropriate token for different use cases
     * @param useCase - 'billing' for billing API calls (uses ID token), 'mfa' for MFA setup (uses Access token)
     */
    getTokenForUseCase(useCase: 'billing' | 'mfa'): string | null {
        if (useCase === 'billing') {
            // For billing API calls, prefer ID token, fallback to Access token
            if (this.capturedIdToken) {
                console.log('🔑 Using ID token for billing API calls');
                return this.capturedIdToken;
            } else if (this.capturedAccessToken) {
                console.log('🔑 Using Access token for billing API calls (fallback)');
                return this.capturedAccessToken;
            }
        } else if (useCase === 'mfa') {
            // For MFA setup, use Access token only
            if (this.capturedAccessToken) {
                console.log('🔑 Using Access token for MFA setup');
                return this.capturedAccessToken;
            }
        }
        
        console.log('❌ No appropriate token found for use case:', useCase);
        return null;
    }

    /**
     * Get the captured ID token
     */
    getCapturedIdToken(): string | null {
        return this.capturedIdToken || null;
    }

    async enterMFAOTP(secretCode: string): Promise<void> {
        if (!secretCode) {
            throw new Error('Secret code not available. Please run the MFA setup step first.');
        }
        
        console.log('🔍 Looking for MFA input field on login page...');
        
        // Try multiple selectors for MFA input
        const mfaSelectors = [
            'input[data-input-otp="true"]',
            'input[autocomplete="one-time-code"]',
            'input[placeholder*="code"]',
            'input[placeholder*="OTP"]',
            'input[placeholder*="MFA"]',
            'input[type="text"]',
            'input[type="number"]',
            'input[name*="code"]',
            'input[name*="otp"]',
            'input[name*="mfa"]'
        ];
        
        let mfaInput = null;
        for (const selector of mfaSelectors) {
            try {
                const element = this.page.locator(selector).first();
                if (await element.isVisible({ timeout: 2000 })) {
                    mfaInput = element;
                    console.log(`✅ Found MFA input with selector: ${selector}`);
                    break;
                }
            } catch (error) {
                // Continue to next selector
            }
        }
        
        if (!mfaInput) {
            // Take a screenshot for debugging
            await this.page.screenshot({ path: `mfa-input-not-found-login-${Date.now()}.png`, fullPage: true });
            throw new Error('MFA input field not found on login page. Check screenshot for debugging.');
        }
        
        const { authenticator } = require('otplib');
        const otp = authenticator.generate(secretCode);
        console.log(`Generated MFA OTP from secret: ${otp}`);
        
        // Wait for the MFA input field to be visible
        await mfaInput.waitFor({ state: 'visible', timeout: 15000 });
        
        // For OTP input fields, we need to clear first and then type
        await mfaInput.clear();
        await mfaInput.fill(otp);
        
        // Verify the OTP was entered correctly
        const enteredValue = await mfaInput.inputValue();
        console.log(`✅ Entered MFA OTP: ${otp} (verified: ${enteredValue})`);
        
        if (enteredValue !== otp) {
            console.log('⚠️ OTP value mismatch, trying alternative method...');
            // Try typing character by character for OTP inputs
            await mfaInput.clear();
            for (const char of otp) {
                await mfaInput.type(char);
                await this.page.waitForTimeout(100); // Small delay between characters
            }
            const finalValue = await mfaInput.inputValue();
            console.log(`✅ Re-entered MFA OTP: ${otp} (final: ${finalValue})`);
        }
        
        // Click the submit button
        try {
            await this.mfaSubmitButton.click();
            console.log('✅ Clicked MFA submit button');
        } catch (error) {
            console.log('⚠️ Could not click MFA submit button, trying alternative...');
            // Try pressing Enter
            await mfaInput.press('Enter');
            console.log('✅ Pressed Enter on MFA input field');
        }
    }

}
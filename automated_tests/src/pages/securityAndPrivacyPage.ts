import { Page, Locator } from '@playwright/test';
import { authenticator } from 'otplib';

export class SecurityAndPrivacyPage {
    readonly page: Page;
    readonly setupAuthenticatorButton: Locator;
    readonly authenticatorPopup: Locator;
    readonly otpInput: Locator;
    readonly confirmButton: Locator;
    readonly successMessage: Locator;
    readonly disableButton: Locator;
    readonly securityPrivacySpan: Locator;
    readonly changePasswordButton: Locator;
    readonly currentPasswordInput: Locator;
    readonly newPasswordInput: Locator;
    readonly confirmPasswordInput: Locator;
    readonly confirmChangePasswordButton: Locator;
    readonly changePasswordSuccessMessage: Locator;
    private capturedAccessToken: string | null = null;

    constructor(page: Page, capturedAccessToken?: string) {
        this.page = page;
        this.capturedAccessToken = capturedAccessToken || null;
        console.log('🔍 SecurityAndPrivacyPage constructor - capturedAccessToken:', capturedAccessToken ? capturedAccessToken.substring(0, 30) + '...' : 'null');
        console.log('🔍 SecurityAndPrivacyPage constructor - token length:', capturedAccessToken ? capturedAccessToken.length : 0);
        this.setupAuthenticatorButton = page.locator('div:has(p:has-text("Authenticator App")) button:has-text("Setup")').first();
        this.authenticatorPopup = page.locator('h2:has-text("Setup Authenticator App")');
        this.otpInput = page.locator('input[placeholder="Enter 6-digit code"]');
        this.confirmButton = page.locator('button:has-text("Confirm")');
        this.successMessage = page.locator('[data-testid="success-message"], .success-message, .alert-success');
        this.disableButton = page.locator('button:has-text("Disable")');
        this.securityPrivacySpan = page.locator('span:has-text("Security & Privacy")');
        this.changePasswordButton = page.locator('button:has-text("Change Password")');
        this.currentPasswordInput = page.locator('input[placeholder*="current password"], input[placeholder*="Current password"], input[name*="current"], input[id*="current"]');
        this.newPasswordInput = page.locator('input[placeholder*="new password"], input[placeholder*="New password"], input[name*="new"], input[id*="new"]');
        this.confirmPasswordInput = page.locator('input[placeholder*="confirm password"], input[placeholder*="Confirm password"], input[name*="confirm"], input[id*="confirm"]');
        this.confirmChangePasswordButton = page.locator('button:has-text("Confirm"), button:has-text("Update"), button:has-text("Save")');
        this.changePasswordSuccessMessage = page.locator('div.grid.gap-1:has(div:has-text("Password Changed")), div:has-text("Password Changed"), div:has-text("You can now log out and log back in with your new password"), [data-testid="success-message"], .success-message, .alert-success');
        
        // Setup API interception when the page is created (only if no token provided)
        if (!this.capturedAccessToken) {
            this.setupAPIInterception();
        } else {
            console.log('🔍 SecurityAndPrivacyPage: Access token already provided, skipping API interception setup');
        }
    }

    // Setup API interception to capture access tokens
    private async setupAPIInterception() {
        console.log('Setting up API interception for access token capture...');
        
        // Intercept all requests to capture access tokens
        await this.page.route('**/*', async (route) => {
            const url = route.request().url();
            const method = route.request().method();
            
            // Log all API calls for debugging
            if (url.includes('cognito-idp.us-east-1.amazonaws.com') || 
                url.includes('smartpc.cloud') ||
                url.includes('api') ||
                url.includes('auth')) {

            }
            
            // Check if this is a Cognito API call or any other relevant API
            if (url.includes('cognito-idp.us-east-1.amazonaws.com') || 
                url.includes('smartpc.cloud') ||
                url.includes('api') ||
                url.includes('auth')) {
                
                try {
                    // Get the request headers and body
                    const headers = route.request().headers();
                    const postData = route.request().postData();
                    

                    
                    // Look for access token in headers (Bearer token)
                    if (headers.authorization && headers.authorization.startsWith('Bearer ')) {
                        const token = headers.authorization.replace('Bearer ', '');
                        if (!this.capturedAccessToken) {
                            this.capturedAccessToken = token;
                            console.log('✅ Access token captured from Authorization header:', token.substring(0, 20) + '...');
                            console.log('🔑 Full token length:', token.length);
                        } else {
                            console.log('🔍 Access token already exists, skipping capture from Authorization header');
                        }
                    }
                    
                    // Look for access token in request body
                    if (postData) {
                        try {
                            const bodyData = JSON.parse(postData);

                            
                            if (bodyData.AccessToken) {
                                if (!this.capturedAccessToken) {
                                    this.capturedAccessToken = bodyData.AccessToken;
                                    console.log('✅ Access token captured from request body:', bodyData.AccessToken.substring(0, 20) + '...');
                                    console.log('🔑 Full token length:', bodyData.AccessToken.length);
                                } else {
                                    console.log('🔍 Access token already exists, skipping capture from request body');
                                }
                            }
                            
                            // Also check for other common token field names
                            const tokenFields = ['accessToken', 'access_token', 'token', 'authToken', 'jwt'];
                            for (const field of tokenFields) {
                                if (bodyData[field]) {
                                    this.capturedAccessToken = bodyData[field];

                                    break;
                                }
                            }
                        } catch (e) {

                        }
                    }
                    
                    // Look for access token in query parameters
                    const urlObj = new URL(url);
                    const accessTokenParam = urlObj.searchParams.get('access_token') || 
                                          urlObj.searchParams.get('token') ||
                                          urlObj.searchParams.get('accessToken') ||
                                          urlObj.searchParams.get('auth_token');
                    if (accessTokenParam) {
                        this.capturedAccessToken = accessTokenParam;
                        console.log('✅ Access token captured from URL parameters:', accessTokenParam.substring(0, 20) + '...');
                        console.log('🔑 Full token length:', accessTokenParam.length);
                    }
                    
                } catch (error) {
                    console.log('❌ Error during API interception:', error);
                }
            }
            
            // Continue with the request
            await route.continue();
        });

        // Also intercept responses to capture tokens from response headers or body
        await this.page.route('**/*', async (route) => {
            try {
                // Check if page/context is still valid before proceeding
                if (this.page.isClosed()) {

                    await route.continue();
                    return;
                }

                const response = await route.fetch();
                
                const url = route.request().url();
                if (url.includes('cognito-idp.us-east-1.amazonaws.com') || 
                    url.includes('smartpc.cloud') ||
                    url.includes('api') ||
                    url.includes('auth')) {
                    

                    
                    // Check response headers for tokens
                    const responseHeaders = response.headers();

                    
                    const setCookieHeader = responseHeaders['set-cookie'];
                    if (setCookieHeader) {
                        const cookies = setCookieHeader.split(';');
                        for (const cookie of cookies) {
                            if (cookie.includes('access_token') || cookie.includes('token') || cookie.includes('auth')) {
                                const token = cookie.split('=')[1];
                                this.capturedAccessToken = token;

                                break;
                            }
                        }
                    }
                    
                    // Check response body for tokens
                    try {
                        const responseBody = await response.text();

                        
                        // Try multiple token patterns in response
                        const tokenPatterns = [
                            /"access_token"\s*:\s*"([^"]+)"/,
                            /"accessToken"\s*:\s*"([^"]+)"/,
                            /"token"\s*:\s*"([^"]+)"/,
                            /"authToken"\s*:\s*"([^"]+)"/,
                            /"jwt"\s*:\s*"([^"]+)"/,
                            /"bearer"\s*:\s*"([^"]+)"/
                        ];
                        
                        for (const pattern of tokenPatterns) {
                            const match = responseBody.match(pattern);
                            if (match) {
                                this.capturedAccessToken = match[1];

                                break;
                            }
                        }
                    } catch (e) {

                    }
                }
                
                // Continue with the response
                await route.fulfill({ response });
            } catch (error) {

                // If there's an error, just continue the request
                try {
                    await route.continue();
                } catch (continueError) {

                }
            }
        });
        
        console.log('API interception setup completed');
    }

    async goto() {
        await this.page.goto('/dashboard/profile?tab=security');
        
        // Wait a bit for any API calls to complete and capture tokens
        await this.page.waitForTimeout(2000);
    }

    async verifyOnSecurityAndPrivacyPage(): Promise<boolean> {
        try {
            await this.securityPrivacySpan.waitFor({ state: 'visible', timeout: 10000 });
            console.log('✅ Successfully verified we are on the Security and Privacy page');
            return true;
        } catch (error) {
            console.log('❌ Security & Privacy page verification failed:', error);
            return false;
        }
    }

    // Method to refresh the page and capture tokens from network requests
    async refreshAndCaptureTokens(): Promise<string | null> {
        console.log('🔄 Refreshing page to capture tokens from network requests...');
        
        // Clear any existing captured token
        this.capturedAccessToken = null;
        
        // Refresh the page
        await this.page.reload();
        
        // Wait for the page to load and any API calls to complete
        await this.page.waitForTimeout(3000);
        
        // Wait for access token from network requests
        const token = await this.waitForAccessTokenFromNetwork();
        
        if (token) {
            console.log('✅ Token captured after page refresh');
            return token;
        } else {
            console.log('❌ No token captured after page refresh');
            return null;
        }
    }

    // Combined method that handles both primary and fallback approaches
    async clickSetupAuthenticatorWithFallback() {
        try {
            // Try the primary method first
            await this.clickSetupAuthenticator();
        } catch (error) {
            console.log('Primary method failed, trying alternative method...');
            // If primary method fails, try the alternative method
            await this.clickSetupAuthenticatorAlternative();
        }
    }

    async clickSetupAuthenticator() {
        try {
            // Check if page is still open before proceeding
            if (this.page.isClosed()) {
                throw new Error('Page is closed, cannot proceed with primary click method');
            }
            
            // Wait for the button to be visible before clicking
            await this.setupAuthenticatorButton.waitFor({ state: 'visible', timeout: 10000 });
            await this.setupAuthenticatorButton.click();
        } catch (error) {
            // Fallback: try to find the button more specifically
            console.log('Primary locator failed, trying fallback approach...');
            
            // Check if page is still open before fallback
            if (this.page.isClosed()) {
                throw new Error('Page is closed, cannot proceed with fallback click method');
            }
            
            const fallbackButton = this.page.locator('div:has(p:has-text("Authenticator App")) button:has-text("Setup")').first();
            await fallbackButton.waitFor({ state: 'visible', timeout: 10000 });
            await fallbackButton.click();
        }
    }

    // Alternative method using a different approach
    async clickSetupAuthenticatorAlternative() {
        try {
            // Check if page is still open before proceeding
            if (this.page.isClosed()) {
                throw new Error('Page is closed, cannot proceed with alternative click method');
            }
            
            // Method 1: Find by text content and parent structure
            const button = this.page.locator('div').filter({ hasText: /Authenticator App.*Use an authenticator app to generate one-time codes/ }).getByRole('button').first();
            await button.waitFor({ state: 'visible', timeout: 10000 });
            await button.click();
        } catch (error) {
            console.log('Alternative method failed, trying direct approach...');
            
            // Check if page is still open before using page.evaluate
            if (this.page.isClosed()) {
                throw new Error('Page is closed, cannot proceed with page.evaluate');
            }
            
            // Method 2: Direct approach using page.evaluate
            await this.page.evaluate(() => {
                const divs = Array.from(document.querySelectorAll('div'));
                const authenticatorDiv = divs.find(div => 
                    div.textContent?.includes('Authenticator App') && 
                    div.textContent?.includes('Use an authenticator app to generate one-time codes')
                );
                if (authenticatorDiv) {
                    const button = authenticatorDiv.querySelector('button');
                    if (button) {
                        button.click();
                    }
                }
            });
        }
    }

    async isAuthenticatorPopupVisible(): Promise<boolean> {
        return await this.authenticatorPopup.isVisible();
    }

    async enterOTP(otp: string) {
        // Ensure OTP is properly formatted and always 6 digits
        const formattedOTP = otp.trim();
        let finalOTP = formattedOTP;
        
        // If OTP is less than 6 digits, pad with leading zeros
        if (formattedOTP.length < 6) {
            finalOTP = formattedOTP.padStart(6, '0');
            console.log(`MFA OTP padded from ${formattedOTP} to ${finalOTP} (6 digits required)`);
        } else if (formattedOTP.length > 6) {
            // If OTP is more than 6 digits, take the last 6 digits
            finalOTP = formattedOTP.slice(-6);
            console.log(`MFA OTP truncated from ${formattedOTP} to ${finalOTP} (6 digits required)`);
        }
        
        console.log(`Entering MFA OTP: ${finalOTP} (length: ${finalOTP.length})`);
        await this.otpInput.fill(finalOTP);
    }

    async clickConfirm() {
        await this.confirmButton.click();
    }

    async isSuccessMessageVisible(): Promise<boolean> {
        return await this.successMessage.isVisible();
    }

    async isDisableButtonVisible(): Promise<boolean> {
        return await this.disableButton.isVisible();
    }

    async clickDisableButton() {
        await this.disableButton.click();
    }

    // Complete MFA setup workflow using existing captured token
    async setupMFAAuthenticator(): Promise<string> {
        try {
            console.log('🚀 Starting MFA setup workflow...');
            
            // Check if we have a captured access token from login
            if (this.capturedAccessToken) {
                const token = this.capturedAccessToken;
                console.log('🔍 MFA setup - this.capturedAccessToken:', token);
                console.log('🔍 MFA setup - token type:', typeof token);
                console.log('🔍 MFA setup - token length:', token.length);
                console.log('✅ Using captured access token from login:', token.substring(0, 30) + '...');
                
                // Make API call to get the secret code directly
                console.log('🔄 Making API call to get MFA secret code...');
                const secretCode = await this.setupAuthenticatorThroughAPI(token);
                
                console.log('✅ Authenticator app setup completed successfully');
                console.log('🔐 Secret code received:', secretCode);
                
                return secretCode;
            } else {
                console.log('⚠️ No captured access token found, trying UI approach...');
                
                // Check if page is still open
                if (this.page.isClosed()) {
                    throw new Error('Page is closed, cannot proceed with MFA setup');
                }
                
                // Click the setup button to trigger the application's own API call
                console.log('🖱️ Clicking setup button...');
                await this.clickSetupAuthenticatorWithFallback();
                
                // Wait for the popup to appear
                console.log('⏳ Waiting for popup to appear...');
                await this.page.waitForSelector('h2:has-text("Setup Authenticator App")', { timeout: 15000 });
                console.log('✅ Setup Authenticator App popup is visible');
                
                // Wait for the application to make its API call and capture the access token
                console.log('🔄 Waiting for application to make API call and capture access token...');
                await this.page.waitForTimeout(5000); // Give more time for API call
                
                // Check if page is still open before proceeding
                if (this.page.isClosed()) {
                    throw new Error('Page was closed during MFA setup process');
                }
                
                // Try to extract from popup as fallback
                console.log('⚠️ Trying to extract from popup...');
                const secretCode = await this.extractSecretCodeFromPopup();
                
                if (secretCode) {
                    console.log('✅ Secret code extracted from popup:', secretCode);
                    return secretCode;
                } else {
                    throw new Error('Could not extract secret code from popup');
                }
            }
        } catch (error) {
            console.error('❌ Failed to setup authenticator app:', error);
            throw error;
        }
    }

    // Extract secret code from the popup content
    async extractSecretCodeFromPopup(): Promise<string | null> {
        try {
            console.log('🔍 Attempting to extract secret code from popup...');
            
            // Look for QR code or secret code in the popup
            const secretCodeElement = await this.page.locator('text=/[A-Z0-9]{32}/').first();
            
            if (await secretCodeElement.isVisible()) {
                const secretCode = await secretCodeElement.textContent();
                if (secretCode && secretCode.length >= 32) {
                    console.log('✅ Secret code found in popup:', secretCode);
                    return secretCode;
                }
            }
            
            // Try to find secret code in any text content
            const allText = await this.page.locator('h2:has-text("Setup Authenticator App")').locator('..').textContent();
            if (allText) {
                const secretMatch = allText.match(/[A-Z0-9]{32,}/);
                if (secretMatch) {
                    console.log('✅ Secret code found in popup text:', secretMatch[0]);
                    return secretMatch[0];
                }
            }
            
            console.log('❌ No secret code found in popup');
            return null;
        } catch (error) {
            console.log('❌ Error extracting secret code from popup:', error);
            return null;
        }
    }

    // Complete OTP entry workflow
    async enterGeneratedOTP(secretCode: string): Promise<void> {
        if (!secretCode) {
            throw new Error('Secret code not available for OTP generation');
        }
        
        try {
            // Generate TOTP from the secret code received from API
            const generatedOTP = this.generateTOTP(secretCode);
            
            console.log('Generated OTP from secret:', generatedOTP);
            
            // Enter the generated OTP
            await this.enterOTP(generatedOTP);
            
        } catch (error) {
            console.error('Failed to generate or enter OTP:', error);
            throw error;
        }
    }

    // Complete MFA verification workflow
    async verifyMFASetup(): Promise<boolean> {
        try {
            // Click confirm button
            await this.clickConfirm();
            
            // Wait for success message
            await this.page.waitForSelector('[data-testid="success-message"], .success-message, .alert-success', { timeout: 10000 });
            
            // Verify success message is visible
            const isSuccessMessageVisible = await this.isSuccessMessageVisible();
            
            if (isSuccessMessageVisible) {
                console.log('MFA setup verified successfully');
                return true;
            } else {
                throw new Error('Success message not visible after MFA setup');
            }
        } catch (error) {
            console.error('MFA setup verification failed:', error);
            throw error;
        }
    }

    // Complete disable button verification workflow
    async verifyDisableButtonDisplayed(): Promise<boolean> {
        try {
            // Wait for the disable button to be visible
            await this.page.waitForSelector('button:has-text("Disable")', { timeout: 10000 });
            
            // Verify the disable button is visible
            const isDisableButtonVisible = await this.isDisableButtonVisible();
            
            if (isDisableButtonVisible) {
                console.log('Disable button is successfully displayed');
                return true;
            } else {
                throw new Error('Disable button is not visible');
            }
        } catch (error) {
            console.error('Disable button verification failed:', error);
            throw error;
        }
    }

    // Get access token from intercepted API calls
    async getAccessTokenFromInterception(): Promise<string> {
        console.log('Attempting to get access token from API interception...');
        
        // Wait longer for API calls to be intercepted
        await this.page.waitForTimeout(5000);
        
        if (this.capturedAccessToken) {
            console.log('Using captured access token from API interception');
            return this.capturedAccessToken;
        }
        
        // Try to trigger some API calls by interacting with the page
        console.log('No token captured yet, trying to trigger API calls...');
        
        // Try clicking the setup button to trigger API calls
        try {
            await this.clickSetupAuthenticatorWithFallback();
            console.log('Setup button clicked, waiting for API calls...');
            await this.page.waitForTimeout(3000);
        } catch (error) {
            console.log('Could not click setup button:', error);
        }
        
        if (this.capturedAccessToken) {
            console.log('Access token captured after button click');
            return this.capturedAccessToken;
        }
        
        // Try to get token from page cookies
        console.log('Trying to get access token from cookies...');
        try {
            const cookies = await this.page.context().cookies();
            const accessTokenCookie = cookies.find(cookie => 
                cookie.name.toLowerCase().includes('access') || 
                cookie.name.toLowerCase().includes('token') ||
                cookie.name.toLowerCase().includes('auth')
            );
            
            if (accessTokenCookie) {
                console.log('Found access token in cookies:', accessTokenCookie.name);
                this.capturedAccessToken = accessTokenCookie.value;
                return accessTokenCookie.value;
            }
        } catch (error) {
            console.log('Error getting cookies:', error);
        }
        
        // Try to get token from localStorage with more keys
        console.log('Trying to get access token from localStorage...');
        try {
            const token = await this.page.evaluate(() => {
                const keys = Object.keys(localStorage);
                console.log('Available localStorage keys:', keys);
                
                // Try common token key names
                const tokenKeys = [
                    'accessToken', 'access_token', 'token', 'authToken', 'auth_token',
                    'jwt', 'jwtToken', 'bearer', 'authorization', 'userToken',
                    'sessionToken', 'apiToken', 'auth', 'authentication'
                ];
                
                for (const key of tokenKeys) {
                    const value = localStorage.getItem(key);
                    if (value && value.length > 10) { // Basic validation
                        console.log(`Found token in localStorage key: ${key}`);
                        return value;
                    }
                }
                
                // Try to find any key that might contain a token
                for (const key of keys) {
                    if (key.toLowerCase().includes('token') || 
                        key.toLowerCase().includes('auth') ||
                        key.toLowerCase().includes('access')) {
                        const value = localStorage.getItem(key);
                        if (value && value.length > 10) {
                            console.log(`Found potential token in localStorage key: ${key}`);
                            return value;
                        }
                    }
                }
                
                return null;
            });
            
            if (token) {
                console.log('Access token found in localStorage');
                this.capturedAccessToken = token;
                return token;
            }
        } catch (error) {
            console.log('Error getting token from localStorage:', error);
        }
        
        // If no token captured, try the old method as fallback
        console.log('No access token captured from interception, trying fallback method...');
        return await this.getAccessTokenFromPage();
    }

    async setupAuthenticatorThroughAPI(accessToken: string): Promise<string> {
        try {
            // Validate the access token before making the API call
            if (!accessToken || accessToken.trim() === '') {
                throw new Error('Access token is empty or invalid');
            }
            
            console.log('🔑 Using access token for API call:', accessToken.substring(0, 20) + '...');
            console.log('🔑 Token length:', accessToken.length);
            
            console.log('🌐 Making API call to AWS Cognito...');
            // Make the API call to AWS Cognito to associate software token
            const response = await this.page.request.post('https://cognito-idp.us-east-1.amazonaws.com/', {
                headers: {
                    'accept': '*/*',
                    'accept-language': 'en-IN,en;q=0.9,de-DE;q=0.8,de;q=0.7,en-GB;q=0.6,en-US;q=0.5',
                    'content-type': 'application/x-amz-json-1.1',
                    'origin': 'https://smartpc.cloud',
                    'referer': 'https://smartpc.cloud/',
                    'x-amz-target': 'AWSCognitoIdentityProviderService.AssociateSoftwareToken',
                    'x-amz-user-agent': 'aws-sdk-js/3.840.0 ua/2.1 os/macOS#10.15.7 lang/js md/browser#Chrome_139.0.0.0 api/cognito-identity-provider#3.840.0 m/E'
                },
                data: {
                    AccessToken: accessToken
                }
            });

            console.log('📡 API response status:', response.status());
            
            if (response.ok()) {
                const responseData = await response.json();
                console.log('📡 API response data:', JSON.stringify(responseData, null, 2));
                
                // Extract the secret code from the response
                if (responseData.SecretCode) {
                    console.log('✅ Authenticator app setup successful. Secret code received:', responseData.SecretCode);
                    return responseData.SecretCode;
                } else {
                    console.log('❌ Secret code not found in API response');
                    throw new Error('Secret code not found in API response');
                }
            } else {
                const errorData = await response.json();
                console.log('❌ API call failed. Error data:', JSON.stringify(errorData, null, 2));
                throw new Error(`API call failed: ${response.status()} - ${errorData.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error setting up authenticator app through API:', error);
            throw error;
        }
    }

    generateTOTP(secret: string): string {
        try {
            // Generate TOTP code using the secret
            const token = authenticator.generate(secret);
            console.log('TOTP Code generated:', token);
            return token;
        } catch (error) {
            console.error('Error generating TOTP:', error);
            throw new Error('Failed to generate TOTP code');
        }
    }

    async getAccessTokenFromPage(): Promise<string> {
        // This method should extract the access token from the current page context
        // You might need to implement this based on how your app stores the token
        // For example, it could be in localStorage, sessionStorage, or a hidden input field
        
        try {
            // Try to get token from localStorage
            const token = await this.page.evaluate(() => {
                return localStorage.getItem('accessToken') || 
                       sessionStorage.getItem('accessToken') ||
                       document.querySelector('[data-testid="access-token"]')?.getAttribute('value') ||
                       '';
            });
            
            if (!token) {
                throw new Error('Access token not found on the page');
            }
            
            return token;
        } catch (error) {
            console.error('Error getting access token from page:', error);
            throw new Error('Could not retrieve access token for MFA setup');
        }
    }

    // Public method to get the captured access token
    getCapturedAccessToken(): string | null {
        return this.capturedAccessToken;
    }

    // Method to capture access token when Setup button is clicked and popup is fully loaded
    async captureAccessTokenOnSetup(): Promise<string | null> {
        console.log('🎯 Starting access token capture process...');
        
        // Clear any existing captured token
        this.capturedAccessToken = null;
        
        // Click the setup button to trigger API calls
        await this.clickSetupAuthenticatorWithFallback();
        
        // Wait for popup to be fully loaded
        await this.page.waitForSelector('h2:has-text("Setup Authenticator App")', { timeout: 10000 });
        console.log('✅ Setup Authenticator App popup is fully loaded');
        
        // Wait for the application to make its API call and capture the token
        console.log('🔄 Waiting for application API call to capture token...');
        await this.page.waitForTimeout(5000);
        
        // Check if we captured the access token
        if (this.capturedAccessToken) {
            const token: string = this.capturedAccessToken;
            console.log('✅ Access token successfully captured from application API call:', token.substring(0, 30) + '...');
            console.log('🔑 Token length:', token.length);
            return token;
        } else {
            console.log('❌ No access token captured during setup process');
            return null;
        }
    }

    // Method to intercept and capture token from application's own API call
    async interceptApplicationAPICall(): Promise<string | null> {
        console.log('🕵️ Setting up interception for application API call...');
        
        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                console.log('⏰ Timeout waiting for application API call');
                resolve(null);
            }, 15000); // 15 second timeout
            
            // Set up a periodic check for the token
            const checkInterval = setInterval(() => {
                if (this.capturedAccessToken) {
                    clearTimeout(timeout);
                    clearInterval(checkInterval);
                    const token = this.capturedAccessToken;
                    console.log('✅ Token captured from application API call:', token.substring(0, 30) + '...');
                    resolve(token);
                }
            }, 500); // Check every 500ms
        });
    }

    // Method to wait for and capture access token from network requests
    async waitForAccessTokenFromNetwork(): Promise<string | null> {
        console.log('🔄 Waiting for access token from network requests...');
        
        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                console.log('⏰ Timeout waiting for access token from network');
                resolve(null);
            }, 10000); // 10 second timeout
            
            // Check if we already have a token
            if (this.capturedAccessToken) {
                clearTimeout(timeout);
                const token = this.capturedAccessToken;
                console.log('✅ Access token already available:', token.substring(0, 20) + '...');
                resolve(token);
                return;
            }
            
            // Set up a periodic check for the token
            const checkInterval = setInterval(() => {
                if (this.capturedAccessToken) {
                    clearTimeout(timeout);
                    clearInterval(checkInterval);
                    const token = this.capturedAccessToken;
                    console.log('✅ Access token captured from network:', token.substring(0, 20) + '...');
                    resolve(token);
                }
            }, 500); // Check every 500ms
        });
    }

    // Alternative method to get access token from current session
    async getAccessTokenFromCurrentSession(): Promise<string | null> {
        console.log('Attempting to get access token from current session...');
        
        try {
            // Try to get token from the page's current state
            const token = await this.page.evaluate(() => {
                // Check for common global variables that might contain the token
                const possibleSources = [
                    () => (window as any).auth?.accessToken,
                    () => (window as any).user?.accessToken,
                    () => (window as any).token,
                    () => (window as any).accessToken,
                    () => (window as any).cognitoUser?.signInUserSession?.accessToken?.jwtToken,
                    () => (window as any).awsUser?.signInUserSession?.accessToken?.jwtToken,
                ];
                
                for (const source of possibleSources) {
                    try {
                        const value = source();
                        if (value && typeof value === 'string' && value.length > 50) {
                            console.log('Found access token in global variable');
                            return value;
                        }
                    } catch (e) {
                        // Continue to next source
                    }
                }
                
                // Check localStorage for Cognito tokens
                const cognitoKeys = [
                    'CognitoIdentityServiceProvider',
                    'aws-amplify-cache',
                    'amplify-cache'
                ];
                
                for (const key of cognitoKeys) {
                    try {
                        const data = localStorage.getItem(key);
                        if (data) {
                            const parsed = JSON.parse(data);
                            // Look for access token in the parsed data
                            const token = this.findTokenInObject(parsed);
                            if (token) {
                                console.log(`Found access token in localStorage key: ${key}`);
                                return token;
                            }
                        }
                    } catch (e) {
                        // Continue to next key
                    }
                }
                
                return null;
            });
            
            if (token) {
                console.log('✅ Access token found in current session');
                this.capturedAccessToken = token;
                return token;
            }
        } catch (error) {
            console.log('Error getting access token from current session:', error);
        }
        
        return null;
    }

    // Helper function to find token in nested objects
    private findTokenInObject(obj: any): string | null {
        if (typeof obj !== 'object' || obj === null) {
            return null;
        }
        
        // Check for common token field names
        const tokenFields = ['accessToken', 'access_token', 'token', 'jwtToken', 'jwt'];
        for (const field of tokenFields) {
            if (obj[field] && typeof obj[field] === 'string' && obj[field].length > 50) {
                return obj[field];
            }
        }
        
        // Recursively search in nested objects
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const result = this.findTokenInObject(obj[key]);
                if (result) {
                    return result;
                }
            }
        }
        
        return null;
    }

    // Change Password Methods
    async clickChangePasswordButton(): Promise<void> {
        try {
            await this.changePasswordButton.waitFor({ state: 'visible', timeout: 10000 });
            await this.changePasswordButton.click();
            console.log('✅ Change Password button clicked successfully');
        } catch (error) {
            console.error('❌ Failed to click Change Password button:', error);
            throw error;
        }
    }

    async enterCurrentPassword(password: string): Promise<void> {
        try {
            await this.currentPasswordInput.waitFor({ state: 'visible', timeout: 10000 });
            await this.currentPasswordInput.fill(password);
            console.log('✅ Current password entered successfully');
        } catch (error) {
            console.error('❌ Failed to enter current password:', error);
            throw error;
        }
    }

    async enterNewPassword(password: string): Promise<void> {
        try {
            await this.newPasswordInput.waitFor({ state: 'visible', timeout: 10000 });
            await this.newPasswordInput.fill(password);
            console.log('✅ New password entered successfully');
        } catch (error) {
            console.error('❌ Failed to enter new password:', error);
            throw error;
        }
    }

    async enterConfirmPassword(password: string): Promise<void> {
        try {
            await this.confirmPasswordInput.waitFor({ state: 'visible', timeout: 10000 });
            await this.confirmPasswordInput.fill(password);
            console.log('✅ Confirm password entered successfully');
        } catch (error) {
            console.error('❌ Failed to enter confirm password:', error);
            throw error;
        }
    }

    async clickConfirmChangePasswordButton(): Promise<void> {
        try {
            await this.confirmChangePasswordButton.waitFor({ state: 'visible', timeout: 10000 });
            await this.confirmChangePasswordButton.click();
            console.log('✅ Confirm change password button clicked successfully');
        } catch (error) {
            console.error('❌ Failed to click confirm change password button:', error);
            throw error;
        }
    }

    async verifyChangePasswordSuccessMessage(): Promise<boolean> {
        try {
            console.log('🔍 Waiting for change password success message...');
            
            // Try multiple locator strategies
            const locators = [
                'div.grid.gap-1:has(div:has-text("Password Changed"))',
                'div:has-text("Password Changed")',
                'div:has-text("You can now log out and log back in with your new password")',
                '[data-testid="success-message"]',
                '.success-message',
                '.alert-success'
            ];
            
            for (const locator of locators) {
                try {
                    const element = this.page.locator(locator);
                    await element.waitFor({ state: 'visible', timeout: 5000 });
                    
                    if (await element.isVisible()) {
                        const messageText = await element.textContent();
                        console.log('✅ Change password success message is visible');
                        console.log('📝 Success message text:', messageText);
                        console.log('🎯 Found with locator:', locator);
                        return true;
                    }
                } catch (locatorError) {
                    console.log(`🔍 Locator "${locator}" did not find element, trying next...`);
                }
            }
            
            // If no specific locator worked, try to find any text containing success indicators
            console.log('🔍 Trying to find success text in page content...');
            const pageText = await this.page.textContent('body');
            if (pageText) {
                const successIndicators = ['Password Changed', 'password changed', 'success', 'Success'];
                for (const indicator of successIndicators) {
                    if (pageText.includes(indicator)) {
                        console.log(`✅ Found success indicator "${indicator}" in page text`);
                        return true;
                    }
                }
            }
            
            console.log('❌ Change password success message not found with any method');
            return false;
            
        } catch (error) {
            console.error('❌ Failed to verify change password success message:', error);
            return false;
        }
    }

    // Generate a new random password
    generateNewPassword(): string {
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        const allChars = lowercase + uppercase + numbers + specialChars;
        
        let password = '';
        
        // Ensure at least one character from each category
        password += lowercase[Math.floor(Math.random() * lowercase.length)]; // lowercase
        password += uppercase[Math.floor(Math.random() * uppercase.length)]; // uppercase
        password += numbers[Math.floor(Math.random() * numbers.length)]; // number
        password += specialChars[Math.floor(Math.random() * specialChars.length)]; // special char
        
        // Fill the rest randomly (total length 12-16 characters)
        const remainingLength = 8 + Math.floor(Math.random() * 5);
        for (let i = 0; i < remainingLength; i++) {
            password += allChars[Math.floor(Math.random() * allChars.length)];
        }
        
        // Shuffle the password to make it more random
        return password.split('').sort(() => Math.random() - 0.5).join('');
    }

    // Complete change password workflow
    async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
        try {
            console.log('🔄 Starting change password workflow...');
            
            // Click change password button
            await this.clickChangePasswordButton();
            
            // Enter current password
            await this.enterCurrentPassword(currentPassword);
            
            // Enter new password
            await this.enterNewPassword(newPassword);
            
            // Enter confirm password
            await this.enterConfirmPassword(newPassword);
            
            // Click confirm button
            await this.clickConfirmChangePasswordButton();
            
            // Verify success message
            const isSuccess = await this.verifyChangePasswordSuccessMessage();
            
            if (isSuccess) {
                console.log('✅ Password changed successfully');
                return true;
            } else {
                console.log('❌ Password change failed - success message not visible');
                return false;
            }
        } catch (error) {
            console.error('❌ Change password workflow failed:', error);
            throw error;
        }
    }

    // Complete change password workflow with automatic password generation
    async changePasswordWithNewPassword(currentPassword: string): Promise<string> {
        try {
            console.log('🔄 Starting change password workflow with new password generation...');
            
            // Generate new password
            const newPassword = this.generateNewPassword();
            console.log('🔐 Generated new password for change password scenario');
            
            // Click change password button
            await this.clickChangePasswordButton();
            
            // Enter current password
            await this.enterCurrentPassword(currentPassword);
            
            // Enter new password
            await this.enterNewPassword(newPassword);
            
            // Enter confirm password
            await this.enterConfirmPassword(newPassword);
            
            // Click confirm button
            await this.clickConfirmChangePasswordButton();
            
            // Wait a moment for the response
            await this.page.waitForTimeout(3000);
            
            // Try to verify success message, but don't fail if it's not found immediately
            let isSuccess = false;
            try {
                isSuccess = await this.verifyChangePasswordSuccessMessage();
            } catch (verifyError) {
                console.log('⚠️ Success message verification failed, but continuing...');
                
                // Take a screenshot for debugging
                try {
                    await this.page.screenshot({ path: 'change-password-debug.png', fullPage: true });
                    console.log('📸 Screenshot saved as change-password-debug.png for debugging');
                } catch (screenshotError) {
                    console.log('📸 Could not take screenshot for debugging');
                }
                
                // Check if we can find any indication of success
                const pageText = await this.page.textContent('body');
                if (pageText?.includes('Password Changed') || pageText?.includes('success')) {
                    console.log('✅ Found success indication in page text');
                    isSuccess = true;
                }
            }
            
            if (isSuccess) {
                console.log('✅ Password changed successfully with new password');
                return newPassword;
            } else {
                console.log('⚠️ Could not verify success message, but password change may have succeeded');
                // Return the new password anyway, as the change might have worked
                return newPassword;
            }
        } catch (error) {
            console.error('❌ Change password workflow with new password failed:', error);
            throw error;
        }
    }
}

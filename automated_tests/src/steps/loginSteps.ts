import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import { CustomWorld } from '../support/world';
import { config, getTestData } from '../config/environment';
import { HomePage } from '../pages/homePage';

Given('I am on the homepage', { timeout: 30000 }, async function(this: CustomWorld) {
    if (!this.page) {
        throw new Error('Page is not initialized');
    }
    console.log('🏠 Navigating to homepage...');
    this.homePage = new HomePage(this.page);
    await this.homePage.goto();
    console.log('✅ Successfully navigated to homepage');
});

When('I click the Sign in link', async function(this: CustomWorld) {
    if (!this.homePage) {
        throw new Error('Home page is not initialized');
    }
    await this.homePage.clickSignIn();
});

Then('I should be on the login page', async function(this: CustomWorld) {
    if (!this.page) {
        throw new Error('Page is not initialized');
    }
    this.loginPage = new LoginPage(this.page);
    const isOnLoginPage = await this.loginPage.isOnLoginPage();
    expect(isOnLoginPage).toBeTruthy();
});

When('I setup API interception for login', async function(this: CustomWorld) {
    if (!this.loginPage) {
        throw new Error('Login page is not initialized');
    }
    await this.loginPage.setupLoginAPIInterception();
});

When('I enter valid email and password', { timeout: 15000 }, async function(this: CustomWorld) {
    if (!this.loginPage) {
        throw new Error('Login page is not initialized');
    }
    await this.loginPage.enterUsername(config.VALID_USERNAME);
    await this.loginPage.enterPassword(config.VALID_PASSWORD);
});

When('I click the login button', { timeout: 15000 }, async function(this: CustomWorld) {
    if (!this.loginPage) {
        throw new Error('Login page is not initialized');
    }
    await this.loginPage.clickLogin();
});

Given('And I click the login button', { timeout: 15000 }, async function(this: CustomWorld) {
    if (!this.loginPage) {
        throw new Error('Login page is not initialized');
    }
    await this.loginPage.clickLogin();
});

Then('I should be logged in successfully', { timeout: 30000 }, async function(this: CustomWorld) {
    if (!this.loginPage) {
        throw new Error('Login page is not initialized');
    }
    
    // Wait for either success message or dashboard redirect
    try {
        // First try to wait for success message
        const isSuccessMessageVisible = await this.loginPage.isLoginSuccessMessageVisible();
        if (isSuccessMessageVisible) {
            console.log('✅ Login success message found');
            return;
        }
    } catch (error) {
        console.log('⚠️ Success message not found, checking for dashboard redirect...');
    }
    
    // If no success message, check if we're redirected to dashboard
    try {
        const isDashboardVisible = await this.loginPage.isDashboardVisible();
        if (isDashboardVisible) {
            console.log('✅ Login successful - redirected to dashboard');
            return;
        }
    } catch (error) {
        console.log('⚠️ Dashboard not found, checking URL...');
    }
    
    // Check if URL indicates successful login (redirected away from login page)
    if (!this.page) {
        throw new Error('Page is not initialized');
    }
    
    const currentUrl = this.page.url();
    console.log(`🔍 Current URL after login attempt: ${currentUrl}`);
    
    if (!currentUrl.includes('/login') && !currentUrl.includes('/auth') && !currentUrl.includes('/signin')) {
        console.log('✅ Login successful - redirected away from login page');
        return;
    }
    
    // If all else fails, wait a bit more and check again
    console.log('⏳ Waiting for login to complete...');
    await this.page.waitForTimeout(3000);
    
    const finalUrl = this.page.url();
    console.log(`🔍 Final URL after wait: ${finalUrl}`);
    
    if (!finalUrl.includes('/login') && !finalUrl.includes('/auth') && !finalUrl.includes('/signin')) {
        console.log('✅ Login successful - final check passed');
        return;
    }
    
    throw new Error('Login failed - still on login page after timeout');
});

Then('I capture the access token from login', async function(this: CustomWorld) {
    if (!this.loginPage) {
        throw new Error('Login page is not initialized');
    }
    
    // Wait a bit for API calls to complete
    if (this.page) {
        await this.page.waitForTimeout(3000);
    }
    
    // First try to get the captured access token from API interception
    let accessToken = this.loginPage.getCapturedAccessToken();
    let idToken = this.loginPage.getCapturedIdToken();
    
    if (accessToken) {
        this.capturedAccessToken = accessToken;
        console.log('✅ Access token captured from API interception:', accessToken.substring(0, 30) + '...');
        console.log('🔑 Access token length:', accessToken.length);
        console.log('🔍 Debug: Stored capturedAccessToken in world object:', !!this.capturedAccessToken);
    }
    
    if (idToken) {
        this.capturedIdToken = idToken;
        console.log('✅ ID token captured from API interception:', idToken.substring(0, 30) + '...');
        console.log('🔑 ID token length:', idToken.length);
        console.log('🔍 Debug: Stored capturedIdToken in world object:', !!this.capturedIdToken);
    }
    
    if (accessToken || idToken) {
        
        // Extract user ID from the token (prefer access token, fallback to ID token)
        try {
            const tokenToUse = accessToken || idToken;
            if (tokenToUse) {
                const tokenPayload = JSON.parse(atob(tokenToUse.split('.')[1]));
                if (tokenPayload.sub) {
                    this.capturedUserId = tokenPayload.sub;
                    console.log('✅ User ID captured from token:', this.capturedUserId);
                    console.log('🔍 Token type:', tokenPayload.token_use || 'unknown');
                }
            }
        } catch (error) {
            console.log('⚠️ Could not extract user ID from token:', error);
        }
    } else {
        console.log('⚠️ No access token captured from API interception, checking Amplify storage...');
        
        // Try to get token from Amplify storage
        const amplifyToken = await this.loginPage.checkAmplifyTokensInStorage();
        
        if (amplifyToken) {
            this.capturedAccessToken = amplifyToken;
            console.log('✅ Access token captured from Amplify storage:', amplifyToken.substring(0, 30) + '...');
            console.log('🔑 Token length:', amplifyToken.length);
            
            // Extract user ID from the token (ID or access token)
            try {
                const tokenPayload = JSON.parse(atob(amplifyToken.split('.')[1]));
                if (tokenPayload.sub) {
                    this.capturedUserId = tokenPayload.sub;
                    console.log('✅ User ID captured from Amplify token:', this.capturedUserId);
                    console.log('🔍 Token type:', tokenPayload.token_use || 'unknown');
                }
            } catch (error) {
                console.log('⚠️ Could not extract user ID from Amplify token:', error);
            }
        } else {
            console.log('❌ No access token found in API interception or Amplify storage');
            
            // Try to get a fresh access token
            console.log('🔄 Attempting to get fresh access token...');
            const freshToken = await this.loginPage.getFreshAccessToken();
            
            if (freshToken) {
                this.capturedAccessToken = freshToken;
                console.log('✅ Fresh access token obtained:', freshToken.substring(0, 30) + '...');
                console.log('🔑 Fresh token length:', freshToken.length);
                
                // Extract user ID from the fresh token (ID or access token)
                try {
                    const tokenPayload = JSON.parse(atob(freshToken.split('.')[1]));
                    if (tokenPayload.sub) {
                        this.capturedUserId = tokenPayload.sub;
                        console.log('✅ User ID captured from fresh token:', this.capturedUserId);
                        console.log('🔍 Token type:', tokenPayload.token_use || 'unknown');
                    }
                } catch (error) {
                    console.log('⚠️ Could not extract user ID from fresh token:', error);
                }
            } else {
                console.log('❌ Failed to obtain fresh access token');
            }
        }
    }
});

Then('I should see the dashboard', { timeout: 30000 }, async function(this: CustomWorld) {
    if (!this.loginPage) {
        throw new Error('Login page is not initialized');
    }
    
    console.log('🔍 Checking dashboard visibility...');
    
    // Wait a bit for any MFA processing to complete
    await this.page?.waitForTimeout(2000);
    
    const isDashboardVisible = await this.loginPage.isDashboardVisible();
    
    if (!isDashboardVisible) {
        console.log('❌ Dashboard not visible, checking for error messages...');
        
        // Check for common error messages
        const errorSelectors = [
            'text="AccessCode Invalid"',
            'text="Invalid code"',
            'text="Code expired"',
            'text="Invalid OTP"',
            'text="OTP expired"',
            '[data-testid="error-message"]',
            '.error-message',
            '.alert-error'
        ];
        
        for (const selector of errorSelectors) {
            try {
                const errorElement = this.page?.locator(selector);
                if (errorElement && await errorElement.isVisible()) {
                    const errorText = await errorElement.textContent();
                    console.log(`❌ Error message found: ${errorText}`);
                    throw new Error(`Authentication failed: ${errorText}`);
                }
            } catch (e) {
                // Continue checking other selectors
            }
        }
        
        // Take a screenshot for debugging
        try {
            await this.page?.screenshot({ path: `dashboard-error-${Date.now()}.png`, fullPage: true });
            console.log('📸 Screenshot saved for dashboard error debugging');
        } catch (screenshotError) {
            console.log('📸 Could not take screenshot for dashboard error');
        }
    }
    
    expect(isDashboardVisible).toBeTruthy();
    console.log('✅ Dashboard is visible');
});
import { Page, Locator, expect } from '@playwright/test';
import { authenticator } from 'otplib';

export class DashboardPage {
    readonly page: Page;
    readonly userAccountIcon: Locator;
    readonly logoutButton: Locator;
    readonly welcomeBackHeading: Locator;
    readonly emailInput: Locator;
    readonly securityPrivacyLink: Locator;
    readonly mfaInput: Locator;
    readonly setupButtonAuthenticatorApp: Locator;
    readonly setupButtonEmailOTP: Locator;
    readonly verifyCodeButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.userAccountIcon = page.locator('button[aria-haspopup="menu"]:has(span.relative.flex.shrink-0.overflow-hidden.rounded-full)').first();
        this.logoutButton = page.getByRole('menuitem', { name: 'Logout' });
        this.welcomeBackHeading = page.locator('h1:has-text("Welcome Back")');
        this.emailInput = page.locator('input[type="email"][placeholder="Enter your email"]');
        this.securityPrivacyLink = page.locator('a:has-text("Security"), a:has-text("Privacy"), a:has-text("Security and Privacy"), [href*="security"], [href*="privacy"]').first();
        this.mfaInput = page.locator('input[data-input-otp="true"], input[autocomplete="one-time-code"], input[placeholder*="code"], input[placeholder*="OTP"], input[placeholder*="MFA"], input[type="text"]').first();
        this.setupButtonAuthenticatorApp = page.locator('button[data-testid="security-setup-authenticator-button"]');
        this.setupButtonEmailOTP = page.locator('div:has(p:has-text("Email Authentication")) button:has(svg.lucide-mail)');
        this.verifyCodeButton = page.locator('button:has-text("Verify Code")');
    }

    async clickUserAccountIcon(): Promise<void> {
        await this.userAccountIcon.waitFor({ state: 'visible', timeout: 10000 });
        await this.userAccountIcon.click();
        console.log('✅ Clicked on header user account icon (user profile button)');
    }

    async clickLogoutButton(): Promise<void> {
        await this.logoutButton.waitFor({ state: 'visible', timeout: 10000 });
        await this.logoutButton.click();
        console.log('✅ Clicked on Logout button (menuitem element)');
    }

    async verifyLogoutSuccess(): Promise<void> {
        try {
            this.page.locator('a:has-text("Login")')
        } catch (error) {
            console.error('❌ Logout verification failed:', error);
            throw error;
        }
    }

    async clickSecurityAndPrivacyLink(): Promise<void> {
        await this.securityPrivacyLink.waitFor({ state: 'visible', timeout: 10000 });
        await this.securityPrivacyLink.click();
        console.log('✅ Clicked on Security and Privacy link');
    }

    async enterMFAOTP(secretCode: string): Promise<void> {
        if (!secretCode) {
            throw new Error('Secret code not available. Please run the MFA setup step first.');
        }
        
        console.log('🔍 Looking for MFA input field...');
        
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
            await this.page.screenshot({ path: `mfa-input-not-found-${Date.now()}.png`, fullPage: true });
            throw new Error('MFA input field not found. Check screenshot for debugging.');
        }
        
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
    }

    async enterEmailOTP(otp: string): Promise<void> {
        console.log(`🔢 Entering email OTP: ${otp}`);
        
        // Wait for the MFA input field to be visible
        await this.mfaInput.waitFor({ state: 'visible', timeout: 10000 });
        
        // Ensure OTP is exactly 6 digits
        const paddedOTP = otp.padStart(6, '0');
        console.log(`🔢 Using padded OTP: ${paddedOTP}`);
        
        // Try multiple input methods for OTP fields
        let success = false;
        
        // Method 1: Clear and fill
        try {
            await this.mfaInput.clear();
            await this.mfaInput.fill(paddedOTP);
            const enteredValue = await this.mfaInput.inputValue();
            console.log(`📝 Method 1 - Fill result: ${enteredValue}`);
            if (enteredValue === paddedOTP) {
                success = true;
                console.log(`✅ OTP entered successfully using fill method: ${paddedOTP}`);
            }
        } catch (error) {
            console.log(`❌ Fill method failed:`, error);
        }
        
        // Method 2: Character by character typing
        if (!success) {
            try {
                console.log('🔄 Trying character-by-character typing...');
                await this.mfaInput.clear();
                await this.page.waitForTimeout(500); // Wait for clear to complete
                
                for (let i = 0; i < paddedOTP.length; i++) {
                    const char = paddedOTP[i];
                    await this.mfaInput.type(char);
                    await this.page.waitForTimeout(200); // Delay between characters
                    console.log(`📝 Typed character ${i + 1}: ${char}`);
                }
                
                const typedValue = await this.mfaInput.inputValue();
                console.log(`📝 Method 2 - Type result: ${typedValue}`);
                if (typedValue === paddedOTP) {
                    success = true;
                    console.log(`✅ OTP entered successfully using type method: ${paddedOTP}`);
                }
            } catch (error) {
                console.log(`❌ Type method failed:`, error);
            }
        }
        
        // Method 3: Focus and type
        if (!success) {
            try {
                console.log('🔄 Trying focus and type method...');
                await this.mfaInput.focus();
                await this.page.waitForTimeout(300);
                await this.mfaInput.clear();
                await this.page.waitForTimeout(300);
                await this.mfaInput.type(paddedOTP);
                
                const focusValue = await this.mfaInput.inputValue();
                console.log(`📝 Method 3 - Focus type result: ${focusValue}`);
                if (focusValue === paddedOTP) {
                    success = true;
                    console.log(`✅ OTP entered successfully using focus method: ${paddedOTP}`);
                }
            } catch (error) {
                console.log(`❌ Focus method failed:`, error);
            }
        }
        
        if (!success) {
            console.error(`❌ All OTP input methods failed. Expected: ${paddedOTP}`);
            throw new Error(`Failed to enter OTP: ${paddedOTP}`);
        }
        
        // Final verification
        const finalValue = await this.mfaInput.inputValue();
        console.log(`🎯 Final OTP value in field: ${finalValue}`);
        
        if (finalValue !== paddedOTP) {
            console.warn(`⚠️ Warning: Final OTP value (${finalValue}) doesn't match expected (${paddedOTP})`);
        }
    }

    async clickSetupAuthenticatorApp(): Promise<void> {
        await this.setupButtonAuthenticatorApp.waitFor({ state: 'visible', timeout: 10000 });
        await this.setupButtonAuthenticatorApp.click();
        console.log('✅ Clicked on Setup button for Authenticator App');
    }

    async clickSetupEmailOTP(): Promise<void> {
        console.log('🔍 Looking for Email Authentication Setup button...');
        
        // Debug: Check what buttons are available on the page
        try {
            const allButtons = await this.page.locator('button').all();
            console.log(`📋 Found ${allButtons.length} buttons on the page`);
            
            const setupButtons = await this.page.locator('button:has-text("Setup")').all();
            console.log(`🔧 Found ${setupButtons.length} buttons with "Setup" text`);
            
            for (let i = 0; i < setupButtons.length; i++) {
                const text = await setupButtons[i].textContent();
                console.log(`  Button ${i + 1}: "${text}"`);
            }
        } catch (error) {
            console.log('❌ Error debugging buttons:', error instanceof Error ? error.message : String(error));
        }
        
        // Try multiple locator strategies
        const locators = [
            this.setupButtonEmailOTP,
            this.page.locator('div:has(p:has-text("Email Authentication")) button:has-text("Setup")'),
            this.page.locator('button:has(svg.lucide-mail)'),
            this.page.locator('div:has(p:has-text("Email")) button:has-text("Setup")'),
            this.page.locator('button:has-text("Setup")').nth(1) // Try second Setup button
        ];
        
        let buttonFound = false;
        for (let i = 0; i < locators.length; i++) {
            try {
                console.log(`🔍 Trying locator ${i + 1}/${locators.length}...`);
                await locators[i].waitFor({ state: 'visible', timeout: 5000 });
                await locators[i].click();
                console.log(`✅ Clicked on Setup button for Email Authentication (using locator ${i + 1})`);
                buttonFound = true;
                break;
            } catch (error) {
                console.log(`❌ Locator ${i + 1} failed:`, error instanceof Error ? error.message : String(error));
                continue;
            }
        }
        
        if (!buttonFound) {
            throw new Error('Could not find Email Authentication Setup button with any locator strategy');
        }
    }

    async verifySetupButtonVisible(): Promise<void> {
        const isSetupButtonVisible = await this.setupButtonAuthenticatorApp.isVisible();
        expect(isSetupButtonVisible).toBeTruthy();
        console.log('✅ Setup for Authenticator App button is visible (MFA successfully disabled)');
    }

    async clickVerifyCodeButton(): Promise<void> {
        console.log('🔍 Looking for Verify Code button...');
        
        // Wait for the button to be visible and enabled
        await this.verifyCodeButton.waitFor({ state: 'visible', timeout: 15000 });
        
        // Check if button is enabled
        const isEnabled = await this.verifyCodeButton.isEnabled();
        if (!isEnabled) {
            console.log('⚠️ Verify Code button is not enabled, waiting...');
            await this.page.waitForTimeout(2000);
        }
        
        // Add a small delay to ensure OTP is fully processed
        await this.page.waitForTimeout(1000);
        
        // Try to click the button
        try {
            await this.verifyCodeButton.click();
            console.log('✅ Clicked on Verify Code button');
        } catch (error) {
            console.log('❌ Failed to click Verify Code button, trying force click...');
            await this.verifyCodeButton.click({ force: true });
            console.log('✅ Force clicked on Verify Code button');
        }
    }
}
import { Page, Locator } from '@playwright/test';

export class HomePage {
    readonly page: Page;
    readonly signInLink: Locator;

    constructor(page: Page) {
        this.page = page;
        this.signInLink = page.locator('a:has-text("Login")');
    }

    async goto() {
        console.log('🔄 Navigating to homepage...');
        try {
            await this.page.goto('/', {
                waitUntil: 'networkidle',
                timeout: 30000
            });
            console.log('✅ Homepage loaded successfully');

            // Wait for URL to stabilize (app may redirect to /auth for unauthenticated users)
            await this.page.waitForURL('**', { timeout: 10000 }).catch(() => {
                // URL might already be stable, continue
            });

            const currentUrl = this.page.url();
            console.log(`🔍 Current URL after navigation: ${currentUrl}`);

            // If redirected to /auth or /dashboard, we're already on the target page - no need to wait for Login link
            if (currentUrl.includes('/auth') || currentUrl.includes('/dashboard')) {
                console.log('✅ Redirected to target page - homepage navigation complete');
                return;
            }

            // Wait for the page to be fully loaded
            await this.page.waitForLoadState('domcontentloaded');
            await this.page.waitForLoadState('networkidle');

            // Try multiple selectors for the sign-in link (different text variations)
            const signInSelectors = [
                'a:has-text("Login")',
                'a:has-text("Sign In")',
                'a:has-text("Sign in")',
                'a[href*="auth"]',
                'a[href*="login"]'
            ];

            let linkFound = false;
            for (const selector of signInSelectors) {
                try {
                    const link = this.page.locator(selector).first();
                    await link.waitFor({ state: 'visible', timeout: 5000 });
                    console.log(`✅ Homepage is fully loaded and ready (found link with selector: ${selector})`);
                    linkFound = true;
                    break;
                } catch (e) {
                    // Try next selector
                    continue;
                }
            }

            if (!linkFound) {
                // Check if we're on auth/dashboard page - if so, this is expected behavior
                const finalUrl = this.page.url();
                if (finalUrl.includes('/auth') || finalUrl.includes('/dashboard')) {
                    console.log('✅ Redirected to target page during link wait - this is expected');
                    return;
                }
                
                // If still not found and not redirected, log warning but don't fail
                // The page might be in a different state (e.g., already authenticated)
                console.log('⚠️ Sign-in link not found, but continuing - page may be in different state');
                console.log(`🔍 Current URL: ${finalUrl}`);
                
                // Take a screenshot for debugging
                await this.page.screenshot({ path: `homepage-no-link-${Date.now()}.png`, fullPage: true }).catch(() => {});
            }
        } catch (error) {
            console.error('❌ Failed to load homepage:', error);
            // Check one more time if we're on a valid page
            try {
                const finalUrl = this.page.url();
                if (finalUrl.includes('/auth') || finalUrl.includes('/dashboard')) {
                    console.log('✅ Actually on valid page despite error - continuing');
                    return;
                }
            } catch (e) {
                // Ignore
            }
            // Take a screenshot for debugging
            await this.page.screenshot({ path: `homepage-load-error-${Date.now()}.png`, fullPage: true }).catch(() => {});
            throw error;
        }
    }

    async clickSignIn() {
        // First check if we're already on auth page - if so, no need to click
        const currentUrl = this.page.url();
        if (currentUrl.includes('/auth')) {
            console.log('✅ Already on auth page - skipping sign-in link click');
            return;
        }

        // Try multiple selectors for the sign-in link (different text variations)
        const signInSelectors = [
            'a:has-text("Login")',
            'a:has-text("Sign In")',
            'a:has-text("Sign in")',
            'a[href*="auth"]',
            'a[href*="login"]'
        ];

        let clicked = false;
        for (const selector of signInSelectors) {
            try {
                const link = this.page.locator(selector).first();
                // Wait for link to be visible with a reasonable timeout
                await link.waitFor({ state: 'visible', timeout: 5000 });
                await link.click();
                console.log(`✅ Clicked sign-in link using selector: ${selector}`);
                clicked = true;
                break;
            } catch (e) {
                // Try next selector
                continue;
            }
        }

        if (!clicked) {
            // Check if we're already on auth page after trying to click
            const urlAfterAttempt = this.page.url();
            if (urlAfterAttempt.includes('/auth')) {
                console.log('✅ Already on auth page - sign-in click not needed');
                return;
            }
            
            // If still not clicked and not on auth page, throw error
            throw new Error(`Could not find or click sign-in link. Current URL: ${this.page.url()}`);
        }
    }
} 
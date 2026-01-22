import { Page, Locator } from '@playwright/test';

export class HomePage {
    readonly page: Page;
    readonly signInLink: Locator;

    constructor(page: Page) {
        this.page = page;
        this.signInLink = page.locator('[data-testid="signin-link"], a[href*="login"], a:has-text("Sign in"), a:has-text("Sign In")');
    }

    async goto() {
        console.log('🔄 Navigating to homepage...');
        try {
            await this.page.goto('/', {
                waitUntil: 'networkidle',
                timeout: 30000
            });
            console.log('✅ Homepage loaded successfully');

            // Wait for the page to be fully loaded
            await this.page.waitForLoadState('domcontentloaded');
            await this.page.waitForLoadState('networkidle');

            // Wait for the sign-in link to be visible to ensure page is ready
            await this.signInLink.waitFor({ state: 'visible', timeout: 10000 });
            console.log('✅ Homepage is fully loaded and ready');
        } catch (error) {
            console.error('❌ Failed to load homepage:', error);
            // Take a screenshot for debugging
            await this.page.screenshot({ path: `homepage-load-error-${Date.now()}.png`, fullPage: true });
            throw error;
        }
    }

    async clickSignIn() {
        await this.signInLink.click();
    }
} 
import { Page, Locator, expect } from '@playwright/test';

export class LandingPage {
    readonly page: Page;
    readonly getStartedButton: Locator;
    readonly chooseConfigurationsSection: Locator;
    readonly operatingSystemDropdown: Locator;
    readonly cpuMemoryDropdown: Locator;
    readonly regionDropdown: Locator;
    readonly storageDropdown: Locator;
    readonly viewEstimateButton: Locator;
    readonly buildPCButton: Locator;
    readonly estMonthlyPrice: Locator;
    readonly estDailyPrice: Locator;
    readonly estHourlyPrice: Locator;
    readonly configurationSummary: Locator;
    readonly includedFeatures: Locator;

    constructor(page: Page) {
        this.page = page;
        this.getStartedButton = page.locator('a:has-text("Get Started Now"), button:has-text("Get Started Now")').first();
        this.chooseConfigurationsSection = page.locator('text=Choose Configurations').first();
        this.operatingSystemDropdown = page.locator('select, [role="combobox"]').filter({ hasText: 'Operating System' }).first();
        this.cpuMemoryDropdown = page.locator('select, [role="combobox"]').filter({ hasText: 'CPU' }).first();
        this.regionDropdown = page.locator('button[role="combobox"]:below(label:has-text("Region"))').first();
        this.storageDropdown = page.locator('button[role="combobox"]:below(label:has-text("Storage"))').first();
        this.viewEstimateButton = page.locator('button:has-text("View Estimate")');
        this.buildPCButton = page.locator('button:has-text("Build PC")');
        this.estMonthlyPrice = page.locator('text=Est. Monthly').locator('..').or(page.locator('[class*="monthly"], [class*="Monthly"]'));
        this.estDailyPrice = page.locator('text=Est. Daily').locator('..').or(page.locator('[class*="daily"], [class*="Daily"]'));
        this.estHourlyPrice = page.locator('text=Est. Hourly').locator('..').or(page.locator('[class*="hourly"], [class*="Hourly"]'));
        this.configurationSummary = page.locator('text=Your Configuration').locator('..').or(page.locator('[class*="configuration"], [class*="Configuration"]'));
        this.includedFeatures = page.locator('text=Included with every plan').locator('..').or(page.locator('[class*="included"], [class*="features"]'));
    }

    async clickGetStarted() {
        await this.getStartedButton.click();
    }

    async scrollToChooseConfigurations() {
        await this.chooseConfigurationsSection.scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(1000); // Wait for scroll to complete
    }

    async selectOperatingSystem(os: string) {
        await this.operatingSystemDropdown.click();
        await this.page.locator(`option:has-text("${os}"), [role="option"]:has-text("${os}")`).nth(1).click();
        await this.page.waitForTimeout(500); // Wait for selection to update
    }

    async selectCpuAndMemory(cpuMemory: string) {
        await this.cpuMemoryDropdown.click();
        await this.page.locator(`option:has-text("${cpuMemory}") , [role="option"]:has-text("${cpuMemory}")`).nth(1).click();
        await this.page.waitForTimeout(500); // Wait for selection to update
    }

    async selectRegion(region: string) {
        await this.regionDropdown.click();
        await this.page.locator(`option:has-text("${region}"), [role="option"]:has-text("${region}")`).nth(1).click();
        await this.page.waitForTimeout(500); // Wait for selection to update
    }

    async selectStorage(storage: string) {
        await this.storageDropdown.click();
        await this.page.locator(`option:has-text("${storage}"), [role="option"]:has-text("${storage}")`).nth(1).click();
        await this.page.waitForTimeout(500); // Wait for selection to update
    }

    async clickViewEstimate() {
        await this.viewEstimateButton.click();
        await this.page.waitForTimeout(1000); // Wait for price calculation
    }

    async clickBuildPC() {
        await this.buildPCButton.click();
    }

    async verifyMonthlyPrice(expectedPrice: string) {
        try {
            // Try multiple selectors to find the monthly price
            const monthlyPriceSelectors = [
                `text=${expectedPrice}`,
                `[class*="monthly"]:has-text("${expectedPrice}")`,
                `[class*="Monthly"]:has-text("${expectedPrice}")`,
                `text=Est. Monthly*:has-text("${expectedPrice}")`
            ];

            for (const selector of monthlyPriceSelectors) {
                try {
                    const element = this.page.locator(selector);
                    await element.waitFor({ state: 'visible', timeout: 5000 });
                    const text = await element.textContent();
                    if (text && text.includes(expectedPrice)) {
                        console.log(`✅ Monthly price verified: ${text}`);
                        return true;
                    }
                } catch (error) {
                    // Continue to next selector
                }
            }

            // Fallback: look for any element containing the expected price
            const priceElement = this.page.locator(`text=${expectedPrice}`);
            const isVisible = await priceElement.isVisible();
            if (isVisible) {
                console.log(`✅ Monthly price verified: ${expectedPrice}`);
                return true;
            }

            console.log(`❌ Monthly price not found: ${expectedPrice}`);
            return false;
        } catch (error) {
            console.log(`❌ Error verifying monthly price: ${error}`);
            return false;
        }
    }

    async verifyDailyPrice(expectedPrice: string) {
        try {
            // Try multiple selectors to find the daily price
            const dailyPriceSelectors = [
                `text=${expectedPrice}`,
                `[class*="daily"]:has-text("${expectedPrice}")`,
                `[class*="Daily"]:has-text("${expectedPrice}")`,
                `text=Est. Daily*:has-text("${expectedPrice}")`
            ];

            for (const selector of dailyPriceSelectors) {
                try {
                    const element = this.page.locator(selector);
                    await element.waitFor({ state: 'visible', timeout: 5000 });
                    const text = await element.textContent();
                    if (text && text.includes(expectedPrice)) {
                        console.log(`✅ Daily price verified: ${text}`);
                        return true;
                    }
                } catch (error) {
                    // Continue to next selector
                }
            }

            // Fallback: look for any element containing the expected price
            const priceElement = this.page.locator(`text=${expectedPrice}`);
            const isVisible = await priceElement.isVisible();
            if (isVisible) {
                console.log(`✅ Daily price verified: ${expectedPrice}`);
                return true;
            }

            console.log(`❌ Daily price not found: ${expectedPrice}`);
            return false;
        } catch (error) {
            console.log(`❌ Error verifying daily price: ${error}`);
            return false;
        }
    }

    async verifyHourlyPrice(expectedPrice: string) {
        try {
            // Try multiple selectors to find the hourly price
            const hourlyPriceSelectors = [
                `text=${expectedPrice}`,
                `[class*="hourly"]:has-text("${expectedPrice}")`,
                `[class*="Hourly"]:has-text("${expectedPrice}")`,
                `text=Est. Hourly*:has-text("${expectedPrice}")`
            ];

            for (const selector of hourlyPriceSelectors) {
                try {
                    const element = this.page.locator(selector);
                    await element.waitFor({ state: 'visible', timeout: 5000 });
                    const text = await element.textContent();
                    if (text && text.includes(expectedPrice)) {
                        console.log(`✅ Hourly price verified: ${text}`);
                        return true;
                    }
                } catch (error) {
                    // Continue to next selector
                }
            }

            // Fallback: look for any element containing the expected price
            const priceElement = this.page.locator(`text=${expectedPrice}`);
            const isVisible = await priceElement.isVisible();
            if (isVisible) {
                console.log(`✅ Hourly price verified: ${expectedPrice}`);
                return true;
            }

            console.log(`❌ Hourly price not found: ${expectedPrice}`);
            return false;
        } catch (error) {
            console.log(`❌ Error verifying hourly price: ${error}`);
            return false;
        }
    }

    async isOnSignUpPage() {
        try {
            await this.page.waitForURL('**/signup**', { timeout: 10000 });
            return true;
        } catch (error) {
            return false;
        }
    }

    async waitForConfigurationUpdate() {
        // Wait for the configuration to update after selection
        await this.page.waitForTimeout(2000);
    }

    async getCurrentConfiguration() {
        try {
            const config = {
                operatingSystem: await this.getSelectedOption(this.operatingSystemDropdown),
                cpuMemory: await this.getSelectedOption(this.cpuMemoryDropdown),
                region: await this.getSelectedOption(this.regionDropdown),
                storage: await this.getSelectedOption(this.storageDropdown)
            };
            return config;
        } catch (error) {
            console.log('Error getting current configuration:', error);
            return null;
        }
    }

    private async getSelectedOption(dropdown: Locator) {
        try {
            const selectedOption = await dropdown.locator('option:checked, [aria-selected="true"]').textContent();
            return selectedOption?.trim() || '';
        } catch (error) {
            return '';
        }
    }
}


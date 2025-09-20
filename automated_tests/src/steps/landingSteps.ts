import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

Given('I click on get started', async function(this: CustomWorld) {
    if (!this.page) {
        throw new Error('Page is not initialized');
    }
    
    if (!this.landingPage) {
        this.landingPage = new (await import('../pages/landingPage')).LandingPage(this.page);
    }
    
    await this.landingPage.clickGetStarted();
    await this.page!.waitForLoadState('networkidle');
});

Given('I scroll down to Choose configurations', async function(this: CustomWorld) {
    if (!this.page) {
        throw new Error('Page is not initialized');
    }
    
    if (!this.landingPage) {
        this.landingPage = new (await import('../pages/landingPage')).LandingPage(this.page);
    }
    
    await this.landingPage.scrollToChooseConfigurations();
});

When('I select operating system as {string}', async function(this: CustomWorld, operatingSystem: string) {
    if (!this.landingPage) {
        throw new Error('LandingPage is not initialized');
    }
    
    await this.landingPage.selectOperatingSystem(operatingSystem);
    await this.landingPage.waitForConfigurationUpdate();
});

When('I select cpu and memory as {string}', async function(this: CustomWorld, cpuMemory: string) {
    if (!this.landingPage) {
        throw new Error('LandingPage is not initialized');
    }
    
    await this.landingPage.selectCpuAndMemory(cpuMemory);
    await this.landingPage.waitForConfigurationUpdate();
});

When('I select region as {string}', async function(this: CustomWorld, region: string) {
    if (!this.landingPage) {
        throw new Error('LandingPage is not initialized');
    }
    
    await this.landingPage.selectRegion(region);
    await this.landingPage.waitForConfigurationUpdate();
});

When('I select storage as {string}', async function(this: CustomWorld, storage: string) {
    if (!this.landingPage) {
        throw new Error('LandingPage is not initialized');
    }
    
    await this.landingPage.selectStorage(storage);
    await this.landingPage.waitForConfigurationUpdate();
});

When('I click on view estimate button', async function(this: CustomWorld) {
    if (!this.landingPage) {
        throw new Error('LandingPage is not initialized');
    }
    
    await this.landingPage.clickViewEstimate();
});

Then('I should be able to verify Est. Monthly {string}', async function(this: CustomWorld, expectedPrice: string) {
    if (!this.landingPage) {
        throw new Error('LandingPage is not initialized');
    }
    
    const isPriceCorrect = await this.landingPage.verifyMonthlyPrice(expectedPrice);
    expect(isPriceCorrect).toBeTruthy();
});

Then('I should be able to verify Est. Daily {string}', async function(this: CustomWorld, expectedPrice: string) {
    if (!this.landingPage) {
        throw new Error('LandingPage is not initialized');
    }
    
    const isPriceCorrect = await this.landingPage.verifyDailyPrice(expectedPrice);
    expect(isPriceCorrect).toBeTruthy();
});

Then('I should be able to verify Est. Hourly {string}', async function(this: CustomWorld, expectedPrice: string) {
    if (!this.landingPage) {
        throw new Error('LandingPage is not initialized');
    }
    
    const isPriceCorrect = await this.landingPage.verifyHourlyPrice(expectedPrice);
    expect(isPriceCorrect).toBeTruthy();
});



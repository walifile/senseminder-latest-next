import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

When('I click on Assign User button for that PC', async function(this: CustomWorld) {
    if (!this.sensePCPage) {
        throw new Error('SensePCPage is not initialized');
    }
    
    await this.sensePCPage.clickAssignUserButton();
});

Then('I should be able to see {string} modal', async function(this: CustomWorld, modalTitle: string) {
    if (!this.sensePCPage) {
        throw new Error('SensePCPage is not initialized');
    }
    
    const isModalVisible = await this.sensePCPage.isAssignSmartPCModalVisible();
    expect(isModalVisible).toBeTruthy();
});

Then('I should be able to verify Assign to Member displays {string}', { timeout: 30000 }, async function(this: CustomWorld, userName: string) {
    if (!this.sensePCPage) {
        throw new Error('SensePCPage is not initialized');
    }
    
    const isUserDisplayed = await this.sensePCPage.verifyAssignToMemberDisplaysUser(userName);
    expect(isUserDisplayed).toBeTruthy();
});

When('I click on {string} user', { timeout: 30000 }, async function(this: CustomWorld, userName: string) {
    if (!this.sensePCPage) {
        throw new Error('SensePCPage is not initialized');
    }
    
    await this.sensePCPage.clickUser(userName);
});

When('I click on assign user button', { timeout: 30000 }, async function(this: CustomWorld) {
    if (!this.sensePCPage) {
        throw new Error('SensePCPage is not initialized');
    }
    
    await this.sensePCPage.clickAssignUserConfirmButton();
    
    // Wait for the assignment to be processed and reflected in the UI
    console.log('⏳ Waiting for user assignment to be processed...');
    await this.sensePCPage.page?.waitForTimeout(5000);
    console.log('✅ Assignment processing wait completed');
});

When('I click on PC name {string}', async function(this: CustomWorld, pcName: string) {
    if (!this.sensePCPage) {
        throw new Error('SensePCPage is not initialized');
    }
    
    await this.sensePCPage.clickOnPCName(pcName);
});

When('I click on the newly created PC name', { timeout: 30000 }, async function(this: CustomWorld) {
    if (!this.sensePCPage) {
        throw new Error('SensePCPage is not initialized');
    }
    
    const computerName = this.sensePCPage.getComputerName(this);
    console.log("COMPUTER NAME IS: "+computerName)
    if (!computerName) {
        throw new Error('Computer name is not available. Make sure PC was created first.');
    }
    
    console.log(`🔍 Clicking on newly created PC name: ${computerName}`);
    
    // Wait a bit more to ensure the assignment is fully reflected in the UI
    console.log('⏳ Waiting for assignment to be reflected in PC list...');
    await this.sensePCPage.page?.waitForTimeout(3000);
    
    await this.sensePCPage.clickOnPCName(computerName);
    
    // Wait for the PC details to load after clicking
    console.log('⏳ Waiting for PC details to load...');
    await this.sensePCPage.page?.waitForTimeout(2000);
    console.log('✅ PC details load wait completed');
});

Then('I should be able to see {string} user is assigned to PC', { timeout: 30000 }, async function(this: CustomWorld, userName: string) {
    if (!this.sensePCPage) {
        throw new Error('SensePCPage is not initialized');
    }
    
    const isUserAssigned = await this.sensePCPage.verifyUserAssignedToPC(userName);
    expect(isUserAssigned).toBeTruthy();
});


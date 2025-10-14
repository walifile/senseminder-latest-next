import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { SenseStoragePage } from '../pages/senseStoragePage';

Given('I navigate to the Sense Storage page', { timeout: 30000 }, async function(this: CustomWorld) {
    if (!this.page) {
        throw new Error('Page is not initialized');
    }
    this.senseStoragePage = new SenseStoragePage(this.page);
    await this.senseStoragePage.navigateToStoragePage();
});

Given('And I navigate to the Sense Storage page', { timeout: 30000 }, async function(this: CustomWorld) {
    if (!this.page) {
        throw new Error('Page is not initialized');
    }
    this.senseStoragePage = new SenseStoragePage(this.page);
    await this.senseStoragePage.navigateToStoragePage();
});

// Upload functionality steps
Given('I click on the Upload button', async function(this: CustomWorld) {
    const isModalVisible = await this.senseStoragePage!.validateUploadButtonClick();
    expect(isModalVisible).toBeTruthy();
});

When('I upload a file {string} with size less than 10MB', async function(this: CustomWorld, fileName: string) {
    await this.senseStoragePage!.uploadFileWithValidation(fileName, 1);
});

When('I upload multiple files {string} with total size less than 10MB', async function(this: CustomWorld, fileNames: string) {
    const files = fileNames.split(',').map(name => name.trim());
    await this.senseStoragePage!.uploadMultipleFilesWithValidation(files, 1);
});

Given('I have uploaded a file {string}', async function(this: CustomWorld, fileName: string) {
    await this.senseStoragePage!.uploadFileWithValidation(fileName, 1);
    await this.senseStoragePage!.waitForUploadComplete();
});

Then('I should see the file content displayed for {string}', async function(this: CustomWorld, fileName: string) {
    const isContentVisible = await this.senseStoragePage!.validateFileContentDisplayed(fileName);
    expect(isContentVisible).toBeTruthy();
});

Then('I should be able to close the file viewer for {string}', async function(this: CustomWorld, fileName: string) {
    const isViewerClosed = await this.senseStoragePage!.validateFileViewerClosed(fileName);
    expect(isViewerClosed).toBeTruthy();
});

// New file menu and actions steps
When('I click on menu of the file {string} in the file list', async function(this: CustomWorld, fileName: string) {
    await this.senseStoragePage!.clickFileMenu(fileName);
});

When('I click on view button in the menu', async function(this: CustomWorld) {
    await this.senseStoragePage!.clickViewButton();
});

Then('The file viewer should open with title containing {string}', async function(this: CustomWorld, expectedTitle: string) {
    const isViewerOpen = await this.senseStoragePage!.validateFileViewerOpenWithTitle(expectedTitle);
    expect(isViewerOpen).toBeTruthy();
});

When('I click on the menu at the top right corner', async function(this: CustomWorld) {
    await this.senseStoragePage!.clickTopRightMenu();
});

When('I click on deleted selected button', async function(this: CustomWorld) {
    await this.senseStoragePage!.clickDeleteSelectedButton();
});

When('I click on confirm delete button', async function(this: CustomWorld) {
    await this.senseStoragePage!.clickConfirmDeleteButton();
});

Then('I should see the status of {string} is set to {string}', async function(this: CustomWorld, fileName: string, status: string) {
    const isStatusCorrect = await this.senseStoragePage!.validateFileStatus(fileName, status);
    expect(isStatusCorrect).toBeTruthy();
});

// Bulk operations steps
Given('I have uploaded multiple files {string}', async function(this: CustomWorld, fileNames: string) {
    const files = fileNames.split(',').map(name => name.trim());
    await this.senseStoragePage!.uploadMultipleFilesWithValidation(files, 1);
    await this.senseStoragePage!.waitForUploadComplete();
});

When('I select the uploaded files {string}', async function(this: CustomWorld, fileNames: string) {
    const files = fileNames.split(',').map(name => name.trim());
    await this.senseStoragePage!.selectMultipleFiles(files);
});

When('I click on the share button for file {string}', async function(this: CustomWorld, fileName: string) {
    // First dismiss any feedback popup that might be present
    // await this.sensePCPage!.handleSkipButtonIfPresent();
    await this.senseStoragePage!.clickShareButton(fileName);
});

When('I click on share button in the menu', async function(this: CustomWorld) {
    // First dismiss any feedback popup that might be present
    // await this.sensePCPage!.handleSkipButtonIfPresent();
    await this.senseStoragePage!.clickShareButton(''); // This will be handled by the menu context
});

When('I dismiss any feedback popup', { timeout: 30000 }, async function(this: CustomWorld) {
    try {
        await this.sensePCPage!.handleSkipButtonIfPresent();
    } catch (error) {
        console.log('⚠️ Failed to dismiss feedback popup, continuing with test:', error);
        // Don't fail the test if popup dismissal fails
    }
});

Then('The share modal should open with title containing {string}', async function(this: CustomWorld, expectedTitle: string) {
    const isValid = await this.senseStoragePage!.validateShareModalWithTitle(expectedTitle, this.captureScreenshot);
    expect(isValid).toBeTruthy();
});

When('I click on the share button', async function(this: CustomWorld) {
    await this.senseStoragePage!.clickShareConfirmButton();
});

Then('I should see a success message {string}', async function(this: CustomWorld, expectedMessage: string) {
    const isValid = await this.senseStoragePage!.validateSuccessMessage(expectedMessage);
    expect(isValid).toBeTruthy();
});

When('I click on close button', async function(this: CustomWorld) {
    await this.senseStoragePage!.clickShareCloseButton();
});

Then('I should be able to see the file in the file list', async function(this: CustomWorld) {
    const isValid = await this.senseStoragePage!.validateFileListNotEmpty();
    expect(isValid).toBeTruthy();
});

Then('All files should appear in the file list', async function(this: CustomWorld) {
    const isValid = await this.senseStoragePage!.validateFileListNotEmpty();
    expect(isValid).toBeTruthy();
});

Then('The selected files {string} should not appear in the file list', async function(this: CustomWorld, fileNames: string) {
    const files = fileNames.split(',').map(name => name.trim());
    const filesDeleted = await this.senseStoragePage!.validateFilesNotInList(files);
    expect(filesDeleted).toBeTruthy();
});

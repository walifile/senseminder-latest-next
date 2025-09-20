import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { SenseStoragePage } from '../pages/senseStoragePage';

Given('I navigate to the Sense Storage page', { timeout: 30000 }, async function(this: CustomWorld) {
    if (!this.page) {
        throw new Error('Page is not initialized');
    }
    this.senseStoragePage = new SenseStoragePage(this.page);
    await this.page.goto('/dashboard/storage');
    await this.page.waitForLoadState('networkidle');
});

Given('And I navigate to the Sense Storage page', { timeout: 30000 }, async function(this: CustomWorld) {
    if (!this.page) {
        throw new Error('Page is not initialized');
    }
    this.senseStoragePage = new SenseStoragePage(this.page);
    await this.page.goto('/dashboard/storage');
    await this.page.waitForLoadState('networkidle');
});

// Upload functionality steps
Given('I click on the Upload button', async function(this: CustomWorld) {
    await this.senseStoragePage!.clickUploadButton();
    const isModalVisible = await this.senseStoragePage!.isUploadModalVisible();
    expect(isModalVisible).toBeTruthy();
});

When('I upload a file {string} with size less than 10MB', async function(this: CustomWorld, fileName: string) {
    const filePath = await this.senseStoragePage!.createTestFile(fileName, 1); // 1MB file
    await this.senseStoragePage!.uploadSingleFile(filePath);
});

When('I upload multiple files {string} with total size less than 10MB', async function(this: CustomWorld, fileNames: string) {
    const files = fileNames.split(',').map(name => name.trim());
    const filePaths: string[] = [];
    
    for (const fileName of files) {
        const filePath = await this.senseStoragePage!.createTestFile(fileName, 1); // 1MB per file
        filePaths.push(filePath);
    }
    
    await this.senseStoragePage!.uploadMultipleFiles(filePaths);
});

Given('I have uploaded a file {string}', async function(this: CustomWorld, fileName: string) {
    const filePath = await this.senseStoragePage!.createTestFile(fileName, 1);
    await this.senseStoragePage!.uploadSingleFile(filePath);
    await this.senseStoragePage!.waitForUploadComplete();
});

Then('I should see the file content displayed for {string}', async function(this: CustomWorld, fileName: string) {
    const isContentVisible = await this.senseStoragePage!.isFileContentVisible(fileName);
    expect(isContentVisible).toBeTruthy();
});

Then('I should be able to close the file viewer for {string}', async function(this: CustomWorld, fileName: string) {
    await this.senseStoragePage!.closeFileViewer();
    const isViewerClosed = await this.senseStoragePage!.isFileViewerClosed(fileName);
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
    const isViewerOpen = await this.senseStoragePage!.isFileViewerOpenWithTitle(expectedTitle);
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
    const isStatusCorrect = await this.senseStoragePage!.isFileStatus(fileName, status);
    expect(isStatusCorrect).toBeTruthy();
});

// Bulk operations steps
Given('I have uploaded multiple files {string}', async function(this: CustomWorld, fileNames: string) {
    const files = fileNames.split(',').map(name => name.trim());
    const filePaths: string[] = [];
    
    for (const fileName of files) {
        const filePath = await this.senseStoragePage!.createTestFile(fileName, 1);
        filePaths.push(filePath);
    }
    
    await this.senseStoragePage!.uploadMultipleFiles(filePaths);
    await this.senseStoragePage!.waitForUploadComplete();
});

When('I select the uploaded files {string}', async function(this: CustomWorld, fileNames: string) {
    const files = fileNames.split(',').map(name => name.trim());
    await this.senseStoragePage!.selectMultipleFiles(files);
});

When('I click on the share button for file {string}', async function(this: CustomWorld, fileName: string) {
    await this.senseStoragePage!.clickShareButton(fileName);
});

When('I click on share button in the menu', async function(this: CustomWorld) {
    await this.senseStoragePage!.clickShareButton(''); // This will be handled by the menu context
});

Then('The share modal should open with title containing {string}', async function(this: CustomWorld, expectedTitle: string) {
    const isModalVisible = await this.senseStoragePage!.isShareModalVisible();
    expect(isModalVisible).toBeTruthy();
    
    // Check if the modal title contains the expected text
    const modalTitle = await this.senseStoragePage!.page.locator('[role="dialog"] h1, [role="dialog"] h2, [role="dialog"] [data-testid="modal-title"]').textContent();
    expect(modalTitle).toContain(expectedTitle);
});

When('I click on the share button', async function(this: CustomWorld) {
    await this.senseStoragePage!.clickShareConfirmButton();
});

Then('I should see a success message {string}', async function(this: CustomWorld, expectedMessage: string) {
    await this.senseStoragePage!.waitForUploadComplete();
    const isSuccessVisible = await this.senseStoragePage!.isSuccessMessageVisible();
    expect(isSuccessVisible).toBeTruthy();
    
    const actualMessage = await this.senseStoragePage!.getSuccessMessage();
    expect(actualMessage).toContain(expectedMessage);
});

When('I click on close button', async function(this: CustomWorld) {
    await this.senseStoragePage!.clickShareCloseButton();
});

Then('I should be able to see the file in the file list', async function(this: CustomWorld) {
    await this.senseStoragePage!.waitForUploadComplete();
    const fileList = await this.senseStoragePage!.getFileList();
    expect(fileList.length).toBeGreaterThan(0);
});

Then('All files should appear in the file list', async function(this: CustomWorld) {
    await this.senseStoragePage!.waitForUploadComplete();
    const fileList = await this.senseStoragePage!.getFileList();
    expect(fileList.length).toBeGreaterThan(0);
});

Then('The selected files {string} should not appear in the file list', async function(this: CustomWorld, fileNames: string) {
    if (this.page) {
        await this.page.waitForTimeout(2000);
    }
    const files = fileNames.split(',').map(name => name.trim());
    const filesDeleted = await this.senseStoragePage!.isFilesDeleted(files);
    expect(filesDeleted).toBeTruthy();
});

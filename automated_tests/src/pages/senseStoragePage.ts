import { Page, Locator, expect } from '@playwright/test';

export class SenseStoragePage {
    readonly page: Page;
    readonly uploadButton: Locator;
    readonly uploadModal: Locator;
    readonly regionDropdown: Locator;
    readonly fileInput: Locator;
    readonly uploadFilesButton: Locator;
    readonly progressIndicator: Locator;
    readonly successMessage: Locator;
    readonly errorMessage: Locator;
    readonly fileList: Locator;
    
    // File viewer elements
    readonly fileViewerClose: Locator;
    
    // Bulk operations elements
    readonly selectAllCheckbox: Locator;
    readonly bulkDeleteButton: Locator;
    readonly bulkDeleteConfirm: Locator;
    
    // File sharing elements
    readonly shareButton: Locator;
    readonly shareModal: Locator;
    readonly shareConfirmButton: Locator;
    readonly shareCloseButton: Locator;
    
    // File menu and actions elements
    readonly fileMenuButton: Locator;
    readonly fileMenuDropdown: Locator;
    readonly viewButton: Locator;
    readonly deleteButton: Locator;
    readonly topRightMenu: Locator;
    readonly deleteSelectedButton: Locator;
    readonly fileStatus: Locator;
    readonly confirmDeleteButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.uploadButton = page.getByText('Upload', {exact: true});
        this.uploadModal = page.locator('[role="dialog"]:has-text("Upload Files")');
        this.regionDropdown = this.uploadModal.locator('select, [role="combobox"]:has-text("Select Region")');
        this.fileInput = this.uploadModal.locator('input[type="file"]');
        this.uploadFilesButton = this.uploadModal.locator('button:has-text("Upload Files")');
        this.progressIndicator = this.uploadModal.locator('[data-testid="progress"], .progress, [class*="progress"]');
        this.successMessage = page.locator('[data-testid="success-message"], .success-message, [class*="success"]');
        this.errorMessage = page.locator('[data-testid="error-message"], .error-message, [class*="error"]');
        this.fileList = page.locator('tbody tr');
        
        // File viewer elements
        this.fileViewerClose = page.locator('button:has-text("Close")');

        // Bulk operations elements
        this.selectAllCheckbox = page.locator('[data-testid="select-all"], input[type="checkbox"]:has-text("Select All")');
        this.bulkDeleteButton = page.locator('button:has-text("Delete Selected"), button:has-text("Bulk Delete")');
        this.bulkDeleteConfirm = page.locator('button:has-text("Confirm Delete"), button:has-text("Yes, Delete")');
        
        // File sharing elements
        this.shareButton = page.locator('div[role="menuitem"]:has-text("Share")');;
        this.shareModal = page.locator('[role="dialog"]');
        this.shareConfirmButton = this.page.locator('div[role="dialog"] button:has-text("Share")');
        this.shareCloseButton = page.locator('button:has-text("Close")');
        
        // File menu and actions elements
        this.fileMenuButton = page.locator('[data-testid="file-menu"], .file-menu-button, button[aria-label="File menu"]');
        this.fileMenuDropdown = page.locator('[data-testid="file-menu-dropdown"], .file-menu-dropdown, [role="menu"]');
        this.viewButton = page.locator('[data-testid="view-button"], button:has-text("View"), [role="menuitem"]:has-text("View")');
        this.deleteButton = page.locator('[data-testid="delete-button"], button:has-text("Delete"), [role="menuitem"]:has-text("Delete")');
        this.topRightMenu = page.locator('button:has(svg.lucide-ellipsis)').first();
        this.deleteSelectedButton = page.locator('div[role="menuitem"]', { hasText: "Delete Selected" });
        this.fileStatus = page.locator('[data-testid="file-status"], .file-status, [class*="status"]');
        this.confirmDeleteButton = page.locator('button:has-text("Confirm Delete")');
    }

    // Upload functionality
    async isUploadModalVisible(): Promise<boolean> {
        try {
            await this.uploadModal.waitFor({ state: 'visible', timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }

    async clickUploadButton(): Promise<void> {
        await this.uploadButton.click();
        await this.uploadModal.waitFor({ state: 'visible', timeout: 10000 });
    }

    async selectRegion(region: string): Promise<void> {
        await this.regionDropdown.click();
        await this.page.locator(`option:has-text("${region}"), [role="option"]:has-text("${region}")`).click();
    }

    async uploadSingleFile(filePath: string): Promise<void> {
        await this.fileInput.setInputFiles(filePath);
        await this.uploadFilesButton.click();
    }

    async uploadMultipleFiles(filePaths: string[]): Promise<void> {
        await this.fileInput.setInputFiles(filePaths);
        await this.uploadFilesButton.click();
    }

    async isUploadProgressVisible(): Promise<boolean> {
        try {
            await this.progressIndicator.waitFor({ state: 'visible', timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }

    async waitForUploadComplete(): Promise<void> {
        try {
            await Promise.race([
                this.progressIndicator.waitFor({ state: 'hidden', timeout: 30000 }),
                this.successMessage.waitFor({ state: 'visible', timeout: 30000 })
            ]);
        } catch (error) {
            if (await this.errorMessage.isVisible()) {
                throw new Error('Upload failed with error');
            }
            throw error;
        }
    }

    async isSuccessMessageVisible(): Promise<boolean> {
        try {
            await this.successMessage.waitFor({ state: 'visible', timeout: 10000 });
            return true;
        } catch {
            return false;
        }
    }

    async getSuccessMessage(): Promise<string> {
        await this.successMessage.waitFor({ state: 'visible', timeout: 10000 });
        return await this.successMessage.textContent() || '';
    }

    async isErrorMessageVisible(): Promise<boolean> {
        try {
            await this.errorMessage.waitFor({ state: 'visible', timeout: 10000 });
            return true;
        } catch {
            return false;
        }
    }

    async getErrorMessage(): Promise<string> {
        await this.errorMessage.waitFor({ state: 'visible', timeout: 10000 });
        return await this.errorMessage.textContent() || '';
    }

    async isFileInList(fileName: string): Promise<boolean> {
        try {
            const fileElement = this.fileList.locator(`:has-text("${fileName}")`);
            await fileElement.waitFor({ state: 'visible', timeout: 10000 });
            return true;
        } catch {
            return false;
        }
    }

    async getFileList(): Promise<string[]> {
        try {
            await this.fileList.first().waitFor({ state: 'visible', timeout: 10000 });
        } catch (error) {
            // If no files are visible, return empty array
            console.log('No files found in file list');
            return [];
        }

        const files = await this.fileList.all();
        const fileNames: string[] = [];
        
        for (const file of files) {
            const name = await file.textContent();
            if (name) {
                fileNames.push(name.trim());
            }
        }

        return fileNames;
    }

    // File viewer functionality
    async clickOnFile(fileName: string): Promise<void> {
        const fileElement = this.fileList.locator(`:has-text("${fileName}")`);
        await fileElement.click();
    }

    async isFileViewerClosed(fileName: String): Promise<boolean> {
        try {
            const fileViewer = this.page.locator(`iframe[title="${fileName}"]`)
            await fileViewer.waitFor({ state: 'hidden', timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }

    async isFileContentVisible(fileName: String): Promise<boolean> {
        try {
            const fileContent = this.page.locator(`iframe[title="${fileName}"]`)
            await fileContent.waitFor({ state: 'visible', timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }

    async closeFileViewer(): Promise<void> {
        await this.fileViewerClose.click();
    }

    // File menu and actions functionality
    async clickFileMenu(fileName: string): Promise<void> {
        const menuButton = this.page.locator(`tr:has-text("${fileName}") button:has(svg.lucide-ellipsis)`);
        await menuButton.click();
        await this.fileMenuDropdown.waitFor({ state: 'visible', timeout: 5000 });
    }

    async clickViewButton(): Promise<void> {
        await this.viewButton.click();
    }

    async clickDeleteButton(): Promise<void> {
        await this.deleteButton.click();
    }

    async clickTopRightMenu(): Promise<void> {
        await this.topRightMenu.click();
    }

    async clickDeleteSelectedButton(): Promise<void> {
        await this.deleteSelectedButton.click();
    }

    async isFileViewerOpenWithTitle(expectedTitle: string): Promise<boolean> {
        try {
            const fileViewer = this.page.locator(`h2:has-text("${expectedTitle}")`);
            await fileViewer.waitFor({ state: 'visible', timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }

    async isFileStatus(fileName: string, status: string): Promise<boolean> {
        try {
            const statusElement = this.page.locator('tr', {
                                         has: this.page.locator('span', { hasText: fileName })
                                       }).locator('div.inline-flex', { hasText: status });
            await statusElement.waitFor({ state: 'visible', timeout: 5000 });
            const statusText = await statusElement.textContent();
            return true;
        } catch {
            return false;
        }
    }

    // Bulk operations functionality
    async selectAllFiles(): Promise<void> {
        await this.selectAllCheckbox.check();
    }

    async selectMultipleFiles(fileNames: string[]): Promise<void> {
        for (const fileName of fileNames) {
            const checkbox = this.page.locator(`tr:has-text("${fileName}") button[role="checkbox"]`);
            await checkbox.click();
        }
    }

    async clickBulkDeleteButton(): Promise<void> {
        await this.bulkDeleteButton.click();
    }

    async confirmBulkDelete(): Promise<void> {
        await this.bulkDeleteConfirm.click();
    }

    async isFileDeleted(fileName: string): Promise<boolean> {
        try {
            const fileElement = this.fileList.locator(`:has-text("${fileName}")`);
            await fileElement.waitFor({ state: 'hidden', timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }

    async clickConfirmDeleteButton(): Promise<void> {
        await this.confirmDeleteButton.click();
    }

    async clickShareButton(fileName: string): Promise<void> {
        await this.shareButton.click();
    }

    async isShareModalVisible(): Promise<boolean> {
        try {
            await this.shareModal.waitFor({ state: 'visible', timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }

    async clickShareConfirmButton(): Promise<void> {
        await this.shareConfirmButton.click();
    }

    async clickShareCloseButton(): Promise<void> {
        await this.shareCloseButton.click();
    }

    async closeShareModal(): Promise<void> {
        await this.shareCloseButton.click();
        await this.shareModal.waitFor({ state: 'hidden', timeout: 5000 });
    }

    async createTestFile(fileName: string, sizeInMB: number = 1): Promise<string> {
        const filePath = `./test-files/${fileName}`;
        // Ensure test-files directory exists
        const fs = require('fs');
        if (!fs.existsSync('./test-files')) {
            fs.mkdirSync('./test-files', { recursive: true });
        }
        // Create a dummy file for testing
        fs.writeFileSync(filePath, 'Test file content');
        return filePath;
    }

    async isFilesDeleted(fileNames: string[]): Promise<boolean> {
        try{
            for (const fileName of fileNames) {
                const fileElement = this.page.locator(`tr:has-text("${fileName}")`);
                await fileElement.waitFor({ state: 'hidden', timeout: 5000 });
                }
            return true;
            }
        catch{
            return false;
            }
    }
}
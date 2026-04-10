import { Page, Locator, expect } from '@playwright/test';
import * as fs from 'fs';

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
        // Target the Close button in DialogFooter (not the X button in DialogHeader)
        // The footer Close button is NOT absolutely positioned, unlike the header X button
        this.fileViewerClose = page.locator('button:has-text("Close")').first();

        // Bulk operations elements
        this.selectAllCheckbox = page.locator('[data-testid="select-all"], input[type="checkbox"]:has-text("Select All")');
        this.bulkDeleteButton = page.locator('button:has-text("Delete Selected"), button:has-text("Bulk Delete")');
        this.bulkDeleteConfirm = page.locator('button:has-text("Confirm Delete"), button:has-text("Yes, Delete")');
        
        // File sharing elements
        this.shareButton = page.locator('div[role="menuitem"]:has-text("Share")');
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
            const fileViewer = this.page.locator(`p:has-text("${fileName}")`)
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
        console.log("Clicked Close button in file viewer");
    }

    async closeUploadModal(): Promise<void> {
        try {
            console.log('🔍 Closing upload modal...');
            
            // Wait for upload modal to be visible
            await this.uploadModal.waitFor({ state: 'visible', timeout: 5000 });
            
            // Find the Close button within the upload modal
            // The Close button is inside the upload modal dialog
            const closeButton = this.uploadModal.locator('button[aria-label="Close"]');
            
            // Wait for the close button to be visible
            await closeButton.waitFor({ state: 'visible', timeout: 5000 });
            
            // Scroll into view if needed
            await closeButton.scrollIntoViewIfNeeded().catch(() => {});
            await this.page.waitForTimeout(200);
            
            // Click the close button
            await closeButton.click();
            console.log('✅ Clicked Close button on upload modal');
            
            // Wait for modal to close
            await this.uploadModal.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {
                console.log('⚠️ Upload modal may still be visible after close click');
            });
            
        } catch (error) {
            console.error('❌ Error closing upload modal:', error);
            // Try alternative: click the X button in the dialog header
            try {
                const xButton = this.uploadModal.locator('button[aria-label*="Close"], button:has(svg)').first();
                await xButton.click();
                console.log('✅ Clicked X button on upload modal');
            } catch (xError) {
                console.error('❌ Failed to close upload modal with X button:', xError);
                throw error; // Throw the original error
            }
        }
    }

    // File menu and actions functionality
    async clickFileMenu(fileName: string): Promise<void> {
        const menuButton = this.page.locator(`tr:has-text("${fileName.replace("./test-files/", "")}") button:has(svg.lucide-ellipsis)`);
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
            const fileViewer = this.page.locator(`p:has-text("${expectedTitle.replace("./test-files/", "")}")`);
            await fileViewer.waitFor({ state: 'visible', timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }

    async isFileStatus(fileName: string, status: string): Promise<boolean> {
        try {
            const statusElement = this.page.locator('tr', {
                                         has: this.page.locator('span', { hasText: fileName.replace("./test-files/", "") }),
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
            const checkbox = this.page.locator(`tr:has-text("${fileName.replace("./test-files/", "")}") button[role="checkbox"]`);
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
            const fileElement = this.fileList.locator(`:has-text("${fileName.replace("./test-files/", "")}")`);
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
        console.log(`🔍 Clicking share button for file: ${fileName}`);
        
        try {
            // First, dismiss any feedback popup that might be present
            //await this.dismissFeedbackPopup();
            
            // Additional check - try to dismiss any overlapping elements
            // await this.dismissOverlappingElements();
            
            // Wait a moment for any UI to settle
            await this.page.waitForTimeout(1000);
            
            // First, ensure the file menu is open
            console.log('🔍 Ensuring file menu is open...');
            const fileMenu = this.page.locator(`tr:has-text("${fileName.replace("./test-files/", "")}") button:has(svg.lucide-ellipsis)`);
            
            // Try to find the file menu with multiple attempts
            let menuFound = false;
            for (let attempt = 1; attempt <= 3; attempt++) {
                try {
                    console.log(`🔍 Looking for file menu, attempt ${attempt}/3...`);
                    await fileMenu.waitFor({ state: 'visible', timeout: 3000 });
                    menuFound = true;
                    break;
                } catch (e) {
                    console.log(`⚠️ File menu not found on attempt ${attempt}, retrying...`);
                    await this.page.waitForTimeout(1000);
                }
            }
            
            if (!menuFound) {
                throw new Error('File menu not found after multiple attempts');
            }
            
            // Check if menu is already open, if not click it
            const menuDropdown = this.page.locator('[role="menu"]');
            const isMenuOpen = await menuDropdown.isVisible();
            if (!isMenuOpen) {
                console.log('🔍 File menu not open, clicking to open...');
                await fileMenu.click();
                await this.page.waitForTimeout(1000); // Wait for menu to open
            }
            
            // Now look for the share button specifically in the menu
            console.log('🔍 Looking for share button in menu...');
            const shareMenuItem = this.page.locator('[role="menu"] div[role="menuitem"]:has-text("Share")');
            await shareMenuItem.waitFor({ state: 'visible', timeout: 5000 });
            console.log('✅ Share button is visible in menu');
            
            // Click the share button
            await shareMenuItem.click();
            console.log('✅ Share button clicked');
            
            // Wait a moment for the modal to appear
            await this.page.waitForTimeout(1000);
            
        } catch (error) {
            console.log('❌ Error clicking share button:', error);
            
            // Debug: Check what menu items are available
            console.log('🔍 Debugging available menu items...');
            const menuItems = await this.page.locator('[role="menu"] [role="menuitem"]').all();
            console.log(`🔍 Found ${menuItems.length} menu items`);
            
            for (let i = 0; i < menuItems.length; i++) {
                try {
                    const text = await menuItems[i].textContent();
                    if (text) {
                        console.log(`🔍 Menu item ${i + 1}: "${text.trim()}"`);
                    }
                } catch (e) {
                    console.log(`🔍 Could not get text from menu item ${i + 1}`);
                }
            }
            
            // Also check if there are any buttons with "share" text
            const shareButtons = await this.page.locator('button:has-text("Share"), [role="menuitem"]:has-text("Share")').all();
            console.log(`🔍 Found ${shareButtons.length} share-related elements`);
            
            for (let i = 0; i < shareButtons.length; i++) {
                try {
                    const text = await shareButtons[i].textContent();
                    const role = await shareButtons[i].getAttribute('role');
                    console.log(`🔍 Share element ${i + 1} (role: ${role}): "${text?.trim()}"`);
                } catch (e) {
                    console.log(`🔍 Could not get details from share element ${i + 1}`);
                }
            }
            
            throw error;
        }
    }

    async isShareModalVisible(): Promise<boolean> {
        try {
            console.log('🔍 Checking if share modal is visible...');
            
            // Wait a bit for the modal to appear
            await this.page.waitForTimeout(1000);
            
            // Try multiple selectors for the share modal
            const modalSelectors = [
                '[role="dialog"]',
                '[data-testid="share-modal"]',
                '.modal',
                '[class*="modal"]',
                '[class*="dialog"]',
                '[class*="share"]'
            ];
            
            for (const selector of modalSelectors) {
                try {
                    const modal = this.page.locator(selector);
                    if (await modal.isVisible()) {
                        console.log(`✅ Share modal found with selector: ${selector}`);
                        return true;
                    }
                } catch (e) {
                    // Continue to next selector
                }
            }
            
            // Debug: Check what's currently on the page
            console.log('🔍 Debugging page content for share modal...');
            const allDialogs = await this.page.locator('[role="dialog"]').all();
            console.log(`🔍 Found ${allDialogs.length} dialogs on page`);
            
            for (let i = 0; i < allDialogs.length; i++) {
                try {
                    const text = await allDialogs[i].textContent();
                    if (text) {
                        console.log(`🔍 Dialog ${i + 1} content: "${text.trim().substring(0, 100)}..."`);
                    }
                } catch (e) {
                    console.log(`🔍 Could not get text from dialog ${i + 1}`);
                }
            }
            
            // Check for any visible modals or overlays
            const allModals = await this.page.locator('[class*="modal"], [class*="overlay"], [class*="backdrop"]').all();
            console.log(`🔍 Found ${allModals.length} potential modal/overlay elements`);
            
            for (let i = 0; i < Math.min(allModals.length, 5); i++) {
                try {
                    const text = await allModals[i].textContent();
                    if (text && text.trim().length > 0) {
                        console.log(`🔍 Modal/Overlay ${i + 1} content: "${text.trim().substring(0, 100)}..."`);
                    }
                } catch (e) {
                    console.log(`🔍 Could not get text from modal/overlay ${i + 1}`);
                }
            }
            
            console.log('❌ Share modal not found with any selector');
            return false;
        } catch (error) {
            console.log('❌ Error checking share modal visibility:', error);
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
        if (!fs.existsSync('./test-files')) {
            fs.mkdirSync('./test-files', { recursive: true });
        }
        
        // If the file already exists, use it (don't overwrite existing test files)
        // This prevents corruption of existing valid test files
        if (fs.existsSync(filePath)) {
            console.log(`✅ Using existing test file: ${fileName}`);
            return filePath;
        }
        
        // Create a new file with appropriate content based on file extension
        const fileExtension = fileName.toLowerCase().split('.').pop();
        const sizeInBytes = sizeInMB * 1024 * 1024;
        
        let fileContent: Buffer;
        
        switch (fileExtension) {
            case 'pdf':
                // Create a minimal valid PDF structure
                // PDF header + minimal content
                const pdfHeader = '%PDF-1.4\n';
                const pdfContent = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> >>\nendobj\n4 0 obj\n<< /Length 44 >>\nstream\nBT\n/F1 12 Tf\n100 700 Td\n(Test PDF Content) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000306 00000 n \ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n395\n%%EOF\n`;
                const pdfBuffer = Buffer.from(pdfHeader + pdfContent, 'utf-8');
                // Pad to desired size if needed
                if (sizeInBytes > pdfBuffer.length) {
                    const padding = Buffer.alloc(sizeInBytes - pdfBuffer.length, 0x20); // Space characters
                    fileContent = Buffer.concat([pdfBuffer, padding]);
                } else {
                    fileContent = pdfBuffer;
                }
                break;
                
            case 'png':
                // Create a minimal valid PNG structure
                // PNG signature + minimal IHDR chunk
                const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
                const pngHeader = Buffer.from([
                    0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
                    0x49, 0x48, 0x44, 0x52, // IHDR
                    0x00, 0x00, 0x00, 0x01, // Width: 1
                    0x00, 0x00, 0x00, 0x01, // Height: 1
                    0x08, 0x02, 0x00, 0x00, 0x00, // Bit depth, color type, compression, filter, interlace
                ]);
                const pngCrc = Buffer.from([0x00, 0x00, 0x00, 0x00]); // Placeholder CRC
                const pngIend = Buffer.from([
                    0x00, 0x00, 0x00, 0x00, // IEND chunk length
                    0x49, 0x45, 0x4E, 0x44, // IEND
                    0xAE, 0x42, 0x60, 0x82  // IEND CRC
                ]);
                const pngBuffer = Buffer.concat([pngSignature, pngHeader, pngCrc, pngIend]);
                // Pad to desired size if needed
                if (sizeInBytes > pngBuffer.length) {
                    const padding = Buffer.alloc(sizeInBytes - pngBuffer.length, 0x00);
                    fileContent = Buffer.concat([pngBuffer, padding]);
                } else {
                    fileContent = pngBuffer;
                }
                break;
                
            case 'docx':
            case 'doc':
                // DOCX files are ZIP archives with XML content
                // Create a minimal valid DOCX structure (simplified)
                // For testing, we'll create a file with appropriate size
                // Note: A proper DOCX would require creating a ZIP with specific XML structure
                // For now, create binary data that's approximately the right size
                fileContent = Buffer.alloc(sizeInBytes, 0x00);
                // Add a simple header to make it somewhat recognizable
                const docxHeader = Buffer.from('PK\x03\x04'); // ZIP file signature
                docxHeader.copy(fileContent, 0);
                break;
                
            default:
                // For other file types, create binary data of the specified size
                fileContent = Buffer.alloc(sizeInBytes, 0x00);
                break;
        }
        
        fs.writeFileSync(filePath, fileContent);
        console.log(`✅ Created test file: ${fileName} (${sizeInMB}MB)`);
        return filePath;
    }

    async isFilesDeleted(fileNames: string[]): Promise<boolean> {
        try{
            for (const fileName of fileNames) {
                const fileElement = this.page.locator(`tr:has-text("${fileName.replace("./test-files/", "")}")`);
                await fileElement.waitFor({ state: 'hidden', timeout: 5000 });
                }
            return true;
            }
        catch{
            return false;
            }
    }

    // Navigation methods
    async navigateToStoragePage(): Promise<void> {
        await this.page.goto('/dashboard/storage');
        await this.page.waitForLoadState('networkidle');
    }

    // File upload with validation methods
    async uploadFileWithValidation(filePath: string, sizeInMB: number = 1): Promise<void> {
        await this.uploadSingleFile(filePath);
    }

    async uploadMultipleFilesWithValidation(filePaths: string[]): Promise<void> {
        await this.uploadMultipleFiles(filePaths);
    }

    // Share modal validation methods
    async validateShareModalWithTitle(expectedTitle: string, captureScreenshot?: (name: string, type?: "failure" | "debug" | "error" | "failure_fallback") => Promise<string | null>): Promise<boolean> {
        console.log(`🔍 Checking if share modal opens with title containing: "${expectedTitle}"`);
        
        const isModalVisible = await this.isShareModalVisible();
        
        if (!isModalVisible) {
            console.log('❌ Share modal is not visible');
            if (captureScreenshot) {
                console.log('🔍 Taking screenshot for debugging...');
                await captureScreenshot('share-modal-not-visible', 'error');
            }
            throw new Error('Share modal did not open. Check screenshot for debugging.');
        }
        
        console.log('✅ Share modal is visible');
        
        // Check if the modal title contains the expected text
        try {
            const modalTitle = await this.page.locator('[role="dialog"] h1, [role="dialog"] h2, [role="dialog"] [data-testid="modal-title"]').nth(1).textContent();
            console.log(`🔍 Modal title found: "${modalTitle}"`);
            
            if (!modalTitle || !modalTitle.includes(expectedTitle)) {
                console.log(`❌ Modal title does not contain expected text. Expected: "${expectedTitle}", Found: "${modalTitle}"`);
                if (captureScreenshot) {
                    console.log('🔍 Taking screenshot for debugging...');
                    await captureScreenshot('share-modal-wrong-title', 'error');
                }
                throw new Error(`Modal title does not contain expected text. Expected: "${expectedTitle}", Found: "${modalTitle}"`);
            }
            
            console.log(`✅ Modal title contains expected text: "${expectedTitle}"`);
            return true;
        } catch (error) {
            console.log('❌ Error checking modal title:', error);
            if (captureScreenshot) {
                console.log('🔍 Taking screenshot for debugging...');
                await captureScreenshot('share-modal-title-error', 'error');
            }
            throw error;
        }
    }

    // Success message validation methods
    async validateSuccessMessage(expectedMessage: string): Promise<boolean> {
        await this.waitForUploadComplete();
        const isSuccessVisible = await this.isSuccessMessageVisible();
        
        if (!isSuccessVisible) {
            return false;
        }
        
        const actualMessage = await this.getSuccessMessage();
        return actualMessage.includes(expectedMessage);
    }

    // File list validation methods
    async validateFileListNotEmpty(): Promise<boolean> {
        await this.waitForUploadComplete();
        const fileList = await this.getFileList();
        return fileList.length > 0;
    }

    async validateFilesNotInList(fileNames: string[]): Promise<boolean> {
        await this.page.waitForTimeout(2000);
        return await this.isFilesDeleted(fileNames);
    }

    // File viewer validation methods
    async validateFileContentDisplayed(fileName: string): Promise<boolean> {
        return await this.isFileContentVisible(fileName);
    }

    async validateFileViewerClosed(fileName: string): Promise<boolean> {
        await this.closeFileViewer();
        return await this.isFileViewerClosed(fileName);
    }

    async validateFileViewerOpenWithTitle(expectedTitle: string): Promise<boolean> {
        return await this.isFileViewerOpenWithTitle(expectedTitle);
    }

    // File status validation methods
    async validateFileStatus(fileName: string, status: string): Promise<boolean> {
        return await this.isFileStatus(fileName, status);
    }

    // Upload button validation methods
    async validateUploadButtonClick(): Promise<boolean> {
        await this.clickUploadButton();
        return await this.isUploadModalVisible();
    }
}
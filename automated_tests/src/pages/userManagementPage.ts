import { Page, Locator, expect, FrameLocator } from '@playwright/test';

export class UserManagementPage {
    readonly page: Page;
    readonly inviteUserButton: Locator;
    readonly inviteUserModal: Locator;
    readonly nameInput: Locator;
    readonly emailInput: Locator;
    readonly roleDropdown: Locator;
    readonly sendInvitationButton: Locator;
    readonly closeModalButton: Locator;
    readonly searchInput: Locator;
    readonly usersTable: Locator;
    readonly totalUsersText: Locator;
    readonly frame: FrameLocator;

    constructor(page: Page) {
        this.page = page;
        this.frame = page.frameLocator('iframe[name^="__privateStripeFrame"]').first();
        this.inviteUserButton = page.locator('button:has-text("Invite User")');
        this.inviteUserModal = page.locator('[role="dialog"]:has-text("Invite User")');
        this.nameInput = this.inviteUserModal.locator('input[name*="name"], input[placeholder*="name"], input[type="text"]').first();
        this.emailInput = this.inviteUserModal.locator('input').nth(1); // Second input (email field)
        this.roleDropdown = this.inviteUserModal.locator('select, [role="combobox"]').first();
        this.sendInvitationButton = this.inviteUserModal.locator('button:has-text("Send Invitation")');
        this.closeModalButton = this.inviteUserModal.locator('button[aria-label="Close"]');
        this.searchInput = page.locator('input[placeholder*="Search users"]');
        this.usersTable = page.locator('table, [role="table"]');
        this.totalUsersText = page.locator('text=Total users:');
    }

    // Navigation
    async navigateToUserManagement(): Promise<void> {
        await this.page.goto('/dashboard/users');
        await this.page.waitForLoadState('networkidle');
    }

    // Invite User functionality
    async clickInviteUserButton(): Promise<void> {
        await this.inviteUserButton.click();
        await this.inviteUserModal.waitFor({ state: 'visible', timeout: 10000 });
    }

    async isInviteUserModalVisible(): Promise<boolean> {
        try {
            await this.inviteUserModal.waitFor({ state: 'visible', timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }

    async enterUserName(name: string): Promise<void> {
        console.log(`🔍 Attempting to enter user name: ${name}`);
        await this.nameInput.waitFor({ state: 'visible', timeout: 10000 });
        console.log('✅ Name input is visible');
        await this.nameInput.clear();
        await this.nameInput.fill(name);
        await this.nameInput.blur(); // Ensure the input is properly filled
        console.log('✅ User name entered successfully');
    }

    async enterUserEmail(email: string): Promise<void> {
        console.log(`🔍 Attempting to enter user email: ${email}`);
        await this.emailInput.waitFor({ state: 'visible', timeout: 10000 });
        console.log('✅ Email input is visible');
        await this.emailInput.clear();
        await this.emailInput.fill(email);
        await this.emailInput.blur(); // Ensure the input is properly filled
        console.log('✅ User email entered successfully');
    }

    async selectUserRole(role: string): Promise<void> {
        await this.roleDropdown.click();
        await this.page.locator(`option:has-text("${role}"), [role="option"]:has-text("${role}")`).nth(1).click();
    }

    async clickSendInvitation(): Promise<void> {
        await this.sendInvitationButton.click();
    }

    async closeInviteUserModal(): Promise<void> {
        await this.closeModalButton.click();
        await this.inviteUserModal.waitFor({ state: 'hidden', timeout: 5000 });
    }

    // User list functionality
    async searchUsers(searchTerm: string): Promise<void> {
        await this.searchInput.fill(searchTerm);
    }

    async getTotalUsersCount(): Promise<number> {
        const text = await this.totalUsersText.textContent();
        const match = text?.match(/Total users: (\d+)/);
        return match ? parseInt(match[1]) : 0;
    }

    async isUserInList(userName: string): Promise<boolean> {
        try {
            const userRow = this.usersTable.locator(`tr:has-text("${userName}")`);
            await userRow.waitFor({ state: 'visible', timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }

    async getUserRole(userName: string): Promise<string> {
        const userRow = this.usersTable.locator(`tr:has-text("${userName}")`);
        const roleCell = userRow.locator('td').nth(2); // Assuming role is the 3rd column
        return await roleCell.textContent() || '';
    }

    async getUserStatus(userName: string): Promise<string> {
        const userRow = this.usersTable.locator(`tr:has-text("${userName}")`);
        const statusCell = userRow.locator('td').nth(3); // Assuming status is the 4th column
        return await statusCell.textContent() || '';
    }

    // Success/Error message handling
    async isSuccessMessageVisible(): Promise<boolean> {
        try {
            const successMessage = this.page.locator('[data-testid="success-message"], .success-message, [class*="success"]');
            await successMessage.waitFor({ state: 'visible', timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }

    async getSuccessMessage(): Promise<string> {
        const successMessage = this.page.locator('[data-testid="success-message"], .success-message, [class*="success"]');
        return await successMessage.textContent() || '';
    }

    async isErrorMessageVisible(): Promise<boolean> {
        try {
            const errorMessage = this.page.locator('[data-testid="error-message"], .error-message, [class*="error"]');
            await errorMessage.waitFor({ state: 'visible', timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }

    async getErrorMessage(): Promise<string> {
        const errorMessage = this.page.locator('[data-testid="error-message"], .error-message, [class*="error"]');
        return await errorMessage.textContent() || '';
    }
}


import { Page, Locator, expect } from '@playwright/test';

export class SupportPage {
    readonly page: Page;
    readonly supportSidebarLink: Locator;
    readonly newTicketTab: Locator;
    readonly myTicketsTab: Locator;
    readonly faqTab: Locator;
    readonly subjectInput: Locator;
    readonly categoryDropdown: Locator;
    readonly priorityDropdown: Locator;
    readonly descriptionTextarea: Locator;
    readonly uploadFilesButton: Locator;
    readonly submitTicketButton: Locator;
    readonly searchInput: Locator;
    readonly statusFilter: Locator;
    readonly ticketList: Locator;
    readonly ticketRow: Locator;
    readonly ticketStatus: Locator;
    readonly ticketSubject: Locator;
    readonly ticketId: Locator;
    readonly replyTextarea: Locator;
    readonly sendReplyButton: Locator;
    readonly markAsResolvedButton: Locator;
    readonly backToSupportButton: Locator;
    readonly successMessage: Locator;
    readonly ticketTitle: Locator;
    readonly ticketInfo: Locator;
    readonly conversationHistory: Locator;
    readonly replyMessage: Locator;
    readonly ticketStatusBadge: Locator;
    readonly reopenWarning: Locator;

    constructor(page: Page) {
        this.page = page;
        this.supportSidebarLink = page.locator('a:has-text("Support")');
        this.newTicketTab = page.locator('button:has-text("New Ticket"), a:has-text("New Ticket")');
        this.myTicketsTab = page.locator('button:has-text("My Tickets"), a:has-text("My Tickets")');
        this.faqTab = page.locator('button:has-text("FAQ"), a:has-text("FAQ")');
        this.subjectInput = page.locator('input[placeholder="Subject"]');
        this.categoryDropdown = page.locator('select, [role="combobox"]').first();
        this.priorityDropdown = page.locator('select, [role="combobox"]').nth(1);
        this.descriptionTextarea = page.locator('textarea[placeholder*="Describe"], textarea[placeholder*="issue"]');
        this.uploadFilesButton = page.locator('button:has-text("Upload Files"), button:has-text("Upload")');
        this.submitTicketButton = page.locator('button:has-text("Submit Ticket")');
        this.searchInput = page.locator('input[placeholder*="Search"]');
        this.statusFilter = page.locator('select, [role="combobox"]').filter({ hasText: 'Status' });
        this.ticketList = page.locator('table, .ticket-list, [role="table"]');
        this.ticketRow = page.locator('tr, .ticket-item, [role="row"]');
        this.ticketStatus = page.locator('tr').locator('td').nth(4).locator('span');
        this.ticketSubject = page.locator('td, .subject, [class*="subject"]');
        this.ticketId = page.locator('td, .ticket-id, [class*="id"]');
        this.replyTextarea = page.locator('textarea[placeholder*="reply"], textarea[placeholder*="Type your reply"]');
        this.sendReplyButton = page.locator('button:has-text("Send Reply")');
        this.markAsResolvedButton = page.locator('button:has-text("Mark as Resolved")').first();
        this.backToSupportButton = page.locator('button:has-text("Back"), a:has-text("Back")').first();
        this.successMessage = page.locator('.success, .alert-success, [class*="success"]');
        this.ticketTitle = page.locator('h1, h2, .ticket-title');
        this.ticketInfo = page.locator('.ticket-info, [class*="ticket-info"]');
        this.conversationHistory = page.locator('.conversation, .messages, [class*="conversation"]');
        this.replyMessage = page.locator('div.mt-1.text-base.whitespace-pre-wrap');
        this.ticketStatusBadge = page.locator('tr').locator('td').nth(4).locator('span');
        this.reopenWarning = page.locator('.warning, .alert-warning, [class*="warning"]');
    }

    async clickSupportFromSidebar() {
        await this.supportSidebarLink.click();
    }

    async clickNewTicketTab() {
        await this.newTicketTab.click();
    }

    async clickMyTicketsTab() {
        await this.myTicketsTab.click();
    }

    async enterSubject(subject: string) {
        await this.subjectInput.fill(subject);
    }

    async enterDescription(description: string) {
        await this.descriptionTextarea.fill(description);
    }

    async selectCategory(category: string) {
        await this.categoryDropdown.click();
        await this.page.locator(`option:has-text("${category}"), [role="option"]:has-text("${category}")`).click();
    }

    async selectPriority(priority: string) {
        await this.priorityDropdown.click();
        await this.page.locator(`option:has-text("${priority}"), [role="option"]:has-text("${priority}")`).click();
    }

    async uploadFile(filePath: string) {
        await this.uploadFilesButton.click();
        // File upload handling would go here
        // This is a placeholder as actual file upload implementation depends on the specific UI
    }

    async clickSubmitTicket() {
        await this.submitTicketButton.click();
    }

    async searchTickets(searchTerm: string) {
        await this.searchInput.fill(searchTerm);
    }

    async filterByStatus(status: string) {
        await this.statusFilter.click();
        await this.page.locator(`option:has-text("${status}"), [role="option"]:has-text("${status}")`).click();
    }

    async clickTicketBySubject(subject: string) {
        const ticketRow = this.ticketRow.filter({ hasText: subject });
        await ticketRow.click();
    }

    async clickTicketById(ticketId: string) {
        const ticketRow = this.ticketRow.filter({ hasText: ticketId });
        await ticketRow.click();
    }

    async enterReplyMessage(message: string) {
        await this.replyTextarea.fill(message);
    }

    async clickSendReply() {
        await this.sendReplyButton.click();
    }

    async clickMarkAsResolved() {
        await this.markAsResolvedButton.click();
    }

    async clickBackToSupport() {
        await this.backToSupportButton.click();
    }

    async isTicketInStatus(status: string) {
        try {
            const statusElement = this.ticketStatus.filter({ hasText: status });
            await statusElement.waitFor({ state: 'visible', timeout: 10000 });
            return true;
        } catch (error) {
            return false;
        }
    }

    async isSuccessMessageVisible() {
        try {
            await this.successMessage.waitFor({ state: 'visible', timeout: 10000 });
            return true;
        } catch (error) {
            return false;
        }
    }

    async isReplyVisible(message: string) {
        try {
            const replyElement = this.replyMessage.filter({ hasText: message });
            await replyElement.waitFor({ state: 'visible', timeout: 10000 });
            return true;
        } catch (error) {
            return false;
        }
    }

    async getTicketId() {
        try {
            const ticketIdElement = this.ticketId.first();
            const ticketId = await ticketIdElement.textContent();
            return ticketId?.trim() || '';
        } catch (error) {
            console.log('Could not get ticket ID:', error);
            return '';
        }
    }

    async getTicketSubject() {
        try {
            const subjectElement = this.ticketSubject.first();
            const subject = await subjectElement.textContent();
            return subject?.trim() || '';
        } catch (error) {
            console.log('Could not get ticket subject:', error);
            return '';
        }
    }

    async isReopenWarningVisible() {
        try {
            await this.reopenWarning.waitFor({ state: 'visible', timeout: 5000 });
            return true;
        } catch (error) {
            return false;
        }
    }

    async waitForTicketList() {
        try {
            await this.ticketList.waitFor({ state: 'visible', timeout: 10000 });
            return true;
        } catch (error) {
            return false;
        }
    }

    async getTicketCount() {
        try {
            const rows = await this.ticketRow.count();
            return rows;
        } catch (error) {
            return 0;
        }
    }
}


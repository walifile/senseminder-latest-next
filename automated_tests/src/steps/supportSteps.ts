import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

Given('I navigate to the support page', { timeout: 30000 }, async function(this: CustomWorld) {
    if (!this.page) {
        throw new Error('Page is not initialized');
    }
    
    if (!this.supportPage) {
        this.supportPage = new (await import('../pages/supportPage')).SupportPage(this.page);
    }

    // const sensePCPage = new SensePCPage(this.page);
    // await sensePCPage.handleSkipButtonIfPresent();

    await this.supportPage.clickSupportFromSidebar();
    await this.page!.waitForLoadState('networkidle');
});

Given('And I navigate to the support page', { timeout: 30000 }, async function(this: CustomWorld) {
    if (!this.page) {
        throw new Error('Page is not initialized');
    }
    
    if (!this.supportPage) {
        this.supportPage = new (await import('../pages/supportPage')).SupportPage(this.page);
    }
    
    await this.supportPage.clickSupportFromSidebar();
    await this.page!.waitForLoadState('networkidle');
});

Given('I click on new ticket tab', async function(this: CustomWorld) {
    if (!this.supportPage) {
        throw new Error('SupportPage is not initialized');
    }
    
    await this.supportPage.clickNewTicketTab();
    await this.page!.waitForLoadState('networkidle');
});

Given('I enter subject, description', async function(this: CustomWorld) {
    if (!this.supportPage) {
        throw new Error('SupportPage is not initialized');
    }
    
    // Generate random subject and description
    const timestamp = Date.now();
    const subject = `Test Support Ticket ${timestamp}`;
    const description = `This is a test support ticket. Please ignore this ticket as it is for testing purposes only.`;
    
    await this.supportPage.enterSubject(subject);
    await this.supportPage.enterDescription(description);
    
    // Store the subject for later verification
    this.ticketSubject = subject;
});

When('I click on submit ticket button', async function(this: CustomWorld) {
    if (!this.supportPage) {
        throw new Error('SupportPage is not initialized');
    }
    
    await this.supportPage.clickSubmitTicket();
    await this.page!.waitForLoadState('networkidle');
});

Then('I should be able to see ticket in {string} status', async function(this: CustomWorld, expectedStatus: string) {
    if (!this.supportPage) {
        throw new Error('SupportPage is not initialized');
    }
    
    // Wait for the ticket list to load
    await this.supportPage.waitForTicketList();
    
    // Check if ticket is in the expected status
    const isInStatus = await this.supportPage.isTicketInStatus(expectedStatus);
    expect(isInStatus).toBeTruthy();
});

When('I click on the created ticket', async function(this: CustomWorld) {
    if (!this.supportPage) {
        throw new Error('SupportPage is not initialized');
    }
    
    if (!this.ticketSubject) {
        throw new Error('Ticket subject not found. Please create a ticket first.');
    }
    
    await this.supportPage.clickTicketBySubject(this.ticketSubject);
    await this.page!.waitForLoadState('networkidle');
});

When('I enter reply message', async function(this: CustomWorld) {
    if (!this.supportPage) {
        throw new Error('SupportPage is not initialized');
    }
    
    const timestamp = Date.now();
    const replyMessage = `Test reply message ${timestamp}`;
    
    await this.supportPage.enterReplyMessage(replyMessage);
    
    // Store the reply message for later verification
    this.replyMessage = replyMessage;
});

When('I click on send reply button', async function(this: CustomWorld) {
    if (!this.supportPage) {
        throw new Error('SupportPage is not initialized');
    }
    
    await this.supportPage.clickSendReply();
    await this.page!.waitForLoadState('networkidle');
});

Then('I should be able to see added reply', async function(this: CustomWorld) {
    if (!this.supportPage) {
        throw new Error('SupportPage is not initialized');
    }
    
    if (!this.replyMessage) {
        throw new Error('Reply message not found. Please send a reply first.');
    }
    
    const isReplyVisible = await this.supportPage.isReplyVisible(this.replyMessage);
    expect(isReplyVisible).toBeTruthy();
});

When('I mark the ticket as resolved', async function(this: CustomWorld) {
    if (!this.supportPage) {
        throw new Error('SupportPage is not initialized');
    }
    
    await this.supportPage.clickMarkAsResolved();
    await this.page!.waitForLoadState('networkidle');
});

When('I click on back to support', async function(this: CustomWorld) {
    if (!this.supportPage) {
        throw new Error('SupportPage is not initialized');
    }
    
    await this.supportPage.clickBackToSupport();
    await this.page!.waitForLoadState('networkidle');
});

// Additional helper steps
When('I select category {string}', async function(this: CustomWorld, category: string) {
    if (!this.supportPage) {
        throw new Error('SupportPage is not initialized');
    }
    
    await this.supportPage.selectCategory(category);
});

When('I select priority {string}', async function(this: CustomWorld, priority: string) {
    if (!this.supportPage) {
        throw new Error('SupportPage is not initialized');
    }
    
    await this.supportPage.selectPriority(priority);
});

When('I search for ticket {string}', async function(this: CustomWorld, searchTerm: string) {
    if (!this.supportPage) {
        throw new Error('SupportPage is not initialized');
    }
    
    await this.supportPage.searchTickets(searchTerm);
});

When('I filter tickets by status {string}', async function(this: CustomWorld, status: string) {
    if (!this.supportPage) {
        throw new Error('SupportPage is not initialized');
    }
    
    await this.supportPage.filterByStatus(status);
});

Then('I should see success message', async function(this: CustomWorld) {
    if (!this.supportPage) {
        throw new Error('SupportPage is not initialized');
    }
    
    const isSuccessVisible = await this.supportPage.isSuccessMessageVisible();
    expect(isSuccessVisible).toBeTruthy();
});

Then('I should see reopen warning', async function(this: CustomWorld) {
    if (!this.supportPage) {
        throw new Error('SupportPage is not initialized');
    }
    
    const isWarningVisible = await this.supportPage.isReopenWarningVisible();
    expect(isWarningVisible).toBeTruthy();
});

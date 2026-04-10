import { Page, Locator, FrameLocator } from '@playwright/test';

export class BillingPage {
    readonly page: Page;
    readonly walletBalance: Locator;
    readonly addPaymentMethodButton: Locator;
    readonly cardholderNameInput: Locator;
    readonly cardNumberInput: Locator;
    readonly expiryInput: Locator;
    readonly cvvInput: Locator;
    readonly zipInput: Locator;
    readonly saveCardSecurelyButton: Locator;
    readonly quickRecharge200Button: Locator;
    readonly automaticReoccurringCheckbox: Locator;
    readonly yesRechargeButton: Locator;
    readonly addPaymentMethodPopup: Locator;
    readonly frame: FrameLocator;

    constructor(page: Page) {
        this.page = page;
        this.frame = page.frameLocator('iframe[name^="__privateStripeFrame"]').first();
        this.walletBalance = page.locator('div[data-testid="billing-wallet-balance"]').first();
        this.addPaymentMethodButton = page.locator('button:has-text("Manage Payment")');
        this.cardholderNameInput = page.locator('input[placeholder="Cardholder name"]');
        this.cardNumberInput = this.frame.locator('input[name="cardnumber"]').first();
        this.expiryInput = this.frame.locator('input[placeholder="MM / YY"]');
        this.cvvInput = this.frame.locator('input[placeholder="CVC"]');
        this.zipInput =this.frame.locator('input[placeholder="ZIP"]');
        this.saveCardSecurelyButton = page.locator('button:has-text("Save Card Securely")');
        this.quickRecharge200Button = page.getByRole('button', { name: '$20', exact: true });
        this.automaticReoccurringCheckbox = page.locator('#autoRecharge');
        this.yesRechargeButton = page.locator('button:has-text("Yes, Recharge")');
        this.addPaymentMethodPopup = page.locator('div[role="dialog"]');
    }

    async isBillingPageVisible() {
        try {
            await this.page.waitForURL('**/dashboard/billing', { timeout: 10000 });
            return true;
        } catch {
            return false;
        }
    }

    async isWalletBalanceVisible() {
        return await this.walletBalance.waitFor({ state: 'visible', timeout: 30000 });
        }

    async getWalletBalance() {
         await this.page.waitForTimeout(3000); // waits 3 seconds for wallet balance to load
         await this.walletBalance.waitFor({ state: 'visible', timeout: 10000 });
         const balance = await this.walletBalance.textContent();
         if (balance === null) {
             throw new Error('Wallet balance text content is null');
         }
         return balance.trim();
    }

    async clickOnAddPaymentMethod() {
        await this.page.waitForTimeout(3000);
        await this.addPaymentMethodButton.click()
    }

    async enterCardholderName(cardholderName: string) {
        await this.cardholderNameInput.fill(cardholderName);
        console.log('Enter card holder name', cardholderName);
    }

    async enterCardNumber(cardNumber: string) {
        // await this.cardNumberInput.click();
        await this.cardNumberInput.fill(cardNumber);
    }

    async enterExpiry(expiryDate: string) {
        // await this.expiryInput.click();
        await this.expiryInput.fill(expiryDate);
    }

    async enterCVV(cvv: string) {
        // await this.cvvInput.click();
        await this.cvvInput.fill(cvv);
    }

    async enterZIP(zip: string) {
        // await this.zipInput.click();
        await this.zipInput.fill(zip);
    }

    async clickOnSaveCardSecurely() {
        await this.saveCardSecurelyButton.click();
    }

    async isCardAddedSuccessfully(cardDetails: string) {
        try {
            await this.page.getByText(cardDetails).waitFor({ state: 'visible', timeout: 10000 });
            return true;
        } catch {
            return false;
        }
    }

    async closeAddPaymentMethodPopup() {
        const closeButton = this.addPaymentMethodPopup.locator('span:has-text("Close")');
        await closeButton.click();
    }

    async clickQuickRecharge200() {
        await this.quickRecharge200Button.click();
    }

    async checkEnableAutomaticReoccurring() {
        await this.automaticReoccurringCheckbox.check();
    }

    async clickYesRechargeButton() {
        await this.yesRechargeButton.click();
        await this.page.waitForTimeout(3000); // waits 3 seconds for modal to close
    }
}
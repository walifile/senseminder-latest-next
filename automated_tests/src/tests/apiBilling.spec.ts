import { test, expect } from '../fixtures';
import {
    navigateToHomepage,
    clickSignInLink,
    verifyOnLoginPage,
    enterValidCredentials,
    clickLoginButton,
    verifyLoginSuccess,
    verifyDashboardVisible,
    setupAPIInterceptionForLogin,
    captureAccessToken,
    TestContext
} from '../test-helpers';
import { config } from '../config/environment';
import { ApiBillingPage } from '../pages/apiBillingPage';

test.describe('Billing API Automation', () => {
    let apiBillingPage: ApiBillingPage;

    test.beforeEach(async ({ page, homePage, loginPage, testContext }) => {
        test.setTimeout(120000); // 2 minutes timeout for login and token capture
        // Background: UI Authentication and Token Capture
        // Given I am on the homepage
        await navigateToHomepage(page, homePage);

        // When I click the Sign in link
        await clickSignInLink(homePage);

        // Then I should be on the login page
        await verifyOnLoginPage(page, loginPage);

        // When I setup API interception for login
        await setupAPIInterceptionForLogin(loginPage);

        // When I enter valid email and password
        await enterValidCredentials(loginPage);

        // And I click the login button
        await clickLoginButton(loginPage);

        // Then I should be logged in successfully
        await verifyLoginSuccess(loginPage, page);

        // And I capture the access token from login
        await captureAccessToken(loginPage, page, testContext);

        // And I should see the dashboard
        await verifyDashboardVisible(loginPage, page);

        // And I have the billing API base URL configured
        const baseURL = config.testData.api?.billingBaseURL || 'https://558xjerom8.execute-api.us-east-1.amazonaws.com/prod';
        apiBillingPage = new ApiBillingPage(baseURL, 'placeholder_token');

        // And I update API authentication with captured token for billing
        const billingToken = testContext.capturedIdToken || testContext.capturedAccessToken;
        if (!billingToken) {
            throw new Error('No captured token available for billing. Please ensure login steps completed successfully.');
        }
        apiBillingPage.updateAuthenticationWithCapturedToken(billingToken);
    });

    test('Get payment methods for current user @api-billing-payment-methods @api-billing @regression @api', async ({
        testContext
    }) => {
        // Given I prepare get payment methods request for current user
        testContext.currentBillingRequest = apiBillingPage.createGetPaymentMethodsConfig();

        // When I send GET request to get payment methods endpoint
        const lastApiResponse = await apiBillingPage.getPaymentMethods(testContext.currentBillingRequest);
        apiBillingPage.setLastResponse(lastApiResponse);
        testContext.lastApiResponse = lastApiResponse;

        // Then I should receive successful billing response with status code 200
        const actualStatusCode = apiBillingPage.getResponseStatusCode();
        expect(actualStatusCode).toBe(200);

        // And I should verify payment methods response contains payment methods
        const hasPaymentMethods = apiBillingPage.hasPaymentMethods();
        expect(hasPaymentMethods).toBeTruthy();
        const paymentMethods = apiBillingPage.getPaymentMethodsFromResponse();
        expect(paymentMethods).toBeDefined();
        expect(Array.isArray(paymentMethods)).toBeTruthy();
    });

    test('Recharge current user wallet @api-billing-recharge-wallet @api-billing @regression @api', async ({
        testContext
    }) => {
        // Given I prepare recharge request for current user
        testContext.currentBillingRequest = apiBillingPage.createRechargeConfig(20, false);

        // When I send POST request to recharge endpoint
        const lastApiResponse = await apiBillingPage.recharge(testContext.currentBillingRequest);
        apiBillingPage.setLastResponse(lastApiResponse);
        testContext.lastApiResponse = lastApiResponse;

        // Then I should receive successful billing response with status code 200
        const actualStatusCode = apiBillingPage.getResponseStatusCode();
        expect(actualStatusCode).toBe(200);

        // And I should verify recharge response contains success message
        const hasSuccessMessage = apiBillingPage.hasSuccessMessage();
        expect(hasSuccessMessage).toBeTruthy();

        // And I should verify recharge response contains wallet balance
        const hasWalletBalance = apiBillingPage.hasWalletBalance();
        expect(hasWalletBalance).toBeTruthy();
        const walletBalance = apiBillingPage.getWalletBalance();
        expect(walletBalance).toBeDefined();
        expect(typeof walletBalance).toBe('number');
    });
});


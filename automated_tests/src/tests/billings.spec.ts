import { test, expect } from '../fixtures';
import {
    navigateToHomepage,
    clickSignInLink,
    verifyOnLoginPage,
    clickSignUpLink,
    verifyOnSignUpPage,
    enterSignUpDetails,
    enterOTP,
    clickSignUpButton,
    clickVerifyOTPButton,
    verifySignUpSuccess,
    verifyEmailVerificationSuccess,
    enterNewlyCreatedCredentials,
    clickLoginButton,
    verifyLoginSuccess,
    verifyDashboardVisible,
    setupAPIInterceptionForLogin,
    captureAccessToken,
    TestContext
} from '../test-helpers';
import { customExpect } from '../utils/customAssertions';
import { config } from '../config/environment';

test.describe('Add Payment method, and Recharge Wallet for a new User', () => {
    test.beforeEach(async ({ page, homePage, loginPage, signUpPage, sensePCPage, addCreatedUser, testContext }) => {
        test.setTimeout(120000); // 2 minutes timeout for signup, email verification, and login
        // Background: I want to be able to sign up to the application and then login with new credentials
        const context: TestContext = {
            page,
            loginPage,
            homePage,
            signUpPage,
            sensePCPage,
            billingPage: {} as any,
            dashboardPage: {} as any,
            ...testContext
        };

        // Given I am on the homepage
        await navigateToHomepage(page, homePage);

        // When I click the Sign in link
        await clickSignInLink(homePage);

        // Then I should be on the login page
        await verifyOnLoginPage(page, loginPage);

        // When I click the Sign up link
        await clickSignUpLink(page, signUpPage);

        // Then I should be on the sign up page
        await verifyOnSignUpPage(page, signUpPage);

        // When I enter all the details
        await enterSignUpDetails(signUpPage, context);

        // And I click the sign up button
        await clickSignUpButton(signUpPage, context);

        // Then I should be signed up successfully
        await verifySignUpSuccess(signUpPage, context, addCreatedUser);

        // And I should be on verify email page
        const isOnVerifyEmailPage = await signUpPage.isOnVerifyEmailPage();
        await customExpect.toBeTruthy(isOnVerifyEmailPage, 'I should be on verify email page');

        // When I enter OTP
        await enterOTP(signUpPage, context);

        // And I click the verify OTP button
        await clickVerifyOTPButton(signUpPage);

        // Then I should be able to verify email successfully
        await verifyEmailVerificationSuccess(page, signUpPage, context, addCreatedUser, sensePCPage);

        // And I should be on the login page
        const isOnLoginPage = await loginPage.isOnLoginPage();
        await customExpect.toBeTruthy(isOnLoginPage, 'I should be on the login page');

        // When I setup API interception for login
        await setupAPIInterceptionForLogin(loginPage);

        // And I enter newly created email and password
        await enterNewlyCreatedCredentials(loginPage, context);

        // And I click the login button
        await clickLoginButton(loginPage);

        // Then I should be logged in successfully
        await verifyLoginSuccess(loginPage, page);

        // And I capture the access token from login
        await captureAccessToken(loginPage, page, context);

        // And I should see the dashboard
        await verifyDashboardVisible(loginPage, page);
    });

    test('Add Payment method, and Recharge Wallet for a new User @billings @regression', async ({
        page,
        loginPage,
        sensePCPage,
        billingPage
    }) => {
        test.setTimeout(180000); // 3 minutes timeout for the test
        // Given I am on the dashboard
        const isDashboardVisible = await loginPage.isDashboardVisible();
        await customExpect.toBeTruthy(isDashboardVisible, 'I am on the dashboard');

        // When I click on Wallet Balance on Top
        await sensePCPage.clickWallet();

        // Then I should be on the Billing and Payments page
        const isBillingPageVisible = await billingPage.isBillingPageVisible();
        await customExpect.toBeTruthy(isBillingPageVisible, 'I should be on the Billing and Payments page');

        // And I should see Wallet Balance is "$0.00"
        const walletBalance = await billingPage.getWalletBalance();
        await customExpect.toBe(walletBalance, "$0.00", 'I should see Wallet Balance is "$0.00"');

        // When I click on Add Payment Method
        await billingPage.clickOnAddPaymentMethod();

        // And I enter Card number
        await billingPage.enterCardNumber(config.testData.testScenarios.payment.cardNumber);

        // And I enter CVV
        await billingPage.enterCVV(config.testData.testScenarios.payment.cvv);

        // And I enter Expiry
        await billingPage.enterExpiry(config.testData.testScenarios.payment.expiry);

        // And I click on Save Card Securely
        await billingPage.clickOnSaveCardSecurely();

        // Then I should be able to verify Card added successfully
        const cardDetails = config.testData.testScenarios.payment.cardType + " •••• " + config.testData.testScenarios.payment.cardEnding;
        const isCardAdded = await billingPage.isCardAddedSuccessfully(cardDetails);
        expect(isCardAdded).toBeTruthy();

        // When I close Add Payment Method Popup
        await billingPage.closeAddPaymentMethodPopup();

        // And I click on $20 from Quick Recharge
        await billingPage.clickQuickRecharge200();

        // And I check on Enable automatic reoccuring
        await billingPage.checkEnableAutomaticReoccurring();

        // And I click on Yes, Recharge button
        await billingPage.clickYesRechargeButton();

        // Then I should see Wallet Balance is "$20.00"
        const newWalletBalance = await billingPage.getWalletBalance();
        await customExpect.toBe(newWalletBalance, "$20.00", 'I should see Wallet Balance is "$20.00"');
    });
});


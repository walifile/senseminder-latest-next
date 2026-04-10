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

test.describe('Support Functionality', () => {
    test.beforeEach(async ({ page, homePage, loginPage, signUpPage, sensePCPage, supportPage, addCreatedUser, testContext }) => {
        test.setTimeout(120000); // 2 minutes timeout for signup, email verification, and login
        // Background: I am logged in as an admin user
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

        // And I navigate to the support page
        await supportPage.clickSupportFromSidebar();
        await page.waitForLoadState('networkidle');
    });

    test('Create support ticket, reply to it and mark it resolved @support @regression @ui', async ({
        page,
        supportPage,
        testContext
    }) => {
        // Given I click on new ticket tab
        await supportPage.clickNewTicketTab();
        await page.waitForLoadState('networkidle');

        // And I enter subject, description
        const timestamp = Date.now();
        const subject = `Test Support Ticket ${timestamp}`;
        const description = `This is a test support ticket. Please ignore this ticket as it is for testing purposes only.`;
        await supportPage.enterSubject(subject);
        await supportPage.enterDescription(description);
        testContext.ticketSubject = subject;

        // When I click on submit ticket button
        await supportPage.clickSubmitTicket();
        await page.waitForLoadState('networkidle');

        // Then I should be able to see ticket in "Open" status
        await supportPage.waitForTicketList();
        const isInStatus = await supportPage.isTicketInStatus("Open");
        expect(isInStatus).toBeTruthy();

        // When I click on the created ticket
        await supportPage.clickTicketBySubject(testContext.ticketSubject);
        await page.waitForLoadState('networkidle');

        // And I enter reply message
        const replyMessage = `Test reply message ${timestamp}`;
        await supportPage.enterReplyMessage(replyMessage);
        testContext.replyMessage = replyMessage;

        // And I click on send reply button
        await supportPage.clickSendReply();
        await page.waitForLoadState('networkidle');

        // Then I should be able to see added reply
        const isReplyVisible = await supportPage.isReplyVisible(testContext.replyMessage);
        expect(isReplyVisible).toBeTruthy();

        // When I mark the ticket as resolved
        await supportPage.clickMarkAsResolved();
        await page.waitForLoadState('networkidle');

        // And I click on back to support
        await supportPage.clickBackToSupport();
        await page.waitForLoadState('networkidle');

        // Then I should be able to see ticket in "Resolved" status
        const isInResolvedStatus = await supportPage.isTicketInStatus("Resolved");
        expect(isInResolvedStatus).toBeTruthy();
    });
});


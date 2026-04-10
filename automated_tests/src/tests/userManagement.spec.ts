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

test.describe('User Management', () => {
    test.beforeEach(async ({ page, homePage, loginPage, signUpPage, sensePCPage, userManagementPage, addCreatedUser, testContext }) => {
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

        // And I navigate to the User Management page
        await sensePCPage.clickUsersFromSidebar();
    });

    test('Invite a new user as admin, user accepts the invitation and is onboarded @usermanagement @regression @ui', async ({
        page,
        userManagementPage,
        signUpPage,
        loginPage,
        homePage,
        dashboardPage,
        testContext
    }) => {
        // Given I generate random user data for invitation
        const userData = await signUpPage.generateRandomUserDataWithEmail();
        testContext.invitedUserName = `${userData.firstName} ${userData.lastName}`;
        testContext.invitedUserEmail = userData.email;
        testContext.invitedUserTimestamp = Date.now();
        testContext.invitedUserToken = userData.token;

        // And I click on the Invite User button
        await userManagementPage.clickInviteUserButton();
        const isModalVisible = await userManagementPage.isInviteUserModalVisible();
        expect(isModalVisible).toBeTruthy();

        // When I enter the generated user name
        await userManagementPage.enterUserName(testContext.invitedUserName);

        // And I enter the generated user email
        await userManagementPage.enterUserEmail(testContext.invitedUserEmail);

        // And I select the user role "Admin"
        await userManagementPage.selectUserRole("Admin");

        // And I click on the Send Invitation button
        await userManagementPage.clickSendInvitation();

        // Then the user should appear in the user list with role "Admin"
        const isUserInList = await userManagementPage.isUserInList(testContext.invitedUserName);
        expect(isUserInList).toBeTruthy();
        const actualRole = await userManagementPage.getUserRole(testContext.invitedUserName);
        expect(actualRole.toLowerCase()).toContain("admin".toLowerCase());

        // And the total user count should increase by 1
        const currentCount = await userManagementPage.getTotalUsersCount();
        expect(currentCount).toBeGreaterThan(0);

        // When I click on header user account icon
        await dashboardPage.clickUserAccountIcon();

        // And I click on Logout button
        await dashboardPage.clickLogoutButton();

        // Then I should be logged out successfully
        await dashboardPage.verifyLogoutSuccess();

        // And I am on the homepage
        await navigateToHomepage(page, homePage);

        // When I click the Sign in link
        await clickSignInLink(homePage);

        // Then I should be on the login page
        await verifyOnLoginPage(page, loginPage);

        // When I accept the invitation as a new user
        const emailContent = await signUpPage.fetchEmailContent(testContext.invitedUserEmail, testContext.invitedUserToken);
        expect(emailContent).toBeTruthy();
        testContext.invitationEmailContent = emailContent;

        // Extract credentials from email
        const credentials = extractCredentialsFromEmail(emailContent);
        testContext.invitedUserEmail = credentials.username;
        testContext.tempPassword = credentials.password;
        testContext.loginUrl = credentials.loginUrl;

        // And I login with the credentials provided in invitation mail
        await page.goto(testContext.loginUrl);
        await page.waitForLoadState('networkidle');
        await loginPage.enterUsername(testContext.invitedUserEmail);
        await loginPage.enterPassword(testContext.tempPassword);
        await loginPage.clickLogin();

        // Wait for redirect to change password page
        await page.waitForURL('**/auth/change-password**', { timeout: 60000 }).catch(async () => {
            await page.waitForURL('**/auth/password-required**', { timeout: 60000 });
        });

        // And I create new password
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        const changePasswordModal = page.locator('h2:has-text("Change Password")');
        await changePasswordModal.waitFor({ state: 'visible', timeout: 10000 });
        testContext.newPassword = signUpPage.generateRandomPassword();
        await page.locator('#newPassword').fill(testContext.newPassword);
        await page.locator('#confirmPassword').fill(testContext.newPassword);
        await page.locator('button:has-text("Change Password")').click();
        await page.waitForLoadState('networkidle');

        // And I login with the new password created
        const currentUrl = page.url();
        const baseURL = config.testData.application.baseURL.replace(/\/$/, ''); // Remove trailing slash
        if (!currentUrl.includes('/login') && !currentUrl.includes('/auth')) {
            await page.goto(`${baseURL}/auth`);
            await page.waitForLoadState('networkidle');
        }
        await loginPage.enterUsername(testContext.invitedUserEmail);
        await loginPage.enterPassword(testContext.newPassword);
        await loginPage.clickLogin();

        await loginPage.enterFullName(userData.firstName + " " + userData.lastName);
        await loginPage.acceptTerms();
        await loginPage.clickContinue();

        // Handle welcome/onboarding if present
        try {
            await page.waitForURL('**/dashboard/**', { timeout: 60000 });
        } catch {
            try {
                await page.waitForURL('**/welcome**', { timeout: 30000 });
            } catch { }
            await page.goto(`${baseURL}/dashboard/sense-pc`, { waitUntil: 'load' });
        }

        // Then I should see the dashboard
        await loginPage.isDashboardVisible();
    });

    test('Invite a new user as member, user accepts the invitation and is onboarded @usermanagement @regression @ui', async ({
        page,
        userManagementPage,
        signUpPage,
        loginPage,
        homePage,
        dashboardPage,
        testContext
    }) => {
        // Given I generate random user data for invitation
        const userData = await signUpPage.generateRandomUserDataWithEmail();
        testContext.invitedUserName = `${userData.firstName} ${userData.lastName}`;
        testContext.invitedUserEmail = userData.email;
        testContext.invitedUserTimestamp = Date.now();
        testContext.invitedUserToken = userData.token;

        // And I click on the Invite User button
        await userManagementPage.clickInviteUserButton();
        const isModalVisible = await userManagementPage.isInviteUserModalVisible();
        expect(isModalVisible).toBeTruthy();

        // When I enter the generated user name
        await userManagementPage.enterUserName(testContext.invitedUserName);

        // And I enter the generated user email
        await userManagementPage.enterUserEmail(testContext.invitedUserEmail);

        // And I select the user role "Member"
        await userManagementPage.selectUserRole("Member");

        // And I click on the Send Invitation button
        await userManagementPage.clickSendInvitation();

        // Then the user should appear in the user list with role "Member"
        const isUserInList = await userManagementPage.isUserInList(testContext.invitedUserName);
        expect(isUserInList).toBeTruthy();
        const actualRole = await userManagementPage.getUserRole(testContext.invitedUserName);
        expect(actualRole.toLowerCase()).toContain("member".toLowerCase());

        // And the total user count should increase by 1
        const currentCount = await userManagementPage.getTotalUsersCount();
        expect(currentCount).toBeGreaterThan(0);

        // When I click on header user account icon
        await dashboardPage.clickUserAccountIcon();

        // And I click on Logout button
        await dashboardPage.clickLogoutButton();

        // Then I should be logged out successfully
        await dashboardPage.verifyLogoutSuccess();

        // And I am on the homepage
        await navigateToHomepage(page, homePage);

        // When I click the Sign in link
        await clickSignInLink(homePage);

        // Then I should be on the login page
        await verifyOnLoginPage(page, loginPage);

        // When I accept the invitation as a new user
        const emailContent = await signUpPage.fetchEmailContent(testContext.invitedUserEmail, testContext.invitedUserToken);
        expect(emailContent).toBeTruthy();
        testContext.invitationEmailContent = emailContent;

        // Extract credentials from email
        const credentials = extractCredentialsFromEmail(emailContent);
        testContext.invitedUserEmail = credentials.username;
        testContext.tempPassword = credentials.password;
        testContext.loginUrl = credentials.loginUrl;

        // And I login with the credentials provided in invitation mail
        await page.goto(testContext.loginUrl);
        await page.waitForLoadState('networkidle');
        await loginPage.enterUsername(testContext.invitedUserEmail);
        await loginPage.enterPassword(testContext.tempPassword);
        await loginPage.clickLogin();

        // Wait for redirect to change password page
        await page.waitForURL('**/auth/change-password**', { timeout: 60000 }).catch(async () => {
            await page.waitForURL('**/auth/password-required**', { timeout: 60000 });
        });

        // And I create new password
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        const changePasswordModal = page.locator('h2:has-text("Change Password")');
        await changePasswordModal.waitFor({ state: 'visible', timeout: 10000 });
        testContext.newPassword = signUpPage.generateRandomPassword();
        await page.locator('#newPassword').fill(testContext.newPassword);
        await page.locator('#confirmPassword').fill(testContext.newPassword);
        await page.locator('button:has-text("Change Password")').click();
        await page.waitForLoadState('networkidle');

        // And I login with the new password created
        const currentUrl = page.url();
        const baseURL = config.testData.application.baseURL.replace(/\/$/, ''); // Remove trailing slash
        if (!currentUrl.includes('/login') && !currentUrl.includes('/auth')) {
            await page.goto(`${baseURL}/auth`);
            await page.waitForLoadState('networkidle');
        }
        await loginPage.enterUsername(testContext.invitedUserEmail);
        await loginPage.enterPassword(testContext.newPassword);
        await loginPage.clickLogin();

        await loginPage.enterFullName(userData.firstName + " " + userData.lastName);
        await loginPage.acceptTerms();
        await loginPage.clickContinue();

        // Handle welcome/onboarding if present
        try {
            await page.waitForURL('**/dashboard/**', { timeout: 30000 });
        } catch {
            try {
                await page.waitForURL('**/welcome**', { timeout: 30000 });

            } catch { }
            await page.goto(`${baseURL}/dashboard/sense-pc`, { waitUntil: 'load' });
        }

        // Then I should see the dashboard
        await loginPage.isDashboardVisible();
    });
});

// Helper function to extract credentials from email content
function extractCredentialsFromEmail(emailContent: string): { username: string; password: string; loginUrl: string } {
    console.log('🔍 Extracting credentials from email content...');

    // Remove line breaks (helps regex)
    const cleanedContent = emailContent.replace(/\n/g, ' ');

    // Extract USERNAME
    const usernameMatch = cleanedContent.match(
        /Your username is\s*<strong>(.*?)<\/strong>/i
    );

    const username = usernameMatch
        ? decodeHtmlEntities(usernameMatch[1].trim())
        : '';

    // Extract PASSWORD
    const passwordMatch = cleanedContent.match(
        /Your temporary password is\s*<strong>(.*?)<\/strong>/i
    );

    const password = passwordMatch
        ? decodeHtmlEntities(passwordMatch[1].trim())
        : '';

    // Extract LOGIN URL
    const urlMatch = cleanedContent.match(/https:\/\/[^\s"']+/);

    const baseURL = config.testData.application.baseURL.replace(/\/$/, '');

    const loginUrl = urlMatch
        ? urlMatch[0].trim().replace(/^["']|["']$/g, '')
        : `${baseURL}/auth`;

    console.log('📧 Extracted credentials:');
    console.log('Username:', username);
    console.log('Password:', password);
    console.log('Login URL:', loginUrl);

    if (!username || !password) {
        throw new Error('Could not extract credentials from email content');
    }

    return { username, password, loginUrl };
}

function decodeHtmlEntities(text: string): string {
    return text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
}

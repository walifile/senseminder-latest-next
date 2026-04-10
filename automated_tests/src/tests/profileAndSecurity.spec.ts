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
import { SecurityAndPrivacyPage } from '../pages/securityAndPrivacyPage';
import { ProfileInformationPage } from '../pages/profileInformationPage';
import { authenticator } from 'otplib';

test.describe('Update Profile and Security Settings', () => {
    test.beforeEach(async ({ page, homePage, loginPage, signUpPage, sensePCPage, dashboardPage, addCreatedUser, testContext }) => {
        test.setTimeout(120000); // 2 minutes timeout for signup, email verification, and login
        // Background: I want to be able to sign up to the application and then login with new credentials
        const context: TestContext = {
            page,
            loginPage,
            homePage,
            signUpPage,
            sensePCPage,
            billingPage: {} as any,
            dashboardPage,
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
        
        // Copy captured tokens and user data from context back to testContext for use in tests
        if (context.capturedAccessToken) {
            testContext.capturedAccessToken = context.capturedAccessToken;
        }
        if (context.capturedIdToken) {
            testContext.capturedIdToken = context.capturedIdToken;
        }
        if (context.capturedUserId) {
            testContext.capturedUserId = context.capturedUserId;
        }
        // Copy email and password to testContext so they're available after logout
        if (context.email) {
            testContext.email = context.email;
        }
        if (context.password) {
            testContext.password = context.password;
        }

        // And I should see the dashboard
        await verifyDashboardVisible(loginPage, page);
    });

    test('Enable/Disable Security MFA @enable-disable-mfa-through-authenticator-app @profile-and-security @regression', async ({
        page,
        loginPage,
        homePage,
        dashboardPage,
        testContext
    }) => {
        // Debug: Verify token is available
        console.log('🔍 Test - testContext.capturedAccessToken:', testContext.capturedAccessToken ? testContext.capturedAccessToken.substring(0, 30) + '...' : 'null');
        console.log('🔍 Test - token length:', testContext.capturedAccessToken ? testContext.capturedAccessToken.length : 0);
        
        if (!testContext.capturedAccessToken) {
            throw new Error('Access token not available in testContext. Please ensure captureAccessToken was called in beforeEach.');
        }

        // Given I am on the Security and Privacy page
        const securityAndPrivacyPage = new SecurityAndPrivacyPage(page, testContext.capturedAccessToken);
        await securityAndPrivacyPage.goto();
        const isOnPage = await securityAndPrivacyPage.verifyOnSecurityAndPrivacyPage();
        expect(isOnPage).toBeTruthy();

        // When I click on Setup for Authenticator App
        await securityAndPrivacyPage.clickSetupAuthenticatorWithFallback();

        // Then I should see Setup Authenticator App popup
        const isPopupVisible = await securityAndPrivacyPage.isAuthenticatorPopupVisible();
        expect(isPopupVisible).toBeTruthy();

        // When I setup authenticator app through API
        testContext.secretCode = await securityAndPrivacyPage.setupMFAAuthenticator();

        // And I enter 6 digit OTP code
        await securityAndPrivacyPage.enterGeneratedOTP(testContext.secretCode);

        // And I Click on Confirm button
        await securityAndPrivacyPage.clickConfirm();
        await page.waitForTimeout(3000);

        // Then I should be able to verify Disable button is displayed
        const isDisableButtonVisible = await securityAndPrivacyPage.verifyDisableButtonDisplayed();
        expect(isDisableButtonVisible).toBeTruthy();

        // When I click on header user account icon
        await dashboardPage.clickUserAccountIcon();

        // And I click on Logout button
        await dashboardPage.clickLogoutButton();

        // Then I should be logged out successfully
        await dashboardPage.verifyLogoutSuccess();

        await page.waitForTimeout(3000); // Wait for page to update after login

        // When I click the Sign in link
        await clickSignInLink(homePage);

        // Then I should be on the login page
        await verifyOnLoginPage(page, loginPage);

        // When I enter newly created email and password
        await enterNewlyCreatedCredentials(loginPage, testContext);

        // And I click the login button
        await clickLoginButton(loginPage);

        // Wait for MFA challenge to appear after login
        console.log('⏳ Waiting for MFA challenge to appear...');
        await page.waitForTimeout(3000); // Wait for page to update after login
        
        // Wait for MFA input field to be visible (with retry logic)
        const mfaSelectors = [
            'input[data-input-otp="true"]',
            'input[autocomplete="one-time-code"]',
            'input[placeholder*="code" i]',
            'input[placeholder*="OTP" i]',
            'input[placeholder*="MFA" i]'
        ];
        
        let mfaInputFound = false;
        for (const selector of mfaSelectors) {
            try {
                const mfaInput = page.locator(selector).first();
                await mfaInput.waitFor({ state: 'visible', timeout: 10000 });
                mfaInputFound = true;
                console.log(`✅ MFA input field found with selector: ${selector}`);
                break;
            } catch (error) {
                // Continue to next selector
            }
        }
        
        if (!mfaInputFound) {
            console.log('⚠️ MFA input not found with standard selectors, proceeding anyway...');
        }

        // And I enter 6 digit MFA code generated by authenticator app
        const otp = authenticator.generate(testContext.secretCode);
        await loginPage.enterMFAOTP(testContext.secretCode);

        // Then I should see the dashboard
        await verifyDashboardVisible(loginPage, page);

        // When I click on Security and Privacy link
        await dashboardPage.clickSecurityAndPrivacyLink();

        // Then I should be on the Security and Privacy page
        const securityPage = new SecurityAndPrivacyPage(page, testContext.capturedAccessToken);
        await securityPage.goto();
        const isOnSecurityPage = await securityPage.verifyOnSecurityAndPrivacyPage();
        expect(isOnSecurityPage).toBeTruthy();

        // When I click on disable button
        await securityPage.clickDisableButton();

        // Then I should be able to see Setup for Authenticator App button
        await dashboardPage.verifySetupButtonVisible();
    });

    test('Change Password @change-password @profile-and-security @regression', async ({
        page,
        loginPage,
        homePage,
        dashboardPage,
        testContext
    }) => {
        test.setTimeout(180000); // 3 minutes timeout for password change, logout, and re-login
        // Given I am on the Security and Privacy page
        const securityAndPrivacyPage = new SecurityAndPrivacyPage(page, testContext.capturedAccessToken);
        await securityAndPrivacyPage.goto();
        const isOnPage = await securityAndPrivacyPage.verifyOnSecurityAndPrivacyPage();
        expect(isOnPage).toBeTruthy();

        // When I change password with new password
        testContext.newPassword = await securityAndPrivacyPage.changePasswordWithNewPassword(testContext.password!);

        // Then I should be able to see Change Password Successfully message
        const isSuccessMessageVisible = await securityAndPrivacyPage.verifyChangePasswordSuccessMessage();
        expect(isSuccessMessageVisible).toBeTruthy();

        // When I click on header user account icon
        await dashboardPage.clickUserAccountIcon();

        // And I click on Logout button
        await dashboardPage.clickLogoutButton();

        // Then I should be logged out successfully
        await dashboardPage.verifyLogoutSuccess();

        await page.waitForTimeout(3000); // Wait for page to update after login

        // When I click the Sign in link
        await clickSignInLink(homePage);

        // Then I should be on the login page
        await verifyOnLoginPage(page, loginPage);

        // When I enter newly created email and new password
        await loginPage.enterUsername(testContext.email!);
        await loginPage.enterPassword(testContext.newPassword);

        // And I click the login button
        await clickLoginButton(loginPage);

        // Then I should be logged in successfully
        await verifyLoginSuccess(loginPage, page);

        // And I should see the dashboard
        await verifyDashboardVisible(loginPage, page);
    });

    test('Profile Settings @profile-settings @profile-and-security @regression', async ({
        page,
        testContext
    }) => {
        // Given I am on the Profile Information page
        const profileInformationPage = new ProfileInformationPage(page, testContext.capturedAccessToken);
        await profileInformationPage.goto();
        const isOnPage = await profileInformationPage.verifyOnProfileInformationPage();
        expect(isOnPage).toBeTruthy();

        // Then I should be able to verify full name
        const fullName = await profileInformationPage.getFullName();
        expect(fullName).toBeTruthy();

        // And I should be able to verify email
        const email = await profileInformationPage.getEmail();
        expect(email).toBeTruthy();

        // When I enter new full name
        testContext.newFullName = profileInformationPage.generateRandomFullName();
        await profileInformationPage.enterFullName(testContext.newFullName);

        // And I enter country
        testContext.newCountry = profileInformationPage.generateRandomCountry();
        await profileInformationPage.enterCountry(testContext.newCountry);

        // And I click on Save Changes button
        await profileInformationPage.clickSaveChangesButton();

        // Then I should be able to see Profile Updated Successfully message
        const isSuccessMessageVisible = await profileInformationPage.verifyProfileUpdatedSuccessMessage();
        expect(isSuccessMessageVisible).toBeTruthy();

        // And I should be able to verify updated full name
        const isVerified = await profileInformationPage.verifyUpdatedFullName(testContext.newFullName);
        expect(isVerified).toBeTruthy();

        // And I should be able to verify updated country
        const isCountryVerified = await profileInformationPage.verifyUpdatedCountry(testContext.newCountry);
        expect(isCountryVerified).toBeTruthy();
    });
});


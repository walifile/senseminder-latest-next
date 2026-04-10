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

test.describe('Sign Up Functionality', () => {
    test.setTimeout(120000); // 2 minutes timeout for sign up flow
    
    test('I want to be able to sign up to the application @critical @signup-test', async ({
        page,
        homePage,
        loginPage,
        signUpPage,
        sensePCPage,
        addCreatedUser,
        testContext
    }) => {
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
    });

    test('I want to be able to sign up to the application and then login with new credentials @regression @extended', async ({
        page,
        homePage,
        loginPage,
        signUpPage,
        sensePCPage,
        addCreatedUser,
        testContext
    }) => {
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

        // When I enter newly created email and password
        await enterNewlyCreatedCredentials(loginPage, context);

        // And I click the login button
        await clickLoginButton(loginPage);

        // Then I should be logged in successfully
        await verifyLoginSuccess(loginPage, page);

        // And I should see the dashboard
        await verifyDashboardVisible(loginPage, page);
    });
});


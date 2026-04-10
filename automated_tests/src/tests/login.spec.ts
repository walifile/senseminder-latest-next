import { test, expect } from '../fixtures';
import {
    navigateToHomepage,
    clickSignInLink,
    verifyOnLoginPage,
    enterValidCredentials,
    clickLoginButton,
    verifyLoginSuccess,
    verifyDashboardVisible
} from '../test-helpers';
import { customExpect } from '../utils/customAssertions';

test.describe('Login Functionality', () => {
    test('I want to be able to log in to the application @critical', async ({
        page,
        homePage,
        loginPage
    }) => {
        // Given I am on the homepage
        await navigateToHomepage(page, homePage);

        // When I click the Sign in link
        await clickSignInLink(homePage);

        // Then I should be on the login page
        await verifyOnLoginPage(page, loginPage);

        // When I enter valid email and password
        await enterValidCredentials(loginPage);

        // And I click the login button
        await clickLoginButton(loginPage);

        // Then I should be logged in successfully
        await verifyLoginSuccess(loginPage, page);

        // And I should see the dashboard
        await verifyDashboardVisible(loginPage, page);
    });
});


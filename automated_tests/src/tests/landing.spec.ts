import { test, expect } from '../fixtures';
import { navigateToHomepage } from '../test-helpers';
import { customExpect } from '../utils/customAssertions';

test.describe('Landing page functionality', () => {
    test.beforeEach(async ({ page, homePage }) => {
        // Background: I am logged in as an admin user
        // Given I am on the homepage
        await navigateToHomepage(page, homePage);
    });

    test('Get started button navigation @landing @regression @ui', async ({ page, landingPage, signUpPage }) => {
        // Given I click on get started
        await landingPage.clickGetStarted();
        await page.waitForLoadState('networkidle');

        // Then I should be on the sign up page
        const isOnSignUpPage = await signUpPage.isOnSignUpPage();
        await customExpect.toBeTruthy(isOnSignUpPage, 'I should be on the sign up page');
    });
});


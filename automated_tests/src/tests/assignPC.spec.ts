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
import { config } from '../config/environment';

test.describe('Assign PC Functionality', () => {
    test.beforeEach(async ({ page, homePage, loginPage }) => {
        test.setTimeout(120000); // 2 minutes timeout for login flow
        // Background: Login to the application
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

    test('Assign user to PC @assign-pc @regression', async ({
        page,
        loginPage,
        sensePCPage,
        testContext
    }) => {
        test.setTimeout(600000); // 10 minutes timeout to allow PC building (up to 9.33 min) and operations time
        // Given I am on the dashboard
        const isDashboardVisible = await loginPage.isDashboardVisible();
        await customExpect.toBeTruthy(isDashboardVisible, 'I am on the dashboard');

        // When I click on Sense PC from side navigation bar
        await sensePCPage.clickSensePCFromSidebar();

        // Then I should be on the Sense PCs page for an existing user
        const isSensePCPageVisible = await sensePCPage.isSensePCPageVisible();
        expect(isSensePCPageVisible).toBeTruthy();

        // When I click on Build Sense PC button
        await sensePCPage.clickBuildSensePCButton();

        // And I enter Name of the computer
        await sensePCPage.enterComputerName("Test_Computer", testContext);

        await sensePCPage.selectNewCPUAndMemoryConfig("SensePC.Standard11—4Cores·16GBRAM");

        // And I click on Estimate button
        await sensePCPage.clickEstimateButton();

        // And I click on Build PC button
        await sensePCPage.clickBuildPCButton();

        // Then I should be able to verify Estimated total using API-calculated price
        const configId = "SensePC.Standard11—4Cores·16GBRAM";
        const expectedPrice = await sensePCPage.getCalculatedHourlyPrice(configId);
        const estimatedTotal = await sensePCPage.getEstimatedTotal();
        expect(estimatedTotal).toContain(expectedPrice);

        // When I check I acknowledge and accept above statement
        await sensePCPage.checkAcknowledgeStatement();

        // And I Click on Confirm & Pay button
        await sensePCPage.clickConfirmAndPayButton();

        // Then I should be able to verify Newly create PC Name Record on list for an existing user
        const isPCDisplayed = await sensePCPage.isCreatedPCDisplayed(testContext);
        expect(isPCDisplayed).toBeTruthy();

        // When I wait for the PC to complete building and start running
        const isStatusChanged = await sensePCPage.isStatusChangedToRunning();
        expect(isStatusChanged).toBeTruthy();

        // And I click on stop button for that PC
        await sensePCPage.clickStopPC(testContext);

        // And I click on Yes, Stop button
        await sensePCPage.clickStopConfirmButton();

        // Then I should be able to see newly created PC and its status as "Stopped"
        const isCreatedPCDisplayed = await sensePCPage.isCreatedPCDisplayed(testContext);
        await customExpect.toBeTruthy(isCreatedPCDisplayed, 'I should be able to see newly created PC');
        const isPCStatusVisible = await sensePCPage.verifyPCStatus("Stopped", testContext);
        await customExpect.toBeTruthy(isPCStatusVisible, 'I should be able to see newly created PC and its status as Stopped');

        // When I click on more button for that PC
        await sensePCPage.clickMoreButton(testContext);

        // And I click on Assign User button for that PC
        await sensePCPage.clickAssignUserButton();

        // Then I should be able to see "Assign SmartPC" modal
        let isModalVisible = await sensePCPage.isAssignSmartPCModalVisible();
        expect(isModalVisible).toBeTruthy();

        // And I should be able to verify Assign to Member displays "Doe"
        const isUserDisplayed = await sensePCPage.verifyAssignToMemberDisplaysUser("Doe");
        expect(isUserDisplayed).toBeTruthy();

        // When I click on "Doe" user
        await sensePCPage.clickUser("Doe");
        await page.waitForTimeout(5000);

         // When I click on more button for that PC
         await sensePCPage.clickMoreButton(testContext);

         // And I click on Assign User button for that PC
         await sensePCPage.clickAssignUserButton();
 
         // Then I should be able to see "Assign SmartPC" modal
         isModalVisible = await sensePCPage.isAssignSmartPCModalVisible();
         expect(isModalVisible).toBeTruthy();

        // Then I should be able to see "Doe" user is assigned to PC
        const isUserAssigned = await sensePCPage.verifyUserAssignedToPC("Doe");
        expect(isUserAssigned).toBeTruthy();
    });
});


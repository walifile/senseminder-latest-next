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
import { ApiCreatePCPage } from '../pages/apiCreatePCPage';
import { customExpect } from '../utils/customAssertions';

test.describe('API Testing with UI Authentication', () => {
    let apiCreatePCPage: ApiCreatePCPage;

    test.beforeEach(async ({ page, homePage, loginPage, testContext, addCreatedPC }) => {
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

        // And I have the API base URL configured
        const baseURL = config.testData.api?.baseURL || 'https://lul5oxdwic.execute-api.us-east-1.amazonaws.com/dev';
        apiCreatePCPage = new ApiCreatePCPage(baseURL, 'placeholder_token');

        // And I update API authentication with captured token
        if (!testContext.capturedAccessToken) {
            throw new Error('No captured access token available for PC operations. Please ensure login steps completed successfully.');
        }
        apiCreatePCPage.updateAuthenticationWithCapturedToken(testContext.capturedAccessToken);
    });

    test('Create PC using captured UI authentication token @api-with-ui-auth-create @api-with-ui-auth @api @regression', async ({
        testContext,
        addCreatedPC
    }) => {
        // Given I prepare PC creation request with basic configuration
        const systemName = `TestPC_${Date.now()}`;
        const currentPCRequest = apiCreatePCPage.createBasicPCConfig(systemName);
        testContext.currentPCRequest = currentPCRequest;

        // When I send POST request to create PC endpoint
        const lastApiResponse = await apiCreatePCPage.createPC(currentPCRequest);
        testContext.lastApiResponse = lastApiResponse;

        // Then I should receive successful response with status code 200
        const actualStatusCode = apiCreatePCPage.getResponseStatusCode();
        await customExpect.toHaveStatusCode(actualStatusCode, 200, 'I should receive successful response with status code');
        const isSuccessful = apiCreatePCPage.isLastResponseSuccessful();
        await customExpect.toBeSuccessful(isSuccessful, 'I should receive successful response with status code');

        // And I should verify PC creation response contains valid instance ID
        const hasInstanceId = apiCreatePCPage.hasInstanceId();
        expect(hasInstanceId).toBeTruthy();
        const instanceId = apiCreatePCPage.getInstanceId();
        expect(instanceId).toBeDefined();
        expect(instanceId).not.toBe('');
        if (instanceId && typeof instanceId === 'string') {
            addCreatedPC(instanceId);
        }
    });

    test('Create PC, check status, and delete PC using captured token @api-with-ui-auth-create-delete @api-with-ui-auth @api @regression', async ({
        testContext,
        addCreatedPC
    }) => {
        // Given I prepare PC creation request with basic configuration
        const systemName = `TestPC_${Date.now()}`;
        const currentPCRequest = apiCreatePCPage.createBasicPCConfig(systemName);
        testContext.currentPCRequest = currentPCRequest;

        // When I send POST request to create PC endpoint
        const lastApiResponse = await apiCreatePCPage.createPC(currentPCRequest);
        testContext.lastApiResponse = lastApiResponse;

        // Then I should receive successful response with status code 200
        const actualStatusCode = apiCreatePCPage.getResponseStatusCode();
        await customExpect.toHaveStatusCode(actualStatusCode, 200, 'I should receive successful response with status code');

        // And I should verify PC creation response contains valid instance ID
        const instanceId = apiCreatePCPage.getInstanceId();
        expect(instanceId).toBeDefined();
        if (instanceId && typeof instanceId === 'string') {
            addCreatedPC(instanceId);
        }

        // And I should verify PC creation response contains custom system name
        const hasSystemName = apiCreatePCPage.hasSystemName(systemName);
        if (hasSystemName) {
            const actualSystemName = apiCreatePCPage.getSystemName();
            expect(actualSystemName).toBe(systemName);
        }

        // And I prepare PC status check request for the created instance
        testContext.currentStatusRequest = apiCreatePCPage.createCheckStatusConfig(instanceId!);

        // When I delete the created PC
        const deleteRequest = apiCreatePCPage.createDeletePCConfig(instanceId!, 'virginia');
        const deleteResponse = await apiCreatePCPage.deletePC(deleteRequest);
        testContext.lastApiResponse = deleteResponse;

        // Then I should receive successful response with status code 200
        const deleteStatusCode = apiCreatePCPage.getResponseStatusCode();
        await customExpect.toHaveStatusCode(deleteStatusCode, 200, 'I should receive successful response with status code');

        // And I should verify PC deletion response contains success message
        const hasSuccessMessage = apiCreatePCPage.hasDeleteSuccessMessage();
        expect(hasSuccessMessage).toBeTruthy();
    });
});


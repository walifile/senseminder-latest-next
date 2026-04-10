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

test.describe('Sense Storage', () => {
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

        // Given I navigate to the Sense Storage page
        await sensePCPage.clickSenseCloudFromSidebar();
    });

    test('Upload a single file successfully and View file in file viewer @sensestorage @regression @ui', async ({
        page,
        senseStoragePage,
        sensePCPage
    }) => {
        // When I click on the Upload button
        const isModalVisible = await senseStoragePage.validateUploadButtonClick();
        expect(isModalVisible).toBeTruthy();

        // And I upload a file "file-sample_150kB.pdf" with size less than 10MB
        await senseStoragePage.uploadFileWithValidation("./test-files/file-sample_150kB.pdf", 1);

        // Then I should be able to see the file in the file list
        const isValid = await senseStoragePage.validateFileListNotEmpty();
        expect(isValid).toBeTruthy();

        // And I dismiss any feedback popup
        try {
            await sensePCPage.handleSkipButtonIfPresent();
        } catch (error) {
            console.log('⚠️ Failed to dismiss feedback popup, continuing with test:', error);
        }

       // await senseStoragePage.closeUploadModal();

        // When I click on menu of the file "file-sample_150kB.pdf" in the file list
        await senseStoragePage.clickFileMenu("file-sample_150kB.pdf");

        // And I click on view button in the menu
        await senseStoragePage.clickViewButton();

        // Then The file viewer should open with title containing "Preview: file-sample_150kB.pdf"
        const isViewerOpen = await senseStoragePage.validateFileViewerOpenWithTitle("file-sample_150kB.pdf");
        expect(isViewerOpen).toBeTruthy();

        // And I should see the file content displayed for "file-sample_150kB.pdf"
        const isContentVisible = await senseStoragePage.validateFileContentDisplayed("file-sample_150kB.pdf");
        expect(isContentVisible).toBeTruthy();

        // And I should be able to close the file viewer for "file-sample_150kB.pdf"
        const isViewerClosed = await senseStoragePage.validateFileViewerClosed("file-sample_150kB.pdf");
        expect(isViewerClosed).toBeTruthy();

        // When I select the uploaded files "file-sample_150kB.pdf, test-document.docx, image.png"
        const files = ["./test-files/file-sample_150kB.pdf"];
        await senseStoragePage.selectMultipleFiles(files);

        // And I click on the menu at the top right corner
        await senseStoragePage.clickTopRightMenu();

        // And I click on deleted selected button
        await senseStoragePage.clickDeleteSelectedButton();

        // And I click on confirm delete button
        await senseStoragePage.clickConfirmDeleteButton();

        // Then The selected files "file-sample_150kB.pdf, test-document.docx, image.png" should not appear in the file list
        const filesDeleted = await senseStoragePage.validateFilesNotInList(files);
        expect(filesDeleted).toBeTruthy();

    });

    test('Upload multiple files in bulk and delete multiple files in bulk @sensestorage @regression @ui', async ({
        page,
        senseStoragePage,
        sensePCPage
    }) => {

        // When I click on the Upload button
        const isModalVisible = await senseStoragePage.validateUploadButtonClick();
        expect(isModalVisible).toBeTruthy();

        // And I upload multiple files "file-sample_150kB.pdf, test-document.docx, image.png" with total size less than 10MB
        const files = ["./test-files/file-sample_150kB.pdf", "./test-files/test-document.docx", "./test-files/image.png"];
        await senseStoragePage.uploadMultipleFilesWithValidation(files);

        // Then All files should appear in the file list
        const isValid = await senseStoragePage.validateFileListNotEmpty();
        expect(isValid).toBeTruthy();

        // And I dismiss any feedback popup
        try {
            await sensePCPage.handleSkipButtonIfPresent();
        } catch (error) {
            console.log('⚠️ Failed to dismiss feedback popup, continuing with test:', error);
        }

       // await senseStoragePage.closeUploadModal();

        // When I select the uploaded files "file-sample_150kB.pdf, test-document.docx, image.png"
        await senseStoragePage.selectMultipleFiles(files);

        // And I click on the menu at the top right corner
        await senseStoragePage.clickTopRightMenu();

        // And I click on deleted selected button
        await senseStoragePage.clickDeleteSelectedButton();

        // And I click on confirm delete button
        await senseStoragePage.clickConfirmDeleteButton();

        // Then The selected files "file-sample_150kB.pdf, test-document.docx, image.png" should not appear in the file list
        const filesDeleted = await senseStoragePage.validateFilesNotInList(files);
        expect(filesDeleted).toBeTruthy();
    });

    test('Share file with another account @sensestorage @regression @ui', async ({
        page,
        senseStoragePage,
        sensePCPage,
        captureScreenshot
    }) => {

        // When I click on the Upload button
        const isModalVisible = await senseStoragePage.validateUploadButtonClick();
        expect(isModalVisible).toBeTruthy();

        // And I upload a file "file-sample_150kB.pdf" with size less than 10MB
        await senseStoragePage.uploadFileWithValidation("./test-files/file-sample_150kB.pdf", 1);

        // Then I should be able to see the file in the file list
        const isValid = await senseStoragePage.validateFileListNotEmpty();
        expect(isValid).toBeTruthy();

        // And I dismiss any feedback popup
        try {
            await sensePCPage.handleSkipButtonIfPresent();
        } catch (error) {
            console.log('⚠️ Failed to dismiss feedback popup, continuing with test:', error);
        }

        //await senseStoragePage.closeUploadModal();

        // When I click on menu of the file "file-sample_150kB.pdf" in the file list
        await senseStoragePage.clickFileMenu("file-sample_150kB.pdf");

        // And I click on the share button for file "file-sample_150kB.pdf"
        await senseStoragePage.clickShareButton("file-sample_150kB.pdf");

        // Then The share modal should open with title containing "Share file-sample_150kB.pdf"
        const isValidModal = await senseStoragePage.validateShareModalWithTitle("Share file-sample_150kB.pdf", captureScreenshot);
        expect(isValidModal).toBeTruthy();

        // When I click on the share button
        await senseStoragePage.clickShareConfirmButton();

        // And I click on close button
        await senseStoragePage.clickShareCloseButton();

        // Then I should see the status of "file-sample_150kB.pdf" is set to "Shared"
        const isStatusCorrect = await senseStoragePage.validateFileStatus("file-sample_150kB.pdf", "Shared");
        expect(isStatusCorrect).toBeTruthy();

        
        // When I select the uploaded files "file-sample_150kB.pdf, test-document.docx, image.png"
        const files = ["./test-files/file-sample_150kB.pdf"];
        await senseStoragePage.selectMultipleFiles(files);

        // And I click on the menu at the top right corner
        await senseStoragePage.clickTopRightMenu();

        // And I click on deleted selected button
        await senseStoragePage.clickDeleteSelectedButton();

        // And I click on confirm delete button
        await senseStoragePage.clickConfirmDeleteButton();

        // Then The selected files "file-sample_150kB.pdf, test-document.docx, image.png" should not appear in the file list
        const filesDeleted = await senseStoragePage.validateFilesNotInList(files);
        expect(filesDeleted).toBeTruthy();
    });
});


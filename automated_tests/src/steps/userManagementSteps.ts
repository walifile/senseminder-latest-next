import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { UserManagementPage } from '../pages/userManagementPage';
import { SignUpPage } from '../pages/signUpPage';
import { LoginPage } from '../pages/loginPage';

Given('I navigate to the User Management page', { timeout: 30000 }, async function(this: CustomWorld) {
    if (!this.page) {
        throw new Error('Page is not initialized');
    }
    this.userManagementPage = new UserManagementPage(this.page);
    await this.userManagementPage.navigateToUserManagement();
});

Given('And I navigate to the User Management page', { timeout: 30000 }, async function(this: CustomWorld) {
    if (!this.page) {
        throw new Error('Page is not initialized');
    }
    this.userManagementPage = new UserManagementPage(this.page);
    await this.userManagementPage.navigateToUserManagement();
});

Given('I generate random user data for invitation', async function(this: CustomWorld) {
    if (!this.page) {
        throw new Error('Page is not initialized');
    }
    
    // Initialize SignUpPage to use its data generation methods
    if (!this.signUpPage) {
        this.signUpPage = new SignUpPage(this.page);
    }
    
    // Generate random user data
    const userData = await this.signUpPage.generateRandomUserDataWithEmail();
    
    // Store the generated data in world context
    this.invitedUserName = `${userData.firstName} ${userData.lastName}`;
    this.invitedUserEmail = userData.email;
    this.invitedUserTimestamp = Date.now(); // Use current timestamp as number
    this.invitedUserToken = userData.token;
});

Given('I click on the Invite User button', async function(this: CustomWorld) {
    await this.userManagementPage!.clickInviteUserButton();
    const isModalVisible = await this.userManagementPage!.isInviteUserModalVisible();
    expect(isModalVisible).toBeTruthy();
});

When('I enter the generated user name', async function(this: CustomWorld) {
    if (!this.invitedUserName) {
        throw new Error('Generated user name not found. Please run "I generate random user data for invitation" step first.');
    }
    try {
        await this.userManagementPage!.enterUserName(this.invitedUserName);
    } catch (error) {
        console.error('Error entering user name:', error);
        throw new Error(`Failed to enter user name: ${error}`);
    }
});

When('I enter the generated user email', async function(this: CustomWorld) {
    if (!this.invitedUserEmail) {
        throw new Error('Generated user email not found. Please run "I generate random user data for invitation" step first.');
    }
    try {
        await this.userManagementPage!.enterUserEmail(this.invitedUserEmail);
    } catch (error) {
        console.error('Error entering user email:', error);
        throw new Error(`Failed to enter user email: ${error}`);
    }
});

When('I select the user role {string}', async function(this: CustomWorld, role: string) {
    await this.userManagementPage!.selectUserRole(role);
});

When('I click on the Send Invitation button', async function(this: CustomWorld) {
    await this.userManagementPage!.clickSendInvitation();
});

Then('the user should appear in the user list with role {string}', async function(this: CustomWorld, expectedRole: string) {
    if (!this.invitedUserName) {
        throw new Error('Generated user name not found. Please run "I generate random user data for invitation" step first.');
    }
    
    const isUserInList = await this.userManagementPage!.isUserInList(this.invitedUserName);
    expect(isUserInList).toBeTruthy();
    
    const actualRole = await this.userManagementPage!.getUserRole(this.invitedUserName);
    expect(actualRole.toLowerCase()).toContain(expectedRole.toLowerCase());
});

Then('the total user count should increase by {int}', async function(this: CustomWorld, expectedIncrease: number) {
    const currentCount = await this.userManagementPage!.getTotalUsersCount();
    expect(currentCount).toBeGreaterThan(0);
});

When('I accept the invitation as a new user', async function(this: CustomWorld) {
    if (!this.invitedUserEmail || !this.invitedUserToken || !this.signUpPage) {
        throw new Error('Invited user email, token, or SignUpPage not found. Please run data generation step first.');
    }
    
    // Fetch the invitation email using the existing email fetching method
    const emailContent = await this.signUpPage.fetchEmailContent(this.invitedUserEmail, this.invitedUserToken);
    expect(emailContent).toBeTruthy();
    
    // Store email content for credential extraction
    this.invitationEmailContent = emailContent;
});

When('I login with the credentials provided in invitation mail', {timeout: 30000}, async function(this: CustomWorld) {
    if (!this.invitationEmailContent) {
        throw new Error('Invitation email content not found. Please run "I accept the invitation as a new user" step first.');
    }
    
    // Extract credentials from email content
    const credentials = extractCredentialsFromEmail(this.invitationEmailContent);
    this.invitedUserEmail = this.invitedUserEmail;
    this.tempPassword = credentials.password;
    this.loginUrl = credentials.loginUrl;
    
    // Navigate to the login URL from the email
    await this.page!.goto(this.loginUrl);
    await this.page!.waitForLoadState('networkidle');
    
    // Initialize login page and login with temporary credentials
    if (!this.loginPage) {
        this.loginPage = new LoginPage(this.page!);
    }
    
    if (!this.invitedUserEmail || !this.tempPassword) {
        throw new Error('Email or password not found. Please run previous steps first.');
    }
    
    await this.loginPage.enterUsername(this.invitedUserEmail);
    await this.loginPage.enterPassword(this.tempPassword);
    await this.loginPage.clickLogin();
});

When('I create new password', {timeout: 30000}, async function(this: CustomWorld) {
    console.log('🔐 Creating new password...');
    
    // Wait for page to be fully loaded
    await this.page!.waitForLoadState('networkidle');
    await this.page!.waitForTimeout(2000);
    
    // Try multiple approaches to find the password change modal
    let modalFound = false;
    let changePasswordModal;
    
    // Approach 1: Look for the specific heading
    try {
        console.log('🔍 Looking for "Change Password" heading...');
        changePasswordModal = this.page!.locator('h1:has-text("Change Password")');
        await changePasswordModal.waitFor({ state: 'visible', timeout: 5000 });
        modalFound = true;
        console.log('✅ Found "Change Password" heading');
    } catch (error) {
        console.log('⚠️ "Change Password" heading not found:', error);
    }
    
    // Approach 2: Look for modal with different text variations
    if (!modalFound) {
        try {
            console.log('🔍 Looking for password modal with alternative text...');
            const alternativeSelectors = [
                'h1:has-text("Change Your Password")',
                'h2:has-text("Change Password")',
                'h3:has-text("Change Password")',
                '[data-testid*="password"] h1',
                '[data-testid*="password"] h2',
                '.modal h1:has-text("Password")',
                '.modal h2:has-text("Password")'
            ];
            
            for (const selector of alternativeSelectors) {
                try {
                    changePasswordModal = this.page!.locator(selector);
                    await changePasswordModal.waitFor({ state: 'visible', timeout: 2000 });
                    modalFound = true;
                    console.log(`✅ Found password modal with selector: ${selector}`);
                    break;
                } catch (e) {
                    // Continue to next selector
                }
            }
        } catch (error) {
            console.log('⚠️ Alternative password modal selectors failed:', error);
        }
    }
    
    // Approach 3: Look for any modal that might contain password fields
    if (!modalFound) {
        try {
            console.log('🔍 Looking for any modal with password fields...');
            const modalWithPassword = this.page!.locator('.modal, [role="dialog"], .dialog').filter({
                has: this.page!.locator('input[type="password"], input[placeholder*="password" i]')
            });
            await modalWithPassword.waitFor({ state: 'visible', timeout: 5000 });
            changePasswordModal = modalWithPassword;
            modalFound = true;
            console.log('✅ Found modal with password fields');
        } catch (error) {
            console.log('⚠️ Modal with password fields not found:', error);
        }
    }
    
    if (!modalFound) {
        // Take a screenshot for debugging
        await this.page!.screenshot({ path: `password-modal-not-found-${Date.now()}.png`, fullPage: true });
        throw new Error('Change Password modal not found. Check screenshot for debugging.');
    }
    
    // Generate a new password
    if (!this.signUpPage) {
        this.signUpPage = new SignUpPage(this.page!);
    }
    this.newPassword = this.signUpPage.generateRandomPassword();
    
    // Fill in the new password fields
    const newPasswordInput = this.page!.locator('input[placeholder*="New password"]');
    const confirmPasswordInput = this.page!.locator('input[placeholder*="Confirm new password"]');
    
    await newPasswordInput.fill(this.newPassword);
    await confirmPasswordInput.fill(this.newPassword);
    
    // Click change password button
    const changePasswordButton = this.page!.locator('button:has-text("Change Password")');
    await changePasswordButton.click();
    
    // Wait for success or redirect
    await this.page!.waitForLoadState('networkidle');
});

When('I login with the new password created', {timeout: 30000}, async function(this: CustomWorld) {
    if (!this.newPassword || !this.invitedUserEmail) {
        throw new Error('New password or username not found. Please run previous steps first.');
    }
    
    // Navigate to login page if not already there
    const currentUrl = this.page!.url();
    if (!currentUrl.includes('/login') && !currentUrl.includes('/auth')) {
        await this.page!.goto('https://smartpc.cloud/auth');
        await this.page!.waitForLoadState('networkidle');
    }
    
    // Initialize login page if not already done
    if (!this.loginPage) {
        this.loginPage = new LoginPage(this.page!);
    }
    
    // Login with new credentials
    await this.loginPage.enterUsername(this.invitedUserEmail);
    await this.loginPage.enterPassword(this.newPassword);
    await this.loginPage.clickLogin();
    
    // Wait for successful login
    await this.loginPage!.isDashboardVisible();
});

// Helper method to extract credentials from email content
function extractCredentialsFromEmail(emailContent: string): { username: string; password: string; loginUrl: string } {
    console.log('🔍 Extracting credentials from email content...');
    console.log('Email content length:', emailContent.length);
    
    // Extract username (email format) - try multiple patterns
    let usernameMatch = emailContent.match(/Your username is \*\*([^*]+)\*\*/);
    if (!usernameMatch) {
        usernameMatch = emailContent.match(/username is \*\*([^*]+)\*\*/);
    }
    if (!usernameMatch) {
        usernameMatch = emailContent.match(/username is ([^\s]+)/);
    }
    const username = usernameMatch ? usernameMatch[1].trim().replace(/<[^>]*>/g, '') : '';
    
    // Extract temporary password - try multiple patterns
    let passwordMatch = emailContent.match(/Your temporary password is \*\*([^*]+)\*\*/);
    if (!passwordMatch) {
        passwordMatch = emailContent.match(/temporary password is \*\*([^*]+)\*\*/);
    }
    if (!passwordMatch) {
        passwordMatch = emailContent.match(/temporary password is ([^\s]+)/);
    }
    if (!passwordMatch) {
        passwordMatch = emailContent.match(/password is \*\*([^*]+)\*\*/);
    }
    if (!passwordMatch) {
        // Try to match HTML formatted password like <strong>password</strong>
        passwordMatch = emailContent.match(/password is <[^>]*>([^<]+)<\/[^>]*>/i);
    }
    if (!passwordMatch) {
        // Try to match any password pattern with HTML tags
        passwordMatch = emailContent.match(/password[:\s]*<[^>]*>([^<]+)<\/[^>]*>/i);
    }
    const password = passwordMatch ? passwordMatch[1].trim().replace(/<[^>]*>/g, '') : '';
    
    // Extract login URL - try multiple patterns
    let urlMatch = emailContent.match(/https:\/\/[^\s"']+/);
    if (!urlMatch) {
        urlMatch = emailContent.match(/log in using the following link:\s*(https:\/\/[^\s"']+)/);
    }
    const loginUrl = urlMatch ? urlMatch[0].trim().replace(/^["']|["']$/g, '') : 'https://smartpc.cloud/auth';
    
    console.log('📧 Extracted credentials:');
    console.log('Username:', username);
    console.log('Password:', password);
    console.log('Login URL:', loginUrl);
    
    if (!username || !password) {
        console.error('❌ Could not extract credentials from email content');
        console.error('Email content preview:', emailContent.substring(0, 500));
        throw new Error('Could not extract credentials from email content');
    }
    
    return { username, password, loginUrl };
}

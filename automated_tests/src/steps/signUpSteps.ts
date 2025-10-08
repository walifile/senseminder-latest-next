import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { SensePCPage } from '../pages/sensePCPage';
import { CustomWorld } from '../support/world';
import { SignUpPage } from '../pages/signUpPage';
import { customExpect } from '../utils/customAssertions';
import { errorHandler } from '../utils/errorHandler';

When('I click the Sign up link', async function(this: CustomWorld) {
    if (!this.page) {
        throw new Error('Page is not initialized');
    }

    if (!this.signUpPage) {
        this.signUpPage = new SignUpPage(this.page);
    }
    
    await this.signUpPage.clickSignUpLink();
});

Then('I should be on the sign up page', async function(this: CustomWorld) {
    if (!this.page) {
        await errorHandler.handleTestFailure(new Error('Sign up page is not initialized'), 'I should be on the sign up page');
        return;
    }
    this.signUpPage = new SignUpPage(this.page);
    const isOnSignUpPage = await this.signUpPage.isOnSignUpPage();
    await customExpect.toBeTruthy(isOnSignUpPage, 'I should be on the sign up page');
});

Then('I should be on verify email page', { timeout: 30000 }, async function(this: CustomWorld) {
    if (!this.page) {
        await errorHandler.handleTestFailure(new Error('Sign up page is not initialized'), 'I should be on verify email page');
        return;
    }
    this.signUpPage = new SignUpPage(this.page);
    const isOnVerifyEmailPage = await this.signUpPage.isOnVerifyEmailPage();
    await customExpect.toBeTruthy(isOnVerifyEmailPage, 'I should be on verify email page');
});

When('I enter all the details', { timeout: 30000 }, async function(this: CustomWorld) {
    if (!this.signUpPage) {
        throw new Error('Sign up page is not initialized');
    }
    
    // Generate all user data with the same timestamp
    const userData = await this.signUpPage.generateRandomUserDataWithEmail();
    
    // Store the data in world context
    this.email = userData.email;
    this.mailPassword = userData.password;
    this.token = userData.token;
    this.password = this.signUpPage.generateRandomPassword();
    
    console.log("🎯 Generated user data with shared timestamp:", userData.timestamp);
    console.log("📧 Email:", userData.email);
    console.log("👤 First Name:", userData.firstName);
    console.log("👤 Last Name:", userData.lastName);
    console.log("🔑 Token:", this.token);
    console.log("🔑 Password:", this.password);
    
    await this.signUpPage.enterSignUpDetails(userData.firstName, userData.lastName, userData.email, this.password);
});

When('I enter OTP', { timeout: 60000 }, async function(this: CustomWorld) {
    if (!this.signUpPage) {
        throw new Error('Sign up page is not initialized');
    }
    
    if (!this.token) {
        throw new Error('Token not found. Please run "I enter all the details" step first.');
    }
    
    const otp = await this.signUpPage.getOtpFromMailTm(this.token);
    await this.signUpPage.enterOTP(otp);
});

When('I click the sign up button', async function(this: CustomWorld) {
    if (!this.signUpPage) {
        throw new Error('Sign up page is not initialized');
    }
    await this.signUpPage.clickSignUp();
});

When('I click the verify OTP button', { timeout: 30000 }, async function(this: CustomWorld) {
    if (!this.signUpPage) {
        throw new Error('Sign up page is not initialized');
    }
    await this.signUpPage.clickVerifyOTPButton();
});

Then('I should be signed up successfully' , { timeout: 60000 }, async function(this: CustomWorld) {
    if (!this.signUpPage) {
        throw new Error('Sign up page is not initialized');
    }
    
    // Verify the success message is visible
    const isSuccessMessageVisible = await this.signUpPage.isSignUpSuccessMessageVisible();
    expect(isSuccessMessageVisible).toBeTruthy();
    
    // Add the created user to cleanup list for automatic deletion after test (only once)
    if (this.email && (!this.createdUsers || !this.createdUsers.includes(this.email))) {
        this.addCreatedUser(this.email);
        console.log(`📝 Added user ${this.email} to cleanup list for automatic deletion`);
    } else if (this.email) {
        console.log(`ℹ️ User ${this.email} already in cleanup list, skipping duplicate`);
    }
});

Then('I should be able to verify email successfully', { timeout: 90000 }, async function(this: CustomWorld) {
    if (!this.signUpPage) {
        throw new Error('Sign up page is not initialized');
    }

    console.log('🔍 Verifying email verification success...');
    
    // Verify the success message is visible
    const isSuccessMessageVisible = await this.signUpPage.isVerifyOTPSuccessMessageVisible();
    
    if (!isSuccessMessageVisible) {
        console.log('❌ Email verification success message not found');
        console.log('🔍 Taking screenshot for debugging...');
        await this.captureScreenshot('email-verification-failure', 'error');
        throw new Error('Email verification success message not found. Check screenshot for debugging.');
    }
    
    console.log('✅ Email verification successful');
    expect(isSuccessMessageVisible).toBeTruthy();
    
    // Add the created user to cleanup list for automatic deletion after test (only once)
    if (this.email && (!this.createdUsers || !this.createdUsers.includes(this.email))) {
        this.addCreatedUser(this.email);
        if (this.page) {
            this.sensePCPage = new SensePCPage(this.page);
            await this.sensePCPage.isNewlyCreatedUser();
        }
        console.log(`📝 Added user ${this.email} to cleanup list for automatic deletion`);
    } else if (this.email) {
        console.log(`ℹ️ User ${this.email} already in cleanup list, skipping duplicate`);
    }
});

When('I enter newly created email and password', { timeout: 15000 }, async function(this: CustomWorld) {
        if (!this.loginPage) {
            throw new Error('Login page is not initialized');
        }
        if (!this.email) {
            throw new Error('Email not found. Please run "I enter all the details" step first.');
        }
        
        if (!this.password) {
            throw new Error('Password not found. Please run "I enter all the details" step first.');
        }
        
        await this.loginPage.enterUsername(this.email);
        await this.loginPage.enterPassword(this.password);
});
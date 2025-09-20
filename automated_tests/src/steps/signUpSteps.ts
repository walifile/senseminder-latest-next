import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import { CustomWorld } from '../support/world';
import { config, getTestData } from '../config/environment';
import { SignUpPage } from '../pages/signUpPage';

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
        throw new Error('Sign up page is not initialized');
    }
    this.signUpPage = new SignUpPage(this.page);
    const isOnSignUpPage = await this.signUpPage.isOnSignUpPage();
    expect(isOnSignUpPage).toBeTruthy();
});

Then('I should be on verify email page', { timeout: 30000 }, async function(this: CustomWorld) {
    if (!this.page) {
        throw new Error('Sign up page is not initialized');
    }
    this.signUpPage = new SignUpPage(this.page);
    const isOnVerifyEmailPage = await this.signUpPage.isOnVerifyEmailPage();
    expect(isOnVerifyEmailPage).toBeTruthy();
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
});

Then('I should be able to verify email successfully', { timeout: 30000 }, async function(this: CustomWorld) {
    if (!this.signUpPage) {
        throw new Error('Sign up page is not initialized');
    }

    // Verify the success message is visible
    const isSuccessMessageVisible = await this.signUpPage.isVerifyOTPSuccessMessageVisible();
    expect(isSuccessMessageVisible).toBeTruthy();
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
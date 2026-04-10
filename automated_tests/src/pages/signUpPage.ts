import { Page, Locator } from '@playwright/test';
import axios from 'axios';
import { expect } from '@playwright/test';
import * as dotenv from 'dotenv';
import https from 'https';

// Load environment variables
dotenv.config();

const createAxiosInstance = () => {
    const httpsAgent = new https.Agent({
        rejectUnauthorized: false, // Allow self-signed or expired certificates
        minVersion: 'TLSv1.2',
        maxVersion: 'TLSv1.3'
    });
    
    return axios.create({
        httpsAgent,
        timeout: 30000,
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'SensePC-Test-Automation/1.0'
        }
    });
};

// Separate axios instance for Mailisk API with proper SSL settings
const createMailiskAxiosInstance = () => {
    // Use default Node.js HTTPS agent for Mailisk
    // Note: If you encounter SSL errors, it might indicate:
    // 1. The API endpoint URL is incorrect
    // 2. Mailisk may require using their client library instead of direct REST calls
    // 3. Check https://docs.mailisk.com/ for the correct API endpoint format
    return axios.create({
        timeout: 30000,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'SensePC-Test-Automation/1.0'
        }
    });
};

// Global set to track used email IDs across test runs to avoid reusing old MFA codes
const usedEmailIds = new Set<string>();

export class SignUpPage {
    readonly page: Page;
    readonly firstnameInput: Locator;
    readonly lastnameInput: Locator;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly confirmPasswordInput: Locator;
    readonly acceptTermsCheckbox: Locator;
    readonly signUpLink: Locator;
    readonly signUpButton: Locator;
    readonly successMsg: Locator;
    readonly otpInput: Locator;
    readonly verifyOTPButton: Locator;
    readonly verifyOTPSuccessMsg: Locator;

    constructor(page: Page) {
        this.page = page;
        this.firstnameInput = page.locator('#first-name');
        this.lastnameInput = page.locator('#last-name');
        this.emailInput = page.locator('#email');
        this.passwordInput = page.locator('#password');
        this.confirmPasswordInput = page.locator('#confirm-password');
        this.acceptTermsCheckbox = page.locator('#terms');
        this.signUpLink = page.locator('button:has-text("Sign up")');
        this.signUpButton = page.locator('button[type="submit"]');
        this.successMsg = page.getByText('Account created successfully! Please verify your email.', {exact: true});
        this.otpInput = page.locator('input[data-input-otp="true"]');
        this.verifyOTPButton = page.locator('button:has-text("Continue")');
        this.verifyOTPSuccessMsg = page.getByText('Your email has been verified successfully. You can now sign in.', {exact: true});
    }

    async clickSignUpLink() {
        await this.signUpLink.click();
    }

    async goto() {
        await this.page.goto('/sign-up');
    }

    async enterFirstName(firstname: string) {
        await this.firstnameInput.fill(firstname);
    }

    async enterLastName(lastname: string) {
        await this.lastnameInput.fill(lastname);
    }

    async enterEmail(email: string) {
        await this.emailInput.fill(email);
    }

    async enterPassword(password: string) {
        await this.passwordInput.fill(password);
    }

    async enterConfirmPassword(password: string) {
        await this.confirmPasswordInput.fill(password);
    }

    async enterOTP(otp: string) {
        // Ensure OTP is properly formatted and always 6 digits
        const formattedOTP = otp.trim();
        let finalOTP = formattedOTP;
        
        // If OTP is less than 6 digits, pad with leading zeros
        if (formattedOTP.length < 6) {
            finalOTP = formattedOTP.padStart(6, '0');
            console.log(`OTP padded from ${formattedOTP} to ${finalOTP} (6 digits required)`);
        } else if (formattedOTP.length > 6) {
            // If OTP is more than 6 digits, take the last 6 digits
            finalOTP = formattedOTP.slice(-6);
            console.log(`OTP truncated from ${formattedOTP} to ${finalOTP} (6 digits required)`);
        }
        
        console.log(`Entering OTP: ${finalOTP} (length: ${finalOTP.length})`);
        await this.otpInput.fill(finalOTP);
    }

    async checkAcceptTerms() {
        await this.acceptTermsCheckbox.check();
    }

    async clickSignUp() {
        await this.signUpButton.click();
    }

    async clickVerifyOTPButton() {
        await this.verifyOTPButton.click();
    }

    async enterSignUpDetails(firstname: string, lastname: string, email: string, password: string) {
        await this.enterFirstName(firstname);
        await this.enterLastName(lastname);
        await this.enterEmail(email);
        await this.enterPassword(password);
        await this.enterConfirmPassword(password);
        await this.checkAcceptTerms();
    }

    async isOnSignUpPage() {
        return this.page.url().includes('/auth/sign-up');
    }

    async isOnVerifyEmailPage() {
        try {
            await this.page.waitForURL('/auth/sign-up', { timeout: 30000 });
            return true;
        } catch {
            return false;
        }
    }

    async isSignUpSuccessMessageVisible() {
        try {
            await this.successMsg.waitFor({ state: 'visible', timeout: 30000 });
            return true;
        } catch {
            return false;
        }
    }

    private async debugPageContent() {
        try {
            console.log('🔍 Current URL:', this.page.url());
            console.log('🔍 Page title:', await this.page.title());
            
            // Look for any text containing success-related words
            const allText = await this.page.locator('body').textContent();
            if (allText) {
                const successKeywords = ['success', 'created', 'verify', 'email', 'account', 'verified', 'complete'];
                const foundKeywords = successKeywords.filter(keyword => 
                    allText.toLowerCase().includes(keyword.toLowerCase())
                );
                console.log("🔍 Found keywords on page:", foundKeywords);
                
                // Look for specific success messages
                const successElements = await this.page.locator('[class*="success"], [class*="message"], [class*="alert"], [class*="notification"], [class*="toast"]').all();
                console.log(`🔍 Found ${successElements.length} potential success/message elements`);
                
                for (let i = 0; i < Math.min(successElements.length, 10); i++) {
                    try {
                        const text = await successElements[i].textContent();
                        if (text && text.trim().length > 0) {
                            console.log(`🔍 Element ${i + 1} text: "${text.trim()}"`);
                        }
                    } catch (e) {
                        console.log(`🔍 Could not get text from element ${i + 1}`);
                    }
                }
                
                // Look for any visible text that might be a success message
                const allVisibleText = await this.page.locator('*:visible').all();
                console.log(`🔍 Found ${allVisibleText.length} visible elements`);
                
                // Check for common success message patterns
                const successPatterns = [
                    /verified/i,
                    /success/i,
                    /complete/i,
                    /done/i,
                    /finished/i
                ];
                
                for (const pattern of successPatterns) {
                    const matchingElements = await this.page.locator(`text=${pattern}`).all();
                    if (matchingElements.length > 0) {
                        console.log(`🔍 Found elements matching pattern ${pattern}: ${matchingElements.length}`);
                        for (let i = 0; i < Math.min(matchingElements.length, 3); i++) {
                            try {
                                const text = await matchingElements[i].textContent();
                                if (text) {
                                    console.log(`🔍 Pattern match ${i + 1}: "${text.trim()}"`);
                                }
                            } catch (e) {
                                // Continue
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.log("🔍 Debug failed:", error instanceof Error ? error.message : 'Unknown error');
        }
    }

    async isVerifyOTPSuccessMessageVisible() {
        // Detect CI environment for extended timeouts
        const isCI = process.env.CI === 'true' || process.env.BITBUCKET_BUILD_NUMBER !== undefined;
        const baseTimeout = isCI ? 20000 : 10000;
        const extendedTimeout = isCI ? 30000 : 15000;
        
        try {
            console.log('🔍 Waiting for OTP verification success message...');
            console.log(`🔍 Environment: CI=${isCI}, Timeout=${baseTimeout}ms`);
            console.log('🔍 Expected message: "Your email has been verified successfully. You can now sign in."');
            
            // First, check for URL redirect (strongest indicator of success)
            // If we've been redirected to login or dashboard, verification succeeded
            try {
                const currentUrl = await this.page.url();
                if (currentUrl.includes('/auth/login') || currentUrl.includes('/dashboard')) {
                    console.log(`✅ Email verification successful - redirected to: ${currentUrl}`);
                    return true;
                }
            } catch (urlError) {
                // Continue to other checks
            }
            
            // Try multiple selector strategies for success message
            const selectors = [
                // Primary selector
                () => this.verifyOTPSuccessMsg,
                // Alternative text-based selectors
                () => this.page.getByText('Your email has been verified successfully', { exact: false }),
                () => this.page.getByText('Email verified successfully', { exact: false }),
                () => this.page.getByText('Verification successful', { exact: false }),
                () => this.page.getByText('successfully verified', { exact: false }),
                () => this.page.getByText('email verified', { exact: false }),
                () => this.page.getByText('account verified', { exact: false }),
                // Data attribute and class selectors
                () => this.page.locator('[data-testid="verification-success"]'),
                () => this.page.locator('[data-testid="email-verification-success"]'),
                () => this.page.locator('.success-message'),
                () => this.page.locator('.verification-success'),
                () => this.page.locator('div:has-text("verified")'),
            ];
            
            // Try each selector with wait
            for (let i = 0; i < selectors.length; i++) {
                try {
                    const locator = selectors[i]();
                    await locator.waitFor({ state: 'visible', timeout: baseTimeout });
                    const isVisible = await locator.isVisible();
                    if (isVisible) {
                        console.log(`✅ Found success message using selector strategy ${i + 1}`);
                        return true;
                    }
                } catch (e) {
                    // Continue to next selector
                    continue;
                }
            }
            
            // If no element found, check URL again (might have redirected while checking)
            const finalUrl = await this.page.url();
            if (finalUrl.includes('/auth/login') || finalUrl.includes('/dashboard')) {
                console.log(`✅ Email verification successful - redirected to: ${finalUrl}`);
                return true;
            }
            
            // Final fallback: Check for any success-related text on page
            console.log('⚠️ Primary selectors failed, trying text content search...');
            const pageContent = await this.page.textContent('body').catch(() => null);
            if (pageContent) {
                const successKeywords = [
                    'verified successfully',
                    'email verified',
                    'verification successful',
                    'successfully verified'
                ];
                
                for (const keyword of successKeywords) {
                    if (pageContent.toLowerCase().includes(keyword.toLowerCase())) {
                        console.log(`✅ Found success keyword "${keyword}" in page content`);
                        return true;
                    }
                }
            }
            
            // If we get here, debug and return false
            console.log('⚠️ OTP verification success message not found within timeout');
            console.log('🔍 Debugging page content after timeout...');
            await this.debugPageContent();
            console.log(`🔍 Current URL: ${finalUrl}`);
            console.log('❌ No success message found with any pattern');
            return false;
        } catch (error: any) {
            console.log('⚠️ Error during success message check:', error.message);
            
            // Final URL check as last resort
            try {
                const errorUrl = await this.page.url();
                if (errorUrl.includes('/auth/login') || errorUrl.includes('/dashboard')) {
                    console.log(`✅ Email verification successful - redirected to: ${errorUrl}`);
                    return true;
                }
            } catch (urlError) {
                // Ignore
            }
            
            console.log('❌ No success message found with any pattern');
            return false;
        }
    }

    generateRandomFirstName(timestamp?: number): string {
        const firstName = 'firstName';
        const ts = timestamp || Date.now();
        return `${firstName}${ts}`;
    }

    generateRandomLastName(timestamp?: number): string {
        const lastName = 'lastName';
        const ts = timestamp || Date.now();
        return `${lastName}${ts}`;
    }

    private generateUUID(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    generateRandomPassword(): string {
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

        let password = '';

        // Ensure one of each required character type
        password += lowercase[Math.floor(Math.random() * lowercase.length)]; // lowercase
        password += uppercase[Math.floor(Math.random() * uppercase.length)]; // uppercase
        password += numbers[Math.floor(Math.random() * numbers.length)]; // number
        password += specialChars[Math.floor(Math.random() * specialChars.length)]; // special char

        // Fill remaining length with random characters (total length: 8-12)
        const remainingLength = Math.floor(Math.random() * 5) + 4; // 4-8 more characters
        const allChars = lowercase + uppercase + numbers + specialChars;

        for (let i = 0; i < remainingLength; i++) {
            password += allChars[Math.floor(Math.random() * allChars.length)];
        }

        // Shuffle the password to make it more random
        return password.split('').sort(() => Math.random() - 0.5).join('');
    }

    generateRandomUserData() {
        const timestamp = Date.now();
        return {
            firstName: this.generateRandomFirstName(timestamp),
            lastName: this.generateRandomLastName(timestamp),
            timestamp: timestamp
        };
    }

    generateRandomUserDataWithCustomEmail(email: string) {
        const timestamp = Date.now();
        return {
            firstName: this.generateRandomFirstName(timestamp),
            lastName: this.generateRandomLastName(timestamp),
            email: email,
            timestamp: timestamp
        };
    }

    async generateRandomUserDataWithEmail() {
        // Add unique test identifier to prevent conflicts in regression suite
        const testId = process.env.CUCUMBER_WORKER_ID || 'main';
        const timestamp = Date.now();
        const uniqueTimestamp = `${timestamp}_${testId}_${Math.random().toString(36).substr(2, 9)}`;
        const mailAccount = await this.createMailiskAccount(uniqueTimestamp);
        
        return {
            firstName: this.generateRandomFirstName(timestamp),
            lastName: this.generateRandomLastName(timestamp),
            email: mailAccount.email,
            password: mailAccount.password,
            token: mailAccount.token,
            timestamp: uniqueTimestamp
        };
    }

    async generateRandomUserDataWithEmailAndTimestamp(customTimestamp: number) {
        const mailAccount = await this.createMailiskAccount(customTimestamp);
        
        return {
            firstName: this.generateRandomFirstName(customTimestamp),
            lastName: this.generateRandomLastName(customTimestamp),
            email: mailAccount.email,
            password: mailAccount.password,
            token: mailAccount.token,
            timestamp: customTimestamp
        };
    }

    async createMailiskAccount(timestamp?: number | string) {
        try {
            console.log('🔗 Creating Mailisk email address...');
            
            // Get Mailisk configuration from environment
            const apiKey = process.env.MAILISK_API_KEY;
            const namespace = process.env.MAILISK_NAMESPACE;
            
            if (!apiKey || !namespace) {
                throw new Error('Mailisk API key and namespace must be configured in .env file (MAILISK_API_KEY and MAILISK_NAMESPACE)');
            }

            const ts = timestamp || Date.now();
            const randomUser = `user${ts}`;
            const email = `${randomUser}@${namespace}.mailisk.net`;
            
            console.log(`✅ Generated Mailisk email: ${email}`);
            console.log(`📝 Note: Mailisk uses API key authentication, no account creation needed`);

            // Mailisk doesn't require account creation or password
            // Email addresses are created on-the-fly when emails are sent to them
            // We return the API key as "token" for consistency with existing code
            return { 
                email, 
                password: '', // Not used for Mailisk
                token: apiKey // Use API key as "token" for API calls
            };
            
        } catch (error: any) {
            console.error('❌ Error creating Mailisk account:', error.message);
            throw new Error(`Mailisk account creation failed: ${error.message}`);
        }
    }


    async getOtpFromMailisk(token: string, lastVerificationEmailTimestamp?: Date | null): Promise<string> {
        const axiosInstance = createMailiskAxiosInstance();
        const apiKey = token; // token is actually the API key for Mailisk
        const namespace = process.env.MAILISK_NAMESPACE;
        
        // Validate required configuration
        if (!apiKey || apiKey.trim() === '') {
            throw new Error('MAILISK_API_KEY is missing or empty. Please ensure MAILISK_API_KEY is set in your environment variables or Bitbucket pipeline configuration.');
        }
        
        if (!namespace || namespace.trim() === '') {
            throw new Error('MAILISK_NAMESPACE must be configured in .env file or Bitbucket pipeline configuration');
        }
        
        // According to Mailisk documentation: https://docs.mailisk.com/
        // Use X-Api-Key header (not Authorization Bearer)
        // Endpoint: GET https://api.mailisk.com/api/emails/{namespace}/inbox
        const headers = { 
            'X-Api-Key': apiKey,
            'Accept': 'application/json'
        };
        
        console.log('Starting OTP retrieval from Mailisk...');
        
        // If we have a timestamp, we'll wait for emails AFTER that timestamp
        if (lastVerificationEmailTimestamp) {
            console.log(`📅 Baseline timestamp provided: ${lastVerificationEmailTimestamp.toISOString()}`);
            console.log(`📧 Will wait for NEW verification email that arrives after this timestamp`);
        } else {
            console.log('⏳ Waiting for at least 2 emails to be received...');
        }
        
        console.log(`🔑 Using API key: ${apiKey.substring(0, 10)}... (${apiKey.length} chars)`);
        console.log(`📧 Using namespace: ${namespace}`);

        const maxAttempts = lastVerificationEmailTimestamp ? 30 : 10; // More attempts if waiting for new email
        const waitTime = lastVerificationEmailTimestamp ? 5000 : 3000; // Longer wait if waiting for new email
        
        for (let i = 0; i < maxAttempts; i++) {
            console.log(`Attempt ${i + 1}/${maxAttempts}: Checking for messages...`);
            
            try {
                // Mailisk API endpoint according to documentation
                const endpoint = `https://api.mailisk.com/api/emails/${namespace}/inbox`;
                console.log(`🔗 Attempting to connect to: ${endpoint}`);
                console.log(`📧 Namespace: ${namespace}`);
                
                const res = await axiosInstance.get(endpoint, { headers });
                
                console.log(`✅ API Response Status: ${res.status}`);
                console.log(`✅ API Response Data Keys: ${Object.keys(res.data || {}).join(', ')}`);
                
                // Mailisk API returns data in response.data array according to docs
                const messages = res.data?.data || [];
                const messageCount = messages.length;
                console.log(`Found ${messageCount} messages in inbox`);

                if (messages.length > 0) {
                    // Sort messages by received_date (newest first)
                    const sortedMessages = messages.sort((a: any, b: any) => {
                        const dateA = new Date(a.received_date || a.received_timestamp || 0).getTime();
                        const dateB = new Date(b.received_date || b.received_timestamp || 0).getTime();
                        return dateB - dateA;
                    });
                    
                    // Filter messages based on timestamp if provided
                    let sortedMessagesForOTP: any[];
                    
                    if (lastVerificationEmailTimestamp) {
                        console.log(`🔍 Filtering for emails after baseline timestamp: ${lastVerificationEmailTimestamp.toISOString()}`);
                        sortedMessagesForOTP = sortedMessages.filter((msg: any) => {
                            const msgTime = new Date(msg.received_date || msg.received_timestamp || 0);
                            const isAfter = msgTime > lastVerificationEmailTimestamp;
                            if (!isAfter) {
                                console.log(`⏪ Skipping old email: ${msg.subject} (${msg.received_date || msg.received_timestamp})`);
                            }
                            return isAfter;
                        });
                        
                        if (sortedMessagesForOTP.length === 0) {
                            console.log(`⏳ No NEW emails found after baseline timestamp. Waiting ${waitTime/1000} seconds...`);
                            if (i < maxAttempts - 1) {
                                await new Promise(resolve => setTimeout(resolve, waitTime));
                            }
                            continue;
                        }
                        
                        console.log(`✅ Found ${sortedMessagesForOTP.length} NEW email(s) after baseline timestamp!`);
                    } else {
                        // Original logic: Wait for at least 2 emails
                        if (messageCount < 2) {
                            console.log(`⏳ Only ${messageCount} email(s) found. Waiting for at least 2 emails...`);
                            if (i < maxAttempts - 1) {
                                console.log(`Waiting ${waitTime/1000} seconds before next attempt...`);
                                await new Promise(resolve => setTimeout(resolve, waitTime));
                            }
                            continue;
                        }
                        console.log(`✅ Found ${messageCount} emails! Proceeding with OTP extraction...`);
                        sortedMessagesForOTP = sortedMessages;
                    }
                    
                    // Log all email subjects for debugging
                    console.log(`\n📋 INBOX SUMMARY:`);
                    console.log(`Total emails found: ${sortedMessages.length}`);
                    console.log(`Emails after baseline: ${sortedMessagesForOTP.length}`);
                    console.log(`Email subjects (newest first):`);
                    sortedMessages.forEach((msg: any, index: number) => {
                        const msgTime = new Date(msg.received_date || msg.received_timestamp || 0);
                        const isNew = lastVerificationEmailTimestamp ? msgTime > lastVerificationEmailTimestamp : true;
                        console.log(`  ${index + 1}. ${msg.subject} (from: ${msg.from?.address || msg.from}) ${isNew ? '✅ NEW' : '⏪ OLD'}`);
                    });
                    
                    // Function to check if an email is a verification email based on subject
                    const isVerificationEmail = (subject: string): boolean => {
                        if (!subject) return false;
                        const lowerSubject = subject.toLowerCase();
                        // Exclude welcome emails
                        if (lowerSubject.includes('welcome')) return false;
                        return lowerSubject.includes('verification code') ||
                               (lowerSubject.includes('verification') && (lowerSubject.includes('code') || lowerSubject.includes('otp'))) ||
                               lowerSubject.includes('verify your') ||
                               lowerSubject.includes('email verification') ||
                               lowerSubject.includes('otp');
                    };
                    
                    // Function to check if email has the exact subject "Your verification code"
                    const isExactVerificationCodeEmail = (subject: string): boolean => {
                        if (!subject) return false;
                        const lowerSubject = subject.toLowerCase().trim();
                        // Exact match for "Your verification code"
                        return lowerSubject === 'your verification code';
                    };
                    
                    // Function to extract OTP from email body (prioritize 6-digit codes)
                    const extractOTPFromBody = (body: string): string | null => {
                        // Patterns ordered by priority (6-digit codes first, then with context)
                        const otpPatterns = [
                            /\b(\d{6})\b/,                    // 6-digit number standalone (highest priority)
                            /verification[:\s]*code[:\s]*[:is]*(\d{6})/i,  // "verification code: 123456" or "verification code is 123456"
                            /your[:\s]*verification[:\s]*code[:\s]*[:is]*(\d{6})/i,  // "your verification code: 123456"
                            /code[:\s]*[:is]*(\d{6})/i,       // "code: 123456" or "code is 123456"
                            /otp[:\s]*[:is]*(\d{6})/i,        // "otp: 123456" or "otp is 123456"
                            /verification[:\s]*[:is]*(\d{6})/i, // "verification: 123456" or "verification is 123456"
                        ];

                        for (const pattern of otpPatterns) {
                            const match = body.match(pattern);
                            if (match) {
                                const otp = match[1] || match[0]; // Use captured group or full match
                                // Only return if it's a 6-digit code
                                if (/^\d{6}$/.test(otp)) {
                                    console.log(`✅ Found 6-digit OTP using pattern ${pattern.source}: ${otp}`);
                                    return otp;
                                }
                            }
                        }

                        // Fallback: look for any 6-digit number if no contextual match found
                        const sixDigitMatch = body.match(/\b(\d{6})\b/);
                        if (sixDigitMatch) {
                            console.log(`✅ Found 6-digit OTP (fallback): ${sixDigitMatch[1]}`);
                            return sixDigitMatch[1];
                        }

                        return null;
                    };
                    
                    // Function to check a specific email for OTP
                    const checkEmailForOTP = (message: any, emailIndex: number) => {
                        console.log(`\n📧 Checking EMAIL ${emailIndex + 1} (index ${emailIndex}):`);
                        console.log(`From: ${message.from?.address || message.from}`);
                        console.log(`Subject: ${message.subject}`);
                        console.log(`Date: ${message.received_date || message.received_timestamp}`);

                        // Ensure body is always a string
                        const body = String(message.text || message.html || "");
                        console.log(`\n📄 EMAIL BODY (first 500 chars):`);
                        console.log('='.repeat(80));
                        console.log(body.substring(0, 500));
                        if (body.length > 500) {
                            console.log(`... (${body.length - 500} more characters)`);
                        }
                        console.log('='.repeat(80));
                        console.log(`📊 Email body length: ${body.length} characters`);

                        const otp = extractOTPFromBody(body);
                        if (otp) {
                            console.log(`✅ OTP extracted from EMAIL ${emailIndex + 1}: ${otp}`);
                            return otp;
                        } else {
                            console.log(`❌ No 6-digit OTP found in EMAIL ${emailIndex + 1}.`);
                            return null;
                        }
                    };
                    
                    // Strategy: First look for exact "Your verification code" subject - this is the ONLY email we should use
                    console.log('\n🔍 STEP 1: Searching for email with exact subject "Your verification code"...');
                    let foundVerificationCodeEmail = false;
                    for (let i = 0; i < sortedMessagesForOTP.length; i++) {
                        const msg = sortedMessagesForOTP[i];
                        const subject = msg.subject || '';
                        if (isExactVerificationCodeEmail(subject)) {
                            foundVerificationCodeEmail = true;
                            console.log(`🎯 Found exact match at position ${i + 1}: "${subject}"`);
                            console.log(`📧 Email ID: ${msg.id}`);
                            console.log(`📅 Email timestamp: ${msg.received_date || msg.received_timestamp}`);
                            const otp = checkEmailForOTP(msg, i);
                            if (otp) {
                                console.log(`✅ Successfully extracted OTP "${otp}" from "Your verification code" email`);
                                console.log(`📝 Using OTP from email with subject: "${subject}"`);
                                return otp;
                            } else {
                                console.log(`⚠️ Found "Your verification code" email but no valid OTP found in body`);
                                console.log(`❌ This is a problem - the verification code email should contain a 6-digit OTP`);
                            }
                        }
                    }
                    
                    if (!foundVerificationCodeEmail) {
                        console.log(`⚠️ No email with exact subject "Your verification code" was found!`);
                        console.log(`📋 Available email subjects (after baseline):`);
                        sortedMessagesForOTP.forEach((msg: any, index: number) => {
                            console.log(`   ${index + 1}. "${msg.subject}"`);
                        });
                    }
                    
                    // Strategy 2: Only if "Your verification code" email was not found, look for other verification emails
                    if (!foundVerificationCodeEmail) {
                        console.log('\n🔍 STEP 2: "Your verification code" email not found. Searching for other verification emails by subject...');
                        for (let i = 0; i < sortedMessagesForOTP.length; i++) {
                            const msg = sortedMessagesForOTP[i];
                            const subject = msg.subject || '';
                            if (isVerificationEmail(subject)) {
                                console.log(`✅ Found verification email at position ${i + 1}: "${subject}"`);
                                const otp = checkEmailForOTP(msg, i);
                                if (otp) {
                                    console.log(`⚠️ Using OTP from non-standard verification email: "${subject}"`);
                                    return otp;
                                }
                            }
                        }
                    }
                    
                    // Strategy 3: Only as last resort - check all emails (but warn about it)
                    if (!foundVerificationCodeEmail) {
                        console.log('\n🔍 STEP 3: No verification emails found. Checking all NEW emails (newest first) as last resort...');
                        console.log(`⚠️ WARNING: This may extract OTP from wrong email (e.g., welcome email)`);
                        for (let i = 0; i < sortedMessagesForOTP.length; i++) {
                            const msg = sortedMessagesForOTP[i];
                            const subject = msg.subject || '';
                            console.log(`📧 Checking email ${i + 1}: "${subject}"`);
                            const otp = checkEmailForOTP(msg, i);
                            if (otp) {
                                console.log(`⚠️ WARNING: Extracted OTP "${otp}" from email with subject "${subject}"`);
                                console.log(`⚠️ This may not be the correct verification code!`);
                                return otp;
                            }
                        }
                    }
                } else {
                    console.log('No messages found in inbox yet');
                }
            } catch (error: any) {
                console.error(`❌ Error during attempt ${i + 1}:`, error.message || error);
                
                // Check for 401 Unauthorized - likely means invalid or missing API key
                if (error.response?.status === 401) {
                    console.error(`\n🚨 AUTHENTICATION ERROR (401 Unauthorized)`);
                    console.error(`This usually means:`);
                    console.error(`1. MAILISK_API_KEY is missing or not set in environment variables`);
                    console.error(`2. MAILISK_API_KEY is invalid or expired`);
                    console.error(`3. MAILISK_NAMESPACE is incorrect`);
                    console.error(`\nPlease verify:`);
                    console.error(`- MAILISK_API_KEY is set in Bitbucket pipeline variables`);
                    console.error(`- MAILISK_NAMESPACE is set in Bitbucket pipeline variables`);
                    console.error(`- API key is valid and has not expired`);
                    console.error(`\nCurrent configuration:`);
                    console.error(`- API Key present: ${!!apiKey} (length: ${apiKey?.length || 0})`);
                    console.error(`- Namespace present: ${!!namespace} (value: ${namespace || 'NOT SET'})`);
                    
                    // Don't retry on 401 - it won't succeed
                    throw new Error(`Mailisk API authentication failed (401 Unauthorized). Please check MAILISK_API_KEY and MAILISK_NAMESPACE configuration. Original error: ${error.message}`);
                }
                
                if (error.response) {
                    console.error(`Response status: ${error.response.status}`);
                    console.error(`Response data:`, error.response.data);
                } else if (error.request) {
                    console.error(`Request was made but no response received`);
                    console.error(`Request details:`, {
                        url: error.config?.url,
                        method: error.config?.method,
                        headers: error.config?.headers ? Object.keys(error.config.headers) : 'No headers'
                    });
                }
                if (error.code) {
                    console.error(`Error code: ${error.code}`);
                }
                if (error.stack) {
                    console.error(`Stack trace (first 5 lines):`, error.stack.split('\n').slice(0, 5).join('\n'));
                }
            }

            if (i < maxAttempts - 1) { // Don't wait after the last attempt
                console.log(`Waiting ${waitTime/1000} seconds before next attempt...`);
                await new Promise(r => setTimeout(r, waitTime));
            }
        }

        // If we get here, no OTP was found
        console.error(`OTP not found after ${maxAttempts} attempts. This could mean:`);
        console.error('1. Verification email was not sent by the application (only welcome email received)');
        console.error('2. Verification email is still in transit (try increasing timeout)');
        console.error('3. Email format doesn\'t contain a recognizable OTP pattern');
        console.error('4. Email was sent to a different address');
        console.error('5. Need to wait longer for the verification email to arrive');
        
        if (lastVerificationEmailTimestamp) {
            throw new Error(`OTP not received in Mailisk inbox after ${maxAttempts} attempts. Expected NEW verification email after ${lastVerificationEmailTimestamp.toISOString()} but none was found.`);
        } else {
            throw new Error(`OTP not received in Mailisk inbox after ${maxAttempts} attempts. Expected at least 2 emails (welcome + verification) but may not have received the verification email yet.`);
        }
    }

    // Method to get the timestamp of the latest verification email before sign-up
    // This helps us identify new emails that arrive after clicking Sign Up button
    async getLatestVerificationEmailTimestamp(token: string): Promise<Date | null> {
        const axiosInstance = createMailiskAxiosInstance();
        const apiKey = token;
        const namespace = process.env.MAILISK_NAMESPACE;
        
        if (!apiKey || apiKey.trim() === '') {
            throw new Error('MAILISK_API_KEY is missing or empty');
        }
        
        if (!namespace || namespace.trim() === '') {
            throw new Error('MAILISK_NAMESPACE must be configured');
        }
        
        const headers = { 
            'X-Api-Key': apiKey,
            'Accept': 'application/json'
        };
        
        try {
            const endpoint = `https://api.mailisk.com/api/emails/${namespace}/inbox`;
            console.log('📧 Checking for existing verification emails to establish baseline timestamp...');
            
            const res = await axiosInstance.get(endpoint, { headers });
            const messages = res.data?.data || [];
            
            if (messages.length === 0) {
                console.log('📭 No existing emails found - will wait for first verification email');
                return null;
            }
            
            // Sort emails by received_date (newest first)
            const sortedMessages = messages.sort((a: any, b: any) => {
                const dateA = new Date(a.received_date || a.received_timestamp || 0).getTime();
                const dateB = new Date(b.received_date || b.received_timestamp || 0).getTime();
                return dateB - dateA;
            });
            
            // Find the latest verification email (sign-up verification)
            for (const msg of sortedMessages) {
                const subject = msg.subject?.toLowerCase() || '';
                const from = typeof msg.from === 'string' ? msg.from.toLowerCase() : (msg.from?.address?.toLowerCase() || '');
                
                // Check for verification emails (but exclude welcome emails)
                const isVerificationEmail = (subject.includes('verification code') ||
                                             subject.includes('verify your') ||
                                             subject.includes('email verification') ||
                                             subject.includes('otp') ||
                                             (subject.includes('verification') && !subject.includes('welcome'))) &&
                                            !subject.includes('welcome');
                
                if (isVerificationEmail) {
                    const emailTime = new Date(msg.received_date || msg.received_timestamp || 0);
                    console.log(`📅 Found latest verification email timestamp: ${emailTime.toISOString()}`);
                    console.log(`📧 Email subject: ${msg.subject}`);
                    console.log(`🆔 Email ID: ${msg.id}`);
                    return emailTime;
                }
            }
            
            // If no verification email found, return the timestamp of the latest email
            if (sortedMessages.length > 0) {
                const latestEmail = sortedMessages[0];
                const emailTime = new Date(latestEmail.received_date || latestEmail.received_timestamp || 0);
                console.log(`📅 No verification email found, using latest email timestamp: ${emailTime.toISOString()}`);
                console.log(`📧 Latest email subject: ${latestEmail.subject}`);
                return emailTime;
            }
            
            console.log('📭 No existing emails found - will wait for first verification email');
            return null;
        } catch (error: any) {
            console.error('❌ Error getting latest verification email timestamp:', error.message || error);
            // Return null if we can't get the timestamp - we'll use current time as fallback
            return null;
        }
    }

    // Method to get the timestamp of the latest MFA email before login/signup
    // This helps us identify new emails that arrive after login/signup
    async getLatestMFAEmailTimestamp(token: string): Promise<Date | null> {
        const axiosInstance = createMailiskAxiosInstance();
        const apiKey = token;
        const namespace = process.env.MAILISK_NAMESPACE;
        
        if (!apiKey || apiKey.trim() === '') {
            throw new Error('MAILISK_API_KEY is missing or empty');
        }
        
        if (!namespace || namespace.trim() === '') {
            throw new Error('MAILISK_NAMESPACE must be configured');
        }
        
        const headers = { 
            'X-Api-Key': apiKey,
            'Accept': 'application/json'
        };
        
        try {
            const endpoint = `https://api.mailisk.com/api/emails/${namespace}/inbox`;
            console.log('📧 Checking for existing MFA emails to establish baseline timestamp...');
            
            const res = await axiosInstance.get(endpoint, { headers });
            const messages = res.data?.data || [];
            
            if (messages.length === 0) {
                console.log('📭 No existing emails found - will wait for first MFA email');
                return null;
            }
            
            // Sort emails by received_date (newest first)
            const sortedMessages = messages.sort((a: any, b: any) => {
                const dateA = new Date(a.received_date || a.received_timestamp || 0).getTime();
                const dateB = new Date(b.received_date || b.received_timestamp || 0).getTime();
                return dateB - dateA;
            });
            
            // Find the latest MFA email
            for (const msg of sortedMessages) {
                const subject = msg.subject?.toLowerCase() || '';
                const from = typeof msg.from === 'string' ? msg.from.toLowerCase() : (msg.from?.address?.toLowerCase() || '');
                
                const isMFAEmail = subject.includes('authentication code') ||
                                 subject.includes('verification') || 
                                 subject.includes('otp') || 
                                 subject.includes('code') ||
                                 subject.includes('mfa') ||
                                 subject.includes('authentication') ||
                                 from.includes('smartpc') ||
                                 from.includes('verification');
                
                if (isMFAEmail) {
                    const emailTime = new Date(msg.received_date || msg.received_timestamp || 0);
                    console.log(`📅 Found latest MFA email timestamp: ${emailTime.toISOString()}`);
                    console.log(`📧 Email subject: ${msg.subject}`);
                    console.log(`🆔 Email ID: ${msg.id}`);
                    return emailTime;
                }
            }
            
            console.log('📭 No existing MFA emails found - will wait for first MFA email');
            return null;
        } catch (error: any) {
            console.error('❌ Error getting latest MFA email timestamp:', error.message || error);
            // Return null if we can't get the timestamp - we'll use current time as fallback
            return null;
        }
    }

    // Method specifically for getting the latest email OTP during sign-in
    async getLatestEmailOTP(token: string, isMFAVerification: boolean = false, providedStartTime?: Date, lastMFAEmailTimestamp?: Date | null): Promise<string> {
        const axiosInstance = createMailiskAxiosInstance();
        const apiKey = token; // token is actually the API key for Mailisk
        const namespace = process.env.MAILISK_NAMESPACE;
        
        // Validate required configuration
        if (!apiKey || apiKey.trim() === '') {
            throw new Error('MAILISK_API_KEY is missing or empty. Please ensure MAILISK_API_KEY is set in your environment variables or Bitbucket pipeline configuration.');
        }
        
        if (!namespace || namespace.trim() === '') {
            throw new Error('MAILISK_NAMESPACE must be configured in .env file or Bitbucket pipeline configuration');
        }
        
        // According to Mailisk documentation: https://docs.mailisk.com/
        // Use X-Api-Key header (not Authorization Bearer)
        // Endpoint: GET https://api.mailisk.com/api/emails/{namespace}/inbox
        const headers = { 
            'X-Api-Key': apiKey,
            'Accept': 'application/json'
        };
        
        if (isMFAVerification) {
            console.log('📧 Retrieving OTP from most recent MFA verification email...');
        } else {
            console.log('📧 Retrieving OTP from most recent sign-up verification email...');
        }
        console.log(`🔑 Using API key: ${apiKey.substring(0, 10)}... (${apiKey.length} chars)`);
        console.log(`📧 Using namespace: ${namespace}`);

        // For MFA verification, use the last MFA email timestamp if provided
        // This ensures we only get emails that arrived AFTER the last known MFA email
        let effectiveStartTime: Date;
        
        if (isMFAVerification && lastMFAEmailTimestamp) {
            // Use the timestamp of the last MFA email - we want emails AFTER this
            effectiveStartTime = lastMFAEmailTimestamp;
            console.log(`⏰ Using last MFA email timestamp as baseline: ${effectiveStartTime.toISOString()}`);
            console.log(`📧 Will wait for NEW MFA email that arrives after this timestamp`);
        } else if (isMFAVerification && providedStartTime) {
            // Fallback to provided start time with buffer
            const bufferTime = 10000; // 10 second buffer
            effectiveStartTime = new Date(providedStartTime.getTime() - bufferTime);
            console.log(`⏰ Using provided start time (with ${bufferTime}ms buffer): ${effectiveStartTime.toISOString()}`);
        } else if (isMFAVerification) {
            // Last resort: use current time minus buffer
            const bufferTime = 10000;
            effectiveStartTime = new Date(Date.now() - bufferTime);
            console.log(`⏰ Using current time minus buffer (${bufferTime}ms): ${effectiveStartTime.toISOString()}`);
        } else {
            // For non-MFA, use provided start time or current time
            effectiveStartTime = providedStartTime || new Date();
            console.log(`⏰ Starting OTP retrieval at: ${effectiveStartTime.toISOString()}`);
        }
        
        console.log(`📋 Tracking used email IDs: ${usedEmailIds.size} emails already used`);

        const maxAttempts = isMFAVerification ? 30 : 10;
        const waitTime = isMFAVerification ? 5000 : 3000;

        for (let i = 0; i < maxAttempts; i++) {
            console.log(`\n🔄 Attempt ${i + 1}/${maxAttempts}: Checking for ${isMFAVerification ? 'MFA verification' : 'sign-up verification'} email...`);
            
            try {
                // Mailisk API endpoint according to documentation
                const endpoint = `https://api.mailisk.com/api/emails/${namespace}/inbox`;
                console.log(`🔗 Attempting to connect to: ${endpoint}`);
                
                const res = await axiosInstance.get(endpoint, { headers });
                
                console.log(`✅ API Response Status: ${res.status}`);
                
                const messages = res.data?.data || [];
                console.log(`📬 Found ${messages.length} total emails in inbox`);
                
                if (messages.length < 1) {
                    console.log(`⏳ No emails found yet. Waiting ${waitTime/1000} seconds...`);
                    if (i < maxAttempts - 1) {
                        await new Promise(resolve => setTimeout(resolve, waitTime));
                    }
                    continue;
                }

                // Sort emails by received_date (newest first)
                const sortedMessages = messages.sort((a: any, b: any) => {
                    const dateA = new Date(a.received_date || a.received_timestamp || 0).getTime();
                    const dateB = new Date(b.received_date || b.received_timestamp || 0).getTime();
                    return dateB - dateA; // Newest first
                });
                
                console.log(`📅 Sorted ${sortedMessages.length} emails by time (newest first):`);
                sortedMessages.forEach((msg: any, index: number) => {
                    const dateStr = msg.received_date || msg.received_timestamp || 'N/A';
                    console.log(`  ${index + 1}. ${msg.subject} - ${dateStr} (ID: ${msg.id})`);
                });
                
                // Find the appropriate verification email based on context
                let targetMessage = null;
                let targetIndex = -1;
                
                if (isMFAVerification) {
                    console.log(`🔍 Looking for NEW MFA verification email after ${effectiveStartTime.toISOString()}`);
                    
                    // Look for MFA verification emails that arrived after effective start time AND haven't been used
                    for (let j = 0; j < sortedMessages.length; j++) {
                        const msg = sortedMessages[j];
                        const msgTime = new Date(msg.received_date || msg.received_timestamp || 0);
                        const subject = msg.subject?.toLowerCase() || '';
                        const from = typeof msg.from === 'string' ? msg.from.toLowerCase() : (msg.from?.address?.toLowerCase() || '');
                        const emailId = msg.id;
                        
                        const timeDiff = msgTime.getTime() - effectiveStartTime.getTime();
                        const timeDiffSeconds = (timeDiff / 1000).toFixed(1);
                        
                        console.log(`📧 Email ${j + 1}: ${msg.subject} - ${msg.received_date || msg.received_timestamp} (ID: ${emailId})`);
                        console.log(`   ⏱️ Time difference from baseline: ${timeDiffSeconds}s ${timeDiff > 0 ? '(NEW)' : '(OLD)'}`);
                        
                        // Check if this email has already been used
                        if (usedEmailIds.has(emailId)) {
                            console.log(`⚠️ Email ${j + 1} (ID: ${emailId}) has already been used - skipping`);
                            continue;
                        }
                        
                        // Check if this email is MFA-related AND arrived after effective start time
                        const isMFAEmail = subject.includes('authentication code') ||  // Primary MFA email pattern
                                         subject.includes('verification') || 
                                         subject.includes('otp') || 
                                         subject.includes('code') ||
                                         subject.includes('mfa') ||
                                         subject.includes('authentication') ||
                                         from.includes('smartpc') ||
                                         from.includes('verification');
                        
                        // Special logging for authentication code emails
                        if (subject.includes('authentication code')) {
                            console.log(`🎯 Found "authentication code" email - this is likely the MFA verification email!`);
                        }
                        
                        const isAfterStart = msgTime > effectiveStartTime;
                        
                        if (isMFAEmail && isAfterStart) {
                            targetMessage = msg;
                            targetIndex = j;
                            console.log(`✅ Found NEW MFA verification email at position ${j + 1}: ${msg.subject}`);
                            console.log(`📅 Email time: ${msg.received_date || msg.received_timestamp}`);
                            console.log(`⏱️ Email arrived ${timeDiffSeconds}s after baseline timestamp`);
                            console.log(`🆔 Email ID: ${emailId} (not used yet)`);
                            break;
                        } else if (isMFAEmail) {
                            console.log(`⚠️ Found MFA email at position ${j + 1} but it's ${Math.abs(parseFloat(timeDiffSeconds))}s OLDER than baseline (skipping)`);
                        }
                    }
                    
                    // If no new MFA email found, wait longer for it to arrive
                    if (!targetMessage) {
                        console.log(`⚠️ No NEW MFA email found after baseline timestamp (${effectiveStartTime.toISOString()})`);
                        console.log(`⏳ Waiting ${waitTime/1000} seconds for new MFA email to arrive...`);
                        if (i < maxAttempts - 1) {
                            await new Promise(resolve => setTimeout(resolve, waitTime));
                            continue;
                        } else {
                            console.log(`❌ No NEW MFA email received after ${maxAttempts} attempts.`);
                            console.log(`📋 Baseline timestamp was: ${effectiveStartTime.toISOString()}`);
                            console.log(`💡 This indicates either:`);
                            console.log(`   1. MFA email was not sent by the application`);
                            console.log(`   2. Email is still in transit (try increasing wait time)`);
                            console.log(`   3. Email was sent before baseline timestamp was recorded`);
                            throw new Error(`No NEW MFA verification email received after ${maxAttempts} attempts. Expected email after ${effectiveStartTime.toISOString()}.`);
                        }
                    }
                } else {
                    // For regular sign-up verification, use the traditional approach
                    console.log(`🔍 Looking for sign-up verification email (2nd email)...`);
                    
                    // Wait for at least 2 emails for sign-up verification
                    if (sortedMessages.length < 2) {
                        console.log(`⏳ Need at least 2 emails for sign-up verification, currently have ${sortedMessages.length}. Waiting...`);
                        if (i < maxAttempts - 1) {
                            await new Promise(resolve => setTimeout(resolve, waitTime));
                            continue;
                        }
                    }
                    
                    // Use the 2nd email (index 1) for sign-up verification
                    if (sortedMessages.length >= 2) {
                        targetMessage = sortedMessages[1];
                        targetIndex = 1;
                        console.log(`📧 Using 2nd email for sign-up verification: ${targetMessage.subject}`);
                    } else {
                        // Fallback to most recent email
                        targetMessage = sortedMessages[0];
                        targetIndex = 0;
                        console.log(`📧 Using most recent email for sign-up verification: ${targetMessage.subject}`);
                    }
                }
                
                console.log(`\n📧 TARGET EMAIL (${targetIndex + 1}st email from ${sortedMessages.length} emails):`);
                console.log(`📧 Email ID: ${targetMessage.id}`);
                console.log(`From: ${typeof targetMessage.from === 'string' ? targetMessage.from : targetMessage.from?.address}`);
                console.log(`Subject: ${targetMessage.subject}`);
                console.log(`Date: ${targetMessage.received_date || targetMessage.received_timestamp}`);

                // Mailisk API returns full email content in the response
                const body = String(targetMessage.text || targetMessage.html || "");
                console.log(`\n📄 EMAIL BODY (${body.length} chars):`);
                console.log('='.repeat(80));
                console.log(body);
                console.log('='.repeat(80));
                
                // Additional debugging for OTP patterns
                console.log('\n🔍 DEBUGGING OTP PATTERNS:');
                const debugPatterns = [
                    { name: '6-digit numbers', pattern: /\b\d{6}\b/g },
                    { name: '4-digit numbers', pattern: /\b\d{4}\b/g },
                    { name: '5-digit numbers', pattern: /\b\d{5}\b/g },
                    { name: '8-digit numbers', pattern: /\b\d{8}\b/g },
                    { name: 'code: pattern', pattern: /code[:\s]*(\d+)/gi },
                    { name: 'otp: pattern', pattern: /otp[:\s]*(\d+)/gi },
                    { name: 'verification: pattern', pattern: /verification[:\s]*(\d+)/gi },
                    { name: 'mfa: pattern', pattern: /mfa[:\s]*(\d+)/gi }
                ];
                
                for (const debugPattern of debugPatterns) {
                    const matches = body.match(debugPattern.pattern);
                    if (matches) {
                        console.log(`  ${debugPattern.name}: ${matches.join(', ')}`);
                    } else {
                        console.log(`  ${debugPattern.name}: No matches`);
                    }
                }

                // Try multiple OTP patterns (prioritize 6-digit codes)
                const otpPatterns = [
                    /\b(\d{6})\b/g,           // 6-digit code (most common for MFA)
                    /\b(\d{4})\b/g,           // 4-digit code
                    /code[:\s]*(\d{6})/gi,    // "code: 123456"
                    /otp[:\s]*(\d{6})/gi,     // "otp: 123456"
                    /verification[:\s]*(\d{6})/gi, // "verification: 123456"
                    /mfa[:\s]*(\d{6})/gi,     // "mfa: 123456"
                    /authentication[:\s]*(\d{6})/gi, // "authentication: 123456"
                    /(\d{6})/g                // Any 6-digit number
                ];

                for (const pattern of otpPatterns) {
                    const matches = body.match(pattern);
                    if (matches) {
                        console.log(`🔍 Pattern ${pattern.source} found matches:`, matches);
                        // For patterns that capture groups, use the first group
                        const otp = pattern.source.includes('(\\d') ? matches[0] : matches[0];
                        if (otp && /^\d{4,6}$/.test(otp)) {
                            // Ensure 6-digit OTP
                            const paddedOTP = otp.padStart(6, '0');
                            const emailId = targetMessage.id;
                            
                            // Mark this email as used to avoid reusing the code
                            usedEmailIds.add(emailId);
                            console.log(`✅ OTP found in email ${targetIndex + 1} from ${sortedMessages.length} emails (ID: ${emailId}): ${paddedOTP}`);
                            console.log(`📝 Marked email ID ${emailId} as used (total used: ${usedEmailIds.size})`);
                            return paddedOTP;
                        }
                    }
                }

                console.log(`❌ No valid OTP pattern found in email ${targetIndex + 1} from ${sortedMessages.length} emails`);
                console.log('🔍 Available patterns tried:', otpPatterns.map(p => p.source));
                
                if (i < 14) {
                    console.log('⏳ Waiting 5 seconds before next attempt...');
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }

            } catch (error: any) {
                console.error(`❌ Error retrieving email on attempt ${i + 1}:`, error.message || error);
                
                // Check for 401 Unauthorized - likely means invalid or missing API key
                if (error.response?.status === 401) {
                    console.error(`\n🚨 AUTHENTICATION ERROR (401 Unauthorized)`);
                    console.error(`This usually means:`);
                    console.error(`1. MAILISK_API_KEY is missing or not set in environment variables`);
                    console.error(`2. MAILISK_API_KEY is invalid or expired`);
                    console.error(`3. MAILISK_NAMESPACE is incorrect`);
                    console.error(`\nPlease verify:`);
                    console.error(`- MAILISK_API_KEY is set in Bitbucket pipeline variables`);
                    console.error(`- MAILISK_NAMESPACE is set in Bitbucket pipeline variables`);
                    console.error(`- API key is valid and has not expired`);
                    console.error(`\nCurrent configuration:`);
                    console.error(`- API Key present: ${!!apiKey} (length: ${apiKey?.length || 0})`);
                    console.error(`- Namespace present: ${!!namespace} (value: ${namespace || 'NOT SET'})`);
                    
                    // Don't retry on 401 - it won't succeed
                    throw new Error(`Mailisk API authentication failed (401 Unauthorized). Please check MAILISK_API_KEY and MAILISK_NAMESPACE configuration. Original error: ${error.message}`);
                }
                
                if (error.response) {
                    console.error(`Response status: ${error.response.status}`);
                    console.error(`Response data:`, error.response.data);
                }
                if (i < 14) {
                    console.log('⏳ Waiting 5 seconds before retry...');
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
            }
        }

        console.error(`❌ Failed to retrieve OTP after ${maxAttempts} attempts`);
        console.error('Possible issues:');
        if (isMFAVerification) {
            console.error('1. No new MFA verification email received after start time');
            console.error('2. Email not sent by the application');
            console.error('3. Email still in transit (try waiting longer)');
            console.error('4. Email sent to different address');
            console.error('5. OTP format not recognized');
            throw new Error(`No valid MFA verification OTP found after ${maxAttempts} attempts. Need a new MFA email after start time.`);
        } else {
            console.error('1. No sign-up verification email received');
            console.error('2. Email not sent by the application');
            console.error('3. Email still in transit (try waiting longer)');
            console.error('4. Email sent to different address');
            console.error('5. OTP format not recognized');
            throw new Error(`No valid sign-up verification OTP found after ${maxAttempts} attempts. Expected at least 2 emails (welcome + verification).`);
        }
    }

    // Method to fetch email content for invitation emails
    async fetchEmailContent(email: string, token: string): Promise<string> {
        const axiosInstance = createMailiskAxiosInstance();
        const apiKey = token; // token is actually the API key for Mailisk
        const namespace = process.env.MAILISK_NAMESPACE;
        
        if (!namespace) {
            throw new Error('MAILISK_NAMESPACE must be configured in .env file');
        }
        
        // According to Mailisk documentation: https://docs.mailisk.com/
        // Use X-Api-Key header (not Authorization Bearer)
        // Endpoint: GET https://api.mailisk.com/api/emails/{namespace}/inbox
        const headers = { 
            'X-Api-Key': apiKey,
            'Accept': 'application/json'
        };
        
        console.log('📧 Fetching invitation email content...');
        console.log('🔑 Using API key:', apiKey.substring(0, 20) + '...');

        for (let i = 0; i < 10; i++) {
            console.log(`\n🔄 Attempt ${i + 1}/10: Checking for invitation email...`);
            
            try {
                // Mailisk API endpoint according to documentation
                const endpoint = `https://api.mailisk.com/api/emails/${namespace}/inbox`;
                console.log(`🔗 Attempting to connect to: ${endpoint}`);
                
                const res = await axiosInstance.get(endpoint, { headers });
                
                console.log(`✅ API Response Status: ${res.status}`);
                
                const messages = res.data?.data || [];
                console.log(`📬 Found ${messages.length} total emails in inbox`);
                
                if (messages.length === 0) {
                    console.log(`⏳ No emails found yet. Waiting 5 seconds...`);
                    if (i < 9) {
                        await new Promise(resolve => setTimeout(resolve, 5000));
                    }
                    continue;
                }

                // Sort messages by received_date (newest first)
                const sortedMessages = messages.sort((a: any, b: any) => {
                    const dateA = new Date(a.received_date || a.received_timestamp || 0).getTime();
                    const dateB = new Date(b.received_date || b.received_timestamp || 0).getTime();
                    return dateB - dateA;
                });

                // Look for invitation email (should be the latest)
                const latestMessage = sortedMessages[0];
                
                console.log(`\n📧 LATEST EMAIL:`);
                console.log(`📧 Email ID: ${latestMessage.id}`);
                console.log(`From: ${typeof latestMessage.from === 'string' ? latestMessage.from : latestMessage.from?.address}`);
                console.log(`Subject: ${latestMessage.subject}`);
                console.log(`Date: ${latestMessage.received_date || latestMessage.received_timestamp}`);

                // Check if this is an invitation email
                if (latestMessage.subject && 
                    (latestMessage.subject.toLowerCase().includes('invite') || 
                     latestMessage.subject.toLowerCase().includes('welcome') ||
                     latestMessage.subject.toLowerCase().includes('smartpc'))) {
                    
                    // Mailisk API returns full email content in the response
                    const body = String(latestMessage.text || latestMessage.html || "");
                    console.log(`\n📄 INVITATION EMAIL BODY (${body.length} chars):`);
                    console.log('='.repeat(80));
                    console.log(body);
                    console.log('='.repeat(80));
                    
                    return body;
                } else {
                    console.log(`❌ Latest email is not an invitation email. Subject: ${latestMessage.subject}`);
                    if (i < 9) {
                        console.log('Waiting 5 seconds for invitation email...');
                        await new Promise(resolve => setTimeout(resolve, 5000));
                    }
                }
                
            } catch (error: any) {
                console.error(`❌ Error fetching emails (attempt ${i + 1}):`, error.message || error);
                if (error.response) {
                    console.error(`Response status: ${error.response.status}`);
                    console.error(`Response data:`, error.response.data);
                }
                if (i < 9) {
                    console.log('Waiting 5 seconds before retry...');
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
            }
        }
        
        throw new Error("Invitation email not found in Mailisk inbox after 10 attempts.");
    }

}
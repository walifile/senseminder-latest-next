import { Page, Locator } from '@playwright/test';
import axios from 'axios';
import { expect } from '@playwright/test';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

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
        this.acceptTermsCheckbox = page.locator('button[role="checkbox"]');
        this.signUpLink = page.locator('a:has-text("Sign up")');
        this.signUpButton = page.locator('button:has-text("Sign up")');
        this.successMsg = page.getByText('Account created successfully! Please verify your email.', {exact: true});
        this.otpInput = page.locator('input[data-input-otp="true"]');
        this.verifyOTPButton = page.locator('button:has-text("Verify OTP")');
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
            await this.page.waitForURL('/auth/verify-otp', { timeout: 30000 });
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
            // Look for any text containing success-related words
            const allText = await this.page.locator('body').textContent();
            if (allText) {
                const successKeywords = ['success', 'created', 'verify', 'email', 'account'];
                const foundKeywords = successKeywords.filter(keyword => 
                    allText.toLowerCase().includes(keyword.toLowerCase())
                );
                console.log("Found keywords on page:", foundKeywords);
                
                // Look for specific success messages
                const successElements = await this.page.locator('[class*="success"], [class*="message"], [class*="alert"]').all();
                console.log(`Found ${successElements.length} potential success/message elements`);
                
                for (let i = 0; i < Math.min(successElements.length, 5); i++) {
                    try {
                        const text = await successElements[i].textContent();
                        if (text) {
                            console.log(`Element ${i + 1} text: "${text.trim()}"`);
                        }
                    } catch (e) {
                        console.log(`Could not get text from element ${i + 1}`);
                    }
                }
            }
        } catch (error) {
            console.log("Debug failed:", error instanceof Error ? error.message : 'Unknown error');
        }
    }

    async isVerifyOTPSuccessMessageVisible() {
        try {
            await this.verifyOTPSuccessMsg.waitFor({ state: 'visible', timeout: 30000 });
            return true;
        } catch {
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
        const mailAccount = await this.createMailTmAccount(uniqueTimestamp);
        
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
        const mailAccount = await this.createMailTmAccount(customTimestamp);
        
        return {
            firstName: this.generateRandomFirstName(customTimestamp),
            lastName: this.generateRandomLastName(customTimestamp),
            email: mailAccount.email,
            password: mailAccount.password,
            token: mailAccount.token,
            timestamp: customTimestamp
        };
    }

    async createMailTmAccount(timestamp?: number | string) {
        // Get valid domain
        const domainRes = await axios.get("https://api.mail.tm/domains");
        const domain = domainRes.data['hydra:member'][0].domain;

        const ts = timestamp || Date.now();
        const randomUser = `user${ts}`;
        const email = `${randomUser}@${domain}`;
        const password = process.env.MAIL_TM_PASSWORD || "Password123!";

        // Create account
        await axios.post("https://api.mail.tm/accounts", {
            address: email,
            password: password
        });

        // Get token
        const tokenRes = await axios.post("https://api.mail.tm/token", {
            address: email,
            password: password
        });

        return { email, password, token: tokenRes.data.token };
    }


    async getOtpFromMailTm(token: string): Promise<string> {
        const headers = { Authorization: `Bearer ${token}` };
        console.log('Starting OTP retrieval from Mail.tm...');
        console.log('⏳ Waiting for at least 2 emails to be received...');

        for (let i = 0; i < 10; i++) {
            console.log(`Attempt ${i + 1}/10: Checking for messages...`);
            
            try {
                const res = await axios.get("https://api.mail.tm/messages", { headers });
                const messageCount = res.data['hydra:member'].length;
                console.log(`Found ${messageCount} messages in inbox`);
                
                // Wait for at least 2 emails
                if (messageCount < 2) {
                    console.log(`⏳ Only ${messageCount} email(s) found. Waiting for at least 2 emails...`);
                    if (i < 9) { // Don't wait after the last attempt
                        console.log('Waiting 3 seconds before next attempt...');
                        await new Promise(resolve => setTimeout(resolve, 3000));
                    }
                    continue;
                }
                
                console.log(`✅ Found ${messageCount} emails! Proceeding with OTP extraction...`);

                if (res.data['hydra:member'].length > 0) {
                    const messages = res.data['hydra:member'];
                    
                    // Function to check a specific email for OTP
                    const checkEmailForOTP = async (message: any, emailNumber: number) => {
                        console.log(`\n📧 EMAIL ${emailNumber}:`);
                        console.log(`From: ${message.from?.address}`);
                        console.log(`Subject: ${message.subject}`);
                        console.log(`Date: ${message.createdAt}`);
                        
                        const msgDetail = await axios.get(
                            `https://api.mail.tm/messages/${message.id}`,
                            { headers }
                        );

                        // Ensure body is always a string
                        const body = String(msgDetail.data.text || msgDetail.data.html || "");
                        console.log(`\n📄 FULL EMAIL BODY:`);
                        console.log('='.repeat(80));
                        console.log(body);
                        console.log('='.repeat(80));
                        console.log(`\n📊 Email body length: ${body.length} characters`);

                        // Try multiple OTP patterns (prioritize 6-digit codes)
                        const otpPatterns = [
                            /\b\d{6}\b/,           // 6-digit number (preferred)
                            /code[:\s]*(\d{6})/i,  // "code: 123456" format (6-digit)
                            /otp[:\s]*(\d{6})/i,   // "otp: 123456" format (6-digit)
                            /verification[:\s]*(\d{6})/i, // "verification: 123456" format (6-digit)
                            /\b\d{4}\b/,           // 4-digit number (fallback)
                            /\b\d{5}\b/,           // 5-digit number (fallback)
                            /\b\d{8}\b/,           // 8-digit number (fallback)
                            /code[:\s]*(\d{4,8})/i, // "code: 1234" format (any length)
                            /otp[:\s]*(\d{4,8})/i,  // "otp: 1234" format (any length)
                            /verification[:\s]*(\d{4,8})/i, // "verification: 1234" format (any length)
                        ];

                        for (const pattern of otpPatterns) {
                            const match = body.match(pattern);
                            if (match) {
                                const otp = match[1] || match[0]; // Use captured group or full match
                                console.log(`✅ OTP found in EMAIL ${emailNumber}: ${otp}`);
                                return otp;
                            }
                        }

                        console.log(`❌ No OTP pattern found in EMAIL ${emailNumber}.`);
                        return null;
                    };
                    
                    // Check EMAIL 2 first (verification email - should be the newest)
                    if (messages.length >= 2) {
                        console.log('🔍 Checking EMAIL 2 first (verification email)...');
                        const otpFromEmail2 = await checkEmailForOTP(messages[1], 2);
                        if (otpFromEmail2) {
                            return otpFromEmail2;
                        }
                    }
                    
                    // If no OTP found in EMAIL 2, check EMAIL 1 (welcome email)
                    console.log('🔍 Checking EMAIL 1 (welcome email) as fallback...');
                    const otpFromEmail1 = await checkEmailForOTP(messages[0], 1);
                    if (otpFromEmail1) {
                        return otpFromEmail1;
                    }
                    
                    console.log(`\n📋 INBOX SUMMARY:`);
                    console.log(`Total emails found: ${res.data['hydra:member'].length}`);
                    console.log(`Email subjects:`);
                    res.data['hydra:member'].forEach((msg: any, index: number) => {
                        console.log(`  ${index + 1}. ${msg.subject} (from: ${msg.from?.address})`);
                    });
                } else {
                    console.log('No messages found in inbox yet');
                }
            } catch (error) {
                console.error(`Error during attempt ${i + 1}:`, error);
            }

            if (i < 9) { // Don't wait after the last attempt
                console.log('Waiting 3 seconds before next attempt...');
                await new Promise(r => setTimeout(r, 3000));
            }
        }

        // If we get here, no OTP was found
        console.error('OTP not found after 10 attempts. This could mean:');
        console.error('1. Verification email was not sent by the application (only welcome email received)');
        console.error('2. Verification email is still in transit (try increasing timeout)');
        console.error('3. Email format doesn\'t contain a recognizable OTP pattern');
        console.error('4. Email was sent to a different address');
        console.error('5. Need to wait longer for the verification email to arrive');
        
        throw new Error("OTP not received in Mail.tm inbox after 10 attempts. Expected at least 2 emails (welcome + verification) but may not have received the verification email yet.");
    }

    // Method specifically for getting the latest email OTP during sign-in
    async getLatestEmailOTP(token: string, isMFAVerification: boolean = false): Promise<string> {
        const headers = { Authorization: `Bearer ${token}` };
        
        if (isMFAVerification) {
            console.log('📧 Retrieving OTP from most recent MFA verification email...');
        } else {
            console.log('📧 Retrieving OTP from most recent sign-up verification email...');
        }
        console.log('🔑 Using token:', token.substring(0, 20) + '...');

        // Record the current time to ensure we get emails after this point
        const startTime = new Date();
        console.log(`⏰ Starting OTP retrieval at: ${startTime.toISOString()}`);

        const maxAttempts = isMFAVerification ? 30 : 10;
        const waitTime = isMFAVerification ? 5000 : 3000;

        for (let i = 0; i < maxAttempts; i++) {
            console.log(`\n🔄 Attempt ${i + 1}/${maxAttempts}: Checking for ${isMFAVerification ? 'MFA verification' : 'sign-up verification'} email...`);
            
            try {
                const res = await axios.get("https://api.mail.tm/messages", { headers });
                const messages = res.data['hydra:member'];
                console.log(`📬 Found ${messages.length} total emails in inbox`);
                
                if (messages.length < 1) {
                    console.log(`⏳ No emails found yet. Waiting ${waitTime/1000} seconds...`);
                    if (i < maxAttempts - 1) {
                        await new Promise(resolve => setTimeout(resolve, waitTime));
                    }
                    continue;
                }

                // Sort emails by creation time (newest first)
                const sortedMessages = messages.sort((a: any, b: any) => {
                    const dateA = new Date(a.createdAt).getTime();
                    const dateB = new Date(b.createdAt).getTime();
                    return dateB - dateA; // Newest first
                });
                
                console.log(`📅 Sorted ${sortedMessages.length} emails by time (newest first):`);
                sortedMessages.forEach((msg: any, index: number) => {
                    console.log(`  ${index + 1}. ${msg.subject} - ${msg.createdAt} (ID: ${msg.id})`);
                });
                
                // Find the appropriate verification email based on context
                let targetMessage = null;
                let targetIndex = -1;
                
                if (isMFAVerification) {
                    console.log(`🔍 Looking for MFA verification email after ${startTime.toISOString()}`);
                    
                    // Look for MFA verification emails that arrived after we started
                    for (let j = 0; j < sortedMessages.length; j++) {
                        const msg = sortedMessages[j];
                        const msgTime = new Date(msg.createdAt);
                        const subject = msg.subject?.toLowerCase() || '';
                        const from = msg.from?.address?.toLowerCase() || '';
                        
                        console.log(`📧 Email ${j + 1}: ${msg.subject} - ${msg.createdAt}`);
                        
                        // Check if this email is MFA-related AND arrived after we started
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
                        
                        const isAfterStart = msgTime > startTime;
                        
                        if (isMFAEmail && isAfterStart) {
                            targetMessage = msg;
                            targetIndex = j;
                            console.log(`✅ Found NEW MFA verification email at position ${j + 1}: ${msg.subject}`);
                            console.log(`📅 Email time: ${msg.createdAt} (after start: ${isAfterStart})`);
                            break;
                        } else if (isMFAEmail) {
                            console.log(`⚠️ Found MFA email at position ${j + 1} but it's older than start time`);
                        }
                    }
                    
                    // If no new MFA email found, wait longer for it to arrive
                    if (!targetMessage) {
                        console.log(`⚠️ No new MFA email found after start time. Waiting longer for fresh MFA email...`);
                        if (i < maxAttempts - 1) {
                            await new Promise(resolve => setTimeout(resolve, waitTime));
                            continue;
                        } else {
                            console.log(`❌ No fresh MFA email received after ${maxAttempts} attempts. This indicates the MFA email may not have been sent.`);
                            throw new Error(`No fresh MFA verification email received after ${maxAttempts} attempts. The MFA email may not have been sent by the application.`);
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
                console.log(`From: ${targetMessage.from?.address}`);
                console.log(`Subject: ${targetMessage.subject}`);
                console.log(`Date: ${targetMessage.createdAt}`);

                const msgDetail = await axios.get(
                    `https://api.mail.tm/messages/${targetMessage.id}`,
                    { headers }
                );

                const body = String(msgDetail.data.text || msgDetail.data.html || "");
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
                            console.log(`✅ OTP found in email ${targetIndex + 1} from ${sortedMessages.length} emails (ID: ${targetMessage.id}): ${paddedOTP}`);
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

            } catch (error) {
                console.error(`❌ Error retrieving email on attempt ${i + 1}:`, error);
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
        // Use the provided token for the existing mail account
        const headers = { Authorization: `Bearer ${token}` };
        
        console.log('📧 Fetching invitation email content...');
        console.log('🔑 Using token:', token.substring(0, 20) + '...');

        for (let i = 0; i < 10; i++) {
            console.log(`\n🔄 Attempt ${i + 1}/10: Checking for invitation email...`);
            
            try {
                const res = await axios.get("https://api.mail.tm/messages", { headers });
                const messages = res.data['hydra:member'];
                console.log(`📬 Found ${messages.length} total emails in inbox`);
                
                if (messages.length === 0) {
                    console.log(`⏳ No emails found yet. Waiting 5 seconds...`);
                    if (i < 9) {
                        await new Promise(resolve => setTimeout(resolve, 5000));
                    }
                    continue;
                }

                // Look for invitation email (should be the latest)
                const latestMessage = messages[0]; // Messages are sorted by creation time, newest first
                
                console.log(`\n📧 LATEST EMAIL:`);
                console.log(`📧 Email ID: ${latestMessage.id}`);
                console.log(`From: ${latestMessage.from?.address}`);
                console.log(`Subject: ${latestMessage.subject}`);
                console.log(`Date: ${latestMessage.createdAt}`);

                // Check if this is an invitation email
                if (latestMessage.subject && 
                    (latestMessage.subject.toLowerCase().includes('invite') || 
                     latestMessage.subject.toLowerCase().includes('welcome') ||
                     latestMessage.subject.toLowerCase().includes('smartpc'))) {
                    
                    const msgDetail = await axios.get(
                        `https://api.mail.tm/messages/${latestMessage.id}`,
                        { headers }
                    );

                    const body = String(msgDetail.data.text || msgDetail.data.html || "");
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
                
            } catch (error) {
                console.error(`❌ Error fetching emails (attempt ${i + 1}):`, error);
                if (i < 9) {
                    console.log('Waiting 5 seconds before retry...');
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
            }
        }
        
        throw new Error("Invitation email not found in Mail.tm inbox after 10 attempts.");
    }

}
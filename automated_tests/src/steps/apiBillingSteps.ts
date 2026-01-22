import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { config, getTestData } from '../config/environment';
import { ApiBillingPage, GetPaymentMethodsRequest, SetDefaultCardRequest, GetRechargesRequest, RechargeRequest, RefundRequestRequest, ProcessRefundsRequest, AddPaymentMethodRequest, DeletePaymentMethodRequest } from '../pages/apiBillingPage';

// Import login steps to get access to UI authentication step definitions
import '../steps/loginSteps';

// Background steps
Given('I have valid API authentication token for billing', async function(this: CustomWorld) {
    this.apiBillingPage = new ApiBillingPage(
        config.testData.api?.billingBaseURL || 'https://558xjerom8.execute-api.us-east-1.amazonaws.com/prod',
        'placeholder_token'
    );
    // For billing API calls, prefer ID token, fallback to Access token
    const billingToken = this.capturedIdToken || this.capturedAccessToken;
    this.apiBillingPage!.initializeAuthentication(billingToken, config.testData.api?.authToken);
});

Given('I have the billing API base URL configured', async function(this: CustomWorld) {
    const baseURL = config.testData.api?.billingBaseURL || 'https://6wo93nmsqg.execute-api.us-east-1.amazonaws.com/dev';
    
    // Initialize apiBillingPage if it doesn't exist
    if (!this.apiBillingPage) {
        this.apiBillingPage = new ApiBillingPage(
            baseURL,
            'placeholder_token'
        );
    } else {
        this.apiBillingPage.updateBaseURL(baseURL);
    }
});

Given('I update API authentication with captured token for billing', async function(this: CustomWorld) {
    // For billing API calls, prefer ID token, fallback to Access token
    const billingToken = this.capturedIdToken || this.capturedAccessToken;
    
    console.log('🔍 Debug: capturedIdToken available:', !!this.capturedIdToken);
    console.log('🔍 Debug: capturedAccessToken available:', !!this.capturedAccessToken);
    console.log('🔍 Debug: billingToken value:', billingToken ? billingToken.substring(0, 30) + '...' : 'undefined');
    
    if (!billingToken) {
        throw new Error('No captured token available for billing. Please ensure login steps completed successfully.');
    }
    
    if (!this.apiBillingPage) {
        this.apiBillingPage = new ApiBillingPage(
            config.testData.api?.billingBaseURL || 'https://558xjerom8.execute-api.us-east-1.amazonaws.com/prod',
            'placeholder_token'
        );
    }
    console.log('🔍 Debug: About to update API billing authentication...');
    console.log('🔍 Debug: billingToken length:', billingToken ? billingToken.length : 'undefined');
    console.log('🔍 Debug: billingToken first 50 chars:', billingToken ? billingToken.substring(0, 50) + '...' : 'undefined');
    
    this.apiBillingPage!.updateAuthenticationWithCapturedToken(billingToken);
    
    console.log('🔍 Debug: After update, API billing page auth token length:', this.apiBillingPage!.getAuthToken() ? this.apiBillingPage!.getAuthToken()!.length : 'undefined');
});


// Request preparation steps - Dynamic
Given('I prepare get payment methods request for current user', async function(this: CustomWorld) {
    // No userId needed - extracted from JWT token on server side
    this.currentBillingRequest = this.apiBillingPage!.createGetPaymentMethodsConfig();
});

Given('I prepare set default card request for current user', async function(this: CustomWorld) {
    const userId = this.capturedUserId || config.testData.api?.billing?.testUserId;
    const paymentMethodId = this.addedPaymentMethodId || `pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.currentBillingRequest = this.apiBillingPage!.createSetDefaultCardConfig(userId!, paymentMethodId);
});

Given('I prepare get recharges request for current user', async function(this: CustomWorld) {
    // No userId needed - extracted from JWT token on server side
    this.currentBillingRequest = this.apiBillingPage!.createGetRechargesConfig();
});

Given('I prepare recharge request for current user', async function(this: CustomWorld) {
    // const amount = Math.floor(Math.random() * 50 + 10);
    const autoRecharge = false;
    this.currentBillingRequest = this.apiBillingPage!.createRechargeConfig(20, autoRecharge);
});

Given('I prepare refund request for current user', async function(this: CustomWorld) {
    const userId = this.capturedUserId || config.testData.api?.billing?.testUserId;
    // const amount = (Math.random() * 50 + 5).toFixed(2);
    const paymentIntentId = `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const reasons = ['Paid by mistake', 'Service not needed', 'Duplicate payment', 'Wrong amount', 'Technical issue'];
    const reason = reasons[Math.floor(Math.random() * reasons.length)];
    this.currentBillingRequest = this.apiBillingPage!.createRefundRequestConfig(userId!, '20', paymentIntentId, reason);
});

Given('I prepare process refunds request with dynamic tickets', async function(this: CustomWorld) {
    const ticketId = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const statuses = ['APPROVED', 'PENDING', 'REJECTED'];
    const assignees = ['Ashfak', 'Admin', 'Support', 'Manager'];
    const tickets = [{
        ticketId: ticketId,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        assignedTo: assignees[Math.floor(Math.random() * assignees.length)]
    }];
    this.currentBillingRequest = this.apiBillingPage!.createProcessRefundsConfig(tickets);
});

Given('I prepare add payment method request for current user', async function(this: CustomWorld) {
    const userId = this.capturedUserId || config.testData.api?.billing?.testUserId;
    const cardNumber = '4242424242424242';
    const expMonth = '11';
    const expYear = '28';
    const cvc = '123';
    const zipCode = '44114';
    const cardName = 'Test';
    this.currentBillingRequest = this.apiBillingPage!.createAddPaymentMethodConfig(
        userId!, cardNumber, expMonth, expYear, cvc, zipCode, cardName
    );
});

Given('I prepare delete payment method request for current user', async function(this: CustomWorld) {
    const userId = this.capturedUserId || config.testData.api?.billing?.testUserId;
    const paymentMethodId = this.addedPaymentMethodId;
    this.currentBillingRequest = this.apiBillingPage!.createDeletePaymentMethodConfig(userId!, paymentMethodId!);
});

// API call steps
When('I send GET request to get payment methods endpoint', { timeout: 30000 }, async function(this: CustomWorld) {
    try {
        this.lastApiResponse = await this.apiBillingPage!.getPaymentMethods(this.currentBillingRequest as GetPaymentMethodsRequest);
        this.apiBillingPage!.setLastResponse(this.lastApiResponse);
    } catch (error: any) {
        this.lastApiError = error;
        if (error && typeof error === 'object' && 'response' in error) {
            this.apiBillingPage!.setLastError(error);
        }
    }
});

When('I send POST request to set default card endpoint', { timeout: 30000 }, async function(this: CustomWorld) {
    try {
        this.lastApiResponse = await this.apiBillingPage!.setDefaultCard(this.currentBillingRequest as SetDefaultCardRequest);
        this.apiBillingPage!.setLastResponse(this.lastApiResponse);
    } catch (error: any) {
        console.log('❌ Set default card request failed:', error);
        this.lastApiError = error;
        if (error && typeof error === 'object' && 'response' in error) {
            this.apiBillingPage!.setLastError(error);
        }
    }
});

When('I send GET request to get recharges endpoint', { timeout: 30000 }, async function(this: CustomWorld) {
    try {
        this.lastApiResponse = await this.apiBillingPage!.getRecharges(this.currentBillingRequest as GetRechargesRequest);
        this.apiBillingPage!.setLastResponse(this.lastApiResponse);
    } catch (error: any) {
        console.log('❌ Get recharges request failed:', error);
        this.lastApiError = error;
        if (error && typeof error === 'object' && 'response' in error) {
            this.apiBillingPage!.setLastError(error);
        }
    }
});

When('I send POST request to recharge endpoint', { timeout: 30000 }, async function(this: CustomWorld) {
    try {
        // Validate token before making the request
        if (!this.capturedAccessToken) {
            throw new Error('No access token available for API request');
        }
        
        // Check if token is still valid by making a test request first
        try {
            await this.apiBillingPage!.validateToken(this.capturedAccessToken);
        } catch (tokenError) {
            console.log('⚠️ Token validation failed, attempting to refresh...');
            // If token is invalid, try to get a fresh one
            if (this.page && !this.page.isClosed()) {
                await this.page.goto('/login');
                await this.page.waitForTimeout(2000);
                // Re-authenticate to get fresh token
                await this.loginPage!.login(this.email!, this.password!);
                this.capturedAccessToken = this.loginPage!.getCapturedAccessToken();
                if (this.capturedAccessToken) {
                    this.apiBillingPage!.updateAuthToken(this.capturedAccessToken);
                    console.log('✅ Token refreshed successfully');
                } else {
                    throw new Error('Failed to refresh authentication token');
                }
            } else {
                throw new Error('Page context not available for token refresh');
            }
        }
        
        this.lastApiResponse = await this.apiBillingPage!.recharge(this.currentBillingRequest as RechargeRequest);
        this.apiBillingPage!.setLastResponse(this.lastApiResponse);
    } catch (error: any) {
        console.log('❌ Recharge request failed:', error);
        this.lastApiError = error;
        if (error && typeof error === 'object' && 'response' in error) {
            this.apiBillingPage!.setLastError(error);
        }
    }
});

When('I send POST request to create refund request endpoint', { timeout: 30000 }, async function(this: CustomWorld) {
    try {
        this.lastApiResponse = await this.apiBillingPage!.createRefundRequest(this.currentBillingRequest as RefundRequestRequest);
        this.apiBillingPage!.setLastResponse(this.lastApiResponse);
    } catch (error: any) {
        console.log('❌ Create refund request failed:', error);
        this.lastApiError = error;
        if (error && typeof error === 'object' && 'response' in error) {
            this.apiBillingPage!.setLastError(error);
        }
    }
});

When('I send GET request to get refund requests endpoint', { timeout: 30000 }, async function(this: CustomWorld) {
    if (!this.apiBillingPage) {
        throw new Error('API Billing page is not initialized');
    }
    
    try {
        this.lastApiResponse = await this.apiBillingPage!.getRefundRequests();
        this.apiBillingPage!.setLastResponse(this.lastApiResponse);
    } catch (error: any) {
        console.log('❌ Get refund requests request failed:', error);
        this.lastApiError = error;
        if (error && typeof error === 'object' && 'response' in error) {
            this.apiBillingPage!.setLastError(error);
        }
    }
});

When('I send POST request to process refunds endpoint', { timeout: 30000 }, async function(this: CustomWorld) {
    try {
        this.lastApiResponse = await this.apiBillingPage!.processRefunds(this.currentBillingRequest as ProcessRefundsRequest);
        this.apiBillingPage!.setLastResponse(this.lastApiResponse);
    } catch (error: any) {
        console.log('❌ Process refunds request failed:', error);
        this.lastApiError = error;
        if (error && typeof error === 'object' && 'response' in error) {
            this.apiBillingPage!.setLastError(error);
        }
    }
});

When('I send POST request to add payment method endpoint', { timeout: 30000 }, async function(this: CustomWorld) {
    try {
        this.lastApiResponse = await this.apiBillingPage!.addPaymentMethod(this.currentBillingRequest as AddPaymentMethodRequest);
        this.apiBillingPage!.setLastResponse(this.lastApiResponse);
        
        // Store the payment method ID for later use
        const paymentMethodId = this.apiBillingPage!.getPaymentMethodIdFromResponse();
        if (paymentMethodId) {
            this.addedPaymentMethodId = paymentMethodId;
            console.log('✅ Payment method ID captured:', paymentMethodId);
        }
        
    } catch (error: any) {
        console.log('❌ Add payment method request failed:', error);
        this.lastApiError = error;
        if (error && typeof error === 'object' && 'response' in error) {
            this.apiBillingPage!.setLastError(error);
        }
    }
});

When('I send DELETE request to delete payment method endpoint', { timeout: 30000 }, async function(this: CustomWorld) {
    try {
        this.lastApiResponse = await this.apiBillingPage!.deletePaymentMethod(this.currentBillingRequest as DeletePaymentMethodRequest);
        this.apiBillingPage!.setLastResponse(this.lastApiResponse);
    } catch (error: any) {
        console.log('❌ Delete payment method request failed:', error);
        this.lastApiError = error;
        if (error && typeof error === 'object' && 'response' in error) {
            this.apiBillingPage!.setLastError(error);
        }
    }
});

// Response verification steps - Success only
Then('I should receive successful billing response with status code {int}', async function(this: CustomWorld, expectedStatusCode: number) {
    if (!this.apiBillingPage) {
        throw new Error('API Billing page is not initialized');
    }
    
    console.log('🔍 Checking API response status...');
    console.log(`📊 lastApiResponse: ${this.lastApiResponse ? 'present' : 'null'}`);
    console.log(`📊 lastApiError: ${this.lastApiError ? 'present' : 'null'}`);
    
    // Check if we have a successful response
    if (this.lastApiResponse) {
        const actualStatusCode = this.apiBillingPage!.getResponseStatusCode();
        console.log(`📊 Actual status code: ${actualStatusCode}, Expected: ${expectedStatusCode}`);
        
        if (actualStatusCode !== expectedStatusCode) {
            console.error(`❌ Status code mismatch! Expected: ${expectedStatusCode}, Got: ${actualStatusCode}`);
            console.error('📄 Response data:', JSON.stringify(this.lastApiResponse.data, null, 2));
            throw new Error(`Expected status code ${expectedStatusCode}, but got ${actualStatusCode}`);
        }
        
        const isSuccessful = this.apiBillingPage!.isLastResponseSuccessful();
        console.log(`📊 Response is successful: ${isSuccessful}`);
        
        if (!isSuccessful) {
            console.error('❌ Response indicates failure despite correct status code');
            console.error('📄 Response data:', JSON.stringify(this.lastApiResponse.data, null, 2));
            throw new Error('API response indicates failure');
        }
        
        console.log(`✅ Received successful response with status code: ${actualStatusCode}`);
    } else if (this.lastApiError) {
        // If we have an error instead of a response, provide more details
        console.error('❌ API call failed with error:', this.lastApiError);
        if (this.lastApiError.response) {
            console.error('📄 Error response data:', JSON.stringify(this.lastApiError.response.data, null, 2));
            console.error('📄 Error response status:', this.lastApiError.response.status);
        }
        throw new Error(`API call failed: ${this.lastApiError.message || this.lastApiError}`);
    } else {
        // Check if the API billing page has a response stored
        const storedResponse = this.apiBillingPage!.getLastResponse();
        console.log(`📊 Stored response: ${storedResponse ? 'present' : 'null'}`);
        
        if (storedResponse) {
            console.log('📄 Using stored response from API billing page');
            const actualStatusCode = this.apiBillingPage!.getResponseStatusCode();
            console.log(`📊 Stored response status code: ${actualStatusCode}, Expected: ${expectedStatusCode}`);
            
            if (actualStatusCode !== expectedStatusCode) {
                console.error(`❌ Stored response status code mismatch! Expected: ${expectedStatusCode}, Got: ${actualStatusCode}`);
                console.error('📄 Stored response data:', JSON.stringify(storedResponse.data, null, 2));
                throw new Error(`Expected status code ${expectedStatusCode}, but got ${actualStatusCode}`);
            }
            
            const isSuccessful = this.apiBillingPage!.isLastResponseSuccessful();
            console.log(`📊 Stored response is successful: ${isSuccessful}`);
            
            if (!isSuccessful) {
                console.error('❌ Stored response indicates failure despite correct status code');
                console.error('📄 Stored response data:', JSON.stringify(storedResponse.data, null, 2));
                throw new Error('Stored API response indicates failure');
            }
            
            console.log(`✅ Received successful response with status code: ${actualStatusCode}`);
        } else {
            console.error('❌ No response or error available for verification');
            console.error('📊 Debug info:');
            console.error(`  - lastApiResponse: ${this.lastApiResponse}`);
            console.error(`  - lastApiError: ${this.lastApiError}`);
            console.error(`  - storedResponse: ${storedResponse}`);
            throw new Error('No valid response available for status code verification. Check if the API call was made successfully.');
        }
    }
});

Then('I should verify payment methods response contains payment methods', async function(this: CustomWorld) {
    if (!this.apiBillingPage) {
        throw new Error('API Billing page is not initialized');
    }
    
    const hasPaymentMethods = this.apiBillingPage!.hasPaymentMethods();
    expect(hasPaymentMethods).toBeTruthy();
    
    const paymentMethods = this.apiBillingPage!.getPaymentMethodsFromResponse();
    expect(paymentMethods).toBeDefined();
    expect(Array.isArray(paymentMethods)).toBeTruthy();
    
    console.log(`✅ Response contains payment methods: ${paymentMethods?.length || 0} methods found`);
});

Then('I should verify recharge response contains success message', async function(this: CustomWorld) {
    if (!this.apiBillingPage) {
        throw new Error('API Billing page is not initialized');
    }
    
    const hasSuccessMessage = this.apiBillingPage!.hasSuccessMessage();
    expect(hasSuccessMessage).toBeTruthy();
    
    const successMessage = this.apiBillingPage!.getSuccessMessage();
    expect(successMessage).toBeDefined();
    expect(successMessage).not.toBe('');
    
    console.log(`✅ Recharge response contains success message: ${successMessage}`);
});

Then('I should verify recharge response contains wallet balance', async function(this: CustomWorld) {
    if (!this.apiBillingPage) {
        throw new Error('API Billing page is not initialized');
    }
    
    const hasWalletBalance = this.apiBillingPage!.hasWalletBalance();
    expect(hasWalletBalance).toBeTruthy();
    
    const walletBalance = this.apiBillingPage!.getWalletBalance();
    expect(walletBalance).toBeDefined();
    expect(typeof walletBalance).toBe('number');
    
    console.log(`✅ Recharge response contains wallet balance: $${walletBalance}`);
});

Then('I should verify recharges response contains recharge data', async function(this: CustomWorld) {
    if (!this.apiBillingPage) {
        throw new Error('API Billing page is not initialized');
    }
    
    const hasRechargeData = this.apiBillingPage!.hasRechargeData();
    expect(hasRechargeData).toBeTruthy();
    
    const rechargeData = this.apiBillingPage!.getRechargeDataFromResponse();
    expect(rechargeData).toBeDefined();
    expect(Array.isArray(rechargeData)).toBeTruthy();
    
    console.log(`✅ Response contains recharge data: ${rechargeData?.length || 0} recharges found`);
});

Then('I should verify refund request response contains refund request ID', async function(this: CustomWorld) {
    if (!this.apiBillingPage) {
        throw new Error('API Billing page is not initialized');
    }
    
    const hasRefundRequestId = this.apiBillingPage!.hasRefundRequestId();
    expect(hasRefundRequestId).toBeTruthy();
    
    const refundRequestId = this.apiBillingPage!.getRefundRequestId();
    expect(refundRequestId).toBeDefined();
    expect(refundRequestId).not.toBe('');
    
    console.log(`✅ Refund request response contains refund request ID: ${refundRequestId}`);
});

Then('I should verify refund requests response contains refund requests', async function(this: CustomWorld) {
    if (!this.apiBillingPage) {
        throw new Error('API Billing page is not initialized');
    }
    
    const hasRefundRequests = this.apiBillingPage!.hasRefundRequests();
    expect(hasRefundRequests).toBeTruthy();
    
    const refundRequests = this.apiBillingPage!.getRefundRequestsFromResponse();
    expect(refundRequests).toBeDefined();
    expect(Array.isArray(refundRequests)).toBeTruthy();
    
    console.log(`✅ Response contains refund requests: ${refundRequests?.length || 0} requests found`);
});

Then('I should verify process refunds response contains success message', async function(this: CustomWorld) {
    if (!this.apiBillingPage) {
        throw new Error('API Billing page is not initialized');
    }
    
    const hasSuccessMessage = this.apiBillingPage!.hasSuccessMessage();
    expect(hasSuccessMessage).toBeTruthy();
    
    const successMessage = this.apiBillingPage!.getSuccessMessage();
    expect(successMessage).toBeDefined();
    expect(successMessage).not.toBe('');
    
    console.log(`✅ Process refunds response contains success message: ${successMessage}`);
});

Then('I should verify add payment method response contains payment method ID', async function(this: CustomWorld) {
    if (!this.apiBillingPage) {
        throw new Error('API Billing page is not initialized');
    }
    
    const hasPaymentMethodId = this.apiBillingPage!.hasPaymentMethodId();
    expect(hasPaymentMethodId).toBeTruthy();
    
    const paymentMethodId = this.apiBillingPage!.getPaymentMethodIdFromResponse();
    expect(paymentMethodId).toBeDefined();
    expect(paymentMethodId).not.toBe('');
    
    console.log(`✅ Add payment method response contains payment method ID: ${paymentMethodId}`);
});

Then('I should verify delete payment method response contains success message', async function(this: CustomWorld) {
    if (!this.apiBillingPage) {
        throw new Error('API Billing page is not initialized');
    }
    
    const hasSuccessMessage = this.apiBillingPage!.hasSuccessMessage();
    expect(hasSuccessMessage).toBeTruthy();
    
    const successMessage = this.apiBillingPage!.getSuccessMessage();
    expect(successMessage).toBeDefined();
    expect(successMessage).not.toBe('');
    
    console.log(`✅ Delete payment method response contains success message: ${successMessage}`);
});



import axios, { AxiosResponse } from 'axios';
import { logConfig } from '../utils/logConfig';

export interface CreatePCRequest {
  action: string;
  configId: string;
  systemName: string;
  region: string;
  storageSize: number;
  billingPlan: string;
}

export interface DeletePCRequest {
  action: string;
  instanceId: string;
  region: string;
}

export interface CreatePCResponse {
  instanceId?: string;
  systemName?: string;
  status?: string;
  message?: string;
  error?: string;
  [key: string]: any;
}

export interface DeletePCResponse {
  instanceId?: string;
  status?: string;
  message?: string;
  error?: string;
  [key: string]: any;
}

export interface CheckPCStatusRequest {
  action: string;
  instanceId: string;
}

export interface CheckPCStatusResponse {
  instanceId?: string;
  status?: string;
  state?: string;
  instanceStatus?: string;
  message?: string;
  error?: string;
  [key: string]: any;
}

export interface StartPCRequest {
  action: string;
  instanceId: string;
  systemName: string;
}

export interface StartPCResponse {
  instanceId?: string;
  status?: string;
  message?: string;
  error?: string;
  [key: string]: any;
}

export interface StopPCRequest {
  action: string;
  instanceId: string;
  systemName: string;
}

export interface StopPCResponse {
  instanceId?: string;
  status?: string;
  message?: string;
  error?: string;
  [key: string]: any;
}

export interface ResizePCRequest {
  userId: string;
  computerName: string;
  targetConfigId: string;
}

export interface ResizePCResponse {
  instanceId?: string;
  status?: string;
  message?: string;
  error?: string;
  [key: string]: any;
}

export interface CognitoGetUserRequest {
  AccessToken: string;
}

export interface CognitoGetUserResponse {
  Username?: string;
  UserAttributes?: Array<{
    Name: string;
    Value: string;
  }>;
  MFAOptions?: Array<{
    DeliveryMedium: string;
    AttributeName: string;
  }>;
  PreferredMfaSetting?: string;
  UserMFASettingList?: string[];
  [key: string]: any;
}

export interface ApiConfig {
  baseURL: string;
  timeout: number;
  headers: {
    'Content-Type': string;
    'Authorization': string;
  };
}

export class ApiCreatePCPage {
  private apiConfig: ApiConfig;
  private lastResponse: AxiosResponse<CreatePCResponse> | null = null;
  private lastError: any = null;

  constructor(baseURL: string, authToken: string) {
    this.apiConfig = {
      baseURL: baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    };
  }

  /**
   * Initialize authentication with captured token or fallback
   */
  initializeAuthentication(capturedToken?: string, fallbackToken?: string): string {
    let authToken = capturedToken;
    
    if (authToken) {
      console.log('✅ Using captured access token for PC creation');
      console.log('🔑 Token (first 30 chars):', authToken.substring(0, 30) + '...');
      console.log('🔑 Token length:', authToken.length);
    } else {
      // Fallback to environment or test data token
      console.log('⚠️ No captured access token found, using fallback token for PC creation');
      authToken = fallbackToken || process.env.API_AUTH_TOKEN;
      
      if (!authToken) {
        throw new Error('No authentication token available. Please provide a captured token or set API_AUTH_TOKEN environment variable.');
      }
      
      console.log('🔑 Using fallback token (first 30 chars):', authToken.substring(0, 30) + '...');
    }
    
    this.apiConfig.headers.Authorization = `Bearer ${authToken}`;
    console.log('✅ API authentication token configured');
    return authToken;
  }

  /**
   * Update authentication with captured token
   */
  updateAuthenticationWithCapturedToken(capturedToken: string): void {
    if (!capturedToken) {
      throw new Error('No captured access token provided');
    }
    
    this.apiConfig.headers.Authorization = `Bearer ${capturedToken}`;
    console.log('✅ API authentication updated with captured token');
    console.log('🔑 Token (first 30 chars):', capturedToken.substring(0, 30) + '...');
    console.log('🔑 Token length:', capturedToken.length);
  }

  /**
   * Create a new PC instance via API
   */
  async createPC(requestData: CreatePCRequest): Promise<AxiosResponse<CreatePCResponse>> {
    if (logConfig.shouldLogRequest()) {
      console.log('\n🚀 ===== CREATE PC API CALL =====');
      console.log(`📋 Request Data:`, JSON.stringify(requestData, null, 2));
      console.log(`🌐 Endpoint: ${this.apiConfig.baseURL}/instance`);
      console.log(`⏱️  Timeout: ${this.apiConfig.timeout}ms`);
    }
    
    const startTime = Date.now();
    
    try {
      const response = await axios.post<CreatePCResponse>(
        `${this.apiConfig.baseURL}/instance`,
        requestData,
        {
          headers: this.apiConfig.headers,
          timeout: this.apiConfig.timeout
        }
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      this.lastResponse = response;
      this.lastError = null;
      
      if (logConfig.shouldLogResponse()) {
        console.log(`✅ PC creation successful`);
        console.log(`⏱️  Duration: ${duration}ms`);
        console.log(`📊 Status: ${response.status} ${response.statusText}`);
        console.log(`📦 Response Data:`, JSON.stringify(response.data, null, 2));
        console.log('=====================================\n');
      }

      return response;
    } catch (error: any) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      this.lastError = error;
      this.lastResponse = error.response || null;
      
      // Always show errors, but conditionally show response data
      console.log(`❌ PC creation failed`);
      console.log(`⏱️  Duration: ${duration}ms`);
      console.log(`🚨 Error Message: ${error.message}`);
      console.log(`📊 Error Status: ${error.response?.status || 'No response'}`);
      if (logConfig.shouldLogResponse()) {
        console.log(`📦 Error Data:`, error.response?.data || 'No error data');
      }
      if (logConfig.shouldLogRequest()) {
        console.log('=====================================\n');
      }

      throw error;
    }
  }

  /**
   * Get the last API response
   */
  getLastResponse(): AxiosResponse<CreatePCResponse> | null {
    return this.lastResponse;
  }

  /**
   * Get the last API error
   */
  getLastError(): any {
    return this.lastError;
  }

  /**
   * Check if the last response was successful
   */
  isLastResponseSuccessful(): boolean {
    return this.lastResponse !== null && this.lastResponse.status >= 200 && this.lastResponse.status < 300;
  }

  /**
   * Get response status code
   */
  getResponseStatusCode(): number | null {
    return this.lastResponse?.status || null;
  }

  /**
   * Get response data
   */
  getResponseData(): CreatePCResponse | null {
    return this.lastResponse?.data || null;
  }

  /**
   * Verify response contains instance ID
   */
  hasInstanceId(): boolean {
    const data = this.getResponseData();
    return data !== null && data.instanceId !== undefined && data.instanceId !== null;
  }

  /**
   * Get instance ID from response
   */
  getInstanceId(): string | null {
    const data = this.getResponseData();
    return data?.instanceId || null;
  }

  /**
   * Verify response contains specific system name
   */
  hasSystemName(systemName: string): boolean {
    const data = this.getResponseData();
    return data !== null && data.systemName === systemName;
  }

  /**
   * Get system name from response
   */
  getSystemName(): string | null {
    const data = this.getResponseData();
    return data?.systemName || null;
  }

  /**
   * Verify response contains error message
   */
  hasErrorMessage(): boolean {
    const data = this.getResponseData();
    return data !== null && (data.error !== undefined || data.message !== undefined);
  }

  /**
   * Get error message from response
   */
  getErrorMessage(): string | null {
    const data = this.getResponseData();
    return data?.error || data?.message || null;
  }

  /**
   * Create basic PC configuration
   */
  createBasicPCConfig(systemName: string = 'Test001'): CreatePCRequest {
    return {
      action: 'create',
      configId: 'SensePC.Standard11—4Cores·16GBRAM',
      systemName: systemName,
      region: 'us-east-1',
      storageSize: 220,
      billingPlan: 'hourly'
    };
  }

  /**
   * Create custom PC configuration
   */
  createCustomPCConfig(
    systemName: string,
    configId: string = 'SensePC.Standard11—4Cores·16GBRAM',
    region: string = 'us-east-1',
    storageSize: number = 220,
    billingPlan: string = 'hourly'
  ): CreatePCRequest {
    return {
      action: 'create',
      configId: configId,
      systemName: systemName,
      region: region,
      storageSize: storageSize,
      billingPlan: billingPlan
    };
  }

  /**
   * Create invalid PC configuration for negative testing
   */
  createInvalidPCConfig(): Partial<CreatePCRequest> {
    return {
      action: 'create',
      // Missing required fields
      systemName: 'InvalidTest'
    };
  }

  /**
   * Create PC configuration with missing required fields
   */
  createPCConfigWithMissingFields(): Partial<CreatePCRequest> {
    return {
      action: 'create',
      // Missing configId, region, storageSize, billingPlan
      systemName: 'MissingFieldsTest'
    };
  }

  /**
   * Update authentication token
   */
  updateAuthToken(newToken: string): void {
    this.apiConfig.headers.Authorization = `Bearer ${newToken}`;
  }

  /**
   * Update API base URL
   */
  updateBaseURL(newBaseURL: string): void {
    this.apiConfig.baseURL = newBaseURL;
  }

  /**
   * Get current API configuration
   */
  getApiConfig(): ApiConfig {
    return { ...this.apiConfig };
  }

  /**
   * Delete a PC instance via API
   */
  async deletePC(requestData: DeletePCRequest): Promise<AxiosResponse<DeletePCResponse>> {
    try {
      console.log('🗑️ Sending API request to delete PC:', JSON.stringify(requestData, null, 2));
      
      const response = await axios.post<DeletePCResponse>(
        `${this.apiConfig.baseURL}/instance`,
        requestData,
        {
          headers: this.apiConfig.headers,
          timeout: this.apiConfig.timeout
        }
      );

      this.lastResponse = response;
      this.lastError = null;
      
      console.log('✅ Delete API response received:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });

      return response;
    } catch (error: any) {
      this.lastError = error;
      this.lastResponse = error.response || null;
      
      console.log('❌ Delete API request failed:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });

      throw error;
    }
  }

  /**
   * Create delete PC configuration
   */
  createDeletePCConfig(instanceId: string, region: string = 'virginia'): DeletePCRequest {
    return {
      action: 'delete',
      instanceId: instanceId,
      region: region
    };
  }

  /**
   * Delete multiple PC instances
   */
  async deleteMultiplePCs(instanceIds: string[], region: string = 'virginia'): Promise<AxiosResponse<DeletePCResponse>[]> {
    const responses: AxiosResponse<DeletePCResponse>[] = [];
    
    for (let i = 0; i < instanceIds.length; i++) {
      try {
        console.log(`🗑️ Deleting PC ${i + 1}/${instanceIds.length} with instance ID: ${instanceIds[i]}`);
        const deleteConfig = this.createDeletePCConfig(instanceIds[i], region);
        const response = await this.deletePC(deleteConfig);
        responses.push(response);
        console.log(`✅ PC ${i + 1} deleted successfully`);
      } catch (error) {
        console.log(`❌ Failed to delete PC ${i + 1}:`, error);
        // Continue with other deletions even if one fails
      }
    }
    
    return responses;
  }

  /**
   * Verify delete response contains success message
   */
  hasDeleteSuccessMessage(): boolean {
    const data = this.getResponseData();
    return data !== null && !!(
      data.message?.toLowerCase().includes('deleted') ||
      data.message?.toLowerCase().includes('success') ||
      data.status?.toLowerCase().includes('success') ||
      data.status?.toLowerCase().includes('deleted')
    );
  }

  /**
   * Get delete success message
   */
  getDeleteSuccessMessage(): string | null {
    const data = this.getResponseData();
    return data?.message || data?.status || null;
  }

  /**
   * Check PC status via API
   */
  async checkPCStatus(requestData: CheckPCStatusRequest): Promise<AxiosResponse<CheckPCStatusResponse>> {
    try {
      console.log('🔍 Sending API request to check PC status:', requestData);
      
      const response = await axios.post<CheckPCStatusResponse>(
        `${this.apiConfig.baseURL}/instance`,
        requestData,
        {
          headers: this.apiConfig.headers,
          timeout: this.apiConfig.timeout
        }
      );
      
      console.log('✅ Status check API response received:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });
      
      this.lastResponse = response;
      return response;
    } catch (error: any) {
      console.log('❌ Status check API request failed:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      // Store the error response as lastResponse for verification steps
      if (error.response) {
        this.lastResponse = error.response;
      }
      this.lastError = error;
      throw error;
    }
  }

  /**
   * Create check PC status configuration
   */
  createCheckStatusConfig(instanceId: string): CheckPCStatusRequest {
    return {
      action: 'checkStatus',
      instanceId: instanceId
    };
  }

  /**
   * Verify status response contains valid status
   */
  hasValidStatus(): boolean {
    const data = this.getResponseData();
    return data !== null && !!(
      data.status ||
      data.state ||
      data.instanceStatus ||
      data.message?.toLowerCase().includes('status')
    );
  }

  /**
   * Get PC status from response
   */
  getPCStatus(): string | null {
    const data = this.getResponseData();
    if (data) {
      return data.status || data.state || data.instanceStatus || data.message || null;
    }
    return null;
  }

  /**
   * Verify status response contains instance ID
   */
  hasInstanceIdInStatus(): boolean {
    const data = this.getResponseData();
    return data !== null && !!(data.instanceId || data.id);
  }

  /**
   * Get instance ID from status response
   */
  getInstanceIdFromStatus(): string | null {
    const data = this.getResponseData();
    if (data) {
      return data.instanceId || data.id || null;
    }
    return null;
  }

  /**
   * Start a PC instance via API
   */
  async startPC(requestData: StartPCRequest): Promise<AxiosResponse<StartPCResponse>> {
    try {
      console.log('🚀 Sending API request to start PC:', JSON.stringify(requestData, null, 2));
      
      const response = await axios.post<StartPCResponse>(
        `${this.apiConfig.baseURL}/instance`,
        requestData,
        {
          headers: this.apiConfig.headers,
          timeout: this.apiConfig.timeout
        }
      );

      this.lastResponse = response;
      this.lastError = null;
      
      console.log('✅ Start PC API response received:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });

      return response;
    } catch (error: any) {
      this.lastError = error;
      this.lastResponse = error.response || null;
      
      console.log('❌ Start PC API request failed:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });

      throw error;
    }
  }

  /**
   * Create start PC configuration
   */
  createStartPCConfig(instanceId: string, systemName: string): StartPCRequest {
    return {
      action: 'start',
      instanceId: instanceId,
      systemName: systemName
    };
  }

  /**
   * Verify start PC response contains success message
   */
  hasStartSuccessMessage(): boolean {
    const data = this.getResponseData();
    return data !== null && !!(
      data.message?.toLowerCase().includes('started') ||
      data.message?.toLowerCase().includes('success') ||
      data.status?.toLowerCase().includes('success') ||
      data.status?.toLowerCase().includes('started')
    );
  }

  /**
   * Get start PC success message
   */
  getStartSuccessMessage(): string | null {
    const data = this.getResponseData();
    return data?.message || data?.status || null;
  }

  /**
   * Stop a PC instance via API
   */
  async stopPC(requestData: StopPCRequest): Promise<AxiosResponse<StopPCResponse>> {
    try {
      console.log('🛑 Sending API request to stop PC:', JSON.stringify(requestData, null, 2));
      
      const response = await axios.post<StopPCResponse>(
        `${this.apiConfig.baseURL}/instance`,
        requestData,
        {
          headers: this.apiConfig.headers,
          timeout: this.apiConfig.timeout
        }
      );

      this.lastResponse = response;
      this.lastError = null;
      
      console.log('✅ Stop PC API response received:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });

      return response;
    } catch (error: any) {
      this.lastError = error;
      this.lastResponse = error.response || null;
      
      console.log('❌ Stop PC API request failed:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });

      throw error;
    }
  }

  /**
   * Create stop PC configuration
   */
  createStopPCConfig(instanceId: string, systemName: string): StopPCRequest {
    return {
      action: 'stop',
      instanceId: instanceId,
      systemName: systemName
    };
  }

  /**
   * Verify stop PC response contains success message
   */
  hasStopSuccessMessage(): boolean {
    const data = this.getResponseData();
    if (!data) return false;
    
    // Check for various success indicators
    const message = data.message?.toLowerCase();
    const status = data.status?.toLowerCase();
    const state = data.state?.toLowerCase();
    
    return !!(
      (message && message.includes('stopped')) ||
      (message && message.includes('success')) ||
      (message && message.includes('completed')) ||
      (status && status.includes('success')) ||
      (status && status.includes('stopped')) ||
      (status && status.includes('completed')) ||
      (state && state.includes('stopped')) ||
      (state && state.includes('success')) ||
      // Check if response indicates success (status 200-299)
      (this.lastResponse && this.lastResponse.status >= 200 && this.lastResponse.status < 300)
    );
  }

  /**
   * Get stop PC success message
   */
  getStopSuccessMessage(): string | null {
    const data = this.getResponseData();
    return data?.message || data?.status || null;
  }

  /**
   * Poll PC status until system status is "ok" or timeout is reached
   */
  async waitForSystemStatusOk(instanceId: string, maxWaitTimeMs: number = 10 * 60 * 1000, pollIntervalMs: number = 5000): Promise<boolean> {
    const startTime = Date.now();
    let attempts = 0;
    
    console.log(`🔄 Starting status polling for instance ${instanceId} (max wait: ${maxWaitTimeMs / 1000}s, poll interval: ${pollIntervalMs / 1000}s)`);
    
    while (Date.now() - startTime < maxWaitTimeMs) {
      attempts++;
      console.log(`🔍 Status check attempt ${attempts} for instance ${instanceId}`);
      
      try {
        const statusRequest = this.createCheckStatusConfig(instanceId);
        const response = await this.checkPCStatus(statusRequest);
        
        const data = response.data;
        const systemStatus = data?.systemStatus?.toLowerCase();
        const state = data?.state?.toLowerCase();
        const instanceStatus = data?.instanceStatus?.toLowerCase();
        
        console.log(`📊 Status check ${attempts} result:`, {
          systemStatus,
          state,
          instanceStatus,
          fullData: data
        });
        
        // Check if system status is "ok"
        if (systemStatus === 'ok') {
          console.log(`✅ System status is now 'ok' after ${attempts} attempts and ${Math.round((Date.now() - startTime) / 1000)}s`);
          return true;
        }
        
        // Check if instance is in an error state
        if (state === 'stopped' || state === 'terminated' || state === 'failed') {
          console.log(`❌ Instance is in terminal state: ${state}. Stopping polling.`);
          return false;
        }
        
        // If we haven't reached the timeout, wait before next poll
        if (Date.now() - startTime < maxWaitTimeMs) {
          const remainingTime = maxWaitTimeMs - (Date.now() - startTime);
          const waitTime = Math.min(pollIntervalMs, remainingTime);
          console.log(`⏳ Waiting ${waitTime / 1000}s before next status check...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        
      } catch (error: any) {
        console.log(`❌ Status check attempt ${attempts} failed:`, error.message);
        
        // If it's a 404 or similar error, the instance might not be ready yet
        if (error.response?.status === 404) {
          console.log(`ℹ️ Instance not found yet (404), continuing to poll...`);
        } else {
          console.log(`⚠️ Unexpected error during status check, continuing to poll...`);
        }
        
        // Wait before retrying
        if (Date.now() - startTime < maxWaitTimeMs) {
          const remainingTime = maxWaitTimeMs - (Date.now() - startTime);
          const waitTime = Math.min(pollIntervalMs, remainingTime);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    
    console.log(`⏰ Timeout reached after ${Math.round((Date.now() - startTime) / 1000)}s and ${attempts} attempts`);
    return false;
  }

  /**
   * Get system status from the last response
   */
  getSystemStatus(): string | null {
    const data = this.getResponseData();
    return data?.systemStatus || null;
  }

  /**
   * Get instance state from the last response
   */
  getInstanceState(): string | null {
    const data = this.getResponseData();
    return data?.state || null;
  }

  /**
   * Get instance status from the last response
   */
  getInstanceStatus(): string | null {
    const data = this.getResponseData();
    return data?.instanceStatus || null;
  }

  /**
   * Resize a PC instance via API
   */
  async resizePC(requestData: ResizePCRequest): Promise<AxiosResponse<ResizePCResponse>> {
    try {
      console.log('📏 Sending API request to resize PC:', JSON.stringify(requestData, null, 2));
      
      const response = await axios.post<ResizePCResponse>(
        `${this.apiConfig.baseURL}/resize`,
        requestData,
        {
          headers: this.apiConfig.headers,
          timeout: this.apiConfig.timeout
        }
      );

      this.lastResponse = response;
      this.lastError = null;
      
      console.log('✅ Resize PC API response received:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });

      return response;
    } catch (error: any) {
      this.lastError = error;
      this.lastResponse = error.response || null;
      
      console.log('❌ Resize PC API request failed:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });

      throw error;
    }
  }

  /**
   * Create resize PC configuration
   */
  createResizePCConfig(userId: string, computerName: string, targetConfigId: string): ResizePCRequest {
    return {
      userId: userId,
      computerName: computerName,
      targetConfigId: targetConfigId
    };
  }

  /**
   * Verify resize PC response contains success message
   */
  hasResizeSuccessMessage(): boolean {
    const data = this.getResponseData();
    if (!data) return false;
    
    // Check for various success indicators
    const message = data.message?.toLowerCase();
    const status = data.status?.toLowerCase();
    
    return !!(
      (message && message.includes('resized')) ||
      (message && message.includes('success')) ||
      (message && message.includes('completed')) ||
      (status && status.includes('success')) ||
      (status && status.includes('resized')) ||
      (status && status.includes('completed')) ||
      // Check if response indicates success (status 200-299)
      (this.lastResponse && this.lastResponse.status >= 200 && this.lastResponse.status < 300)
    );
  }

  /**
   * Get resize PC success message
   */
  getResizeSuccessMessage(): string | null {
    const data = this.getResponseData();
    return data?.message || data?.status || null;
  }

  /**
   * Get Cognito user information using access token
   */
  async getCognitoUser(accessToken: string): Promise<AxiosResponse<CognitoGetUserResponse>> {
    try {
      console.log('🔐 Sending API request to get Cognito user info');
      
      const requestData: CognitoGetUserRequest = {
        AccessToken: accessToken
      };
      
      const response = await axios.post<CognitoGetUserResponse>(
        'https://cognito-idp.us-east-1.amazonaws.com/',
        requestData,
        {
          headers: {
            'Content-Type': 'application/x-amz-json-1.1',
            'X-Amz-Target': 'AWSCognitoIdentityProviderService.GetUser',
            'X-Amz-User-Agent': 'aws-amplify/6.14.4 auth/6 framework/2',
            'Accept': '*/*',
            'Accept-Language': 'en-IN,en;q=0.9,de-DE;q=0.8,de;q=0.7,en-GB;q=0.6,en-US;q=0.5',
            'Cache-Control': 'no-store',
            'Origin': 'https://smartpc.cloud',
            'Referer': 'https://smartpc.cloud/',
            'Sec-Ch-Ua': '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'cross-site',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36'
          },
          timeout: this.apiConfig.timeout
        }
      );

      this.lastResponse = response;
      this.lastError = null;
      
      console.log('✅ Cognito GetUser API response received:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });

      return response;
    } catch (error: any) {
      this.lastError = error;
      this.lastResponse = error.response || null;
      
      console.log('❌ Cognito GetUser API request failed:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });

      throw error;
    }
  }

  /**
   * Extract user ID from Cognito user response
   */
  getUserIdFromCognitoResponse(): string | null {
    const data = this.getResponseData() as CognitoGetUserResponse;
    if (!data) return null;
    
    // First try to get from Username field
    if (data.Username) {
      console.log(`🔍 Found Username in Cognito response: ${data.Username}`);
      return data.Username;
    }
    
    // Then try to get from UserAttributes (sub field)
    if (data.UserAttributes && Array.isArray(data.UserAttributes)) {
      const subAttribute = data.UserAttributes.find(attr => attr.Name === 'sub');
      if (subAttribute && subAttribute.Value) {
        console.log(`🔍 Found sub attribute in Cognito response: ${subAttribute.Value}`);
        return subAttribute.Value;
      }
    }
    
    console.log('❌ No user ID found in Cognito response');
    return null;
  }

  /**
   * Get all user attributes from Cognito response
   */
  getUserAttributesFromCognitoResponse(): Array<{Name: string, Value: string}> | null {
    const data = this.getResponseData() as CognitoGetUserResponse;
    return data?.UserAttributes || null;
  }

  /**
   * Get specific user attribute by name
   */
  getUserAttributeByName(attributeName: string): string | null {
    const attributes = this.getUserAttributesFromCognitoResponse();
    if (!attributes) return null;
    
    const attribute = attributes.find(attr => attr.Name === attributeName);
    return attribute?.Value || null;
  }
}

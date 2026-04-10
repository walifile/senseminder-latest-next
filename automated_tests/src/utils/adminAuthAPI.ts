import axios, { AxiosResponse } from 'axios';
import { authenticator } from 'otplib';
import dotenv from 'dotenv';
import { Page } from 'puppeteer';

// Load environment variables
dotenv.config();

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  session: string;
  [key: string]: any;
}

export interface SelectMFARequest {
  email: string;
  mfaType: string;
  session: string;
}

export interface SelectMFAResponse {
  session: string;
  [key: string]: any;
}

export interface ConfirmMFARequest {
  email: string;
  challengeName: string;
  code: string;
  session: string;
}

export interface ConfirmMFAResponse {
  accessToken?: string;
  idToken?: string;
  [key: string]: any;
}

export class AdminAuthAPI {
  private baseURL: string;
  private adminEmail: string;
  private adminPassword: string;
  private mfaSecret: string;

  constructor(
    baseURL: string = 'https://l14mhv118a.execute-api.us-east-1.amazonaws.com',
    adminEmail?: string,
    adminPassword?: string,
    mfaSecret?: string
  ) {
    this.baseURL = baseURL;
    this.adminEmail = adminEmail || process.env.ADMIN_USERNAME || '';
    this.adminPassword = adminPassword || process.env.ADMIN_PASSWORD || '';
    this.mfaSecret = mfaSecret || process.env.MFA_SECRET || '';

    if (!this.adminEmail || !this.adminPassword) {
      console.warn('⚠️ ADMIN_USERNAME or ADMIN_PASSWORD not found in environment variables.');
    }

    if (!this.mfaSecret) {
      console.warn('⚠️ MFA_SECRET not found in environment variables. MFA authentication will fail.');
    }
  }

  /**
   * Step 1: Admin Login - POST to /auth/login
   * @returns Promise<AdminLoginResponse>
   */
  async adminLogin(): Promise<AdminLoginResponse> {
    try {
      if (!this.adminEmail || !this.adminPassword) {
        throw new Error('Admin credentials (ADMIN_USERNAME, ADMIN_PASSWORD) are not configured.');
      }

      console.log(`🔐 Admin Login API: Logging in with email ${this.adminEmail}...`);

      const loginPayload: AdminLoginRequest = {
        email: this.adminEmail,
        password: this.adminPassword,
      };

      const response: AxiosResponse<AdminLoginResponse> = await axios.post(
        `${this.baseURL}/auth/login`,
        loginPayload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      console.log(`✅ Admin Login API: Login successful`);
      console.log(`🔍 Admin Login API: Session token received`);

      return response.data;
    } catch (error: any) {
      console.error(`❌ Admin Login API: Login failed`, error.message);

      if (error.response) {
        console.error(`📄 API Error Response:`, {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
        });
      }

      throw error;
    }
  }

  /**
   * Step 2: Select MFA Type - POST to /auth/select-mfa
   * @param session - Session token from Step 1
   * @returns Promise<SelectMFAResponse>
   */
  async selectMFAType(session: string): Promise<SelectMFAResponse> {
    try {
      if (!session) {
        throw new Error('Session token is required for MFA selection.');
      }

      console.log(`🔐 Select MFA Type API: Selecting MFA type for ${this.adminEmail}...`);

      const mfaPayload: SelectMFARequest = {
        email: this.adminEmail,
        mfaType: 'SOFTWARE_TOKEN_MFA',
        session: session,
      };

      const response: AxiosResponse<SelectMFAResponse> = await axios.post(
        `${this.baseURL}/auth/select-mfa`,
        mfaPayload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      console.log(`✅ Select MFA Type API: MFA type selected successfully`);
      console.log(`🔍 Select MFA Type API: New session token received`);

      return response.data;
    } catch (error: any) {
      console.error(`❌ Select MFA Type API: Failed to select MFA type`, error.message);

      if (error.response) {
        console.error(`📄 API Error Response:`, {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
        });
      }

      throw error;
    }
  }

  /**
   * Step 3: Confirm MFA - POST to /auth/confirm
   * @param session - Session token from Step 2
   * @returns Promise<ConfirmMFAResponse>
   */
  async confirmMFA(session: string): Promise<ConfirmMFAResponse> {
    try {
      if (!session) {
        throw new Error('Session token is required for MFA confirmation.');
      }

      if (!this.mfaSecret) {
        throw new Error('MFA_SECRET is not configured. Cannot generate MFA code.');
      }

      // Generate OTP/MFA code from secret
      console.log(`🔐 Confirm MFA API: Generating MFA code...`);
      const mfaCode = authenticator.generate(this.mfaSecret);
      console.log(`✅ Confirm MFA API: MFA code generated: ${mfaCode}`);

      console.log(`🔐 Confirm MFA API: Confirming MFA for ${this.adminEmail}...`);

      const confirmPayload: ConfirmMFARequest = {
        email: this.adminEmail,
        challengeName: 'SOFTWARE_TOKEN_MFA',
        code: mfaCode,
        session: session,
      };

      const response: AxiosResponse<ConfirmMFAResponse> = await axios.post(
        `${this.baseURL}/auth/confirm`,
        confirmPayload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      console.log(`✅ Confirm MFA API: MFA confirmation successful`);
      console.log(`🔍 Confirm MFA API: Access token received`);
      //console.log('🔍 Confirm MFA API: Full response data:', response.data);

      return response.data;
    } catch (error: any) {
      console.error(`❌ Confirm MFA API: Failed to confirm MFA`, error.message);

      if (error.response) {
        console.error(`📄 API Error Response:`, {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
        });
      }

      throw error;
    }
  }

  /**
   * Complete authentication flow - performs all 3 steps
   * @returns Promise<string> - Returns the access token
   */
  async authenticate(): Promise<string> {
    try {
      console.log('\n🔐 ===== ADMIN AUTHENTICATION FLOW =====');
      console.log(`👤 Admin Email: ${this.adminEmail}`);

      // Step 1: Login
      console.log('\n📍 Step 1: Admin Login...');
      const loginResponse = await this.adminLogin();
      const session1 = loginResponse.session;

      if (!session1) {
        throw new Error('Session token not received from login response.');
      }

      // Step 2: Select MFA Type
      console.log('\n📍 Step 2: Select MFA Type...');
      const mfaResponse = await this.selectMFAType(session1);
      const session2 = mfaResponse.session;

      if (!session2) {
        throw new Error('Session token not received from MFA selection response.');
      }

      // Step 3: Confirm MFA
      console.log('\n📍 Step 3: Confirm MFA...');
      const confirmResponse = await this.confirmMFA(session2);
      const idToken = confirmResponse.idToken;

      if (!idToken) {
        throw new Error('ID token not received from MFA confirmation response.');
      }

      console.log(`\n✅ ===== AUTHENTICATION SUCCESSFUL =====`);
      console.log(`🎫 ID Token obtained (length: ${idToken.length})`);

      return idToken;
    } catch (error: any) {
      console.error(`\n❌ ===== AUTHENTICATION FAILED =====`);
      console.error(`Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get the configured base URL
   * @returns string
   */
  getBaseURL(): string {
    return this.baseURL;
  }

  /**
   * Get the configured admin email
   * @returns string
   */
  getAdminEmail(): string {
    return this.adminEmail;
  }

  /**
   * Check if all required credentials are configured
   * @returns boolean
   */
  isConfigured(): boolean {
    return !!(this.adminEmail && this.adminPassword && this.mfaSecret);
  }
}

// Export a default instance
export const adminAuthAPI = new AdminAuthAPI();

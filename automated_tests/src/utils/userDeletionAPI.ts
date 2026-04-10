import axios, { AxiosResponse } from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export interface UserDeletionRequest {
  email: string;
}

export interface UserDeletionResponse {
  success?: boolean;
  message?: string;
  error?: string;
  [key: string]: any;
}

export class UserDeletionAPI {
  private baseURL: string;
  private adminToken: string;

  constructor(baseURL: string = 'https://k5lwplh48b.execute-api.us-east-1.amazonaws.com/dev') {
    this.baseURL = baseURL;
    this.adminToken = process.env.ADMIN_TOKEN || '';
    
    // // DEBUG: Log the token that was read
    // console.log('🔍 ===== DEBUG: UserDeletionAPI Constructor =====');
    // console.log(`📌 process.env.ADMIN_TOKEN type: ${typeof process.env.ADMIN_TOKEN}`);
    // console.log(`📌 process.env.ADMIN_TOKEN length: ${process.env.ADMIN_TOKEN ? process.env.ADMIN_TOKEN.length : 'null'}`);
    // console.log(`📌 process.env.ADMIN_TOKEN value (first 50 chars): ${process.env.ADMIN_TOKEN ? process.env.ADMIN_TOKEN.substring(0, 50) + '...' : 'EMPTY'}`);
    // console.log(`📌 this.adminToken length: ${this.adminToken ? this.adminToken.length : 'null'}`);
    // console.log(`📌 this.adminToken value (first 50 chars): ${this.adminToken ? this.adminToken.substring(0, 50) + '...' : 'EMPTY'}`);
    
    if (!this.adminToken) {
      console.warn('⚠️ ADMIN_TOKEN not found in environment variables. User deletion will not work.');
    }
  }

  /**
   * Delete a user by email using the admin API
   * @param email - The email of the user to delete
   * @returns Promise<UserDeletionResponse>
   */
  async deleteUser(email: string): Promise<UserDeletionResponse> {
    try {
      if (!this.adminToken) {
        throw new Error('ADMIN_TOKEN is not configured. Cannot delete user.');
      }

      console.log(`🗑️ Attempting to delete user with email: ${email}`);

      const response: AxiosResponse<UserDeletionResponse> = await axios.delete(
        `${this.baseURL}/admin/user`,
        {
          params: {
            email: email
          },
          headers: {
            'Authorization': this.adminToken,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 second timeout
        }
      );

      console.log(`✅ User deletion API call successful for ${email}:`, response.status);
      console.log(`📄 Response data:`, response.data);

      return {
        success: true,
        message: `User ${email} deleted successfully`,
        ...response.data
      };

    } catch (error: any) {
      console.error(`❌ Error deleting user ${email}:`, error.message);
      
      if (error.response) {
        console.error(`📄 API Error Response:`, {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
        
        // Handle specific error cases
        if (error.response.status === 403) {
          console.error(`🚫 Access Denied: The admin token may be expired or invalid`);
          console.error(`💡 Please check your ADMIN_TOKEN in the .env file`);
        } else if (error.response.status === 404) {
          console.log(`ℹ️ User ${email} not found - may already be deleted`);
          return {
            success: true,
            message: `User ${email} not found (may already be deleted)`
          };
        } else if (error.response.status === 400) {
          console.log(`ℹ️ Bad request for user ${email} - user may not exist or already be deleted`);
          return {
            success: true,
            message: `User ${email} may already be deleted or not exist`
          };
        }
        
        return {
          success: false,
          error: `API Error: ${error.response.status} - ${error.response.statusText}`,
          message: error.response.data?.message || 'Unknown API error'
        };
      } else if (error.request) {
        console.error(`📄 Network Error:`, error.request);
        return {
          success: false,
          error: 'Network Error',
          message: 'Failed to connect to the API server'
        };
      } else {
        console.error(`📄 Request Setup Error:`, error.message);
        return {
          success: false,
          error: 'Request Setup Error',
          message: error.message
        };
      }
    }
  }

  /**
   * Delete multiple users by their emails (one by one to avoid duplicate API calls)
   * @param emails - Array of email addresses to delete
   * @returns Promise<UserDeletionResponse[]>
   */
  async deleteMultipleUsers(emails: string[]): Promise<UserDeletionResponse[]> {
    console.log(`🗑️ Attempting to delete ${emails.length} users one by one...`);
    
    // Remove duplicates from the email list
    const uniqueEmails = [...new Set(emails)];
    console.log(`🔍 Removed duplicates: ${emails.length} -> ${uniqueEmails.length} unique emails`);
    
    const results: UserDeletionResponse[] = [];
    
    for (const email of uniqueEmails) {
      try {
        console.log(`🗑️ Deleting user: ${email}`);
        const result = await this.deleteUser(email);
        results.push(result);
        
        // Add a small delay between deletions to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error: any) {
        console.error(`❌ Error deleting user ${email}:`, error.message);
        results.push({
          success: false,
          error: error.message,
          message: `Failed to delete user ${email}`
        });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;
    
    console.log(`📊 User deletion summary: ${successCount} successful, ${failureCount} failed`);
    
    return results;
  }

  /**
   * Check if the admin token is configured
   * @returns boolean
   */
  isConfigured(): boolean {
    return !!this.adminToken;
  }

  /**
   * Validate the admin token by making a test API call
   * @returns Promise<boolean>
   */
  async validateToken(): Promise<boolean> {
    if (!this.adminToken) {
      console.error('❌ ADMIN_TOKEN is not configured');
      return false;
    }

    try {
      console.log('🔍 Validating admin token...');
      
      // Try to make a test call to check if token is valid
      // We'll use a non-existent user to test the token without side effects
      const testEmail = 'test-token-validation@example.com';
      
      const response = await axios.delete(
        `${this.baseURL}/admin/user`,
        {
          params: {
            email: testEmail
          },
          headers: {
            'authorization': this.adminToken,
            'Content-Type': 'application/json',
            'Origin': 'https://sms.smartpc.cloud',
            'Referer': 'https://sms.smartpc.cloud/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'cross-site',
            'Sec-Fetch-Dest': 'empty'
          },
          timeout: 10000 // 10 second timeout for validation
        }
      );

      console.log('✅ Admin token is valid');
      return true;
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 403) {
          console.error('❌ Admin token is invalid or expired (403 Forbidden)');
          return false;
        } else if (error.response.status === 404) {
          console.log('✅ Admin token is valid (404 means user not found, which is expected)');
          return true;
        } else {
          console.error(`❌ Admin token validation failed: ${error.response.status} - ${error.response.statusText}`);
          return false;
        }
      } else {
        console.error('❌ Admin token validation failed due to network error');
        return false;
      }
    }
  }

  /**
   * Get the base URL being used
   * @returns string
   */
  getBaseURL(): string {
    return this.baseURL;
  }
}

// Export a default instance
export const userDeletionAPI = new UserDeletionAPI();

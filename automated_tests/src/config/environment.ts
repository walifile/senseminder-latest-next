import dotenv from 'dotenv';
import path from 'path';
import testData from './testData.json';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export interface EnvironmentConfig {
  // Only sensitive credentials and environment-specific values
  HTTP_USERNAME: string;
  HTTP_PASSWORD: string;
  VALID_USERNAME: string;
  VALID_PASSWORD: string;
  ADMIN_USERNAME: string;
  ADMIN_PASSWORD: string;
  MFA_SECRET?: string;
  API_AUTH_TOKEN?: string;
  ADMIN_TOKEN?: string;
  
  // Test data from JSON file
  testData: typeof testData;
}

export const config: EnvironmentConfig = {
  // Only sensitive credentials from environment variables
  HTTP_USERNAME: process.env.HTTP_USERNAME || 'default_username',
  HTTP_PASSWORD: process.env.HTTP_PASSWORD || 'default_password',
  VALID_USERNAME: process.env.VALID_USERNAME || 'valid_username',
  VALID_PASSWORD: process.env.VALID_PASSWORD || 'valid_password',
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'admin_username',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin_password',
  MFA_SECRET: process.env.MFA_SECRET,
  API_AUTH_TOKEN: process.env.API_AUTH_TOKEN,
  ADMIN_TOKEN: process.env.ADMIN_TOKEN,
  
  // Test data loaded from JSON file
  testData: testData
};

// Helper function to get configuration value
export function getConfig<T extends keyof EnvironmentConfig>(key: T): EnvironmentConfig[T] {
  return config[key];
}

// Helper function to get test data
export function getTestData() {
  return config.testData;
}

// Helper function to check if running in CI environment
export function isCI(): boolean {
  return process.env.CI === 'true' || process.env.NODE_ENV === 'production';
}

// Helper function to get environment-specific configuration
export function getEnvironmentSpecificConfig() {
  const env = process.env.NODE_ENV || 'development';
  const testEnv = process.env.TEST_ENV || env;
  
  switch (testEnv) {
    case 'production':
      return {
        headless: true,
        timeout: 60000,
        slowMo: 0,
        baseURL: 'https://smartpc.cloud/',
      };
    case 'staging':
      return {
        headless: true,
        timeout: 45000,
        slowMo: 500,
        baseURL: 'https://staging.smartpc.cloud/',
      };
    case 'test':
      return {
        headless: true,
        timeout: 30000,
        slowMo: 0,
        baseURL: 'http://localhost:3000',
      };
    default: // development
      return {
        headless: false,
        timeout: 30000,
        slowMo: 1000,
        baseURL: 'http://localhost:3000',
      };
  }
}

// Helper function to get base URL from environment
export function getBaseURL(): string {
  // Check if BASE_URL environment variable is set (for CI/CD)
  if (process.env.BASE_URL) {
    return process.env.BASE_URL;
  }
  
  // Fall back to environment-specific config
  const envConfig = getEnvironmentSpecificConfig();
  return envConfig.baseURL;
} 
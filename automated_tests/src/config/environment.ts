import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
// Use fs.readFileSync() for JSON imports to avoid ES module import attribute issues
// Path is relative to the automated_tests directory (where tests are run from)
let testData: any;
try {
  // Try primary path (from process.cwd() - when run from automated_tests directory)
  const testDataPath = path.resolve(process.cwd(), 'src/config/testData.json');
  
  if (!fs.existsSync(testDataPath)) {
    // Try alternative paths
    const altPaths = [
      path.resolve(process.cwd(), 'automated_tests/src/config/testData.json'),
      path.resolve(process.cwd(), './src/config/testData.json'),
    ];
    
    let found = false;
    for (const altPath of altPaths) {
      if (fs.existsSync(altPath)) {
        testData = JSON.parse(fs.readFileSync(altPath, 'utf-8'));
        found = true;
        break;
      }
    }
    
    if (!found) {
      throw new Error(`testData.json not found. Tried: ${testDataPath} and ${altPaths.join(', ')}`);
    }
  } else {
    testData = JSON.parse(fs.readFileSync(testDataPath, 'utf-8'));
  }
} catch (error: any) {
  // Only log error, don't throw - allow tests to continue with fallback
  console.error(`⚠️ Error loading testData.json: ${error.message}`);
  console.error(`⚠️ Current working directory: ${process.cwd()}`);
  // Use minimal fallback testData
  testData = {
    application: {
      baseURL: process.env.BASE_URL || 'https://smartpc.cloud/',
      timeout: 180000
    },
    browser: {
      headless: true,
      slowMo: 0
    },
    reporting: {
      path: './reports',
      screenshotOnFailure: true,
      videoOnFailure: true
    }
  };
}

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
  // Check for common CI environment variables
  return !!(
    process.env.CI === 'true' || 
    process.env.CI === '1' ||
    process.env.NODE_ENV === 'production' ||
    process.env.BITBUCKET_BUILD_NUMBER ||
    process.env.GITHUB_ACTIONS ||
    process.env.JENKINS_URL ||
    process.env.TEAMCITY_VERSION ||
    process.env.CIRCLECI ||
    process.env.TRAVIS ||
    process.env.GITLAB_CI
  );
}

// Helper function to get environment-specific configuration
export function getEnvironmentSpecificConfig() {
  const env = process.env.NODE_ENV || 'development';
  const testEnv = process.env.TEST_ENV || env;
  
  switch (testEnv) {
    case 'production':
      return {
        headless: true,
        timeout: 180000,
        slowMo: 0,
        baseURL: 'https://smartpc.cloud/',
      };
    case 'staging':
      return {
        headless: true,
        timeout: 150000,
        slowMo: 500,
        baseURL: 'https://staging.smartpc.cloud/',
      };
    case 'test':
      return {
        headless: true,
        timeout: 120000,
        slowMo: 0,
        baseURL: 'http://localhost:3000',
      };
    default: // development
      return {
        headless: true,
        timeout: 120000,
        slowMo: 1000,
        baseURL: 'http://localhost:3000',
      };
  }
}

// Helper function to get base URL from environment
export function getBaseURL(): string {
  // Check if BASE_URL environment variable is set (for CI/CD) - highest priority
  if (process.env.BASE_URL) {
    return process.env.BASE_URL;
  }
  
  // Use baseURL from testData.json - primary source
  const testData = getTestData();
  if (testData?.application?.baseURL) {
    return testData.application.baseURL;
  }
  
  // Fall back to environment-specific config
  const envConfig = getEnvironmentSpecificConfig();
  return envConfig.baseURL;
} 
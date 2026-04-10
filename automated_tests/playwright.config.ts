import { defineConfig, devices } from '@playwright/test';
import { isCI, getEnvironmentSpecificConfig, getBaseURL, config as envConfig } from './src/config/environment';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// Use fs.readFileSync() for JSON imports to avoid ES module import attribute issues
// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const testDataPath = path.resolve(__dirname, 'src/config/testData.json');
const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf-8'));

// Get HTTP Basic Auth credentials
const httpUsername = envConfig.HTTP_USERNAME || process.env.HTTP_USERNAME || '';
const httpPassword = envConfig.HTTP_PASSWORD || process.env.HTTP_PASSWORD || '';

// Build use configuration with conditional HTTP credentials
const useConfig: any = {
  baseURL: getBaseURL(),
  trace: 'on-first-retry',
  // In CI, always record videos and take screenshots for all tests
  // In local, use the config from testData.json
  screenshot: isCI() ? 'on' : (testData.reporting.screenshotOnFailure ? 'only-on-failure' : 'off'),
  video: isCI() ? 'on' : (testData.reporting.videoOnFailure ? 'retain-on-failure' : 'off'),
  actionTimeout: testData.application.timeouts?.action || testData.application.timeout,
  navigationTimeout: testData.application.timeouts?.navigation || testData.application.timeout,
  // Allow popups and new tabs
  permissions: ['clipboard-read', 'clipboard-write'],
  // Ensure headless mode is enabled in CI
  headless: isCI() ? true : testData.browser.headless,
};

// Only add HTTP Basic Auth credentials if both username and password are provided
if (httpUsername && httpPassword) {
  useConfig.httpCredentials = {
    username: httpUsername,
    password: httpPassword,
  };
  console.log('✅ HTTP Basic Auth credentials configured for browser context');
} else {
  console.log('⚠️ HTTP Basic Auth credentials not provided - tests may fail if HTTP auth is required');
}

export default defineConfig({
  testDir: './src/tests',
  globalSetup: './src/global-setup.ts',
  globalTeardown: './src/global-teardown.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: isCI() ? 1 : 1,
  // Use 4 workers in CI for parallel execution, or 50% of CPU cores locally
  workers: isCI() ? 1 : 1,
  reporter: [
    ['html', { outputFolder: testData.reporting.path + '/playwright-report' }],
    ['json', { outputFile: testData.reporting.path + '/results.json' }],
    ['junit', { outputFile: testData.reporting.path + '/results.xml' }]
  ],
  use: useConfig,
  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        headless: isCI() ? true : testData.browser.headless,
        launchOptions: {
          slowMo: isCI() ? 0 : testData.browser.slowMo,
          args: [
            '--disable-gpu',
            '--disable-popup-blocking',
            '--allow-popups-during-page-unload',
          ]
        }
      },
    },
    // {
    //   name: 'firefox',
    //   use: {
    //     ...devices['Desktop Firefox'],
    //     headless: testData.browser.headless,
    //     launchOptions: {
    //       slowMo: testData.browser.slowMo,
    //       firefoxUserPrefs: {
    //         'dom.disable_open_during_load': false,
    //         'dom.popup_maximum': 0,
    //         'dom.disable_window_open_feature.close': false,
    //         'dom.disable_window_open_feature.location': false,
    //         'dom.disable_window_open_feature.menubar': false,
    //         'dom.disable_window_open_feature.resizable': false,
    //         'dom.disable_window_open_feature.scrollbars': false,
    //         'dom.disable_window_open_feature.status': false,
    //         'dom.disable_window_open_feature.toolbar': false,
    //         'dom.disable_window_open_feature.directories': false
    //       }
    //     }
    //   },
    // },
    // {
    //   name: 'webkit',
    //   use: {
    //     ...devices['Desktop Safari'],
    //     headless: testData.browser.headless,
    //     launchOptions: {
    //       slowMo: testData.browser.slowMo,
    //     }
    //   },
    // },
    // // Mobile/Responsive browsers
    // {
    //   name: 'Mobile Chrome',
    //   use: {
    //     ...devices['Pixel 5'],
    //     headless: testData.browser.headless,
    //     launchOptions: {
    //       slowMo: testData.browser.slowMo,
    //     }
    //   },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: {
    //     ...devices['iPhone 12'],
    //     headless: testData.browser.headless,
    //     launchOptions: {
    //       slowMo: testData.browser.slowMo,
    //     }
    //   },
    // },
    // {
    //   name: 'Tablet Chrome',
    //   use: {
    //     ...devices['iPad Pro'],
    //     headless: testData.browser.headless,
    //     launchOptions: {
    //       slowMo: testData.browser.slowMo,
    //     }
    //   },
    // },
    // {
    //   name: 'Tablet Safari',
    //   use: {
    //     ...devices['iPad Pro'],
    //     headless: testData.browser.headless,
    //     launchOptions: {
    //       slowMo: testData.browser.slowMo,
    //     }
    //   },
    // },
  ],
  // webServer configuration removed - tests run against external application
  // If you need to test against a local server, uncomment and configure:
  // webServer: {
  //   command: 'npm run start',
  //   url: getBaseURL(),
  //   reuseExistingServer: !isCI(),
  // },
}); 
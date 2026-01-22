import { defineConfig, devices } from '@playwright/test';
import { isCI, getEnvironmentSpecificConfig, getBaseURL } from './src/config/environment';
import testData from './src/config/testData.json';

export default defineConfig({
  testDir: './src',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: isCI() ? 2 : 0,
  workers: isCI() ? 1 : 1,
  reporter: [
    ['html', { outputFolder: testData.reporting.path + '/html' }],
    ['json', { outputFile: testData.reporting.path + '/results.json' }],
    ['junit', { outputFile: testData.reporting.path + '/results.xml' }],
    ['allure-playwright', { outputFolder: './allure-results' }]
  ],
  use: {
    baseURL: getBaseURL(),
    trace: 'on-first-retry',
    screenshot: testData.reporting.screenshotOnFailure ? 'only-on-failure' : 'off',
    video: testData.reporting.videoOnFailure ? 'retain-on-failure' : 'off',
    actionTimeout: testData.application.timeout,
    navigationTimeout: testData.application.timeout,
    // Allow popups and new tabs
    permissions: ['clipboard-read', 'clipboard-write'],
    // Ensure headless mode is enabled
    headless: testData.browser.headless,
  },
  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        headless: testData.browser.headless,
        launchOptions: {
          slowMo: testData.browser.slowMo,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
            '--disable-popup-blocking',
            '--disable-web-security',
            '--disable-features=TranslateUI',
            '--disable-ipc-flooding-protection',
            '--allow-popups-during-page-unload',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--disable-extensions',
            '--disable-plugins',
            '--disable-default-apps',
            '--disable-sync',
            '--disable-translate',
            '--hide-scrollbars',
            '--mute-audio',
            '--no-default-browser-check',
            '--disable-logging',
            '--disable-permissions-api',
            '--disable-presentation-api',
            '--disable-remote-fonts',
            '--disable-speech-api',
            '--disable-file-system',
            '--disable-notifications',
            '--disable-background-networking',
            '--disable-client-side-phishing-detection',
            '--disable-component-extensions-with-background-pages',
            '--disable-domain-reliability',
            '--disable-features=AudioServiceOutOfProcess',
            '--disable-hang-monitor',
            '--disable-prompt-on-repost',
            '--disable-domain-reliability',
            '--disable-features=VizDisplayCompositor',
            '--force-color-profile=srgb',
            '--metrics-recording-only',
            '--use-mock-keychain',
            '--enable-features=NetworkService,NetworkServiceLogging',
            '--force-prefers-reduced-motion',
            '--disable-blink-features=AutomationControlled'
          ]
        }
      },
    },
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        headless: testData.browser.headless,
        launchOptions: {
          slowMo: testData.browser.slowMo,
          firefoxUserPrefs: {
            'dom.disable_open_during_load': false,
            'dom.popup_maximum': 0,
            'dom.disable_window_open_feature.close': false,
            'dom.disable_window_open_feature.location': false,
            'dom.disable_window_open_feature.menubar': false,
            'dom.disable_window_open_feature.resizable': false,
            'dom.disable_window_open_feature.scrollbars': false,
            'dom.disable_window_open_feature.status': false,
            'dom.disable_window_open_feature.toolbar': false,
            'dom.disable_window_open_feature.directories': false
          }
        }
      },
    },
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        headless: testData.browser.headless,
        launchOptions: {
          slowMo: testData.browser.slowMo,
        }
      },
    },
    // Mobile/Responsive browsers
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        headless: testData.browser.headless,
        launchOptions: {
          slowMo: testData.browser.slowMo,
        }
      },
    },
    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 12'],
        headless: testData.browser.headless,
        launchOptions: {
          slowMo: testData.browser.slowMo,
        }
      },
    },
    {
      name: 'Tablet Chrome',
      use: { 
        ...devices['iPad Pro'],
        headless: testData.browser.headless,
        launchOptions: {
          slowMo: testData.browser.slowMo,
        }
      },
    },
    {
      name: 'Tablet Safari',
      use: { 
        ...devices['iPad Pro'],
        headless: testData.browser.headless,
        launchOptions: {
          slowMo: testData.browser.slowMo,
        }
      },
    },
  ],
  webServer: {
    command: 'npm run start',
    url: getBaseURL(),
    reuseExistingServer: !isCI(),
  },
}); 
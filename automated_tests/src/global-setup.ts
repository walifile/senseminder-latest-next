import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
    console.log('Starting test suite...');
    // Any global setup can go here
}

export default globalSetup;


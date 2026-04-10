import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
    console.log('Test suite completed - performing final cleanup...');
    // Any global teardown can go here
}

export default globalTeardown;


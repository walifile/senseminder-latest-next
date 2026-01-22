import { Given, When, Then } from '@cucumber/cucumber';
import { APITestUtils } from '../utils/apiTestUtils';

Given('I want to see API call details', async function() {
    console.log('🔍 Printing API call details...');
    APITestUtils.printAPICallDetails();
});

When('I print API call summary', async function() {
    console.log('📊 Printing API call summary...');
    APITestUtils.printAPISummary();
});

Then('I should see API performance metrics', async function() {
    console.log('📈 Printing API performance metrics...');
    APITestUtils.printAPIPerformance();
});

Given('I want to debug API calls', async function() {
    console.log('🐛 Starting API debugging session...');
    APITestUtils.printAPICallDetails();
    APITestUtils.printAPIPerformance();
});

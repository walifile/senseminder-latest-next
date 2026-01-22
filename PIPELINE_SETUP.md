# Bitbucket Pipeline Setup

This document describes the automated testing pipeline configuration for the SensePC web application.

## Pipeline Configuration

The pipeline is configured in `bitbucket-pipelines.yml` and handles three main scenarios:

### 1. Feature → Develop PRs (Smoke Tests)
- **Trigger**: Pull requests from `feature/*` branches to `develop`
- **Environment**: Development (localhost:3000)
- **Tests**: Smoke suite (`@smoke` tags)
- **Process**:
  1. Installs dependencies for both main app and test suite
  2. Starts Next.js development server (`npm run dev`)
  3. Waits 30 seconds for server to be ready
  4. Runs smoke tests against localhost:3000
  5. Generates Allure reports

### 2. Develop → Master PRs (Regression Tests)
- **Trigger**: Pull requests from `develop` to `master`
- **Environment**: Production (https://smartpc.cloud/)
- **Tests**: Regression suite (`@regression` tags)
- **Process**:
  1. Installs test dependencies
  2. Runs regression tests against production URL
  3. Generates Allure reports

### 3. Daily Scheduled Tests (Regression Tests)
- **Trigger**: Scheduled daily at 1:00 AM EST
- **Environment**: Production (https://smartpc.cloud/)
- **Tests**: Regression suite (`@regression` tags)
- **Process**:
  1. Installs test dependencies
  2. Runs regression tests against production URL
  3. Generates Allure reports

## Environment Configuration

The test framework automatically detects the environment and uses the appropriate base URL:

- **Development**: `http://localhost:3000`
- **Production**: `https://smartpc.cloud/`
- **Staging**: `https://staging.smartpc.cloud/` (if configured)

The base URL can be overridden using the `BASE_URL` environment variable in the pipeline.

## Setting Up Scheduled Runs

To enable the daily scheduled tests at 1:00 AM EST:

1. Go to your Bitbucket repository
2. Navigate to **Repository settings** → **Pipelines** → **Schedules**
3. Click **Create schedule**
4. Configure:
   - **Name**: `Daily Regression Tests`
   - **Schedule**: `0 1 * * *` (1:00 AM EST daily)
   - **Target**: `master` branch
   - **Pipeline**: `daily-regression`

## Required Environment Variables

Ensure these environment variables are set in your Bitbucket repository settings:

- `HTTP_USERNAME` - Basic auth username
- `HTTP_PASSWORD` - Basic auth password
- `VALID_USERNAME` - Test user email
- `VALID_PASSWORD` - Test user password
- `SHARED_USER_EMAIL` - Shared user email for testing
- `SHARED_USERNAME` - Shared username for testing

## Test Tags

- `@smoke` - Critical functionality tests (run on feature PRs)
- `@regression` - Full test suite (run on develop PRs and daily)
- `@api` - API-specific tests
- `@login` - Authentication tests
- `@create-a-new-pc` - PC creation tests
- `@sensestorage` - Storage functionality tests
- `@usermanagement` - User management tests
- `@assign-pc` - PC assignment tests
- `@support` - Support functionality tests
- `@landing` - Landing page tests
- `@billings` - Billing functionality tests

## Artifacts

All pipeline runs generate:
- Allure test results (`allure-results/`)
- Allure HTML reports (`allure-report/`)

These artifacts are available for download from the pipeline run page.

## Troubleshooting

### Local Development Server Issues
If the smoke tests fail due to server startup issues:
1. Check that the Next.js app starts successfully locally
2. Verify the server is accessible at `http://localhost:3000`
3. Increase the sleep duration in the pipeline if needed

### Environment Variable Issues
If tests fail due to missing credentials:
1. Verify all required environment variables are set in Bitbucket
2. Check that the variables are marked as "Secured" for sensitive data
3. Ensure variable names match exactly (case-sensitive)

### Test Execution Issues
If tests fail unexpectedly:
1. Check the Allure reports for detailed failure information
2. Verify the base URL is correct for the environment
3. Check network connectivity to the target environment
4. Review test data configuration in `src/config/testData.json`

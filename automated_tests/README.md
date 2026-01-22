# SensePC QA Automation Framework

A comprehensive automated testing framework using Playwright and Cucumber with Allure reporting.

## Features

- **Playwright**: Modern web automation
- **Cucumber**: BDD testing approach
- **TypeScript**: Type-safe test development
- **Allure Reporting**: Beautiful and detailed test reports
- **Tag-based Execution**: Run tests by specific tags/categories

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation

```bash
npm install
npm run playwright:install
npm run playwright:install-deps
```

## Test Execution

### Basic Test Commands

```bash
# Run all tests
npm test

# Run tests in CI mode
npm run test:ci

# Run tests in headed mode
npm run test:headed

# Run tests in debug mode
npm run test:debug
```

### Tag-based Test Execution

The framework supports various tags for organizing and executing tests:

#### Available Tags

- `@smoke` - Critical functionality tests
- `@regression` - Comprehensive test suite
- `@login` - Login-related tests
- `@signup` - Signup-related tests
- `@critical` - High-priority tests
- `@extended` - Extended test scenarios

#### Running Tests by Tags

```bash
# Run smoke tests only
npm run test:smoke

# Run regression tests only
npm run test:regression

# Run login tests only
npm run test:login

# Run signup tests only
npm run test:signup

# Run critical tests only
npm run test:critical

# Run extended tests only
npm run test:extended
```

### Allure Reporting

#### Generate Allure Reports

```bash
# Run tests with Allure reporting
npm run test:allure

# Run specific tag tests with Allure reporting
npm run test:smoke:allure
npm run test:regression:allure
npm run test:login:allure
npm run test:signup:allure
npm run test:critical:allure
npm run test:extended:allure
```

#### View Allure Reports

```bash
# Generate HTML report
npm run allure:generate

# Open generated report
npm run allure:open

# Serve report locally
npm run allure:serve

# Clean Allure results
npm run allure:clean
```

## Test Structure

```
features/
├── login.feature          # @login @smoke @regression
└── signUp.feature        # @signup @regression

src/
├── steps/                 # Step definitions
├── pages/                 # Page Object Models
├── support/               # Hooks and world configuration
└── config/                # Environment and test data
```

## Tag Strategy

### Feature Level Tags
- `@login` - Login functionality tests
- `@signup` - Signup functionality tests

### Scenario Level Tags
- `@smoke` - Essential functionality tests
- `@regression` - Comprehensive test coverage
- `@critical` - High-priority business critical tests
- `@extended` - Extended test scenarios

## Examples

### Run Smoke Tests Only
```bash
npm run test:smoke
```
This will execute only scenarios tagged with `@smoke`.

### Run Login Tests with Allure Reporting
```bash
npm run test:login:allure
npm run allure:generate
npm run allure:open
```

### Run Critical Tests
```bash
npm run test:critical
```
This will execute only scenarios tagged with `@critical`.

## Configuration

### Cucumber Configuration
- `cucumber.json` - Main configuration
- `cucumber.json` (allure profile) - Allure-specific configuration

### Environment Setup
```bash
npm run env:setup
```
Then edit the `.env` file with your actual credentials.

## Reports

### Cucumber Reports
- HTML: `reports/cucumber-report.html`
- JSON: `reports/cucumber-report.json`

### Allure Reports
- Results: `allure-results/`
- Generated Reports: `allure-report/`

## Troubleshooting

### Common Issues

1. **Allure not generating reports**: Ensure you've run tests with `--format allure`
2. **Tags not working**: Verify tag syntax in feature files
3. **TypeScript errors**: Run `npm run build` to check for compilation issues

### Clean Up
```bash
# Clean Allure results and reports
npm run allure:clean

# Clean node modules (if needed)
rm -rf node_modules package-lock.json
npm install
```

## Contributing

1. Add appropriate tags to new feature files
2. Follow the existing tag strategy
3. Update this README when adding new tags or commands

## License

ISC 
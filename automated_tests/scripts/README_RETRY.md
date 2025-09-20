# Test Retry Functionality

This directory contains scripts to automatically retry failed test scenarios to help identify flaky tests and reduce false failures.

## Overview

The retry system analyzes failed test scenarios from Cucumber JSON reports and automatically retries them up to 3 times to determine if failures are genuine or flaky.

## Files

- `retry-failed-tests.js` - Main retry script (Node.js)
- `retry-failed-tests.bat` - Windows batch file wrapper
- `retry-failed-tests.ps1` - PowerShell wrapper
- `README_RETRY.md` - This documentation

## Usage

### Method 1: Using npm scripts (Recommended)

```bash
# Retry ProfileAndSecurity tests
npm run retry:profileandsecurity

# Retry Login tests
npm run retry:login

# Retry Signup tests
npm run retry:signup

# Retry API tests
npm run retry:api

# Retry all failed tests from main report
npm run retry:failed
```

### Method 2: Direct script execution

```bash
# Using Node.js directly
node scripts/retry-failed-tests.js reports/profileandsecurity-cucumber.json "npm run test:profileandsecurity:allure"

# Using Windows batch file
scripts\retry-failed-tests.bat reports/profileandsecurity-cucumber.json "npm run test:profileandsecurity:allure"

# Using PowerShell
.\scripts\retry-failed-tests.ps1 -ReportPath "reports/profileandsecurity-cucumber.json" -TestCommand "npm run test:profileandsecurity:allure"
```

## Configuration

The retry system can be configured by modifying the constants in `retry-failed-tests.js`:

```javascript
const MAX_RETRIES = 3;        // Maximum number of retry attempts
const RETRY_DELAY = 2000;     // Delay between retries (milliseconds)
```

## How It Works

1. **Analysis**: Parses the Cucumber JSON report to identify failed scenarios
2. **Retry Loop**: For each failed scenario:
   - Runs the test command
   - Waits for completion
   - If successful, marks as passed
   - If failed, waits and retries (up to MAX_RETRIES)
3. **Reporting**: Provides detailed summary of results

## Output

The script provides colored console output showing:

- 🔄 Retry attempts with progress
- ✅ Successful retries
- ❌ Persistent failures
- 📊 Summary statistics
- 📋 Detailed results for each scenario

## Example Output

```
🔍 Analyzing test report for failed scenarios...
📊 Found 2 failed scenario(s)

🎯 Retrying scenario: Enable/Disable MFA through Email OTP
🔄 RETRY ATTEMPT 1/3
📋 Scenario: Enable/Disable MFA through Email OTP
📁 Feature: Profile and Security
🏷️  Tags: @profile-and-security
✅ SUCCESS on attempt 1 (45.2s)

🎯 Retrying scenario: Get Cognito user information
🔄 RETRY ATTEMPT 1/3
❌ FAILED on attempt 1
⏳ Waiting 2s before next attempt...
🔄 RETRY ATTEMPT 2/3
✅ SUCCESS on attempt 2 (38.7s)

================================================================================
📊 RETRY SUMMARY
================================================================================
Total scenarios: 2
✅ Successful: 2
❌ Failed: 0
📈 Success rate: 100.0%

📋 DETAILED RESULTS:

1. ✅ Enable/Disable MFA through Email OTP
   Feature: Profile and Security
   Status: PASSED
   Attempts: 1/3
   Duration: 45.2s

2. ✅ Get Cognito user information
   Feature: API Create New PC
   Status: PASSED
   Attempts: 2/3
   Duration: 38.7s

✅ All scenarios passed after retries!
```

## Exit Codes

- `0` - All scenarios passed after retries
- `1` - Some scenarios still failing after retries

## Troubleshooting

### Common Issues

1. **Report file not found**
   - Ensure the report path is correct
   - Run the test suite first to generate the report

2. **Test command fails**
   - Verify the test command is correct
   - Check that all dependencies are installed

3. **Permission errors (Windows)**
   - Run PowerShell as Administrator
   - Check execution policy: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

### Debug Mode

To see more detailed output, you can modify the script to include debug logging or run tests in debug mode:

```bash
# Run with debug output
DEBUG=* npm run retry:profileandsecurity
```

## Integration with CI/CD

The retry script can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions step
- name: Retry Failed Tests
  run: |
    npm run test:profileandsecurity:allure
    if [ $? -ne 0 ]; then
      npm run retry:profileandsecurity
    fi
```

## Best Practices

1. **Run retries after initial test failure** to identify flaky tests
2. **Monitor retry success rates** to identify consistently failing tests
3. **Use retry results** to prioritize test stability improvements
4. **Set appropriate retry limits** to avoid long-running test suites
5. **Document flaky tests** for future investigation

## Support

For issues or questions about the retry functionality, please check:

1. This documentation
2. The retry script logs
3. The main test suite documentation
4. Project issue tracker

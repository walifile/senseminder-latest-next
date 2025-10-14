# PowerShell script to run login tests with Allure report generation
Write-Host "Starting login test with Allure report generation..." -ForegroundColor Green

# Clean allure results
Write-Host "Cleaning Allure results..." -ForegroundColor Yellow
node scripts/clean-allure.js

# Run cucumber command
Write-Host "Running cucumber tests..." -ForegroundColor Yellow
npx cucumber-js --tags @login --format json:reports/login-cucumber.json --format progress-bar
$CucumberExitCode = $LASTEXITCODE

Write-Host "Cucumber exit code: $CucumberExitCode" -ForegroundColor Yellow

# Always run allure conversion and generation regardless of cucumber exit code
Write-Host "Converting Cucumber JSON to Allure format..." -ForegroundColor Green
node scripts/cucumber-to-allure.js reports/login-cucumber.json allure-results

Write-Host "Generating Allure report..." -ForegroundColor Green
npx allure generate allure-results --output allure-report

Write-Host "Opening Allure report..." -ForegroundColor Green
npx allure open allure-report

# Exit with the original cucumber exit code
exit $CucumberExitCode

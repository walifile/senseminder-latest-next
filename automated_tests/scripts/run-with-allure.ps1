param(
    [string]$CucumberCommand,
    [string]$ReportFile,
    [string]$AllureResults,
    [string]$Mode = "open"
)

Write-Host "Running cucumber command: $CucumberCommand" -ForegroundColor Green

# Run cucumber command and capture exit code
Invoke-Expression $CucumberCommand
$CucumberExitCode = $LASTEXITCODE

Write-Host "Cucumber exit code: $CucumberExitCode" -ForegroundColor Yellow

# Always run allure conversion and generation regardless of cucumber exit code
Write-Host "Converting Cucumber JSON to Allure format..." -ForegroundColor Green
node scripts/cucumber-to-allure.js $ReportFile $AllureResults

Write-Host "Generating Allure report..." -ForegroundColor Green
npx allure generate $AllureResults --output allure-report

# If not in CI mode, open the report
if ($Mode -ne "ci") {
    Write-Host "Opening Allure report..." -ForegroundColor Green
    npx allure open allure-report
}

# Exit with the original cucumber exit code
exit $CucumberExitCode

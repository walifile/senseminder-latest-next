# SensePC QA Automation - Test Runner Script (PowerShell)
# This script provides easy access to tag-based test execution and Allure reporting

# Function to display available commands
function Show-Help {
    Write-Host ""
    Write-Host "Available Commands:" -ForegroundColor Yellow
    Write-Host "==================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Basic Test Execution:" -ForegroundColor Cyan
    Write-Host "  npm test                    - Run all tests"
    Write-Host "  npm run test:ci            - Run tests in CI mode"
    Write-Host "  npm run test:headed        - Run tests in headed mode"
    Write-Host "  npm run test:debug         - Run tests in debug mode"
    Write-Host ""
    Write-Host "Tag-based Test Execution:" -ForegroundColor Cyan
    Write-Host "  npm run test:smoke         - Run smoke tests only"
    Write-Host "  npm run test:regression    - Run regression tests only"
    Write-Host "  npm run test:login         - Run login tests only"
    Write-Host "  npm run test:signup        - Run signup tests only"
    Write-Host "  npm run test:critical      - Run critical tests only"
    Write-Host "  npm run test:extended      - Run extended tests only"
    Write-Host ""
    Write-Host "Allure Reporting:" -ForegroundColor Cyan
    Write-Host "  npm run test:allure        - Run all tests with Allure"
    Write-Host "  npm run test:smoke:allure  - Run smoke tests with Allure"
    Write-Host "  npm run test:regression:allure - Run regression tests with Allure"
    Write-Host "  npm run test:login:allure  - Run login tests with Allure"
    Write-Host "  npm run test:signup:allure - Run signup tests with Allure"
    Write-Host "  npm run test:critical:allure - Run critical tests with Allure"
    Write-Host "  npm run test:extended:allure - Run extended tests with Allure"
    Write-Host ""
    Write-Host "Allure Report Management:" -ForegroundColor Cyan
    Write-Host "  npm run allure:generate    - Generate HTML report"
    Write-Host "  npm run allure:open        - Open generated report"
    Write-Host "  npm run allure:serve       - Serve report locally"
    Write-Host "  npm run allure:clean       - Clean Allure results"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Cyan
    Write-Host "  .\scripts\run-tests.ps1 smoke        - Run smoke tests"
    Write-Host "  .\scripts\run-tests.ps1 login allure - Run login tests with Allure"
    Write-Host "  .\scripts\run-tests.ps1 report       - Generate and open Allure report"
}

# Function to run tests by tag
function Run-TagTests {
    param([string]$Tag)
    Write-Host "Running tests with tag: @$Tag" -ForegroundColor Yellow
    npm run "test:$Tag"
}

# Function to run tests by tag with Allure
function Run-TagTestsAllure {
    param([string]$Tag)
    Write-Host "Running tests with tag: @$Tag (with Allure)" -ForegroundColor Yellow
    npm run "test:$Tag:allure"
}

# Function to generate and open Allure report
function Generate-AllureReport {
    Write-Host "Generating Allure report..." -ForegroundColor Yellow
    npm run allure:generate
    
    Write-Host "Opening Allure report..." -ForegroundColor Yellow
    npm run allure:open
}

# Function to clean Allure results
function Clean-Allure {
    Write-Host "Cleaning Allure results..." -ForegroundColor Yellow
    if (Test-Path "allure-results") {
        Remove-Item -Recurse -Force "allure-results"
    }
    if (Test-Path "allure-report") {
        Remove-Item -Recurse -Force "allure-report"
    }
    Write-Host "Allure results cleaned" -ForegroundColor Green
}

# Main script logic
Write-Host "SensePC QA Automation - Test Runner" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

$Command = $args[0]
$SubCommand = $args[1]

if (-not $Command -or $Command -in @("help", "-h", "--help")) {
    Show-Help
    exit
}

switch ($Command) {
    "smoke" { Run-TagTests "smoke" }
    "regression" { Run-TagTests "regression" }
    "login" { Run-TagTests "login" }
    "signup" { Run-TagTests "signup" }
    "critical" { Run-TagTests "critical" }
    "extended" { Run-TagTests "extended" }
    "allure" { 
        if ($SubCommand) {
            Run-TagTestsAllure $SubCommand
        } else {
            Write-Host "Running all tests with Allure" -ForegroundColor Yellow
            npm run test:allure
        }
    }
    "report" { Generate-AllureReport }
    "clean" { Clean-Allure }
    default {
        Write-Host "Unknown command: $Command" -ForegroundColor Red
        Write-Host "Use '.\scripts\run-tests.ps1 help' to see available commands" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "Test execution completed!" -ForegroundColor Green

@echo off
REM SensePC QA Automation - Test Runner Script (Windows)
REM This script provides easy access to tag-based test execution and Allure reporting

echo 🚀 SensePC QA Automation - Test Runner
echo ======================================

REM Function to display available commands
if "%1"=="help" goto show_help
if "%1"=="-h" goto show_help
if "%1"=="--help" goto show_help
if "%1"=="" goto show_help

REM Function to run tests by tag
if "%1"=="smoke" goto run_smoke
if "%1"=="regression" goto run_regression
if "%1"=="login" goto run_login
if "%1"=="signup" goto run_signup
if "%1"=="critical" goto run_critical
if "%1"=="extended" goto run_extended
if "%1"=="allure" goto run_allure
if "%1"=="report" goto generate_report
if "%1"=="clean" goto clean_allure

echo ❌ Unknown command: %1
echo Use 'scripts\run-tests.bat help' to see available commands
exit /b 1

:show_help
echo.
echo Available Commands:
echo ==================
echo.
echo Basic Test Execution:
echo   npm test                    - Run all tests
echo   npm run test:ci            - Run tests in CI mode
echo   npm run test:headed        - Run tests in headed mode
echo   npm run test:debug         - Run tests in debug mode
echo.
echo Tag-based Test Execution:
echo   npm run test:smoke         - Run smoke tests only
echo   npm run test:regression    - Run regression tests only
echo   npm run test:login         - Run login tests only
echo   npm run test:signup        - Run signup tests only
echo   npm run test:critical      - Run critical tests only
echo   npm run test:extended      - Run extended tests only
echo.
echo Allure Reporting:
echo   npm run test:allure        - Run all tests with Allure
echo   npm run test:smoke:allure  - Run smoke tests with Allure
echo   npm run test:regression:allure - Run regression tests with Allure
echo   npm run test:login:allure  - Run login tests with Allure
echo   npm run test:signup:allure - Run signup tests with Allure
echo   npm run test:critical:allure - Run critical tests with Allure
echo   npm run test:extended:allure - Run extended tests with Allure
echo.
echo Allure Report Management:
echo   npm run allure:generate    - Generate HTML report
echo   npm run allure:open        - Open generated report
echo   npm run allure:serve       - Serve report locally
echo   npm run allure:clean       - Clean Allure results
echo.
echo Examples:
echo   scripts\run-tests.bat smoke        - Run smoke tests
echo   scripts\run-tests.bat login allure - Run login tests with Allure
echo   scripts\run-tests.bat report       - Generate and open Allure report
goto end

:run_smoke
echo 🏷️  Running tests with tag: @smoke
call npm run test:smoke
goto end

:run_regression
echo 🏷️  Running tests with tag: @regression
call npm run test:regression
goto end

:run_login
echo 🏷️  Running tests with tag: @login
call npm run test:login
goto end

:run_signup
echo 🏷️  Running tests with tag: @signup
call npm run test:signup
goto end

:run_critical
echo 🏷️  Running tests with tag: @critical
call npm run test:critical
goto end

:run_extended
echo 🏷️  Running tests with tag: @extended
call npm run test:extended
goto end

:run_allure
if "%2"=="" (
    echo 🏷️  Running all tests with Allure
    call npm run test:allure
) else (
    echo 🏷️  Running tests with tag: @%2 (with Allure)
    call npm run test:%2:allure
)
goto end

:generate_report
echo 📊 Generating Allure report...
call npm run allure:generate
echo 🌐 Opening Allure report...
call npm run allure:open
goto end

:clean_allure
echo 🧹 Cleaning Allure results...
call npm run allure:clean
goto end

:end
echo.
echo ✅ Test execution completed!

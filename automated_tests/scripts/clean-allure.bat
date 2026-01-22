@echo off

REM Clean Allure Results and Reports Script for Windows
REM This script helps maintain clean Allure reporting for Cucumber tests

echo 🧹 Cleaning Allure results and reports...

REM Remove old Allure results and reports
if exist allure-results rmdir /s /q allure-results
if exist allure-report rmdir /s /q allure-report

echo ✅ Cleaned up old Allure data

REM Check if tests were specified
if "%~1"=="" (
    echo 📝 No test files specified, running all Cucumber tests...
    echo 💡 Tip: You can specify feature files like: scripts\clean-allure.bat features\login.feature
    npm run test:ci
) else (
    echo 🧪 Running specified feature files: %*
    npx cucumber-js --format progress-bar %*
)

REM Check if tests generated results
if not exist allure-results (
    echo ❌ No Allure results generated. Tests may have failed or not run.
    echo 💡 Note: This setup currently generates Cucumber reports. Allure integration can be added later.
    exit /b 1
)

echo 📊 Generating Allure report...
npm run allure:generate

if %errorlevel% equ 0 (
    echo ✅ Allure report generated successfully!
    echo 🌐 To view the report, run: npm run allure:open
    echo 📁 Report location: allure-report\
) else (
    echo ❌ Failed to generate Allure report
    exit /b 1
)


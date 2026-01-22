@echo off
REM Retry Failed Tests Script for Windows
REM Usage: retry-failed-tests.bat <report-path> <test-command>

if "%~2"=="" (
    echo Usage: retry-failed-tests.bat ^<report-path^> ^<test-command^>
    echo Example: retry-failed-tests.bat reports/cucumber-report.json "npm run test:profileandsecurity:allure"
    exit /b 1
)

echo Starting retry process for failed test scenarios...
echo Report path: %1
echo Test command: %2
echo.

node scripts/retry-failed-tests.js %1 %2

if %ERRORLEVEL% EQU 0 (
    echo.
    echo All tests passed after retries!
) else (
    echo.
    echo Some tests are still failing after retries.
)

pause

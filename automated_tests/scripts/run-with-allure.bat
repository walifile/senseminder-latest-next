@echo off
setlocal

REM Get the cucumber command from the first argument
set "CUCUMBER_CMD=%~1"
shift

REM Get the report file from the second argument  
set "REPORT_FILE=%~1"
shift

REM Get the allure results directory from the third argument
set "ALLURE_RESULTS=%~1"
shift

REM Run cucumber command and capture exit code
call %CUCUMBER_CMD%
set "CUCUMBER_EXIT_CODE=%ERRORLEVEL%"

REM Always run allure conversion and generation regardless of cucumber exit code
echo Converting Cucumber JSON to Allure format...
node scripts/cucumber-to-allure.js %REPORT_FILE% %ALLURE_RESULTS%

echo Generating Allure report...
npx allure generate %ALLURE_RESULTS% --output allure-report

REM If not in CI mode, open the report
if "%1" neq "ci" (
    echo Opening Allure report...
    npx allure open allure-report
)

REM Exit with the original cucumber exit code
exit /b %CUCUMBER_EXIT_CODE%

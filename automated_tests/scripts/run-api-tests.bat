@echo off
echo ========================================
echo    API Testing Script for PC Creation
echo ========================================
echo.

REM Check if .env file exists
if not exist .env (
    echo Warning: .env file not found!
    echo Please copy env.template to .env and configure your API_AUTH_TOKEN
    echo.
)

REM Set environment variables
if exist .env (
    echo Loading environment variables from .env...
    for /f "usebackq tokens=1,2 delims==" %%a in (.env) do (
        if not "%%a"=="" if not "%%a:~0,1%"=="#" (
            set %%a=%%b
        )
    )
    echo.
)

REM Check if API_AUTH_TOKEN is set
if "%API_AUTH_TOKEN%"=="" (
    echo Error: API_AUTH_TOKEN is not set!
    echo Please set it in your .env file or as an environment variable.
    echo.
    pause
    exit /b 1
)

echo API_AUTH_TOKEN is configured.
echo.

REM Display menu
:menu
echo Select test option:
echo 1. Run all API tests
echo 2. Run PC creation API tests only
echo 3. Run PC deletion API tests only
echo 4. Run API tests with UI authentication
echo 5. Run positive scenarios only
echo 6. Run basic configuration tests
echo 7. Run custom configuration tests
echo 8. Run different configuration tests
echo 9. Run multiple instances tests
echo 10. Run with Allure reporting
echo 11. Run example script
echo 12. Exit
echo.
set /p choice="Enter your choice (1-12): "

if "%choice%"=="1" (
    echo.
    echo Running all API tests...
    npm run test:api
    goto end
)

if "%choice%"=="2" (
    echo.
    echo Running PC creation API tests...
    npm run test:api-create-pc
    goto end
)

if "%choice%"=="3" (
    echo.
    echo Running PC deletion API tests...
    npm run test:api-delete-pc
    goto end
)

if "%choice%"=="4" (
    echo.
    echo Running API tests with UI authentication...
    npm run test:api-with-ui
    goto end
)

if "%choice%"=="5" (
    echo.
    echo Running positive scenarios only...
    npm run test:api-positive
    goto end
)

if "%choice%"=="6" (
    echo.
    echo Running basic configuration tests...
    npx cucumber-js --tags @api-create-pc-basic
    goto end
)

if "%choice%"=="7" (
    echo.
    echo Running custom configuration tests...
    npx cucumber-js --tags @api-create-pc-custom
    goto end
)

if "%choice%"=="8" (
    echo.
    echo Running different configuration tests...
    npx cucumber-js --tags @api-create-pc-different-configs
    goto end
)

if "%choice%"=="9" (
    echo.
    echo Running multiple instances tests...
    npx cucumber-js --tags @api-create-pc-multiple-instances
    goto end
)

if "%choice%"=="10" (
    echo.
    echo Running tests with Allure reporting...
    npm run test:api:allure
    goto end
)

if "%choice%"=="11" (
    echo.
    echo Running example script...
    node examples/api-test-example.js
    goto end
)

if "%choice%"=="12" (
    echo.
    echo Exiting...
    goto end
)

echo Invalid choice. Please try again.
echo.
goto menu

:end
echo.
echo Test execution completed.
pause

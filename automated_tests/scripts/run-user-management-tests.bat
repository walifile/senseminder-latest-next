@echo off
echo Running User Management Tests...

npx cucumber-js features/userManagement.feature --require src/steps/*.ts --require src/support/*.ts --format @cucumber/pretty-formatter

echo User Management Tests completed!
pause


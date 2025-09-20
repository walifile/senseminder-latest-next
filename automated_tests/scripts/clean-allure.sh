#!/bin/bash

# Clean Allure Results and Reports Script
# This script helps maintain clean Allure reporting for Cucumber tests

echo "🧹 Cleaning Allure results and reports..."

# Remove old Allure results and reports
rm -rf allure-results/*
rm -rf allure-report/*

echo "✅ Cleaned up old Allure data"

# Check if tests were specified
if [ $# -eq 0 ]; then
    echo "📝 No test files specified, running all Cucumber tests..."
    echo "💡 Tip: You can specify feature files like: ./scripts/clean-allure.sh features/login.feature"
    npm run test:ci
else
    echo "🧪 Running specified feature files: $@"
    npx cucumber-js --format progress-bar "$@"
fi

# Check if tests generated results
if [ -z "$(ls -A allure-results/ 2>/dev/null)" ]; then
    echo "❌ No Allure results generated. Tests may have failed or not run."
    echo "💡 Note: This setup currently generates Cucumber reports. Allure integration can be added later."
    exit 1
fi

echo "📊 Generating Allure report..."
npm run allure:generate

if [ $? -eq 0 ]; then
    echo "✅ Allure report generated successfully!"
    echo "🌐 To view the report, run: npm run allure:open"
    echo "📁 Report location: allure-report/"
else
    echo "❌ Failed to generate Allure report"
    exit 1
fi 
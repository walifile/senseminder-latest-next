#!/bin/bash

# SensePC QA Automation - Test Runner Script
# This script provides easy access to tag-based test execution and Allure reporting

echo "🚀 SensePC QA Automation - Test Runner"
echo "======================================"

# Function to display available commands
show_help() {
    echo ""
    echo "Available Commands:"
    echo "=================="
    echo ""
    echo "Basic Test Execution:"
    echo "  npm test                    - Run all tests"
    echo "  npm run test:ci            - Run tests in CI mode"
    echo "  npm run test:headed        - Run tests in headed mode"
    echo "  npm run test:debug         - Run tests in debug mode"
    echo ""
    echo "Tag-based Test Execution:"
    echo "  npm run test:smoke         - Run smoke tests only"
    echo "  npm run test:regression    - Run regression tests only"
    echo "  npm run test:login         - Run login tests only"
    echo "  npm run test:signup        - Run signup tests only"
    echo "  npm run test:critical      - Run critical tests only"
    echo "  npm run test:extended      - Run extended tests only"
    echo ""
    echo "Allure Reporting:"
    echo "  npm run test:allure        - Run all tests with Allure"
    echo "  npm run test:smoke:allure  - Run smoke tests with Allure"
    echo "  npm run test:regression:allure - Run regression tests with Allure"
    echo "  npm run test:login:allure  - Run login tests with Allure"
    echo "  npm run test:signup:allure - Run signup tests with Allure"
    echo "  npm run test:critical:allure - Run critical tests with Allure"
    echo "  npm run test:extended:allure - Run extended tests with Allure"
    echo ""
    echo "Allure Report Management:"
    echo "  npm run allure:generate    - Generate HTML report"
    echo "  npm run allure:open        - Open generated report"
    echo "  npm run allure:serve       - Serve report locally"
    echo "  npm run allure:clean       - Clean Allure results"
    echo ""
    echo "Examples:"
    echo "  ./scripts/run-tests.sh smoke        - Run smoke tests"
    echo "  ./scripts/run-tests.sh login allure - Run login tests with Allure"
    echo "  ./scripts/run-tests.sh report       - Generate and open Allure report"
}

# Function to run tests by tag
run_tag_tests() {
    local tag=$1
    echo "🏷️  Running tests with tag: @$tag"
    npm run "test:$tag"
}

# Function to run tests by tag with Allure
run_tag_tests_allure() {
    local tag=$1
    echo "🏷️  Running tests with tag: @$tag (with Allure)"
    npm run "test:$tag:allure"
}

# Function to generate and open Allure report
generate_allure_report() {
    echo "📊 Generating Allure report..."
    npm run allure:generate
    
    echo "🌐 Opening Allure report..."
    npm run allure:open
}

# Function to clean Allure results
clean_allure() {
    echo "🧹 Cleaning Allure results..."
    npm run allure:clean
}

# Main script logic
case "$1" in
    "smoke")
        run_tag_tests "smoke"
        ;;
    "regression")
        run_tag_tests "regression"
        ;;
    "login")
        run_tag_tests "login"
        ;;
    "signup")
        run_tag_tests "signup"
        ;;
    "critical")
        run_tag_tests "critical"
        ;;
    "extended")
        run_tag_tests "extended"
        ;;
    "allure")
        if [ -n "$2" ]; then
            run_tag_tests_allure "$2"
        else
            echo "🏷️  Running all tests with Allure"
            npm run test:allure
        fi
        ;;
    "report")
        generate_allure_report
        ;;
    "clean")
        clean_allure
        ;;
    "help"|"-h"|"--help"|"")
        show_help
        ;;
    *)
        echo "❌ Unknown command: $1"
        echo "Use './scripts/run-tests.sh help' to see available commands"
        exit 1
        ;;
esac

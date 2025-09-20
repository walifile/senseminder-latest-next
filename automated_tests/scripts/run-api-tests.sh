#!/bin/bash

echo "========================================"
echo "   API Testing Script for PC Creation"
echo "========================================"
echo

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Warning: .env file not found!"
    echo "Please copy env.template to .env and configure your API_AUTH_TOKEN"
    echo
fi

# Load environment variables
if [ -f .env ]; then
    echo "Loading environment variables from .env..."
    export $(grep -v '^#' .env | xargs)
    echo
fi

# Check if API_AUTH_TOKEN is set
if [ -z "$API_AUTH_TOKEN" ]; then
    echo "Error: API_AUTH_TOKEN is not set!"
    echo "Please set it in your .env file or as an environment variable."
    echo
    exit 1
fi

echo "API_AUTH_TOKEN is configured."
echo

# Function to display menu
show_menu() {
    echo "Select test option:"
    echo "1. Run all API tests"
    echo "2. Run PC creation API tests only"
    echo "3. Run PC deletion API tests only"
    echo "4. Run API tests with UI authentication"
    echo "5. Run positive scenarios only"
    echo "6. Run basic configuration tests"
    echo "7. Run custom configuration tests"
    echo "8. Run different configuration tests"
    echo "9. Run multiple instances tests"
    echo "10. Run with Allure reporting"
    echo "11. Run example script"
    echo "12. Exit"
    echo
}

# Function to run tests
run_tests() {
    case $1 in
        1)
            echo "Running all API tests..."
            npm run test:api
            ;;
        2)
            echo "Running PC creation API tests..."
            npm run test:api-create-pc
            ;;
        3)
            echo "Running PC deletion API tests..."
            npm run test:api-delete-pc
            ;;
        4)
            echo "Running API tests with UI authentication..."
            npm run test:api-with-ui
            ;;
        5)
            echo "Running positive scenarios only..."
            npm run test:api-positive
            ;;
        6)
            echo "Running basic configuration tests..."
            npx cucumber-js --tags @api-create-pc-basic
            ;;
        7)
            echo "Running custom configuration tests..."
            npx cucumber-js --tags @api-create-pc-custom
            ;;
        8)
            echo "Running different configuration tests..."
            npx cucumber-js --tags @api-create-pc-different-configs
            ;;
        9)
            echo "Running multiple instances tests..."
            npx cucumber-js --tags @api-create-pc-multiple-instances
            ;;
        10)
            echo "Running tests with Allure reporting..."
            npm run test:api:allure
            ;;
        11)
            echo "Running example script..."
            node examples/api-test-example.js
            ;;
        12)
            echo "Exiting..."
            exit 0
            ;;
        *)
            echo "Invalid choice. Please try again."
            echo
            return 1
            ;;
    esac
}

# Main loop
while true; do
    show_menu
    read -p "Enter your choice (1-12): " choice
    echo
    
    if run_tests $choice; then
        echo
        echo "Test execution completed."
        echo
        read -p "Press Enter to continue or Ctrl+C to exit..."
        echo
    fi
done

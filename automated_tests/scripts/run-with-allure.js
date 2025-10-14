#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

/**
 * Cross-platform Allure test runner
 * Ensures Allure reports are generated even when tests fail
 */

const args = process.argv.slice(2);

if (args.length < 3) {
    console.log('Usage: node run-with-allure.js <cucumber-command> <report-file> <allure-results> [mode]');
    console.log('Example: node run-with-allure.js "cucumber-js --tags @login" "reports/login-cucumber.json" "allure-results"');
    process.exit(1);
}

const cucumberCommand = args[0];
const reportFile = args[1];
const allureResults = args[2];
const mode = args[3] || 'open';

console.log('🔄 Running cucumber command:', cucumberCommand);
console.log('📊 Report file:', reportFile);
console.log('📁 Allure results directory:', allureResults);
console.log('🔧 Mode:', mode);

// Parse the cucumber command - handle device parameters specially
let command, commandArgs;

if (cucumberCommand.includes('--world-parameters')) {
    // For device tests, we need to handle the JSON parameter specially
    const parts = cucumberCommand.split('--world-parameters');
    const beforeParams = parts[0].trim().split(' ');
    const afterParams = parts[1].trim();
    
    command = beforeParams[0];
    
    // Find the JSON parameter and the rest of the arguments
    // The JSON parameter starts with { and ends with }
    console.log('🔍 After params:', afterParams);
    const jsonStart = afterParams.indexOf('{');
    const jsonEnd = afterParams.lastIndexOf('}') + 1;
    
    console.log('🔍 JSON start:', jsonStart, 'JSON end:', jsonEnd);
    
    if (jsonStart !== -1 && jsonEnd > jsonStart) {
        const jsonParam = afterParams.substring(jsonStart, jsonEnd);
        const remainingArgs = afterParams.substring(jsonEnd).trim().split(' ').filter(arg => arg.length > 0);
        
        console.log('🔍 Extracted JSON param:', jsonParam);
        console.log('🔍 Remaining args:', remainingArgs);
        
        commandArgs = [
            ...beforeParams.slice(1),
            '--world-parameters',
            `'${jsonParam}'`,
            ...remainingArgs
        ];
    } else {
        // Fallback to original method if JSON parsing fails
        const afterParamsArray = afterParams.split(' ');
        commandArgs = [
            ...beforeParams.slice(1),
            '--world-parameters',
            afterParamsArray[0],
            ...afterParamsArray.slice(1)
        ];
    }
    
    console.log('🔍 Final command args:', commandArgs);
} else {
    // For regular tests, split normally
    const commandParts = cucumberCommand.split(' ');
    command = commandParts[0];
    commandArgs = commandParts.slice(1);
}

// Run cucumber command
const cucumberProcess = spawn(command, commandArgs, {
    stdio: 'inherit',
    shell: true
});

cucumberProcess.on('close', (exitCode) => {
    console.log(`\n📋 Cucumber exit code: ${exitCode}`);
    
    // Always run allure conversion and generation regardless of cucumber exit code
    console.log('🔄 Converting Cucumber JSON to Allure format...');
    
    const convertProcess = spawn('node', [
        path.join(__dirname, 'cucumber-to-allure.js'),
        reportFile,
        allureResults
    ], {
        stdio: 'inherit',
        shell: true
    });
    
    convertProcess.on('close', (convertExitCode) => {
        if (convertExitCode !== 0) {
            console.error('❌ Error converting Cucumber JSON to Allure format');
        } else {
            console.log('✅ Successfully converted Cucumber JSON to Allure format');
        }
        
        console.log('🔄 Generating Allure report...');
        
        const generateProcess = spawn('npx', [
            'allure',
            'generate',
            allureResults,
            '--output',
            'allure-report'
        ], {
            stdio: 'inherit',
            shell: true
        });
        
        generateProcess.on('close', (generateExitCode) => {
            if (generateExitCode !== 0) {
                console.error('❌ Error generating Allure report');
            } else {
                console.log('✅ Successfully generated Allure report');
            }
            
            // If not in CI mode, open the report
            if (mode !== 'ci') {
                console.log('🔄 Opening Allure report...');
                
                const openProcess = spawn('npx', [
                    'allure',
                    'open',
                    'allure-report'
                ], {
                    stdio: 'inherit',
                    shell: true
                });
                
                openProcess.on('close', (openExitCode) => {
                    if (openExitCode !== 0) {
                        console.error('❌ Error opening Allure report');
                    } else {
                        console.log('✅ Allure report opened successfully');
                    }
                    
                    // Exit with the original cucumber exit code
                    process.exit(exitCode);
                });
            } else {
                // Exit with the original cucumber exit code
                process.exit(exitCode);
            }
        });
    });
});

cucumberProcess.on('error', (error) => {
    console.error('❌ Error running cucumber command:', error.message);
    process.exit(1);
});

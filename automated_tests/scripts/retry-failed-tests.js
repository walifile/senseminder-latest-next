#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds between retries

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function parseCucumberReport(reportPath) {
    try {
        const reportContent = fs.readFileSync(reportPath, 'utf8');
        const report = JSON.parse(reportContent);
        return report;
    } catch (error) {
        log(`Error reading report file: ${error.message}`, 'red');
        return null;
    }
}

function getFailedScenarios(report) {
    const failedScenarios = [];
    
    if (report && report.length > 0) {
        for (const feature of report) {
            if (feature.elements) {
                for (const scenario of feature.elements) {
                    if (scenario.type === 'scenario') {
                        const hasFailedSteps = scenario.steps && scenario.steps.some(step => 
                            step.result && step.result.status === 'failed'
                        );
                        
                        if (hasFailedSteps) {
                            failedScenarios.push({
                                feature: feature.name,
                                scenario: scenario.name,
                                tags: scenario.tags || [],
                                location: scenario.location
                            });
                        }
                    }
                }
            }
        }
    }
    
    return failedScenarios;
}

function extractTags(scenario) {
    return scenario.tags.map(tag => tag.name).join(' ');
}

function runTestWithRetry(testCommand, scenario, attempt = 1) {
    log(`\n${'='.repeat(80)}`, 'cyan');
    log(`🔄 RETRY ATTEMPT ${attempt}/${MAX_RETRIES}`, 'yellow');
    log(`📋 Scenario: ${scenario.scenario}`, 'bright');
    log(`📁 Feature: ${scenario.feature}`, 'bright');
    log(`🏷️  Tags: ${extractTags(scenario)}`, 'blue');
    log(`${'='.repeat(80)}`, 'cyan');
    
    try {
        const startTime = Date.now();
        execSync(testCommand, { 
            stdio: 'inherit',
            cwd: process.cwd()
        });
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);
        
        log(`✅ SUCCESS on attempt ${attempt} (${duration}s)`, 'green');
        return { success: true, attempt, duration };
        
    } catch (error) {
        log(`❌ FAILED on attempt ${attempt}`, 'red');
        if (error.stdout) {
            log('STDOUT:', 'yellow');
            console.log(error.stdout.toString());
        }
        if (error.stderr) {
            log('STDERR:', 'yellow');
            console.log(error.stderr.toString());
        }
        return { success: false, attempt, error: error.message };
    }
}

async function retryFailedTests(reportPath, testCommand) {
    log('🔍 Analyzing test report for failed scenarios...', 'blue');
    
    const report = parseCucumberReport(reportPath);
    if (!report) {
        log('❌ Could not parse test report', 'red');
        process.exit(1);
    }
    
    const failedScenarios = getFailedScenarios(report);
    
    if (failedScenarios.length === 0) {
        log('✅ No failed scenarios found!', 'green');
        return;
    }
    
    log(`📊 Found ${failedScenarios.length} failed scenario(s)`, 'yellow');
    
    const results = {
        total: failedScenarios.length,
        successful: 0,
        failed: 0,
        details: []
    };
    
    for (const scenario of failedScenarios) {
        log(`\n🎯 Retrying scenario: ${scenario.scenario}`, 'magenta');
        
        let success = false;
        let lastError = null;
        
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            const result = runTestWithRetry(testCommand, scenario, attempt);
            
            if (result.success) {
                success = true;
                results.successful++;
                results.details.push({
                    scenario: scenario.scenario,
                    feature: scenario.feature,
                    status: 'PASSED',
                    attempts: attempt,
                    duration: result.duration
                });
                break;
            } else {
                lastError = result.error;
                
                if (attempt < MAX_RETRIES) {
                    log(`⏳ Waiting ${RETRY_DELAY/1000}s before next attempt...`, 'yellow');
                    await sleep(RETRY_DELAY);
                }
            }
        }
        
        if (!success) {
            results.failed++;
            results.details.push({
                scenario: scenario.scenario,
                feature: scenario.feature,
                status: 'FAILED',
                attempts: MAX_RETRIES,
                error: lastError
            });
        }
    }
    
    // Print summary
    log(`\n${'='.repeat(80)}`, 'cyan');
    log('📊 RETRY SUMMARY', 'bright');
    log(`${'='.repeat(80)}`, 'cyan');
    log(`Total scenarios: ${results.total}`, 'blue');
    log(`✅ Successful: ${results.successful}`, 'green');
    log(`❌ Failed: ${results.failed}`, 'red');
    log(`📈 Success rate: ${((results.successful / results.total) * 100).toFixed(1)}%`, 'yellow');
    
    log(`\n📋 DETAILED RESULTS:`, 'bright');
    results.details.forEach((detail, index) => {
        const statusColor = detail.status === 'PASSED' ? 'green' : 'red';
        const statusIcon = detail.status === 'PASSED' ? '✅' : '❌';
        
        log(`\n${index + 1}. ${statusIcon} ${detail.scenario}`, statusColor);
        log(`   Feature: ${detail.feature}`, 'blue');
        log(`   Status: ${detail.status}`, statusColor);
        log(`   Attempts: ${detail.attempts}/${MAX_RETRIES}`, 'yellow');
        
        if (detail.duration) {
            log(`   Duration: ${detail.duration}s`, 'cyan');
        }
        
        if (detail.error) {
            log(`   Error: ${detail.error}`, 'red');
        }
    });
    
    // Exit with appropriate code
    if (results.failed > 0) {
        log(`\n❌ ${results.failed} scenario(s) still failing after ${MAX_RETRIES} attempts`, 'red');
        process.exit(1);
    } else {
        log(`\n✅ All scenarios passed after retries!`, 'green');
        process.exit(0);
    }
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
        log('Usage: node retry-failed-tests.js <report-path> <test-command>', 'red');
        log('Example: node retry-failed-tests.js reports/cucumber-report.json "npm run test:profileandsecurity:allure"', 'yellow');
        process.exit(1);
    }
    
    const reportPath = args[0];
    const testCommand = args.slice(1).join(' ');
    
    log('🚀 Starting retry process for failed test scenarios...', 'bright');
    log(`📄 Report path: ${reportPath}`, 'blue');
    log(`🔧 Test command: ${testCommand}`, 'blue');
    log(`🔄 Max retries: ${MAX_RETRIES}`, 'blue');
    log(`⏱️  Retry delay: ${RETRY_DELAY/1000}s`, 'blue');
    
    await retryFailedTests(reportPath, testCommand);
}

if (require.main === module) {
    main().catch(error => {
        log(`💥 Unexpected error: ${error.message}`, 'red');
        process.exit(1);
    });
}

module.exports = { retryFailedTests, getFailedScenarios, parseCucumberReport };

const fs = require('fs');
const path = require('path');

// Function to convert Cucumber JSON to Allure format
function convertCucumberToAllure(cucumberJsonPath, outputDir) {
    try {
        // Read Cucumber JSON output
        const cucumberData = JSON.parse(fs.readFileSync(cucumberJsonPath, 'utf8'));
        
        // Create output directory if it doesn't exist
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Convert each scenario to Allure format
        cucumberData.forEach((feature, featureIndex) => {
            feature.elements.forEach((scenario, scenarioIndex) => {
                const allureResult = {
                    name: scenario.name,
                    fullName: `${feature.name} - ${scenario.name}`,
                    status: scenario.steps.every(step => step.result.status === 'passed') ? 'passed' : 'failed',
                    statusDetails: {
                        message: scenario.steps.find(step => step.result.status === 'failed')?.result.error_message || '',
                        trace: scenario.steps.find(step => step.result.status === 'failed')?.result.error_message || ''
                    },
                    start: Date.now(),
                    stop: Date.now(),
                    uuid: `${featureIndex}-${scenarioIndex}-${Date.now()}`,
                    historyId: `${feature.name}-${scenario.name}`.replace(/[^a-zA-Z0-9]/g, '_'),
                    testCaseId: `${feature.name}-${scenario.name}`.replace(/[^a-zA-Z0-9]/g, '_'),
                    labels: [
                        {
                            name: 'feature',
                            value: feature.name
                        },
                        {
                            name: 'story',
                            value: scenario.name
                        },
                        {
                            name: 'suite',
                            value: feature.name
                        }
                    ],
                    links: [],
                    parameters: [],
                    steps: scenario.steps.map((step, stepIndex) => ({
                        name: step.name,
                        status: step.result.status === 'passed' ? 'passed' : 'failed',
                        start: Date.now(),
                        stop: Date.now(),
                        attachments: []
                    }))
                };
                
                // Write individual Allure result file
                const resultFile = path.join(outputDir, `${allureResult.uuid}-result.json`);
                fs.writeFileSync(resultFile, JSON.stringify(allureResult, null, 2));
            });
        });
        
        console.log(`✅ Successfully converted Cucumber JSON to Allure format in ${outputDir}`);
        return true;
        
    } catch (error) {
        console.error('❌ Error converting Cucumber JSON to Allure:', error.message);
        return false;
    }
}

// Main execution
const args = process.argv.slice(2);
if (args.length < 2) {
    console.log('Usage: node cucumber-to-allure.js <cucumber-json-path> <allure-output-dir>');
    console.log('Example: node cucumber-to-allure.js reports/cucumber-report.json allure-results');
    process.exit(1);
}

const cucumberJsonPath = args[0];
const outputDir = args[1];

if (!fs.existsSync(cucumberJsonPath)) {
    console.error(`❌ Cucumber JSON file not found: ${cucumberJsonPath}`);
    process.exit(1);
}

convertCucumberToAllure(cucumberJsonPath, outputDir);

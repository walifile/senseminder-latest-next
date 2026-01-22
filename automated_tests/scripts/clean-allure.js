#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Cross-platform Allure cleanup script
 * Removes allure-results and allure-report directories
 */

console.log('🧹 Cleaning Allure results and reports...');

const directoriesToClean = ['allure-results', 'allure-report'];

function removeDirectory(dirPath) {
    if (fs.existsSync(dirPath)) {
        try {
            fs.rmSync(dirPath, { recursive: true, force: true });
            console.log(`✅ Removed directory: ${dirPath}`);
            return true;
        } catch (error) {
            console.log(`⚠️ Failed to remove directory ${dirPath}:`, error.message);
            return false;
        }
    } else {
        console.log(`ℹ️ Directory does not exist: ${dirPath}`);
        return true;
    }
}

let allCleaned = true;

directoriesToClean.forEach(dir => {
    const success = removeDirectory(dir);
    if (!success) {
        allCleaned = false;
    }
});

if (allCleaned) {
    console.log('✅ Allure results cleaned successfully');
    process.exit(0);
} else {
    console.log('⚠️ Some directories could not be cleaned');
    process.exit(1);
}

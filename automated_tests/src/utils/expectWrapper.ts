/**
 * Expect wrapper that automatically captures screenshots on assertion failures
 * This can be used as a drop-in replacement for standard expect assertions
 */

import { expect as playwrightExpect } from '@playwright/test';
import { errorHandler } from './errorHandler';

// Store the current step name for better error context
let currentStepName = 'Unknown step';

export function setCurrentStepName(stepName: string) {
    currentStepName = stepName;
}

// Create a wrapper around Playwright's expect that captures screenshots on failure
export const expect = (actual: any) => {
    const originalExpect = playwrightExpect(actual);
    
    // Wrap each matcher to capture screenshots on failure
    const wrappedMatchers: any = {};
    
    // List of common matchers to wrap
    const matchersToWrap = [
        'toBeTruthy', 'toBeFalsy', 'toBe', 'toEqual', 'toContain', 
        'toHaveURL', 'toBeVisible', 'toHaveText', 'toHaveCount'
    ];
    
    matchersToWrap.forEach(matcherName => {
        const originalMatcher = originalExpect[matcherName];
        if (originalMatcher) {
            wrappedMatchers[matcherName] = async (...args: any[]) => {
                try {
                    return await originalMatcher.apply(originalExpect, args);
                } catch (error) {
                    console.log(`❌ Assertion failed in step: ${currentStepName}`);
                    console.log(`❌ Matcher: ${matcherName}`);
                    console.log(`❌ Error: ${error.message}`);
                    
                    // Capture screenshot at the failure point
                    await errorHandler.handleAssertionFailure(
                        actual, 
                        args[0] || 'expected value', 
                        currentStepName, 
                        matcherName
                    );
                }
            };
        }
    });
    
    // Copy over any other matchers that weren't wrapped
    Object.keys(originalExpect).forEach(key => {
        if (!wrappedMatchers[key]) {
            wrappedMatchers[key] = originalExpect[key];
        }
    });
    
    return wrappedMatchers;
};

// Export a function to set the current step name
export { setCurrentStepName as setStepName };

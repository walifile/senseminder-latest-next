import { expect } from '@playwright/test';
import { errorHandler } from './errorHandler';

/**
 * Custom assertion utilities that capture screenshots at failure points
 */
export class CustomAssertions {
    private static currentStepName: string = '';

    /**
     * Set the current step name for better error context
     */
    public static setCurrentStepName(stepName: string): void {
        this.currentStepName = stepName;
    }

    /**
     * Custom toBeTruthy assertion with screenshot capture
     */
    public static async toBeTruthy(actual: any, stepName?: string): Promise<void> {
        const step = stepName || this.currentStepName;
        try {
            expect(actual).toBeTruthy();
        } catch (error) {
            await errorHandler.handleAssertionFailure(actual, 'truthy', step, 'toBeTruthy');
        }
    }

    /**
     * Custom toBeFalsy assertion with screenshot capture
     */
    public static async toBeFalsy(actual: any, stepName?: string): Promise<void> {
        const step = stepName || this.currentStepName;
        try {
            expect(actual).toBeFalsy();
        } catch (error) {
            await errorHandler.handleAssertionFailure(actual, 'falsy', step, 'toBeFalsy');
        }
    }

    /**
     * Custom toBe assertion with screenshot capture
     */
    public static async toBe(actual: any, expected: any, stepName?: string): Promise<void> {
        const step = stepName || this.currentStepName;
        try {
            expect(actual).toBe(expected);
        } catch (error) {
            await errorHandler.handleAssertionFailure(actual, expected, step, 'toBe');
        }
    }

    /**
     * Custom toEqual assertion with screenshot capture
     */
    public static async toEqual(actual: any, expected: any, stepName?: string): Promise<void> {
        const step = stepName || this.currentStepName;
        try {
            expect(actual).toEqual(expected);
        } catch (error) {
            await errorHandler.handleAssertionFailure(actual, expected, step, 'toEqual');
        }
    }

    /**
     * Custom toContain assertion with screenshot capture
     */
    public static async toContain(actual: any, expected: any, stepName?: string): Promise<void> {
        const step = stepName || this.currentStepName;
        try {
            expect(actual).toContain(expected);
        } catch (error) {
            await errorHandler.handleAssertionFailure(actual, expected, step, 'toContain');
        }
    }

    /**
     * Custom toHaveURL assertion with screenshot capture
     */
    public static async toHaveURL(page: any, expected: string | RegExp, stepName?: string): Promise<void> {
        const step = stepName || this.currentStepName;
        try {
            expect(page).toHaveURL(expected);
        } catch (error) {
            const currentUrl = await page.url();
            await errorHandler.handleAssertionFailure(currentUrl, expected, step, 'toHaveURL');
        }
    }

    /**
     * Custom toBeVisible assertion with screenshot capture
     */
    public static async toBeVisible(locator: any, stepName?: string): Promise<void> {
        const step = stepName || this.currentStepName;
        try {
            expect(locator).toBeVisible();
        } catch (error) {
            const isVisible = await locator.isVisible();
            await errorHandler.handleAssertionFailure(isVisible, true, step, 'toBeVisible');
        }
    }

    /**
     * Custom toHaveText assertion with screenshot capture
     */
    public static async toHaveText(locator: any, expected: string | RegExp, stepName?: string): Promise<void> {
        const step = stepName || this.currentStepName;
        try {
            expect(locator).toHaveText(expected);
        } catch (error) {
            const actualText = await locator.textContent();
            await errorHandler.handleAssertionFailure(actualText, expected, step, 'toHaveText');
        }
    }

    /**
     * Custom toHaveCount assertion with screenshot capture
     */
    public static async toHaveCount(locator: any, expected: number, stepName?: string): Promise<void> {
        const step = stepName || this.currentStepName;
        try {
            expect(locator).toHaveCount(expected);
        } catch (error) {
            const actualCount = await locator.count();
            await errorHandler.handleAssertionFailure(actualCount, expected, step, 'toHaveCount');
        }
    }

    /**
     * Custom API response assertion with screenshot capture
     */
    public static async toHaveStatusCode(actualStatusCode: number | null, expectedStatusCode: number, stepName?: string): Promise<void> {
        const step = stepName || this.currentStepName;
        try {
            if (actualStatusCode === null) {
                throw new Error('Status code is null - no response received');
            }
            expect(actualStatusCode).toBe(expectedStatusCode);
        } catch (error) {
            await errorHandler.handleAssertionFailure(actualStatusCode, expectedStatusCode, step, 'toHaveStatusCode');
        }
    }

    /**
     * Custom API success assertion with screenshot capture
     */
    public static async toBeSuccessful(isSuccessful: boolean, stepName?: string): Promise<void> {
        const step = stepName || this.currentStepName;
        try {
            expect(isSuccessful).toBeTruthy();
        } catch (error) {
            await errorHandler.handleAssertionFailure(isSuccessful, true, step, 'toBeSuccessful');
        }
    }

    /**
     * Custom error message assertion with screenshot capture
     */
    public static async toHaveErrorMessage(page: any, expectedError: string, stepName?: string): Promise<void> {
        const step = stepName || this.currentStepName;
        try {
            const errorSelectors = [
                'text="AccessCode Invalid"',
                'text="Invalid code"',
                'text="Code expired"',
                'text="Invalid OTP"',
                'text="OTP expired"',
                'text="Verification failed"',
                '[data-testid="error-message"]',
                '.error-message',
                '.alert-error'
            ];
            
            let errorFound = false;
            let actualError = '';
            
            for (const selector of errorSelectors) {
                try {
                    const errorElement = page.locator(selector);
                    if (await errorElement.isVisible()) {
                        actualError = await errorElement.textContent() || '';
                        errorFound = true;
                        break;
                    }
                } catch (e) {
                    // Continue checking other selectors
                }
            }
            
            if (!errorFound) {
                throw new Error(`Expected error message "${expectedError}" but no error was found`);
            }
            
            if (!actualError.includes(expectedError)) {
                throw new Error(`Expected error message to contain "${expectedError}" but got "${actualError}"`);
            }
            
        } catch (error) {
            await errorHandler.handleAssertionFailure('No error found or error mismatch', expectedError, step, 'toHaveErrorMessage');
        }
    }

    /**
     * Custom timeout assertion with screenshot capture
     */
    public static async toCompleteWithinTimeout(
        operation: () => Promise<any>, 
        timeoutMs: number, 
        stepName?: string
    ): Promise<void> {
        const step = stepName || this.currentStepName;
        try {
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs);
            });
            
            await Promise.race([operation(), timeoutPromise]);
        } catch (error) {
            await errorHandler.handleAssertionFailure(`Operation timed out after ${timeoutMs}ms`, 'Operation completed within timeout', step, 'toCompleteWithinTimeout');
        }
    }
}

// Export individual assertion functions for convenience
export const customExpect = {
    toBeTruthy: CustomAssertions.toBeTruthy,
    toBeFalsy: CustomAssertions.toBeFalsy,
    toBe: CustomAssertions.toBe,
    toEqual: CustomAssertions.toEqual,
    toContain: CustomAssertions.toContain,
    toHaveURL: CustomAssertions.toHaveURL,
    toBeVisible: CustomAssertions.toBeVisible,
    toHaveText: CustomAssertions.toHaveText,
    toHaveCount: CustomAssertions.toHaveCount,
    toHaveStatusCode: CustomAssertions.toHaveStatusCode,
    toBeSuccessful: CustomAssertions.toBeSuccessful,
    toHaveErrorMessage: CustomAssertions.toHaveErrorMessage,
    toCompleteWithinTimeout: CustomAssertions.toCompleteWithinTimeout
};

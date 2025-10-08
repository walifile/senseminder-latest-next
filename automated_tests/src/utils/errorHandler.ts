import { CustomWorld } from '../support/world';

/**
 * Custom error handler that captures screenshots at the actual failure point
 * instead of waiting for the After hook
 */
export class ErrorHandler {
    private static instance: ErrorHandler;
    private world: CustomWorld | null = null;

    private constructor() {}

    public static getInstance(): ErrorHandler {
        if (!ErrorHandler.instance) {
            ErrorHandler.instance = new ErrorHandler();
        }
        return ErrorHandler.instance;
    }

    /**
     * Set the world instance for error handling
     */
    public setWorld(world: CustomWorld): void {
        this.world = world;
    }

    /**
     * Handle test failures with immediate screenshot capture
     */
    public async handleTestFailure(error: Error, stepName: string, context?: string): Promise<void> {
        console.log(`❌ Test failure detected in step: ${stepName}`);
        console.log(`❌ Error: ${error.message}`);
        
        if (context) {
            console.log(`❌ Context: ${context}`);
        }

        // Capture screenshot immediately at the failure point
        if (this.world && this.world.page && !this.world.page.isClosed()) {
            try {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const cleanStepName = stepName.replace(/[^a-zA-Z0-9]/g, '_');
                const screenshotPath = `screenshots/failure_${cleanStepName}_${timestamp}.png`;
                
                await this.world.page.screenshot({ 
                    path: screenshotPath, 
                    fullPage: true 
                });
                
                console.log(`📸 Failure screenshot saved: ${screenshotPath}`);
                
                // Also capture debug artifacts for more context
                await this.captureDebugArtifacts(stepName, 'failure');
                
            } catch (screenshotError) {
                console.log('❌ Error capturing failure screenshot:', screenshotError);
            }
        } else {
            console.log('⚠️ Cannot capture screenshot - page context not available');
            console.log(`⚠️ World available: ${!!this.world}`);
            console.log(`⚠️ Page available: ${!!(this.world && this.world.page)}`);
            console.log(`⚠️ Page closed: ${this.world && this.world.page ? this.world.page.isClosed() : 'N/A'}`);
        }

        // Re-throw the error to maintain test failure behavior
        throw error;
    }

    /**
     * Handle assertion failures with immediate screenshot capture
     */
    public async handleAssertionFailure(
        actual: any, 
        expected: any, 
        stepName: string, 
        assertionType: string,
        context?: string
    ): Promise<void> {
        const errorMessage = `Assertion failed in ${stepName}: Expected ${expected}, but got ${actual}`;
        console.log(`❌ ${errorMessage}`);
        
        if (context) {
            console.log(`❌ Context: ${context}`);
        }

        // Capture screenshot immediately
        if (this.world && this.world.page && !this.world.page.isClosed()) {
            try {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const cleanStepName = stepName.replace(/[^a-zA-Z0-9]/g, '_');
                const screenshotPath = `screenshots/assertion_failure_${cleanStepName}_${timestamp}.png`;
                
                await this.world.page.screenshot({ 
                    path: screenshotPath, 
                    fullPage: true 
                });
                
                console.log(`📸 Assertion failure screenshot saved: ${screenshotPath}`);
                
                // Also capture debug artifacts
                await this.captureDebugArtifacts(stepName, 'assertion_failure');
                
            } catch (screenshotError) {
                console.log('❌ Error capturing assertion failure screenshot:', screenshotError);
            }
        }

        // Create and throw assertion error
        const error = new Error(errorMessage);
        error.name = 'AssertionError';
        throw error;
    }

    /**
     * Handle API failures with immediate screenshot capture
     */
    public async handleApiFailure(
        error: any, 
        stepName: string, 
        apiEndpoint?: string,
        requestData?: any,
        responseData?: any
    ): Promise<void> {
        console.log(`❌ API failure detected in step: ${stepName}`);
        console.log(`❌ Error: ${error.message || error}`);
        
        if (apiEndpoint) {
            console.log(`❌ API Endpoint: ${apiEndpoint}`);
        }
        
        if (requestData) {
            console.log(`❌ Request Data:`, JSON.stringify(requestData, null, 2));
        }
        
        if (responseData) {
            console.log(`❌ Response Data:`, JSON.stringify(responseData, null, 2));
        }

        // Capture screenshot immediately
        if (this.world && this.world.page && !this.world.page.isClosed()) {
            try {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const cleanStepName = stepName.replace(/[^a-zA-Z0-9]/g, '_');
                const screenshotPath = `screenshots/api_failure_${cleanStepName}_${timestamp}.png`;
                
                await this.world.page.screenshot({ 
                    path: screenshotPath, 
                    fullPage: true 
                });
                
                console.log(`📸 API failure screenshot saved: ${screenshotPath}`);
                
                // Also capture debug artifacts
                await this.captureDebugArtifacts(stepName, 'api_failure');
                
            } catch (screenshotError) {
                console.log('❌ Error capturing API failure screenshot:', screenshotError);
            }
        }

        // Re-throw the error
        throw error;
    }

    /**
     * Capture debug artifacts (screenshots, logs, page source)
     */
    private async captureDebugArtifacts(stepName: string, type: 'failure' | 'assertion_failure' | 'api_failure'): Promise<void> {
        if (!this.world || !this.world.page || this.world.page.isClosed()) {
            return;
        }

        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const cleanStepName = stepName.replace(/[^a-zA-Z0-9]/g, '_');
            
            // Capture full page screenshot
            const fullPageScreenshot = `screenshots/${type}_${cleanStepName}_fullpage_${timestamp}.png`;
            await this.world.page.screenshot({ 
                path: fullPageScreenshot, 
                fullPage: true 
            });
            console.log(`📸 Full page screenshot saved: ${fullPageScreenshot}`);
            
            // Capture viewport screenshot
            const viewportScreenshot = `screenshots/${type}_${cleanStepName}_viewport_${timestamp}.png`;
            await this.world.page.screenshot({ 
                path: viewportScreenshot, 
                fullPage: false 
            });
            console.log(`📸 Viewport screenshot saved: ${viewportScreenshot}`);
            
            // Capture page source
            try {
                const pageSource = await this.world.page.content();
                const sourcePath = `screenshots/${type}_${cleanStepName}_source_${timestamp}.html`;
                const fs = require('fs');
                fs.writeFileSync(sourcePath, pageSource);
                console.log(`📄 Page source saved: ${sourcePath}`);
            } catch (sourceError) {
                console.log('⚠️ Could not capture page source:', sourceError);
            }
            
            // Capture console logs
            try {
                const logs = await this.world.page.evaluate(() => {
                    return (window as any).consoleLogs || [];
                });
                if (logs && logs.length > 0) {
                    const logsPath = `screenshots/${type}_${cleanStepName}_logs_${timestamp}.json`;
                    const fs = require('fs');
                    fs.writeFileSync(logsPath, JSON.stringify(logs, null, 2));
                    console.log(`📄 Console logs saved: ${logsPath}`);
                }
            } catch (logsError) {
                console.log('⚠️ Could not capture console logs:', logsError);
            }
            
        } catch (error) {
            console.log('❌ Error capturing debug artifacts:', error);
        }
    }

    /**
     * Pause execution for debugging purposes
     */
    public async pauseForDebugging(stepName: string, duration: number = 5000): Promise<void> {
        console.log(`⏸️ Pausing execution for debugging in step: ${stepName}`);
        console.log(`⏸️ Duration: ${duration}ms`);
        
        if (this.world && this.world.page && !this.world.page.isClosed()) {
            // Take a screenshot before pausing
            try {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const cleanStepName = stepName.replace(/[^a-zA-Z0-9]/g, '_');
                const screenshotPath = `screenshots/debug_pause_${cleanStepName}_${timestamp}.png`;
                
                await this.world.page.screenshot({ 
                    path: screenshotPath, 
                    fullPage: true 
                });
                
                console.log(`📸 Debug pause screenshot saved: ${screenshotPath}`);
            } catch (screenshotError) {
                console.log('❌ Error capturing debug pause screenshot:', screenshotError);
            }
        }
        
        // Pause execution
        await new Promise(resolve => setTimeout(resolve, duration));
        console.log(`▶️ Resuming execution after debug pause`);
    }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

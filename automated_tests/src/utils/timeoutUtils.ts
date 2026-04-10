import { getTestData } from '../config/environment';

export interface TimeoutConfig {
  default: number;
  navigation: number;
  action: number;
  api: number;
  email: number;
  fileUpload: number;
  pcCreation: number;
  pcConnection: number;
  mfa: number;
  pageLoad: number;
}

export class TimeoutManager {
  private static timeouts: TimeoutConfig;

  static initialize() {
    const testData = getTestData();
    this.timeouts = testData.application.timeouts || {
      default: testData.application.timeout,
      navigation: testData.application.timeout,
      action: testData.application.timeout,
      api: 60000,
      email: 30000,
      fileUpload: 120000,
      pcCreation: 300000,
      pcConnection: 300000,
      mfa: 60000,
      pageLoad: 60000
    };
  }

  static getTimeout(type: keyof TimeoutConfig): number {
    if (!this.timeouts) {
      this.initialize();
    }
    return this.timeouts[type] || this.timeouts.default;
  }

  static getDefaultTimeout(): number {
    return this.getTimeout('default');
  }

  static getNavigationTimeout(): number {
    return this.getTimeout('navigation');
  }

  static getActionTimeout(): number {
    return this.getTimeout('action');
  }

  static getApiTimeout(): number {
    return this.getTimeout('api');
  }

  static getEmailTimeout(): number {
    return this.getTimeout('email');
  }

  static getFileUploadTimeout(): number {
    return this.getTimeout('fileUpload');
  }

  static getPCCreationTimeout(): number {
    return this.getTimeout('pcCreation');
  }

  static getPCConnectionTimeout(): number {
    return this.getTimeout('pcConnection');
  }

  static getMfaTimeout(): number {
    return this.getTimeout('mfa');
  }

  static getPageLoadTimeout(): number {
    return this.getTimeout('pageLoad');
  }

  /**
   * Get timeout for specific test scenarios
   */
  static getScenarioTimeout(scenario: string): number {
    const scenarioTimeouts: Record<string, keyof TimeoutConfig> = {
      'signup': 'email',
      'login': 'default',
      'pc-creation': 'pcCreation',
      'pc-connection': 'pcConnection',
      'file-upload': 'fileUpload',
      'mfa': 'mfa',
      'api-call': 'api',
      'page-navigation': 'navigation',
      'page-load': 'pageLoad'
    };

    const timeoutType = scenarioTimeouts[scenario] || 'default';
    return this.getTimeout(timeoutType);
  }

  /**
   * Create a timeout promise that rejects after specified time
   */
  static createTimeoutPromise<T>(timeoutMs: number, errorMessage?: string): Promise<T> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(errorMessage || `Operation timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });
  }

  /**
   * Wrap a promise with a timeout
   */
  static withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage?: string): Promise<T> {
    return Promise.race([
      promise,
      this.createTimeoutPromise<T>(timeoutMs, errorMessage)
    ]);
  }
}

// Initialize on module load
TimeoutManager.initialize();


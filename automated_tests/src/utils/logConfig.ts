/**
 * Log Configuration Utility
 * Controls what types of logs are displayed during test execution
 */

export enum LogLevel {
  NONE = 0,
  ERROR = 1,
  WARN = 2,
  INFO = 3,
  DEBUG = 4,
  VERBOSE = 5
}

export interface LogConfig {
  logLevel: LogLevel;
  showNetworkRequests: boolean;
  showNetworkResponses: boolean;
  showNetworkErrors: boolean;
  showTestLogs: boolean;
}

class LogConfigManager {
  private static instance: LogConfigManager;
  private config: LogConfig;

  private constructor() {
    // Default: Show test logs but hide network responses
    const envLogLevel = process.env.LOG_LEVEL?.toUpperCase() || 'INFO';
    const showNetwork = process.env.SHOW_NETWORK_LOGS === 'true';
    
    this.config = {
      logLevel: this.parseLogLevel(envLogLevel),
      showNetworkRequests: showNetwork,
      showNetworkResponses: showNetwork,
      showNetworkErrors: true, // Always show errors
      showTestLogs: true // Always show test logs by default
    };
  }

  public static getInstance(): LogConfigManager {
    if (!LogConfigManager.instance) {
      LogConfigManager.instance = new LogConfigManager();
    }
    return LogConfigManager.instance;
  }

  private parseLogLevel(level: string): LogLevel {
    switch (level) {
      case 'NONE': return LogLevel.NONE;
      case 'ERROR': return LogLevel.ERROR;
      case 'WARN': return LogLevel.WARN;
      case 'INFO': return LogLevel.INFO;
      case 'DEBUG': return LogLevel.DEBUG;
      case 'VERBOSE': return LogLevel.VERBOSE;
      default: return LogLevel.INFO;
    }
  }

  public getConfig(): LogConfig {
    return { ...this.config };
  }

  public shouldLogRequest(): boolean {
    return this.config.showNetworkRequests;
  }

  public shouldLogResponse(): boolean {
    return this.config.showNetworkResponses;
  }

  public shouldLogError(): boolean {
    return this.config.showNetworkErrors;
  }

  public shouldLogTest(): boolean {
    return this.config.showTestLogs;
  }

  public setConfig(config: Partial<LogConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public isLogLevelEnabled(level: LogLevel): boolean {
    return this.config.logLevel >= level;
  }
}

export const logConfig = LogConfigManager.getInstance();






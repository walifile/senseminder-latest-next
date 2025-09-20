import { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

export interface APICallDetails {
    method: string;
    url: string;
    headers: Record<string, any>;
    params?: Record<string, any>;
    data?: any;
    startTime: number;
    endTime?: number;
    duration?: number;
    statusCode?: number;
    responseData?: any;
    error?: any;
}

export class APILogger {
    private static instance: APILogger;
    private apiCalls: APICallDetails[] = [];

    private constructor() {}

    public static getInstance(): APILogger {
        if (!APILogger.instance) {
            APILogger.instance = new APILogger();
        }
        return APILogger.instance;
    }

    public logRequest(config: AxiosRequestConfig): string {
        const callId = this.generateCallId();
        const startTime = Date.now();
        
        const apiCall: APICallDetails = {
            method: config.method?.toUpperCase() || 'UNKNOWN',
            url: this.buildFullUrl(config),
            headers: config.headers || {},
            params: config.params,
            data: config.data,
            startTime: startTime
        };

        this.apiCalls.push(apiCall);

        console.log('\n🚀 ===== API REQUEST =====');
        console.log(`📋 Call ID: ${callId}`);
        console.log(`⏰ Timestamp: ${new Date(startTime).toISOString()}`);
        console.log(`🔗 Method: ${apiCall.method}`);
        console.log(`🌐 URL: ${apiCall.url}`);
        
        if (apiCall.headers && Object.keys(apiCall.headers).length > 0) {
            console.log(`📋 Headers:`);
            Object.entries(apiCall.headers).forEach(([key, value]) => {
                // Mask sensitive headers
                const displayValue = this.maskSensitiveData(key, value);
                console.log(`   ${key}: ${displayValue}`);
            });
        }
        
        if (apiCall.params && Object.keys(apiCall.params).length > 0) {
            console.log(`🔍 Query Parameters:`);
            Object.entries(apiCall.params).forEach(([key, value]) => {
                console.log(`   ${key}: ${value}`);
            });
        }
        
        if (apiCall.data) {
            console.log(`📦 Request Body:`);
            const maskedData = this.maskSensitiveDataInObject(apiCall.data);
            console.log(JSON.stringify(maskedData, null, 2));
        }
        
        console.log('========================\n');

        return callId;
    }

    public logResponse(callId: string, response: AxiosResponse): void {
        const apiCall = this.findApiCall(callId);
        if (!apiCall) return;

        const endTime = Date.now();
        apiCall.endTime = endTime;
        apiCall.duration = endTime - apiCall.startTime;
        apiCall.statusCode = response.status;
        apiCall.responseData = response.data;

        console.log('\n✅ ===== API RESPONSE =====');
        console.log(`📋 Call ID: ${callId}`);
        console.log(`⏰ Timestamp: ${new Date(endTime).toISOString()}`);
        console.log(`⏱️  Duration: ${apiCall.duration}ms`);
        console.log(`📊 Status Code: ${apiCall.statusCode}`);
        console.log(`📦 Response Data:`);
        console.log(JSON.stringify(response.data, null, 2));
        console.log('==========================\n');
    }

    public logError(callId: string, error: AxiosError): void {
        const apiCall = this.findApiCall(callId);
        if (!apiCall) return;

        const endTime = Date.now();
        apiCall.endTime = endTime;
        apiCall.duration = endTime - apiCall.startTime;
        apiCall.error = {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data
        };

        console.log('\n❌ ===== API ERROR =====');
        console.log(`📋 Call ID: ${callId}`);
        console.log(`⏰ Timestamp: ${new Date(endTime).toISOString()}`);
        console.log(`⏱️  Duration: ${apiCall.duration}ms`);
        console.log(`🚨 Error Message: ${error.message}`);
        
        if (error.response) {
            console.log(`📊 Status Code: ${error.response.status}`);
            console.log(`📝 Status Text: ${error.response.statusText}`);
            console.log(`📦 Error Response Data:`);
            console.log(JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.log(`🌐 Request was made but no response received`);
            console.log(`📦 Request Data:`);
            console.log(JSON.stringify(error.request, null, 2));
        } else {
            console.log(`⚠️  Error setting up request: ${error.message}`);
        }
        
        console.log('========================\n');
    }

    public getAllApiCalls(): APICallDetails[] {
        return [...this.apiCalls];
    }

    public getApiCallSummary(): void {
        console.log('\n📊 ===== API CALLS SUMMARY =====');
        console.log(`📈 Total API Calls: ${this.apiCalls.length}`);
        
        const successfulCalls = this.apiCalls.filter(call => call.statusCode && call.statusCode >= 200 && call.statusCode < 300);
        const failedCalls = this.apiCalls.filter(call => call.error || (call.statusCode && call.statusCode >= 400));
        
        console.log(`✅ Successful Calls: ${successfulCalls.length}`);
        console.log(`❌ Failed Calls: ${failedCalls.length}`);
        
        if (this.apiCalls.length > 0) {
            const totalDuration = this.apiCalls.reduce((sum, call) => sum + (call.duration || 0), 0);
            const avgDuration = totalDuration / this.apiCalls.length;
            console.log(`⏱️  Average Duration: ${avgDuration.toFixed(2)}ms`);
            console.log(`⏱️  Total Duration: ${totalDuration}ms`);
        }
        
        console.log('\n📋 Detailed Call List:');
        this.apiCalls.forEach((call, index) => {
            const status = call.error ? '❌' : (call.statusCode && call.statusCode >= 200 && call.statusCode < 300 ? '✅' : '⚠️');
            console.log(`${index + 1}. ${status} ${call.method} ${call.url} - ${call.duration || 0}ms`);
        });
        
        console.log('================================\n');
    }

    public clearApiCalls(): void {
        this.apiCalls = [];
        console.log('🧹 API calls log cleared');
    }

    private generateCallId(): string {
        return `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private buildFullUrl(config: AxiosRequestConfig): string {
        if (config.url?.startsWith('http')) {
            return config.url;
        }
        
        const baseURL = config.baseURL || '';
        const url = config.url || '';
        const params = config.params ? '?' + new URLSearchParams(config.params).toString() : '';
        
        return `${baseURL}${url}${params}`;
    }

    private findApiCall(callId: string): APICallDetails | undefined {
        return this.apiCalls.find(call => call.url.includes(callId.split('_')[1]));
    }

    private maskSensitiveData(key: string, value: any): any {
        const sensitiveKeys = ['authorization', 'token', 'apikey', 'password', 'secret', 'key'];
        const lowerKey = key.toLowerCase();
        
        if (sensitiveKeys.some(sensitiveKey => lowerKey.includes(sensitiveKey))) {
            if (typeof value === 'string' && value.length > 10) {
                return value.substring(0, 6) + '...' + value.substring(value.length - 4);
            }
            return '***MASKED***';
        }
        
        return value;
    }

    private maskSensitiveDataInObject(obj: any): any {
        if (obj === null || obj === undefined) return obj;
        
        if (typeof obj === 'string') {
            return obj;
        }
        
        if (Array.isArray(obj)) {
            return obj.map(item => this.maskSensitiveDataInObject(item));
        }
        
        if (typeof obj === 'object') {
            const masked: any = {};
            for (const [key, value] of Object.entries(obj)) {
                masked[key] = this.maskSensitiveData(key, this.maskSensitiveDataInObject(value));
            }
            return masked;
        }
        
        return obj;
    }
}

// Export singleton instance
export const apiLogger = APILogger.getInstance();

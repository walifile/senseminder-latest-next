import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { apiLogger } from './apiLogger';

// Store call IDs for tracking
const callIdMap = new Map<string, string>();

// Request interceptor
axios.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const callId = apiLogger.logRequest(config);
        callIdMap.set(config.url || '', callId);
        return config;
    },
    (error: AxiosError) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
axios.interceptors.response.use(
    (response: AxiosResponse) => {
        const callId = callIdMap.get(response.config.url || '');
        if (callId) {
            apiLogger.logResponse(callId, response);
            callIdMap.delete(response.config.url || '');
        }
        return response;
    },
    (error: AxiosError) => {
        const callId = callIdMap.get(error.config?.url || '');
        if (callId) {
            apiLogger.logError(callId, error);
            callIdMap.delete(error.config?.url || '');
        }
        return Promise.reject(error);
    }
);

// Export the configured axios instance
export default axios;

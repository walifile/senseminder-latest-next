import axios, { AxiosResponse } from 'axios';

export interface CalculateCostRequest {
    configId: string;
    storageSize: number;
    region: string;
}

export interface CalculateCostResponse {
    instance?: {
        configId: string;
        pricePerHour: number;
        pricePerDay: number;
        pricePerMonth: number;
    };
    storage?: {
        size: number;
        pricePerHour: number;
        pricePerDay: number;
        pricePerMonth: number;
    };
    total?: {
        pricePerHour: number;
        pricePerDay: number;
        pricePerMonth: number;
    };
    // Fallback fields for backward compatibility
    hourlyPrice?: number;
    dailyPrice?: number;
    monthlyPrice?: number;
    price?: number;
    [key: string]: any; // Allow for additional response fields
}

/**
 * Calculate cost using the calculate-cost API
 * @param configId - The PC configuration ID (e.g., "SensePC.Basic11—2Cores·8GBRAM")
 * @param storageSize - Storage size in GB (default: 220)
 * @param region - AWS region (default: "us-east-1")
 * @returns Promise with the calculated cost response
 */
export async function calculateCost(
    configId: string,
    storageSize: number = 220,
    region: string = 'us-east-1'
): Promise<CalculateCostResponse> {
    const apiUrl = 'https://zxxx3xjbb0.execute-api.us-east-1.amazonaws.com/calculate-cost';
    
    const requestBody: CalculateCostRequest = {
        configId,
        storageSize,
        region
    };

    try {
        console.log(`💰 Calling calculate-cost API with:`, requestBody);
        
        const response: AxiosResponse<CalculateCostResponse> = await axios.post(
            apiUrl,
            requestBody,
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000 // 10 second timeout
            }
        );

        console.log(`✅ Calculate-cost API response:`, response.data);
        return response.data;
    } catch (error: any) {
        console.error(`❌ Error calling calculate-cost API:`, error.message);
        if (error.response) {
            console.error(`   Status: ${error.response.status}`);
            console.error(`   Data:`, error.response.data);
        }
        throw error;
    }
}

/**
 * Get formatted hourly price string from API response
 * @param configId - The PC configuration ID
 * @param storageSize - Storage size in GB (default: 220)
 * @param region - AWS region (default: "us-east-1")
 * @returns Formatted price string like "$0.618 /hour"
 */
export async function getFormattedHourlyPrice(
    configId: string,
    storageSize: number = 220,
    region: string = 'us-east-1'
): Promise<string> {
    const response = await calculateCost(configId, storageSize, region);
    
    // Try to get hourly price from the response structure
    // Priority: total.pricePerHour > hourlyPrice > price > cost
    const hourlyPrice = response.total?.pricePerHour 
        || response.hourlyPrice 
        || response.price 
        || response.cost;
    
    if (hourlyPrice === undefined || hourlyPrice === null) {
        throw new Error(`Hourly price not found in API response: ${JSON.stringify(response)}`);
    }
    
    // Format the price to match the frontend format: "$0.618 /hour"
    const formattedPrice = `$${hourlyPrice.toFixed(3)} /hour`;
    console.log(`💰 Formatted hourly price: ${formattedPrice}`);
    
    return formattedPrice;
}


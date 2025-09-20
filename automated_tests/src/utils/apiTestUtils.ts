import { apiLogger } from './apiLogger';

export class APITestUtils {
    /**
     * Print detailed API call information for debugging
     */
    public static printAPICallDetails(): void {
        console.log('\n🔍 ===== DETAILED API CALL INFORMATION =====');
        
        const apiCalls = apiLogger.getAllApiCalls();
        
        if (apiCalls.length === 0) {
            console.log('📭 No API calls recorded yet');
            return;
        }
        
        apiCalls.forEach((call, index) => {
            console.log(`\n📋 API Call #${index + 1}:`);
            console.log(`   🔗 Method: ${call.method}`);
            console.log(`   🌐 URL: ${call.url}`);
            console.log(`   ⏰ Start Time: ${new Date(call.startTime).toISOString()}`);
            
            if (call.endTime) {
                console.log(`   ⏰ End Time: ${new Date(call.endTime).toISOString()}`);
                console.log(`   ⏱️  Duration: ${call.duration}ms`);
            } else {
                console.log(`   ⏰ End Time: Still in progress`);
            }
            
            if (call.statusCode) {
                console.log(`   📊 Status Code: ${call.statusCode}`);
            }
            
            if (call.headers && Object.keys(call.headers).length > 0) {
                console.log(`   📋 Headers:`);
                Object.entries(call.headers).forEach(([key, value]) => {
                    console.log(`      ${key}: ${value}`);
                });
            }
            
            if (call.params && Object.keys(call.params).length > 0) {
                console.log(`   🔍 Query Parameters:`);
                Object.entries(call.params).forEach(([key, value]) => {
                    console.log(`      ${key}: ${value}`);
                });
            }
            
            if (call.data) {
                console.log(`   📦 Request Body:`);
                console.log(JSON.stringify(call.data, null, 6));
            }
            
            if (call.responseData) {
                console.log(`   📦 Response Data:`);
                console.log(JSON.stringify(call.responseData, null, 6));
            }
            
            if (call.error) {
                console.log(`   ❌ Error:`);
                console.log(`      Message: ${call.error.message}`);
                if (call.error.status) {
                    console.log(`      Status: ${call.error.status}`);
                }
                if (call.error.data) {
                    console.log(`      Data: ${JSON.stringify(call.error.data, null, 6)}`);
                }
            }
        });
        
        console.log('\n==========================================\n');
    }
    
    /**
     * Print a summary of API calls
     */
    public static printAPISummary(): void {
        apiLogger.getApiCallSummary();
    }
    
    /**
     * Get API call statistics
     */
    public static getAPIStats(): {
        totalCalls: number;
        successfulCalls: number;
        failedCalls: number;
        averageDuration: number;
        totalDuration: number;
    } {
        const apiCalls = apiLogger.getAllApiCalls();
        
        const successfulCalls = apiCalls.filter(call => 
            call.statusCode && call.statusCode >= 200 && call.statusCode < 300
        );
        
        const failedCalls = apiCalls.filter(call => 
            call.error || (call.statusCode && call.statusCode >= 400)
        );
        
        const completedCalls = apiCalls.filter(call => call.duration !== undefined);
        const totalDuration = completedCalls.reduce((sum, call) => sum + (call.duration || 0), 0);
        const averageDuration = completedCalls.length > 0 ? totalDuration / completedCalls.length : 0;
        
        return {
            totalCalls: apiCalls.length,
            successfulCalls: successfulCalls.length,
            failedCalls: failedCalls.length,
            averageDuration: Math.round(averageDuration),
            totalDuration: totalDuration
        };
    }
    
    /**
     * Print API performance metrics
     */
    public static printAPIPerformance(): void {
        const stats = this.getAPIStats();
        
        console.log('\n📈 ===== API PERFORMANCE METRICS =====');
        console.log(`📊 Total API Calls: ${stats.totalCalls}`);
        console.log(`✅ Successful Calls: ${stats.successfulCalls}`);
        console.log(`❌ Failed Calls: ${stats.failedCalls}`);
        console.log(`📈 Success Rate: ${stats.totalCalls > 0 ? ((stats.successfulCalls / stats.totalCalls) * 100).toFixed(2) : 0}%`);
        console.log(`⏱️  Average Duration: ${stats.averageDuration}ms`);
        console.log(`⏱️  Total Duration: ${stats.totalDuration}ms`);
        console.log('=====================================\n');
    }
}

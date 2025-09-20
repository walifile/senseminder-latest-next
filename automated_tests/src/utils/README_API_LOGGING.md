# API Call Logging System

This system provides comprehensive logging and debugging capabilities for all API calls made during test execution.

## Features

### 🔍 **Detailed API Call Logging**
- **Request Details**: Method, URL, headers, parameters, and request body
- **Response Details**: Status code, response data, and timing information
- **Error Handling**: Detailed error information with status codes and error data
- **Security**: Automatic masking of sensitive data (tokens, passwords, etc.)

### ⏱️ **Performance Monitoring**
- **Duration Tracking**: Individual call duration and total execution time
- **Success Rate**: Percentage of successful vs failed calls
- **Performance Metrics**: Average response time and total API time

### 📊 **Summary Reports**
- **Test Summary**: API call summary at the end of each test
- **Detailed Reports**: Comprehensive call-by-call breakdown
- **Performance Analysis**: Statistical analysis of API performance

## Usage

### Automatic Logging
API calls are automatically logged when using the enhanced API pages:
- `ApiBillingPage`
- `ApiCreatePCPage`

### Manual Logging
You can manually trigger API logging in your test steps:

```typescript
import { APITestUtils } from '../utils/apiTestUtils';

// Print detailed API call information
APITestUtils.printAPICallDetails();

// Print API call summary
APITestUtils.printAPISummary();

// Print performance metrics
APITestUtils.printAPIPerformance();
```

### Test Steps
Use these predefined steps in your feature files:

```gherkin
Given I want to see API call details
When I print API call summary
Then I should see API performance metrics
Given I want to debug API calls
```

## Example Output

### Request Logging
```
🚀 ===== API REQUEST =====
📋 Call ID: api_1703123456789_abc123def
⏰ Timestamp: 2023-12-21T10:30:45.123Z
🔗 Method: POST
🌐 URL: https://api.example.com/v1/instances
📋 Headers:
   Content-Type: application/json
   Authorization: Bearer eyJraWQiOiJub2xBNHIxV0N0Nm9OUloxZlBpNUNDaDNoaFpqb2RwRjlvRVwveVAyaVUwcz0i...
📦 Request Body:
{
  "action": "create",
  "configId": "Basic_win11_2core_4gbRam",
  "systemName": "TestPC-123",
  "region": "us-east-1",
  "storageSize": 120,
  "billingPlan": "hourly"
}
========================
```

### Response Logging
```
✅ ===== API RESPONSE =====
📋 Call ID: api_1703123456789_abc123def
⏰ Timestamp: 2023-12-21T10:30:47.456Z
⏱️  Duration: 2333ms
📊 Status Code: 201
📦 Response Data:
{
  "instanceId": "i-1234567890abcdef0",
  "systemName": "TestPC-123",
  "status": "pending",
  "message": "Instance creation initiated"
}
==========================
```

### Error Logging
```
❌ ===== API ERROR =====
📋 Call ID: api_1703123456789_abc123def
⏰ Timestamp: 2023-12-21T10:30:47.456Z
⏱️  Duration: 1500ms
🚨 Error Message: Request failed with status code 400
📊 Status Code: 400
📝 Status Text: Bad Request
📦 Error Response Data:
{
  "error": "Invalid configuration",
  "message": "The specified configId is not valid"
}
========================
```

### Summary Report
```
📊 ===== API CALLS SUMMARY =====
📈 Total API Calls: 5
✅ Successful Calls: 4
❌ Failed Calls: 1
⏱️  Average Duration: 1250ms
⏱️  Total Duration: 6250ms

📋 Detailed Call List:
1. ✅ POST https://api.example.com/v1/instances - 2333ms
2. ✅ GET https://api.example.com/v1/instances/i-1234567890abcdef0 - 850ms
3. ❌ POST https://api.example.com/v1/instances/i-1234567890abcdef0/start - 1500ms
4. ✅ GET https://api.example.com/v1/instances/i-1234567890abcdef0 - 1200ms
5. ✅ DELETE https://api.example.com/v1/instances/i-1234567890abcdef0 - 367ms
================================
```

## Configuration

### Sensitive Data Masking
The system automatically masks sensitive data in headers and request bodies:
- `authorization`
- `token`
- `apikey`
- `password`
- `secret`
- `key`

### Timeout Configuration
API calls respect the timeout settings from your test configuration:
- Default timeout: 30 seconds
- Configurable per API call

## Integration

### With Test Hooks
API call summaries are automatically printed at the end of each test in the main After hook.

### With Existing API Pages
The enhanced logging is integrated into:
- `ApiBillingPage` - All billing-related API calls
- `ApiCreatePCPage` - All PC management API calls

### With Custom API Calls
For custom API calls, use the `apiLogger` directly:

```typescript
import { apiLogger } from '../utils/apiLogger';

// Log request
const callId = apiLogger.logRequest(config);

// Log response
apiLogger.logResponse(callId, response);

// Log error
apiLogger.logError(callId, error);
```

## Benefits

1. **Debugging**: Easy identification of API call issues
2. **Performance**: Monitor API response times and identify bottlenecks
3. **Reliability**: Track success rates and error patterns
4. **Security**: Automatic masking of sensitive information
5. **Documentation**: Comprehensive logs for test analysis

## Troubleshooting

### No API Calls Logged
- Ensure you're using the enhanced API pages
- Check that the API logger is properly imported
- Verify that API calls are being made through the configured axios instance

### Sensitive Data Not Masked
- Add additional sensitive key patterns to the `maskSensitiveData` method
- Check that the data is in the expected format

### Performance Issues
- Monitor the `averageDuration` metric
- Check for API calls with unusually long response times
- Review error rates to identify problematic endpoints

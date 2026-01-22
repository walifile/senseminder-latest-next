# Retry Failed Tests Script for PowerShell
# Usage: .\retry-failed-tests.ps1 -ReportPath <path> -TestCommand <command>

param(
    [Parameter(Mandatory=$true)]
    [string]$ReportPath,
    
    [Parameter(Mandatory=$true)]
    [string]$TestCommand
)

Write-Host "🚀 Starting retry process for failed test scenarios..." -ForegroundColor Green
Write-Host "📄 Report path: $ReportPath" -ForegroundColor Blue
Write-Host "🔧 Test command: $TestCommand" -ForegroundColor Blue
Write-Host ""

try {
    node scripts/retry-failed-tests.js $ReportPath $TestCommand
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ All tests passed after retries!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "❌ Some tests are still failing after retries." -ForegroundColor Red
    }
} catch {
    Write-Host "💥 Error running retry script: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

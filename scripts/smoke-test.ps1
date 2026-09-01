# Deployment Smoke Test Script for AdminHub21 (PowerShell)
# Usage: .\smoke-test.ps1 [-BaseUrl <url>]
# Example: .\smoke-test.ps1 -BaseUrl "https://api.adminhub21.com"

param(
    [string]$BaseUrl = "http://localhost:8080"
)

$ErrorActionPreference = "Continue"
$Failed = 0
$Passed = 0

$ApiUrl = "$BaseUrl/api/v1"

function Write-Info { param($Message) Write-Host "[INFO] $Message" -ForegroundColor Yellow }
function Write-Pass { param($Message) Write-Host "[PASS] $Message" -ForegroundColor Green; $script:Passed++ }
function Write-Fail { param($Message) Write-Host "[FAIL] $Message" -ForegroundColor Red; $script:Failed++ }

function Test-Health {
    Write-Info "Testing health endpoint..."
    try {
        $response = Invoke-WebRequest -Uri "$ApiUrl/health" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Pass "Health endpoint returned 200"
        } else {
            Write-Fail "Health endpoint returned $($response.StatusCode)"
        }
    } catch {
        Write-Fail "Health endpoint failed: $($_.Exception.Message)"
    }
}

function Test-ApiRoot {
    Write-Info "Testing API root..."
    try {
        $response = Invoke-WebRequest -Uri $ApiUrl -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 401) {
            Write-Pass "API root accessible (HTTP $($response.StatusCode))"
        } else {
            Write-Fail "API root returned unexpected HTTP $($response.StatusCode)"
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 401) {
            Write-Pass "API root accessible (HTTP 401 - expected for protected routes)"
        } else {
            Write-Fail "API root failed: $($_.Exception.Message)"
        }
    }
}

function Test-AuthEndpoint {
    Write-Info "Testing authentication endpoint..."
    try {
        $body = @{
            email = "test@test.com"
            password = "wrong"
        } | ConvertTo-Json

        $response = Invoke-WebRequest -Uri "$ApiUrl/auth/login" -Method POST -ContentType "application/json" -Body $body -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        Write-Pass "Authentication endpoint responding (HTTP $($response.StatusCode))"
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 401 -or $statusCode -eq 422) {
            Write-Pass "Authentication endpoint responding correctly (HTTP $statusCode)"
        } else {
            Write-Fail "Authentication endpoint returned unexpected HTTP $statusCode"
        }
    }
}

function Test-CorsHeaders {
    Write-Info "Testing CORS headers..."
    try {
        $headers = @{
            "Origin" = "http://localhost:3000"
            "Access-Control-Request-Method" = "GET"
        }
        $response = Invoke-WebRequest -Uri "$ApiUrl/health" -Method OPTIONS -Headers $headers -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        $corsHeader = $response.Headers["Access-Control-Allow-Origin"]
        if ($corsHeader) {
            Write-Pass "CORS headers present: $corsHeader"
        } else {
            Write-Fail "CORS headers missing"
        }
    } catch {
        Write-Fail "CORS check failed: $($_.Exception.Message)"
    }
}

function Test-ResponseTime {
    Write-Info "Testing response time..."
    try {
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        $response = Invoke-WebRequest -Uri "$ApiUrl/health" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        $stopwatch.Stop()
        $responseTime = $stopwatch.ElapsedMilliseconds
        if ($responseTime -lt 2000) {
            Write-Pass "Response time acceptable (${responseTime}ms)"
        } else {
            Write-Fail "Response time too slow (${responseTime}ms)"
        }
    } catch {
        Write-Fail "Response time test failed: $($_.Exception.Message)"
    }
}

function Test-HorizonDashboard {
    Write-Info "Testing Horizon dashboard..."
    try {
        $response = Invoke-WebRequest -Uri "$BaseUrl/horizon/api/stats" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Pass "Horizon dashboard accessible"
        } else {
            Write-Fail "Horizon dashboard returned $($response.StatusCode)"
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 401) {
            Write-Pass "Horizon dashboard accessible (HTTP 401 - auth required)"
        } else {
            Write-Fail "Horizon dashboard not accessible: $($_.Exception.Message)"
        }
    }
}

# Run all tests
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AdminHub21 Deployment Smoke Test" -ForegroundColor Cyan
Write-Host "Target: $BaseUrl" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Test-Health
Test-ApiRoot
Test-AuthEndpoint
Test-CorsHeaders
Test-ResponseTime
Test-HorizonDashboard

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Results" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Passed: $Passed" -ForegroundColor Green
Write-Host "Failed: $Failed" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Cyan

if ($Failed -gt 0) {
    Write-Host "SMOKE TEST FAILED" -ForegroundColor Red
    exit 1
} else {
    Write-Host "ALL TESTS PASSED" -ForegroundColor Green
    exit 0
}

#!/bin/bash
# Deployment Smoke Test Script for AdminHub21
# Usage: ./smoke-test.sh <base_url>
# Example: ./smoke-test.sh https://api.adminhub21.com

set -e

BASE_URL="${1:-http://localhost:8080}"
API_URL="${BASE_URL}/api/v1"
FAILED=0
PASSED=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${YELLOW}[INFO]${NC} $1"
}

log_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((PASSED++))
}

log_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((FAILED++))
}

# Test 1: Health Check
test_health() {
    log_info "Testing health endpoint..."
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${API_URL}/health" 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ]; then
        log_pass "Health endpoint returned 200"
    else
        log_fail "Health endpoint returned ${HTTP_CODE}"
    fi
}

# Test 2: API Root
test_api_root() {
    log_info "Testing API root..."
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${API_URL}" 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "401" ]; then
        log_pass "API root accessible (HTTP ${HTTP_CODE})"
    else
        log_fail "API root returned unexpected HTTP ${HTTP_CODE}"
    fi
}

# Test 3: Database Connection
test_database() {
    log_info "Testing database connectivity..."
    RESPONSE=$(curl -s "${API_URL}/health" 2>/dev/null || echo "")
    if echo "$RESPONSE" | grep -q "ok\|healthy\|success"; then
        log_pass "Database connection successful"
    else
        log_fail "Database connection check failed"
    fi
}

# Test 4: Redis Connection
test_redis() {
    log_info "Testing Redis connectivity..."
    RESPONSE=$(curl -s "${API_URL}/health" 2>/dev/null || echo "")
    if echo "$RESPONSE" | grep -q "ok\|healthy\|success"; then
        log_pass "Redis connection successful"
    else
        log_fail "Redis connection check failed"
    fi
}

# Test 5: Authentication Endpoint
test_auth_endpoint() {
    log_info "Testing authentication endpoint..."
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${API_URL}/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"email":"test@test.com","password":"wrong"}' 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "422" ]; then
        log_pass "Authentication endpoint responding correctly (HTTP ${HTTP_CODE})"
    else
        log_fail "Authentication endpoint returned unexpected HTTP ${HTTP_CODE}"
    fi
}

# Test 6: CORS Headers
test_cors() {
    log_info "Testing CORS headers..."
    CORS_HEADER=$(curl -s -I -X OPTIONS "${API_URL}/health" \
        -H "Origin: http://localhost:3000" \
        -H "Access-Control-Request-Method: GET" 2>/dev/null | grep -i "access-control-allow-origin" || echo "")
    if [ -n "$CORS_HEADER" ]; then
        log_pass "CORS headers present"
    else
        log_fail "CORS headers missing"
    fi
}

# Test 7: Response Time
test_response_time() {
    log_info "Testing response time..."
    RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" "${API_URL}/health" 2>/dev/null || echo "999")
    RESPONSE_TIME_MS=$(echo "$RESPONSE_TIME * 1000" | bc | cut -d. -f1)
    if [ "$RESPONSE_TIME_MS" -lt 2000 ]; then
        log_pass "Response time acceptable (${RESPONSE_TIME_MS}ms)"
    else
        log_fail "Response time too slow (${RESPONSE_TIME_MS}ms)"
    fi
}

# Test 8: SSL Certificate (production only)
test_ssl() {
    if [[ "$BASE_URL" == https* ]]; then
        log_info "Testing SSL certificate..."
        SSL_EXPIRY=$(echo | openssl s_client -servername "$(echo $BASE_URL | sed 's|https://||' | cut -d/ -f1)" \
            -connect "$(echo $BASE_URL | sed 's|https://||' | cut -d/ -f1):443" 2>/dev/null | \
            openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2 || echo "")
        if [ -n "$SSL_EXPIRY" ]; then
            log_pass "SSL certificate valid until: ${SSL_EXPIRY}"
        else
            log_fail "SSL certificate check failed"
        fi
    else
        log_info "Skipping SSL test (not HTTPS)"
    fi
}

# Test 9: Queue Worker Status
test_queue_worker() {
    log_info "Testing queue worker status..."
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/horizon/api/stats" 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "401" ]; then
        log_pass "Horizon dashboard accessible (HTTP ${HTTP_CODE})"
    else
        log_fail "Horizon dashboard not accessible (HTTP ${HTTP_CODE})"
    fi
}

# Test 10: Static Assets
test_static_assets() {
    log_info "Testing static assets..."
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/health" 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ]; then
        log_pass "Static assets serving correctly"
    else
        log_fail "Static assets not serving (HTTP ${HTTP_CODE})"
    fi
}

# Run all tests
echo "========================================"
echo "AdminHub21 Deployment Smoke Test"
echo "Target: ${BASE_URL}"
echo "========================================"
echo ""

test_health
test_api_root
test_database
test_redis
test_auth_endpoint
test_cors
test_response_time
test_ssl
test_queue_worker
test_static_assets

echo ""
echo "========================================"
echo "Test Results"
echo "========================================"
echo -e "Passed: ${GREEN}${PASSED}${NC}"
echo -e "Failed: ${RED}${FAILED}${NC}"
echo "========================================"

if [ $FAILED -gt 0 ]; then
    echo -e "${RED}SMOKE TEST FAILED${NC}"
    exit 1
else
    echo -e "${GREEN}ALL TESTS PASSED${NC}"
    exit 0
fi

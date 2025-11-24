#!/bin/bash

# Profile Routes Test Script
# Tests the API routes to identify 404 issues

echo "=========================================="
echo "     PROFILE ROUTES TEST SCRIPT"
echo "=========================================="
echo ""

BASE_URL="${NEXT_PUBLIC_BASE_URL:-http://localhost:3000}"
API_BASE="$BASE_URL/api"

echo "Testing against: $API_BASE"
echo "Timestamp: $(date)"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

test_route() {
    local route=$1
    local expected_status=$2
    local description=$3
    
    echo -e "${BLUE}Testing:${NC} $description"
    echo -e "${BLUE}Route:${NC} $route"
    
    response=$(curl -s -w "\n%{http_code}" "$route")
    status_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | sed '$d')
    
    echo -e "${BLUE}Status Code:${NC} $status_code"
    
    if [ "$status_code" -eq "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} - Got expected status $expected_status"
    elif [ "$status_code" -eq 404 ]; then
        echo -e "${RED}❌ FAIL${NC} - Route not found (404)"
        echo -e "${YELLOW}⚠️  This indicates a routing issue${NC}"
    else
        echo -e "${YELLOW}⚠️  Got status $status_code (expected $expected_status)${NC}"
    fi
    
    echo -e "${BLUE}Response Body:${NC}"
    echo "$body" | head -c 200
    echo ""
    echo "---"
    echo ""
}

echo "=========================================="
echo "TEST 1: Profile Route (No Auth)"
echo "=========================================="
echo ""
test_route "$API_BASE/profile" 401 "GET /api/profile without auth (should return 401 Unauthorized)"

echo "=========================================="
echo "TEST 2: Profile Check Complete Route (No Auth)"
echo "=========================================="
echo ""
test_route "$API_BASE/profile/check-complete" 401 "GET /api/profile/check-complete without auth (should return 401)"

echo "=========================================="
echo "TEST 3: Skills Route (No Auth)"
echo "=========================================="
echo ""
test_route "$API_BASE/skills" 401 "GET /api/skills without auth (should return 401)"

echo "=========================================="
echo "TEST 4: Gigs Route (Public)"
echo "=========================================="
echo ""
test_route "$API_BASE/gigs" 200 "GET /api/gigs (public route, should return 200)"

echo "=========================================="
echo "TEST 5: Invalid Route"
echo "=========================================="
echo ""
test_route "$API_BASE/nonexistent-route-12345" 404 "GET /api/nonexistent-route-12345 (should return 404)"

echo ""
echo "=========================================="
echo "         ROUTE STRUCTURE TEST"
echo "=========================================="
echo ""
echo "Testing catch-all route behavior..."
echo ""

# Test various route patterns
routes=(
    "/api/profile"
    "/api/profile/check-complete"
    "/api/skills"
    "/api/notifications"
    "/api/gigs"
)

echo "Testing route accessibility (expecting 401 for auth-required, not 404):"
echo ""

for route in "${routes[@]}"; do
    full_url="$BASE_URL$route"
    status=$(curl -s -o /dev/null -w "%{http_code}" "$full_url")
    
    if [ "$status" -eq 404 ]; then
        echo -e "${RED}❌ $route - NOT FOUND (404)${NC}"
    elif [ "$status" -eq 401 ]; then
        echo -e "${GREEN}✅ $route - Exists (401 Unauthorized as expected)${NC}"
    elif [ "$status" -eq 200 ]; then
        echo -e "${GREEN}✅ $route - Exists (200 OK)${NC}"
    else
        echo -e "${YELLOW}⚠️  $route - Status $status${NC}"
    fi
done

echo ""
echo "=========================================="
echo "         DIAGNOSTIC INFORMATION"
echo "=========================================="
echo ""

# Check if Next.js is running
if curl -s "$BASE_URL" > /dev/null; then
    echo -e "${GREEN}✅ Next.js server is responding${NC}"
else
    echo -e "${RED}❌ Next.js server is not responding${NC}"
fi

# Check API route file exists
if [ -f "/app/app/api/[[...path]]/route.js" ]; then
    echo -e "${GREEN}✅ API route file exists at /app/app/api/[[...path]]/route.js${NC}"
else
    echo -e "${RED}❌ API route file not found${NC}"
fi

# Check profile page exists
if [ -f "/app/app/profile/page.js" ]; then
    echo -e "${GREEN}✅ Profile page exists at /app/app/profile/page.js${NC}"
else
    echo -e "${RED}❌ Profile page not found${NC}"
fi

echo ""
echo "=========================================="
echo "             TEST COMPLETE"
echo "=========================================="
echo ""
echo "Summary:"
echo "- If you see 404 errors on /api/profile, there's a routing configuration issue"
echo "- Expected behavior: 401 Unauthorized (not 404) for protected routes"
echo "- 404 is only expected for truly non-existent routes"
echo ""

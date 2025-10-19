#!/bin/bash

# ChequeSaathi Authentication API Tests
# This script tests all authentication endpoints with various scenarios

BASE_URL="http://localhost:5001/api/auth"
COOKIES_FILE="test_cookies.txt"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASS=0
FAIL=0

# Clean up cookies file
rm -f $COOKIES_FILE

echo "========================================="
echo "  ChequeSaathi Authentication API Tests"
echo "========================================="
echo ""

# Helper function to print test results
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}: $2"
        ((PASS++))
    else
        echo -e "${RED}✗ FAIL${NC}: $2"
        ((FAIL++))
    fi
}

# Test 0: Cleanup - Delete test user if exists (to make test idempotent)
echo -e "${YELLOW}Test 0: Cleanup (Deleting test user if exists)${NC}"
# Try to login and delete the user if exists
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -c $COOKIES_FILE \
  -d '{
    "email": "testuser@example.com",
    "password": "password123"
  }')

if echo "$LOGIN_RESPONSE" | grep -q "Login successful"; then
    echo "Test user exists from previous run - this is expected"
else
    echo "Test user doesn't exist - starting fresh"
fi
rm -f $COOKIES_FILE
echo ""

# Test 1: Health Check
echo -e "${YELLOW}Test 1: Health Check${NC}"
RESPONSE=$(curl -s http://localhost:5001/health)
if echo "$RESPONSE" | grep -q "ChequeSaathi API is running"; then
    print_result 0 "Health check endpoint responds correctly"
else
    print_result 1 "Health check endpoint failed"
fi
echo ""

# Test 2: Register with valid data (using unique email each time)
echo -e "${YELLOW}Test 2: Register New User (Valid Data)${NC}"
TIMESTAMP=$(date +%s)
TEST_EMAIL="testuser${TIMESTAMP}@example.com"
RESPONSE=$(curl -s -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" \
  -c $COOKIES_FILE \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"password123\",
    \"name\": \"Test User\"
  }")

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q "User registered successfully"; then
    print_result 0 "User registration successful"
else
    print_result 1 "User registration failed"
fi
echo ""

# Test 3: Register with missing fields
echo -e "${YELLOW}Test 3: Register with Missing Fields${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "incomplete@example.com",
    "password": "password123"
  }')

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q "required"; then
    print_result 0 "Missing fields validation works"
else
    print_result 1 "Missing fields validation failed"
fi
echo ""

# Test 4: Register with duplicate email
echo -e "${YELLOW}Test 4: Register with Duplicate Email${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "password456",
    "name": "Another User"
  }')

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q "already exists"; then
    print_result 0 "Duplicate email validation works"
else
    print_result 1 "Duplicate email validation failed"
fi
echo ""

# Test 5: Login with valid credentials (using the newly created user)
echo -e "${YELLOW}Test 5: Login with Valid Credentials${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -c $COOKIES_FILE \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"password123\"
  }")

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q "Login successful"; then
    print_result 0 "Login successful with valid credentials"
else
    print_result 1 "Login failed with valid credentials"
fi
echo ""

# Test 6: Login with invalid password
echo -e "${YELLOW}Test 6: Login with Invalid Password${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"wrongpassword\"
  }")

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q "Invalid"; then
    print_result 0 "Invalid password rejected correctly"
else
    print_result 1 "Invalid password not rejected"
fi
echo ""

# Test 7: Login with non-existent email
echo -e "${YELLOW}Test 7: Login with Non-existent Email${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@example.com",
    "password": "password123"
  }')

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q "Invalid"; then
    print_result 0 "Non-existent email rejected correctly"
else
    print_result 1 "Non-existent email not rejected"
fi
echo ""

# Test 8: Access protected route with valid token
echo -e "${YELLOW}Test 8: Access /me Endpoint (With Valid Token)${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL/me" \
  -b $COOKIES_FILE)

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q "${TEST_EMAIL}"; then
    print_result 0 "Protected route accessible with valid token"
else
    print_result 1 "Protected route failed with valid token"
fi
echo ""

# Test 9: Access protected route without token
echo -e "${YELLOW}Test 9: Access /me Endpoint (Without Token)${NC}"
rm -f $COOKIES_FILE  # Remove cookies
RESPONSE=$(curl -s -X GET "$BASE_URL/me")

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q "Authentication"; then
    print_result 0 "Protected route blocked without token"
else
    print_result 1 "Protected route not blocked without token"
fi
echo ""

# Test 10: Logout
echo -e "${YELLOW}Test 10: Logout${NC}"
# Login again first
curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -c $COOKIES_FILE \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"password123\"
  }" > /dev/null

RESPONSE=$(curl -s -X POST "$BASE_URL/logout" \
  -b $COOKIES_FILE \
  -c $COOKIES_FILE)

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q "Logout successful"; then
    print_result 0 "Logout successful"
else
    print_result 1 "Logout failed"
fi
echo ""

# Test 11: Access protected route after logout
echo -e "${YELLOW}Test 11: Access /me After Logout${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL/me" \
  -b $COOKIES_FILE)

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q "Authentication"; then
    print_result 0 "Token invalidated after logout"
else
    print_result 1 "Token not invalidated after logout"
fi
echo ""

# Clean up
rm -f $COOKIES_FILE

# Summary
echo "========================================="
echo "  Test Summary"
echo "========================================="
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${RED}Failed: $FAIL${NC}"
echo "Total: $((PASS + FAIL))"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}All tests passed! ✓${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed! ✗${NC}"
    exit 1
fi

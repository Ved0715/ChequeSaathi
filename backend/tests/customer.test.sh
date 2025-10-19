#!/bin/bash

# ChequeSaathi Customer API Tests

BASE_URL="http://localhost:5001/api"
COOKIES_FILE="test_cookies.txt"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASS=0
FAIL=0

print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}: $2"
        ((PASS++))
    else
        echo -e "${RED}✗ FAIL${NC}: $2"
        ((FAIL++))
    fi
}

rm -f $COOKIES_FILE

echo "========================================="
echo "  ChequeSaathi Customer API Tests"
echo "========================================="
echo ""

# Step 1: Login first to get authentication
echo -e "${YELLOW}Step 1: Login to get authentication${NC}"
TIMESTAMP=$(date +%s)
TEST_EMAIL="custtest${TIMESTAMP}@example.com"

# Register test user
curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -c $COOKIES_FILE \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"password123\",
    \"name\": \"Customer Test User\"
  }" > /dev/null

echo "Logged in as ${TEST_EMAIL}"
echo ""

# Test 1: Create Customer
echo -e "${YELLOW}Test 1: Create Customer (Valid Data)${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/customers" \
  -H "Content-Type: application/json" \
  -b $COOKIES_FILE \
  -d "{
    \"name\": \"John Doe\",
    \"phone\": \"9876543210\",
    \"email\": \"john@example.com\",
    \"businessName\": \"John's Business\",
    \"address\": \"123 Main St\",
    \"notes\": \"VIP Customer\"
  }")

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q "Customer created successfully"; then
    print_result 0 "Customer created successfully"
    CUSTOMER_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "Customer ID: $CUSTOMER_ID"
else
    print_result 1 "Customer creation failed"
fi
echo ""

# Test 2: Create Customer with Duplicate Phone
echo -e "${YELLOW}Test 2: Create Customer with Duplicate Phone${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/customers" \
  -H "Content-Type: application/json" \
  -b $COOKIES_FILE \
  -d "{
    \"name\": \"Jane Doe\",
    \"phone\": \"9876543210\",
    \"email\": \"jane@example.com\"
  }")

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q "phone number already exists"; then
    print_result 0 "Duplicate phone rejected"
else
    print_result 1 "Duplicate phone not rejected"
fi
echo ""

# Test 3: Create Customer with Duplicate Email
echo -e "${YELLOW}Test 3: Create Customer with Duplicate Email${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/customers" \
  -H "Content-Type: application/json" \
  -b $COOKIES_FILE \
  -d "{
    \"name\": \"Jane Doe\",
    \"phone\": \"1234567890\",
    \"email\": \"john@example.com\"
  }")

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q "email already exists"; then
    print_result 0 "Duplicate email rejected"
else
    print_result 1 "Duplicate email not rejected"
fi
echo ""

# Test 4: Get All Customers
echo -e "${YELLOW}Test 4: Get All Customers${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL/customers" \
  -b $COOKIES_FILE)

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q "customers"; then
    print_result 0 "Get all customers successful"
else
    print_result 1 "Get all customers failed"
fi
echo ""

# Test 5: Get Customer by ID
if [ -n "$CUSTOMER_ID" ]; then
    echo -e "${YELLOW}Test 5: Get Customer by ID${NC}"
    RESPONSE=$(curl -s -X GET "$BASE_URL/customers/${CUSTOMER_ID}" \
      -b $COOKIES_FILE)

    echo "Response: $RESPONSE"

    if echo "$RESPONSE" | grep -q "John Doe"; then
        print_result 0 "Get customer by ID successful"
    else
        print_result 1 "Get customer by ID failed"
    fi
    echo ""
fi

# Test 6: Update Customer
if [ -n "$CUSTOMER_ID" ]; then
    echo -e "${YELLOW}Test 6: Update Customer${NC}"
    RESPONSE=$(curl -s -X PATCH "$BASE_URL/customers/${CUSTOMER_ID}" \
      -H "Content-Type: application/json" \
      -b $COOKIES_FILE \
      -d "{
        \"name\": \"John Doe Updated\",
        \"notes\": \"Updated VIP Customer\"
      }")

    echo "Response: $RESPONSE"

    if echo "$RESPONSE" | grep -q "Customer updated successfully"; then
        print_result 0 "Customer updated successfully"
    else
        print_result 1 "Customer update failed"
    fi
    echo ""
fi

# Test 7: Search Customers
echo -e "${YELLOW}Test 7: Search Customers${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL/customers?search=John" \
  -b $COOKIES_FILE)

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q "John"; then
    print_result 0 "Search customers successful"
else
    print_result 1 "Search customers failed"
fi
echo ""

# Test 8: Delete Customer
if [ -n "$CUSTOMER_ID" ]; then
    echo -e "${YELLOW}Test 8: Delete Customer (Soft Delete)${NC}"
    RESPONSE=$(curl -s -X DELETE "$BASE_URL/customers/${CUSTOMER_ID}" \
      -b $COOKIES_FILE)

    echo "Response: $RESPONSE"

    if echo "$RESPONSE" | grep -q "Customer deleted successfully"; then
        print_result 0 "Customer deleted successfully"
    else
        print_result 1 "Customer deletion failed"
    fi
    echo ""
fi

# Test 9: Try to Get Deleted Customer
if [ -n "$CUSTOMER_ID" ]; then
    echo -e "${YELLOW}Test 9: Try to Access Deleted Customer${NC}"
    RESPONSE=$(curl -s -X GET "$BASE_URL/customers/${CUSTOMER_ID}" \
      -b $COOKIES_FILE)

    echo "Response: $RESPONSE"

    if echo "$RESPONSE" | grep -q "Customer not found"; then
        print_result 0 "Deleted customer not accessible"
    else
        print_result 1 "Deleted customer still accessible"
    fi
    echo ""
fi

# Test 10: Create Customer without Authentication
echo -e "${YELLOW}Test 10: Create Customer without Auth${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/customers" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Unauthorized User\",
    \"phone\": \"0000000000\",
    \"email\": \"unauth@example.com\"
  }")

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q "Authentication"; then
    print_result 0 "Unauthorized request blocked"
else
    print_result 1 "Unauthorized request not blocked"
fi
echo ""

# Cleanup
rm -f $COOKIES_FILE

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

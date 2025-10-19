#!/bin/bash

# ChequeSaathi Dashboard API Tests

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
echo "  ChequeSaathi Dashboard API Tests"
echo "========================================="
echo ""

# Setup: Login and Create Test Data
echo -e "${YELLOW}Setup: Creating Test Data${NC}"
TIMESTAMP=$(date +%s)
TEST_EMAIL="dashtest${TIMESTAMP}@example.com"

# Register and login
curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -c $COOKIES_FILE \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"password123\",
    \"name\": \"Dashboard Test User\"
  }" > /dev/null

# Create test customer 1
PHONE_NUMBER_1="${TIMESTAMP: -10}"
CUSTOMER_RESPONSE_1=$(curl -s -X POST "$BASE_URL/customers" \
  -H "Content-Type: application/json" \
  -b $COOKIES_FILE \
  -d "{
    \"name\": \"Customer One\",
    \"phone\": \"${PHONE_NUMBER_1}\",
    \"email\": \"cust1_${TIMESTAMP}@example.com\",
    \"businessName\": \"Business One\"
  }")

CUSTOMER_ID_1=$(echo "$CUSTOMER_RESPONSE_1" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

# Create test customer 2
PHONE_NUMBER_2="99${TIMESTAMP: -8}"
CUSTOMER_RESPONSE_2=$(curl -s -X POST "$BASE_URL/customers" \
  -H "Content-Type: application/json" \
  -b $COOKIES_FILE \
  -d "{
    \"name\": \"Customer Two\",
    \"phone\": \"${PHONE_NUMBER_2}\",
    \"email\": \"cust2_${TIMESTAMP}@example.com\",
    \"businessName\": \"Business Two\"
  }")

CUSTOMER_ID_2=$(echo "$CUSTOMER_RESPONSE_2" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$CUSTOMER_ID_1" ] || [ -z "$CUSTOMER_ID_2" ]; then
    echo "ERROR: Failed to create customers. Stopping tests."
    rm -f $COOKIES_FILE
    exit 1
fi

echo "Customer 1 ID: $CUSTOMER_ID_1"
echo "Customer 2 ID: $CUSTOMER_ID_2"

# Create cheques with different statuses
# Cheque 1 - RECEIVED (due today)
TODAY=$(date +%Y-%m-%d)
curl -s -X POST "$BASE_URL/cheques" \
  -H "Content-Type: application/json" \
  -b $COOKIES_FILE \
  -d "{
    \"customerId\": \"${CUSTOMER_ID_1}\",
    \"chequeNumber\": \"CHQ001\",
    \"amount\": 10000,
    \"bankName\": \"HDFC Bank\",
    \"chequeType\": \"POST_DATED\",
    \"direction\": \"RECEIVABLE\",
    \"drawerName\": \"Customer One\",
    \"payeeName\": \"Test Business\",
    \"issueDate\": \"2024-01-01\",
    \"dueDate\": \"${TODAY}\"
  }" > /dev/null

# Cheque 2 - DEPOSITED
CHEQUE_2_RESPONSE=$(curl -s -X POST "$BASE_URL/cheques" \
  -H "Content-Type: application/json" \
  -b $COOKIES_FILE \
  -d "{
    \"customerId\": \"${CUSTOMER_ID_1}\",
    \"chequeNumber\": \"CHQ002\",
    \"amount\": 20000,
    \"bankName\": \"ICICI Bank\",
    \"chequeType\": \"AT_SIGHT\",
    \"direction\": \"RECEIVABLE\",
    \"drawerName\": \"Customer One\",
    \"payeeName\": \"Test Business\",
    \"issueDate\": \"2024-01-05\",
    \"dueDate\": \"2024-02-05\"
  }")

CHEQUE_2_ID=$(echo "$CHEQUE_2_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

# Update cheque 2 to DEPOSITED status
if [ -n "$CHEQUE_2_ID" ]; then
    curl -s -X PATCH "$BASE_URL/cheques/${CHEQUE_2_ID}/status" \
      -H "Content-Type: application/json" \
      -b $COOKIES_FILE \
      -d "{
        \"status\": \"DEPOSITED\",
        \"depositDate\": \"${TODAY}\"
      }" > /dev/null
fi

# Cheque 3 - CLEARED
CHEQUE_3_RESPONSE=$(curl -s -X POST "$BASE_URL/cheques" \
  -H "Content-Type: application/json" \
  -b $COOKIES_FILE \
  -d "{
    \"customerId\": \"${CUSTOMER_ID_2}\",
    \"chequeNumber\": \"CHQ003\",
    \"amount\": 15000,
    \"bankName\": \"SBI\",
    \"chequeType\": \"POST_DATED\",
    \"direction\": \"RECEIVABLE\",
    \"drawerName\": \"Customer Two\",
    \"payeeName\": \"Test Business\",
    \"issueDate\": \"2024-01-10\",
    \"dueDate\": \"2024-01-20\"
  }")

CHEQUE_3_ID=$(echo "$CHEQUE_3_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

# Update cheque 3 to CLEARED status
if [ -n "$CHEQUE_3_ID" ]; then
    curl -s -X PATCH "$BASE_URL/cheques/${CHEQUE_3_ID}/status" \
      -H "Content-Type: application/json" \
      -b $COOKIES_FILE \
      -d "{
        \"status\": \"CLEARED\",
        \"clearedDate\": \"${TODAY}\"
      }" > /dev/null
fi

# Create transactions
curl -s -X POST "$BASE_URL/transactions" \
  -H "Content-Type: application/json" \
  -b $COOKIES_FILE \
  -d "{
    \"customerId\": \"${CUSTOMER_ID_1}\",
    \"amount\": 5000,
    \"type\": \"CREDIT\",
    \"method\": \"UPI\",
    \"date\": \"${TODAY}\"
  }" > /dev/null

curl -s -X POST "$BASE_URL/transactions" \
  -H "Content-Type: application/json" \
  -b $COOKIES_FILE \
  -d "{
    \"customerId\": \"${CUSTOMER_ID_2}\",
    \"amount\": 3000,
    \"type\": \"DEBIT\",
    \"method\": \"CASH\",
    \"date\": \"${TODAY}\"
  }" > /dev/null

echo "Test data created successfully"
echo ""

# Test 1: Get Dashboard Stats
echo -e "${YELLOW}Test 1: Get Dashboard Stats${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL/dashboard/stats" \
  -b $COOKIES_FILE)

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q "todaysDeposits"; then
    print_result 0 "Get dashboard stats successful"
else
    print_result 1 "Get dashboard stats failed"
fi
echo ""

# Test 2: Verify Today's Deposits
echo -e "${YELLOW}Test 2: Verify Today's Deposits Data${NC}"

if echo "$RESPONSE" | grep -q "pendingClearances"; then
    print_result 0 "Pending clearances data present"
else
    print_result 1 "Pending clearances data missing"
fi
echo ""

# Test 3: Verify Status Breakdown
echo -e "${YELLOW}Test 3: Verify Status Breakdown${NC}"

if echo "$RESPONSE" | grep -q "statusBreakdown"; then
    print_result 0 "Status breakdown data present"
else
    print_result 1 "Status breakdown data missing"
fi
echo ""

# Test 4: Verify Total Amounts
echo -e "${YELLOW}Test 4: Verify Total Amounts${NC}"

if echo "$RESPONSE" | grep -q "totalAmounts"; then
    print_result 0 "Total amounts data present"
else
    print_result 1 "Total amounts data missing"
fi
echo ""

# Test 5: Verify Cash Flow
echo -e "${YELLOW}Test 5: Verify Cash Flow Data${NC}"

if echo "$RESPONSE" | grep -q "cashFlow"; then
    print_result 0 "Cash flow data present"
else
    print_result 1 "Cash flow data missing"
fi
echo ""

# Test 6: Get Customer-wise Summary
echo -e "${YELLOW}Test 6: Get Customer-wise Summary${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL/dashboard/customer-summary" \
  -b $COOKIES_FILE)

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q "customers"; then
    print_result 0 "Get customer-wise summary successful"
else
    print_result 1 "Get customer-wise summary failed"
fi
echo ""

# Test 7: Verify Customer Summary Data
echo -e "${YELLOW}Test 7: Verify Customer Summary Has Cheque Data${NC}"

if echo "$RESPONSE" | grep -q "cheques"; then
    print_result 0 "Customer summary has cheque data"
else
    print_result 1 "Customer summary missing cheque data"
fi
echo ""

# Test 8: Verify Customer Summary Has Transaction Data
echo -e "${YELLOW}Test 8: Verify Customer Summary Has Transaction Data${NC}"

if echo "$RESPONSE" | grep -q "transactions"; then
    print_result 0 "Customer summary has transaction data"
else
    print_result 1 "Customer summary missing transaction data"
fi
echo ""

# Test 9: Get Recent Activity
echo -e "${YELLOW}Test 9: Get Recent Activity${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL/dashboard/recent-activity" \
  -b $COOKIES_FILE)

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q "recentCheques"; then
    print_result 0 "Get recent activity successful"
else
    print_result 1 "Get recent activity failed"
fi
echo ""

# Test 10: Verify Recent Activity Has Transactions
echo -e "${YELLOW}Test 10: Verify Recent Activity Has Transactions${NC}"

if echo "$RESPONSE" | grep -q "recentTransactions"; then
    print_result 0 "Recent activity has transactions data"
else
    print_result 1 "Recent activity missing transactions data"
fi
echo ""

# Test 11: Get Recent Activity with Limit
echo -e "${YELLOW}Test 11: Get Recent Activity with Limit${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL/dashboard/recent-activity?limit=5" \
  -b $COOKIES_FILE)

if echo "$RESPONSE" | grep -q "recentCheques"; then
    print_result 0 "Recent activity with limit parameter works"
else
    print_result 1 "Recent activity with limit parameter failed"
fi
echo ""

# Test 12: Dashboard Stats without Authentication
echo -e "${YELLOW}Test 12: Dashboard Stats without Auth${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL/dashboard/stats")

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

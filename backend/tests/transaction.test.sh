#!/bin/bash

# ChequeSaathi Transaction API Tests

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
echo "  ChequeSaathi Transaction API Tests"
echo "========================================="
echo ""

# Step 1: Login and Create Customer
echo -e "${YELLOW}Setup: Login and Create Test Customer${NC}"
TIMESTAMP=$(date +%s)
TEST_EMAIL="txntest${TIMESTAMP}@example.com"

# Register and login
curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -c $COOKIES_FILE \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"password123\",
    \"name\": \"Transaction Test User\"
  }" > /dev/null

# Create test customer with unique phone (10 digits)
PHONE_NUMBER="${TIMESTAMP: -10}"
CUSTOMER_RESPONSE=$(curl -s -X POST "$BASE_URL/customers" \
  -H "Content-Type: application/json" \
  -b $COOKIES_FILE \
  -d "{
    \"name\": \"Test Customer\",
    \"phone\": \"${PHONE_NUMBER}\",
    \"email\": \"testcust${TIMESTAMP}@example.com\",
    \"businessName\": \"Test Business\"
  }")

CUSTOMER_ID=$(echo "$CUSTOMER_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Test Customer ID: $CUSTOMER_ID"

if [ -z "$CUSTOMER_ID" ]; then
    echo "ERROR: Failed to create customer. Stopping tests."
    rm -f $COOKIES_FILE
    exit 1
fi
echo ""

# Test 1: Create Transaction (Valid Data - CREDIT)
echo -e "${YELLOW}Test 1: Create Transaction with Valid Data (CREDIT)${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/transactions" \
  -H "Content-Type: application/json" \
  -b $COOKIES_FILE \
  -d "{
    \"customerId\": \"${CUSTOMER_ID}\",
    \"amount\": 10000,
    \"type\": \"CREDIT\",
    \"method\": \"UPI\",
    \"date\": \"2024-01-15\",
    \"reference\": \"UPI-123456789\",
    \"category\": \"Advance Payment\",
    \"notes\": \"Received advance\"
  }")

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q "Transaction created successfully"; then
    print_result 0 "Transaction created successfully"
    TRANSACTION_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "Transaction ID: $TRANSACTION_ID"
else
    print_result 1 "Transaction creation failed"
fi
echo ""

# Test 2: Create Transaction (DEBIT)
echo -e "${YELLOW}Test 2: Create Transaction with DEBIT type${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/transactions" \
  -H "Content-Type: application/json" \
  -b $COOKIES_FILE \
  -d "{
    \"customerId\": \"${CUSTOMER_ID}\",
    \"amount\": 5000,
    \"type\": \"DEBIT\",
    \"method\": \"CASH\",
    \"date\": \"2024-01-20\"
  }")

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q "Transaction created successfully"; then
    print_result 0 "DEBIT transaction created successfully"
    TRANSACTION_ID_2=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
else
    print_result 1 "DEBIT transaction creation failed"
fi
echo ""

# Test 3: Create Transaction with Invalid Customer ID
echo -e "${YELLOW}Test 3: Create Transaction with Invalid Customer ID${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/transactions" \
  -H "Content-Type: application/json" \
  -b $COOKIES_FILE \
  -d "{
    \"customerId\": \"invalid-customer-id\",
    \"amount\": 1000,
    \"type\": \"CREDIT\",
    \"method\": \"UPI\",
    \"date\": \"2024-01-10\"
  }")

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q "Customer not found"; then
    print_result 0 "Invalid customer rejected"
else
    print_result 1 "Invalid customer not rejected"
fi
echo ""

# Test 4: Get All Transactions
echo -e "${YELLOW}Test 4: Get All Transactions${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL/transactions" \
  -b $COOKIES_FILE)

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q "transactions"; then
    print_result 0 "Get all transactions successful"
else
    print_result 1 "Get all transactions failed"
fi
echo ""

# Test 5: Get Transactions by Customer ID
if [ -n "$CUSTOMER_ID" ]; then
    echo -e "${YELLOW}Test 5: Get Transactions by Customer ID${NC}"
    RESPONSE=$(curl -s -X GET "$BASE_URL/transactions?customerId=${CUSTOMER_ID}" \
      -b $COOKIES_FILE)

    echo "Response: $RESPONSE"

    if echo "$RESPONSE" | grep -q "UPI-123456789"; then
        print_result 0 "Filter by customer ID successful"
    else
        print_result 1 "Filter by customer ID failed"
    fi
    echo ""
fi

# Test 6: Get Transaction by ID
if [ -n "$TRANSACTION_ID" ]; then
    echo -e "${YELLOW}Test 6: Get Transaction by ID${NC}"
    RESPONSE=$(curl -s -X GET "$BASE_URL/transactions/${TRANSACTION_ID}" \
      -b $COOKIES_FILE)

    echo "Response: $RESPONSE"

    if echo "$RESPONSE" | grep -q "UPI-123456789"; then
        print_result 0 "Get transaction by ID successful"
    else
        print_result 1 "Get transaction by ID failed"
    fi
    echo ""
fi

# Test 7: Update Transaction
if [ -n "$TRANSACTION_ID" ]; then
    echo -e "${YELLOW}Test 7: Update Transaction${NC}"
    RESPONSE=$(curl -s -X PATCH "$BASE_URL/transactions/${TRANSACTION_ID}" \
      -H "Content-Type: application/json" \
      -b $COOKIES_FILE \
      -d "{
        \"amount\": 12000,
        \"notes\": \"Updated advance payment\"
      }")

    echo "Response: $RESPONSE"

    if echo "$RESPONSE" | grep -q "Transaction updated successfully"; then
        print_result 0 "Transaction updated successfully"
    else
        print_result 1 "Transaction update failed"
    fi
    echo ""
fi

# Test 8: Filter Transactions by Type
echo -e "${YELLOW}Test 8: Filter Transactions by Type (CREDIT)${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL/transactions?type=CREDIT" \
  -b $COOKIES_FILE)

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q "CREDIT"; then
    print_result 0 "Filter by type successful"
else
    print_result 1 "Filter by type failed"
fi
echo ""

# Test 9: Filter Transactions by Payment Method
echo -e "${YELLOW}Test 9: Filter Transactions by Payment Method (UPI)${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL/transactions?method=UPI" \
  -b $COOKIES_FILE)

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q "UPI"; then
    print_result 0 "Filter by payment method successful"
else
    print_result 1 "Filter by payment method failed"
fi
echo ""

# Test 10: Filter Transactions by Date Range
echo -e "${YELLOW}Test 10: Filter Transactions by Date Range${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL/transactions?startDate=2024-01-01&endDate=2024-01-31" \
  -b $COOKIES_FILE)

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q "transactions"; then
    print_result 0 "Filter by date range successful"
else
    print_result 1 "Filter by date range failed"
fi
echo ""

# Test 11: Delete Transaction
if [ -n "$TRANSACTION_ID" ]; then
    echo -e "${YELLOW}Test 11: Delete Transaction (Soft Delete)${NC}"
    RESPONSE=$(curl -s -X DELETE "$BASE_URL/transactions/${TRANSACTION_ID}" \
      -b $COOKIES_FILE)

    echo "Response: $RESPONSE"

    if echo "$RESPONSE" | grep -q "Transaction deleted successfully"; then
        print_result 0 "Transaction deleted successfully"
    else
        print_result 1 "Transaction deletion failed"
    fi
    echo ""
fi

# Test 12: Try to Access Deleted Transaction
if [ -n "$TRANSACTION_ID" ]; then
    echo -e "${YELLOW}Test 12: Try to Access Deleted Transaction${NC}"
    RESPONSE=$(curl -s -X GET "$BASE_URL/transactions/${TRANSACTION_ID}" \
      -b $COOKIES_FILE)

    echo "Response: $RESPONSE"

    if echo "$RESPONSE" | grep -q "Transaction not found"; then
        print_result 0 "Deleted transaction not accessible"
    else
        print_result 1 "Deleted transaction still accessible"
    fi
    echo ""
fi

# Test 13: Create Transaction without Authentication
echo -e "${YELLOW}Test 13: Create Transaction without Auth${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/transactions" \
  -H "Content-Type: application/json" \
  -d "{
    \"customerId\": \"${CUSTOMER_ID}\",
    \"amount\": 1000,
    \"type\": \"CREDIT\",
    \"method\": \"CASH\",
    \"date\": \"2024-01-01\"
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

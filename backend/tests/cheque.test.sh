#!/bin/bash

# ChequeSaathi Cheque API Tests

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
echo "  ChequeSaathi Cheque API Tests"
echo "========================================="
echo ""

# Step 1: Login and Create Customer
echo -e "${YELLOW}Setup: Login and Create Test Customer${NC}"
TIMESTAMP=$(date +%s)
TEST_EMAIL="chequetest${TIMESTAMP}@example.com"

# Register and login
curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -c $COOKIES_FILE \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"password123\",
    \"name\": \"Cheque Test User\"
  }" > /dev/null

# Create test customer with unique phone (10 digits)
PHONE_NUMBER="${TIMESTAMP: -10}"  # Take last 10 digits of timestamp
CUSTOMER_RESPONSE=$(curl -s -X POST "$BASE_URL/customers" \
  -H "Content-Type: application/json" \
  -b $COOKIES_FILE \
  -d "{
    \"name\": \"Test Customer\",
    \"phone\": \"${PHONE_NUMBER}\",
    \"email\": \"testcust${TIMESTAMP}@example.com\",
    \"businessName\": \"Test Business\"
  }")

echo "Customer Response: $CUSTOMER_RESPONSE"
CUSTOMER_ID=$(echo "$CUSTOMER_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Test Customer ID: $CUSTOMER_ID"

if [ -z "$CUSTOMER_ID" ]; then
    echo "ERROR: Failed to create customer. Stopping tests."
    rm -f $COOKIES_FILE
    exit 1
fi
echo ""

# Test 1: Create Cheque (Valid Data)
echo -e "${YELLOW}Test 1: Create Cheque with Valid Data${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/cheques" \
  -H "Content-Type: application/json" \
  -b $COOKIES_FILE \
  -d "{
    \"customerId\": \"${CUSTOMER_ID}\",
    \"chequeNumber\": \"CHQ001\",
    \"amount\": 50000,
    \"bankName\": \"HDFC Bank\",
    \"branchName\": \"MG Road\",
    \"ifscCode\": \"HDFC0001234\",
    \"chequeType\": \"POST_DATED\",
    \"direction\": \"RECEIVABLE\",
    \"drawerName\": \"John Doe\",
    \"payeeName\": \"Test Business\",
    \"issueDate\": \"2024-01-15\",
    \"dueDate\": \"2024-02-15\",
    \"notes\": \"First cheque\"
  }")

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q "Cheque created successfully"; then
    print_result 0 "Cheque created successfully"
    CHEQUE_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "Cheque ID: $CHEQUE_ID"
else
    print_result 1 "Cheque creation failed"
fi
echo ""

# Test 2: Create Cheque with Duplicate Cheque Number
echo -e "${YELLOW}Test 2: Create Cheque with Duplicate Cheque Number${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/cheques" \
  -H "Content-Type: application/json" \
  -b $COOKIES_FILE \
  -d "{
    \"customerId\": \"${CUSTOMER_ID}\",
    \"chequeNumber\": \"CHQ001\",
    \"amount\": 30000,
    \"bankName\": \"ICICI Bank\",
    \"chequeType\": \"AT_SIGHT\",
    \"direction\": \"RECEIVABLE\",
    \"drawerName\": \"Jane Doe\",
    \"payeeName\": \"Test Business\",
    \"issueDate\": \"2024-01-20\",
    \"dueDate\": \"2024-01-25\"
  }")

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q "already exists"; then
    print_result 0 "Duplicate cheque number rejected"
else
    print_result 1 "Duplicate cheque number not rejected"
fi
echo ""

# Test 3: Create Cheque with Invalid Customer ID
echo -e "${YELLOW}Test 3: Create Cheque with Invalid Customer ID${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/cheques" \
  -H "Content-Type: application/json" \
  -b $COOKIES_FILE \
  -d "{
    \"customerId\": \"invalid-customer-id\",
    \"chequeNumber\": \"CHQ999\",
    \"amount\": 10000,
    \"bankName\": \"SBI\",
    \"chequeType\": \"AT_SIGHT\",
    \"direction\": \"PAYABLE\",
    \"drawerName\": \"ABC Corp\",
    \"payeeName\": \"Supplier\",
    \"issueDate\": \"2024-01-10\",
    \"dueDate\": \"2024-01-15\"
  }")

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q "Customer not found"; then
    print_result 0 "Invalid customer rejected"
else
    print_result 1 "Invalid customer not rejected"
fi
echo ""

# Test 4: Get All Cheques
echo -e "${YELLOW}Test 4: Get All Cheques${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL/cheques" \
  -b $COOKIES_FILE)

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q "cheques"; then
    print_result 0 "Get all cheques successful"
else
    print_result 1 "Get all cheques failed"
fi
echo ""

# Test 5: Get Cheques by Customer ID
if [ -n "$CUSTOMER_ID" ]; then
    echo -e "${YELLOW}Test 5: Get Cheques by Customer ID${NC}"
    RESPONSE=$(curl -s -X GET "$BASE_URL/cheques?customerId=${CUSTOMER_ID}" \
      -b $COOKIES_FILE)

    echo "Response: $RESPONSE"

    if echo "$RESPONSE" | grep -q "CHQ001"; then
        print_result 0 "Filter by customer ID successful"
    else
        print_result 1 "Filter by customer ID failed"
    fi
    echo ""
fi

# Test 6: Get Cheque by ID
if [ -n "$CHEQUE_ID" ]; then
    echo -e "${YELLOW}Test 6: Get Cheque by ID${NC}"
    RESPONSE=$(curl -s -X GET "$BASE_URL/cheques/${CHEQUE_ID}" \
      -b $COOKIES_FILE)

    echo "Response: $RESPONSE"

    if echo "$RESPONSE" | grep -q "CHQ001"; then
        print_result 0 "Get cheque by ID successful"
    else
        print_result 1 "Get cheque by ID failed"
    fi
    echo ""
fi

# Test 7: Update Cheque
if [ -n "$CHEQUE_ID" ]; then
    echo -e "${YELLOW}Test 7: Update Cheque Details${NC}"
    RESPONSE=$(curl -s -X PATCH "$BASE_URL/cheques/${CHEQUE_ID}" \
      -H "Content-Type: application/json" \
      -b $COOKIES_FILE \
      -d "{
        \"amount\": 55000,
        \"notes\": \"Updated amount\"
      }")

    echo "Response: $RESPONSE"

    if echo "$RESPONSE" | grep -q "Cheque updated successfully"; then
        print_result 0 "Cheque updated successfully"
    else
        print_result 1 "Cheque update failed"
    fi
    echo ""
fi

# Test 8: Update Cheque Status to DEPOSITED
if [ -n "$CHEQUE_ID" ]; then
    echo -e "${YELLOW}Test 8: Update Cheque Status to DEPOSITED${NC}"
    RESPONSE=$(curl -s -X PATCH "$BASE_URL/cheques/${CHEQUE_ID}/status" \
      -H "Content-Type: application/json" \
      -b $COOKIES_FILE \
      -d "{
        \"status\": \"DEPOSITED\",
        \"depositDate\": \"2024-02-15\"
      }")

    echo "Response: $RESPONSE"

    if echo "$RESPONSE" | grep -q "status updated successfully"; then
        print_result 0 "Status updated to DEPOSITED"
    else
        print_result 1 "Status update to DEPOSITED failed"
    fi
    echo ""
fi

# Test 9: Update Cheque Status to CLEARED
if [ -n "$CHEQUE_ID" ]; then
    echo -e "${YELLOW}Test 9: Update Cheque Status to CLEARED${NC}"
    RESPONSE=$(curl -s -X PATCH "$BASE_URL/cheques/${CHEQUE_ID}/status" \
      -H "Content-Type: application/json" \
      -b $COOKIES_FILE \
      -d "{
        \"status\": \"CLEARED\",
        \"clearedDate\": \"2024-02-20\"
      }")

    echo "Response: $RESPONSE"

    if echo "$RESPONSE" | grep -q "status updated successfully"; then
        print_result 0 "Status updated to CLEARED"
    else
        print_result 1 "Status update to CLEARED failed"
    fi
    echo ""
fi

# Test 10: Search Cheques
echo -e "${YELLOW}Test 10: Search Cheques${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL/cheques?search=CHQ001" \
  -b $COOKIES_FILE)

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q "CHQ001"; then
    print_result 0 "Search cheques successful"
else
    print_result 1 "Search cheques failed"
fi
echo ""

# Test 11: Filter by Status
echo -e "${YELLOW}Test 11: Filter Cheques by Status${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL/cheques?status=CLEARED" \
  -b $COOKIES_FILE)

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q "cheques"; then
    print_result 0 "Filter by status successful"
else
    print_result 1 "Filter by status failed"
fi
echo ""

# Test 12: Delete Cheque
if [ -n "$CHEQUE_ID" ]; then
    echo -e "${YELLOW}Test 12: Delete Cheque (Soft Delete)${NC}"
    RESPONSE=$(curl -s -X DELETE "$BASE_URL/cheques/${CHEQUE_ID}" \
      -b $COOKIES_FILE)

    echo "Response: $RESPONSE"

    if echo "$RESPONSE" | grep -q "Cheque deleted successfully"; then
        print_result 0 "Cheque deleted successfully"
    else
        print_result 1 "Cheque deletion failed"
    fi
    echo ""
fi

# Test 13: Try to Access Deleted Cheque
if [ -n "$CHEQUE_ID" ]; then
    echo -e "${YELLOW}Test 13: Try to Access Deleted Cheque${NC}"
    RESPONSE=$(curl -s -X GET "$BASE_URL/cheques/${CHEQUE_ID}" \
      -b $COOKIES_FILE)

    echo "Response: $RESPONSE"

    if echo "$RESPONSE" | grep -q "Cheque not found"; then
        print_result 0 "Deleted cheque not accessible"
    else
        print_result 1 "Deleted cheque still accessible"
    fi
    echo ""
fi

# Test 14: Create Cheque without Authentication
echo -e "${YELLOW}Test 14: Create Cheque without Auth${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/cheques" \
  -H "Content-Type: application/json" \
  -d "{
    \"customerId\": \"${CUSTOMER_ID}\",
    \"chequeNumber\": \"CHQ999\",
    \"amount\": 10000,
    \"bankName\": \"Test Bank\",
    \"chequeType\": \"AT_SIGHT\",
    \"direction\": \"RECEIVABLE\",
    \"drawerName\": \"Test\",
    \"payeeName\": \"Test\",
    \"issueDate\": \"2024-01-01\",
    \"dueDate\": \"2024-01-10\"
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

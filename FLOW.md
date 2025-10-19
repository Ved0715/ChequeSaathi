# ChequeSaathi - Complete Application Flow Documentation

## Table of Contents
1. [Complete Cheque Lifecycle](#1-complete-cheque-lifecycle)
2. [Customer Management](#2-customer-management)
3. [Cash Transaction Flow](#3-cash-transaction-flow)
4. [Dashboard](#4-dashboard)
5. [Photo Management](#5-photo-management)
6. [Risk Scoring System](#6-risk-scoring-system)
7. [Permissions & Access Control](#7-permissions--access-control)
8. [Daily Operational Scenarios](#8-daily-operational-scenarios)
9. [Technical Flow](#9-technical-flow)

---

## 1. COMPLETE CHEQUE LIFECYCLE

### Stage 1: RECEIVING A CHEQUE (Status: RECEIVED)

**Real-world scenario:**
```
Customer "ABC Traders" visits your office
Gives you a cheque for ₹50,000
Date on cheque: Oct 19, 2025
They want it deposited on Oct 26, 2025
```

**Staff action in ChequeSaathi:**
1. Login to system
2. Go to "Add Cheque" page
3. Select customer (or create new if first-time)
4. Fill details:
   - Cheque Number: 123456
   - Amount: ₹50,000
   - Issue Date: Oct 19 (date written on cheque)
   - Due Date: Oct 26 (when to deposit)
   - Bank: HDFC Bank, Andheri Branch
   - IFSC: HDFC0001234
   - Direction: RECEIVABLE (we're receiving money)
   - Type: POST_DATED (future date)
   - Drawer Name: "Mr. Sharma" (who signed the cheque)
   - Upload cheque photo
5. Click "Save"

**Backend Actions:**
- Cheque saved in database with status = RECEIVED
- Photo uploaded to Cloudinary → URL stored
- Customer's total cheque count updates
- Appears in "Upcoming Deposits" dashboard
- createdBy = current logged-in user
- createdAt = current timestamp

---

### Stage 2: DEPOSITING THE CHEQUE (Status: DEPOSITED)

**Real-world scenario:**
```
Oct 26 arrives (due date)
Staff checks dashboard: "5 cheques due for deposit today"
Takes cheques to bank
Bank accepts and gives deposit slip
```

**Staff action:**
1. Dashboard shows "Today's Deposits Due"
2. Click on cheque
3. Click "Update Status"
4. Change status: RECEIVED → DEPOSITED
5. System automatically sets depositDate = today
6. Add note: "Deposited at HDFC Andheri, Slip #789"
7. Save

**Backend Actions:**
- Status updated to DEPOSITED
- depositDate = current date (auto-set)
- updatedBy = current user
- updatedAt = current timestamp
- Cheque moves to "Pending Clearances" section
- Email reminder set for 7 days later

---

### Stage 3A: CHEQUE CLEARS (Status: CLEARED) ✅

**Real-world scenario:**
```
Nov 2 (7 days later)
Bank confirms: "Cheque cleared, money in your account"
```

**Staff action:**
1. Go to cheque details
2. Update status: DEPOSITED → CLEARED
3. System sets clearedDate = today
4. Save

**Backend Actions:**
- Status = CLEARED
- clearedDate = current date (auto-set)
- updatedBy = current user
- Customer's payment history updated
- Risk score may improve if customer had issues before
- Removed from pending list
- Added to "Recent Cleared" report

---

### Stage 3B: CHEQUE BOUNCES (Status: BOUNCED) ❌

**Real-world scenario:**
```
Nov 2 (7 days later)
Bank calls: "Cheque bounced - Insufficient funds"
```

**Staff action:**
1. Go to cheque details
2. Update status: DEPOSITED → BOUNCED
3. Set bouncedDate = today
4. Add bounceReason: "Insufficient funds"
5. Add note: "Called customer, promised re-payment"
6. Save

**Backend Actions:**
- Status = BOUNCED
- bouncedDate = current date (auto-set)
- bounceReason stored
- Customer's risk score INCREASES automatically:
  ```
  Old: 1 bounced / 10 total = 10% risk
  New: 2 bounced / 11 total = 18% risk
  ```
- Alert on dashboard: "Action Required"
- Customer marked with risk level color
- Appears in "Bounced Cheques Report"

---

## 2. CUSTOMER MANAGEMENT

### Adding a New Customer

**Flow:**
```
Customer walks in for first time
↓
Staff: "Add New Customer"
↓
Fill form:
  - Name: ABC Traders
  - Phone: 9876543210
  - Email: abc@example.com (optional)
  - Business Name: ABC Traders Pvt Ltd
  - Address: Mumbai, Maharashtra
  - Notes: "Referred by XYZ Corp"
↓
Save
↓
Customer created with:
  - riskScore = 0 (no history)
  - createdBy = current user
  - createdAt = now
```

### Viewing Customer Profile

**Information Displayed:**
- **Basic Info:** Name, phone, email, business name, address
- **Statistics (Dynamically Calculated):**
  - Total cheques: 10
  - Cleared: 8 (₹5,00,000)
  - Bounced: 2 (₹50,000)
  - Pending: 0
  - Risk Score: 20% (Medium Risk)
- **Complete History:**
  - All cheques (with status and dates)
  - All cash transactions
  - Timeline of all interactions
- **Notes:** Staff notes and observations

---

## 3. CASH TRANSACTION FLOW

**Real-world scenario:**
```
Customer pays ₹10,000 via UPI instead of cheque
```

**Staff action:**
1. Go to "Add Transaction"
2. Select customer
3. Fill details:
   - Amount: ₹10,000
   - Type: CREDIT (we received money)
   - Payment Method: UPI
   - Reference: UPI Txn #123456789
   - Date: Oct 19, 2025
   - Category: "Advance payment"
   - Notes: "For order #456"
4. Save

**Backend Actions:**
- Transaction stored in database
- Added to customer's payment history
- Shows in customer profile
- Included in financial reports
- createdBy = current user

---

## 4. DASHBOARD

### Today's Work Section

**Deposits Due Today:**
```
5 cheques totaling ₹2,50,000
  - ABC Traders: ₹50,000
  - XYZ Corp: ₹1,00,000
  - DEF Ltd: ₹75,000
  - ...
```

**Pending Clearances:**
```
12 cheques totaling ₹5,75,000
(Deposited to bank, waiting for clearance confirmation)
```

**Action Required:**
```
❌ Recently Bounced: 1 cheque
  - DEF Ltd: ₹25,000 (Insufficient funds)
  - Action: Follow up with customer
```

### Next 7 Days Pipeline

```
Oct 20: 3 cheques (₹1,20,000)
Oct 21: 2 cheques (₹80,000)
Oct 22: 1 cheque (₹50,000)
Oct 23: 0 cheques
Oct 24: 4 cheques (₹2,00,000)
Oct 25: 1 cheque (₹30,000)
Oct 26: 2 cheques (₹90,000)
```

### Customer Summary

**Top Customers:**
```
1. ABC Traders: ₹10,00,000 (15 cheques, 0% bounce)
2. XYZ Corp: ₹8,50,000 (12 cheques, 8% bounce)
3. PQR Ltd: ₹6,00,000 (10 cheques, 0% bounce)
```

**High Risk Customers:**
```
1. DEF Ltd: 60% bounce rate (3/5 bounced)
2. GHI Corp: 40% bounce rate (2/5 bounced)
```

---

## 5. PHOTO MANAGEMENT

### Cheque Photo Upload Flow

```
Staff scans/photographs cheque
↓
Uploads in "Add Cheque" form (or "Edit Cheque")
↓
Frontend sends image to backend (multipart/form-data)
↓
Backend receives image file
↓
Backend uploads to Cloudinary:
  - Automatic optimization
  - Thumbnail generation
  - Secure storage
↓
Cloudinary returns URL:
"https://res.cloudinary.com/yourcloud/image/upload/v1234/cheque_123456.jpg"
↓
Backend saves URL in database (imageUrl field)
↓
Success response to frontend
```

### Viewing Cheque Photos

**Staff can:**
- View image in cheque details page
- Zoom in to verify details
- Download original if needed
- Replace/update photo anytime

**Why Cloudinary?**
- Automatic image optimization
- Fast CDN delivery worldwide
- Thumbnail generation
- No server storage needed
- Secure and reliable

---

## 6. RISK SCORING SYSTEM

### Calculation Formula

```typescript
// Calculated dynamically when viewing customer
const totalCheques = await prisma.cheque.count({
  where: { customerId, deletedAt: null }
});

const bouncedCheques = await prisma.cheque.count({
  where: {
    customerId,
    status: 'BOUNCED',
    deletedAt: null
  }
});

const riskScore = totalCheques > 0
  ? Math.round((bouncedCheques / totalCheques) * 100)
  : 0;

// Risk score = (bounced cheques / total cheques) × 100
```

### Risk Categories

**Low Risk (0-20%)** - 🟢 Green
- Reliable customer
- Accept cheques confidently
- Example: 1 bounced out of 10 = 10%

**Medium Risk (21-50%)** - 🟡 Yellow
- Be cautious
- Consider asking for advance or smaller amounts
- Example: 3 bounced out of 10 = 30%

**High Risk (51-100%)** - 🔴 Red
- Avoid accepting cheques
- Request cash/NEFT/UPI only
- Example: 6 bounced out of 10 = 60%

### Risk Score Updates

**Automatically recalculated when:**
- New cheque added
- Cheque status changes to BOUNCED
- Cheque status changes to CLEARED
- Cheque is soft-deleted

---

## 7. PERMISSIONS & ACCESS CONTROL

**Note:** For MVP, all users have the same access level. There is no admin/staff role distinction.

### What Users CANNOT Do:
- ❌ Change cheque from BOUNCED back to CLEARED (prevent fraud)
- ❌ Change status backwards (DEPOSITED → RECEIVED)
- ❌ Hard delete records (audit compliance)
- ❌ Modify createdBy/updatedBy (system controlled)
- ❌ Change historical dates (depositDate, clearedDate, etc.)

### What Users CAN Do:
- ✅ Update status forward (RECEIVED → DEPOSITED → CLEARED/BOUNCED)
- ✅ Add notes anytime
- ✅ Upload/replace cheque photos
- ✅ Add new customers
- ✅ Add new cheques
- ✅ Add cash transactions
- ✅ Soft delete customers, cheques, and transactions (mark as deleted, not permanent)

### System Automatically Handles:
- ✅ Sets depositDate when status changes to DEPOSITED
- ✅ Sets clearedDate when status changes to CLEARED
- ✅ Sets bouncedDate when status changes to BOUNCED
- ✅ Updates customer risk score after status changes
- ✅ Tracks who created/updated records (audit trail)
- ✅ Prevents invalid status transitions

---

## 8. DAILY OPERATIONAL SCENARIOS

### Monday Morning Routine

**9:00 AM - Login & Review**
```
Staff logs in
Dashboard shows:
  - 8 cheques to deposit today
  - 15 pending clearances (from last week)
  - 2 bounced cheques requiring follow-up
```

**9:30 AM - Bank Visit**
```
Take 8 cheques to bank
Bank accepts all 8
Receive deposit slip
```

**10:30 AM - Update System**
```
Update all 8 cheques:
  Status: RECEIVED → DEPOSITED
  Add notes with slip numbers
```

**11:00 AM - Clearance Updates**
```
Bank confirms 3 cheques cleared from last week
Update 3 cheques:
  Status: DEPOSITED → CLEARED
```

**12:00 PM - Bounce Handling**
```
Bank calls: "1 cheque bounced - wrong signature"
Update cheque:
  Status: DEPOSITED → BOUNCED
  Reason: "Signature mismatch"
  Note: "Calling customer"

Call customer
Customer agrees to provide new cheque
```

**2:00 PM - Replacement Cheque**
```
Customer arrives with new cheque
Add new cheque to system
Update old cheque note: "Replaced with #789"
```

**4:00 PM - New Receipts**
```
Receive 5 new cheques from customers
Add all 5 to system:
  - Upload photos
  - Set due dates
  - Add customer notes
```

---

## 9. TECHNICAL FLOW

### Authentication Flow

```
User opens app (http://localhost:3000)
↓
Redirected to /login
↓
User enters email + password
↓
Frontend sends POST /api/auth/login
  Body: { email, password }
  Credentials: include
↓
Backend:
  1. Validates email format
  2. Finds user in database
  3. Compares password with hashed password
  4. Generates JWT token (payload: { id, email })
  5. Sets httpOnly cookie with token
↓
Backend responds:
  Status: 200
  Cookie: token=eyJhbGc...
  Body: { message, user: { id, email, name } }
↓
Frontend:
  Stores user info in state/context
  Redirects to /dashboard
```

### Dashboard Data Flow

```
User opens /dashboard
↓
Frontend checks if user is logged in
  (Check if user context has data)
↓
If not logged in → redirect to /login
↓
If logged in:
  Frontend sends GET /api/dashboard/stats
  (Cookie with JWT automatically included)
↓
Backend:
  1. Extracts token from cookie
  2. Verifies JWT token
  3. Extracts user ID from token
  4. Queries database:
     - Today's deposits due (dueDate = today, status = RECEIVED)
     - Pending clearances (status = DEPOSITED)
     - Next 7 days pipeline (dueDate in next 7 days)
     - Bounced cheques (status = BOUNCED)
     - Customer summaries (top customers, high risk)
  5. Calculates statistics dynamically
↓
Backend responds:
  Status: 200
  Body: {
    todayDeposits: [...],
    pendingClearances: [...],
    pipeline: {...},
    topCustomers: [...],
    highRiskCustomers: [...]
  }
↓
Frontend:
  Displays data in dashboard UI
  Shows charts and graphs
```

### Add Cheque Flow

```
User clicks "Add Cheque"
↓
Frontend shows form
↓
User fills form:
  - Customer (dropdown or create new)
  - Cheque number, amount, dates
  - Bank details
  - Photo upload
↓
User clicks "Save"
↓
Frontend:
  1. Validates form data
  2. Uploads photo file to backend
     POST /api/upload/cheque-image
     (multipart/form-data)
↓
Backend (Upload):
  1. Receives image file
  2. Validates file type (JPEG/PNG)
  3. Uploads to Cloudinary
  4. Returns Cloudinary URL
↓
Frontend:
  Receives image URL
  Sends POST /api/cheques
  Body: {
    customerId, chequeNumber, amount,
    issueDate, dueDate, bankName,
    drawerName, imageUrl, ...
  }
↓
Backend (Create Cheque):
  1. Validates JWT from cookie
  2. Validates all required fields
  3. Checks chequeNumber is unique
  4. Creates cheque in database with:
     - status = RECEIVED (default)
     - createdBy = current user ID
     - imageUrl = from upload
  5. Returns created cheque
↓
Frontend:
  Shows success message
  Redirects to cheque details page
```

### Update Cheque Status Flow

```
User opens cheque details
↓
Clicks "Update Status"
↓
Frontend shows modal with:
  - Current status
  - Available next statuses
  - Optional notes field
↓
User selects new status (e.g., DEPOSITED)
Adds note: "Deposited at HDFC"
Clicks "Update"
↓
Frontend sends PATCH /api/cheques/:id/status
  Body: { status: 'DEPOSITED', notes: '...' }
↓
Backend:
  1. Verifies JWT token
  2. Finds cheque by ID
  3. Validates status transition:
     RECEIVED → DEPOSITED ✅
     DEPOSITED → RECEIVED ❌ (can't go backward)
     DEPOSITED → BOUNCED ✅
     BOUNCED → CLEARED ❌ (can't go backward)
  4. Updates cheque:
     - status = 'DEPOSITED'
     - depositDate = current date (auto-set)
     - updatedBy = current user
     - updatedAt = current timestamp
     - Append note to notes field
  5. Recalculates customer risk score
  6. Returns updated cheque
↓
Frontend:
  Updates UI with new status
  Shows success message
  Refreshes cheque details
```

### Logout Flow

```
User clicks "Logout"
↓
Frontend sends POST /api/auth/logout
  (Cookie automatically included)
↓
Backend:
  1. Verifies JWT (optional, just clear cookie anyway)
  2. Clears 'token' cookie:
     res.clearCookie('token', {
       httpOnly: true,
       secure: production,
       sameSite: 'strict'
     })
  3. Returns success
↓
Frontend:
  Clears user context/state
  Redirects to /login
```

---

## Key Design Decisions

### 1. Soft Delete vs Hard Delete
**Decision: Soft Delete**
- Financial records must be kept for compliance
- Audit trail requirement
- Data recovery possibility
- Mark deletedAt instead of removing

### 2. Static Fields vs Dynamic Calculation
**Decision: Dynamic Calculation**
- Single source of truth (cheques table)
- No sync issues
- Always accurate
- Calculate totalCheques, bouncedCheques on demand

### 3. httpOnly Cookies vs localStorage
**Decision: httpOnly Cookies**
- XSS attack protection
- Automatic sending with requests
- Industry standard for web apps
- More secure for financial data

### 4. Monolithic vs Separate Frontend/Backend
**Decision: Separate**
- Can add mobile app later
- Backend serves multiple clients
- Better security separation
- Independent scaling

### 5. Image Storage
**Decision: Cloudinary (not database or local storage)**
- Automatic optimization
- CDN delivery (fast worldwide)
- Thumbnail generation
- No server storage management
- Scalable

---

## Status Transition Rules

### Valid Transitions:
```
RECEIVED → DEPOSITED ✅
DEPOSITED → CLEARED ✅
DEPOSITED → BOUNCED ✅
```

### Invalid Transitions (Prevented by Backend):
```
DEPOSITED → RECEIVED ❌
CLEARED → DEPOSITED ❌
BOUNCED → CLEARED ❌
BOUNCED → DEPOSITED ❌
Any status → RECEIVED ❌ (can only be initial status)
```

### Why Prevent Backward Transitions?
1. **Audit Integrity:** Financial records shouldn't be altered
2. **Fraud Prevention:** Staff can't mark bounced as cleared
3. **Compliance:** Regulatory requirements
4. **Data Trust:** History remains accurate

---

## API Endpoint Summary

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Customers
- `GET /api/customers` - List all customers
- `POST /api/customers` - Create customer
- `GET /api/customers/:id` - Get customer details
- `PATCH /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Soft delete customer

### Cheques
- `GET /api/cheques` - List cheques (with filters)
- `POST /api/cheques` - Create cheque
- `GET /api/cheques/:id` - Get cheque details
- `PATCH /api/cheques/:id` - Update cheque
- `PATCH /api/cheques/:id/status` - Update status
- `DELETE /api/cheques/:id` - Soft delete cheque

### Transactions
- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/:id` - Get transaction
- `DELETE /api/transactions/:id` - Soft delete

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/pipeline` - Next 7 days pipeline

### Upload
- `POST /api/upload/cheque-image` - Upload cheque photo

---

**Document Version:** 1.0
**Last Updated:** October 2025
**Project:** ChequeSaathi - Cheque & Payment Management System

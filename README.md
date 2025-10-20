# ChequeSaathi 💼

**A Modern Cheque & Payment Management System** - Built to help businesses efficiently track cheques, manage customer data, and monitor payment workflows with automated email notifications.

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-blue)](https://www.postgresql.org/)

---

## 🚀 Features

### Core Features
- ✅ **Cheque Registry** - Complete CRUD operations with advanced search & filters
- ✅ **Customer Management** - Customer database with risk scoring & payment history
- ✅ **Status Workflow** - Track cheques: `RECEIVED` → `DEPOSITED` → `CLEARED` / `BOUNCED`
- ✅ **Smart Dashboard** - Real-time overview:
  - Today's deposits due
  - Pending clearances
  - Next 7 days pipeline
  - Customer-wise summary
  - Cash flow analytics
- ✅ **Transaction Logging** - Record cash/digital payments (UPI, NEFT, RTGS, etc.)
- ✅ **Email Notifications** - Automated alerts:
  - Cheque bounce alerts
  - Clearance confirmations
  - Manual reminders
  - Customer statements
- ✅ **Risk Assessment** - Dynamic customer risk scoring based on cheque bounce ratio
- ✅ **Authentication** - Secure JWT-based auth with bcrypt password hashing

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.5 | React framework with App Router & Turbopack |
| TypeScript | 5.0 | Type safety |
| Tailwind CSS | 4.0 | Utility-first CSS |
| React Hook Form | 7.65 | Form management |
| Zod | 4.1 | Schema validation |
| Recharts | 3.3 | Data visualization |
| shadcn/ui | Latest | UI components |
| date-fns | 4.1 | Date utilities |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Express.js | Latest | Web framework |
| TypeScript | 5.0 | Type safety |
| PostgreSQL | Latest | Database |
| Prisma ORM | Latest | Database ORM |
| JWT | Latest | Authentication |
| bcryptjs | Latest | Password hashing |
| Resend | Latest | Email service (optional) |
| Cloudinary | Latest | Image storage (optional) |

---

## 📁 Project Structure

```
ChequeSaathi/
├── frontend/                    # Next.js Application
│   ├── app/                    # App Router
│   │   ├── (auth)/            # Auth pages (login, register)
│   │   └── (protected)/       # Protected pages (dashboard, customers, cheques, transactions)
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── customers/        # Customer-specific components
│   │   ├── cheques/          # Cheque-specific components
│   │   └── transactions/     # Transaction-specific components
│   ├── lib/                  # Utilities
│   │   ├── api/              # API client functions
│   │   └── validations.ts    # Zod schemas
│   ├── contexts/             # React contexts (Auth)
│   └── types/                # TypeScript types
│
└── backend/                   # Express.js API
    ├── src/
    │   ├── controllers/      # Request handlers
    │   ├── routes/           # API routes
    │   ├── services/         # Business logic
    │   │   └── emailService.ts  # Email templates & sending
    │   ├── middleware/       # Auth & validation middleware
    │   ├── utils/            # Helper functions
    │   ├── types/            # TypeScript interfaces
    │   ├── config/           # Configuration (DB, email, etc.)
    │   └── index.ts          # Entry point
    └── prisma/
        └── schema.prisma     # Database schema
```

---

## 🚦 Quick Start

### Prerequisites
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** database (local or cloud like [Neon](https://neon.tech/) / [Supabase](https://supabase.com/))
- **npm** or **yarn** package manager

### 1️⃣ Clone Repository
```bash
git clone <your-repo-url>
cd ChequeSaathi
```

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

**Create `.env` file** in `/backend`:
```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/chequesaathi?schema=public"
DIRECT_URL="postgresql://user:password@host:5432/chequesaathi?schema=public"

# Server
PORT=5000

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# CORS
FRONTEND_URL=http://localhost:3000

# Email Service (Optional - Get free API key from resend.com)
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=onboarding@resend.dev
EMAIL_ENABLED=true

# File Storage (Optional - Get from cloudinary.com)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_ENABLED=false
```

**Run database migrations:**
```bash
npm run prisma:migrate
npm run prisma:generate
```

**Start backend server:**
```bash
npm run dev
```
Backend runs at `http://localhost:5000`

### 3️⃣ Frontend Setup

**Open new terminal:**
```bash
cd frontend
npm install
```

**Create `.env.local` file** in `/frontend`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Start frontend:**
```bash
npm run dev
```
Frontend runs at `http://localhost:3000`

---

## 📋 Database Schema

### Core Models

**User**
- Authentication & authorization
- Tracks created/updated records

**Customer**
- Personal & business info
- Dynamic risk score (0-100)
- Phone, email, address
- Soft delete support

**Cheque**
- Complete cheque details (number, amount, dates, bank)
- Status: `RECEIVED` | `DEPOSITED` | `CLEARED` | `BOUNCED`
- Type: `AT_SIGHT` | `POST_DATED`
- Direction: `RECEIVABLE` | `PAYABLE`
- Drawer & payee information
- Optional image URL (Cloudinary)
- Soft delete support

**CashTransaction**
- Type: `CREDIT` | `DEBIT`
- Method: `CASH` | `UPI` | `NEFT` | `RTGS` | `IMPS` | `CARD` | `OTHER`
- Date, amount, category, reference
- Soft delete support

---

## 🔐 Authentication Flow

1. User registers with email/password
2. Password hashed with bcrypt
3. JWT token issued on login (7-day expiry)
4. Token stored in httpOnly cookie
5. Protected routes validate token via middleware

---

## 📬 Email Notifications

### Automated Emails
- **Cheque Bounced** - Sent when status changes to `BOUNCED`
- **Cheque Cleared** - Sent when status changes to `CLEARED`

### Manual Emails
- **Send Reminder** - Mail icon button in cheques page
- **Send Statement** - Mail icon button in customers page

### Email Templates
All emails feature professional HTML templates with:
- Responsive design
- Color-coded themes (green for success, red for alerts)
- Customer personalization
- Business branding

**Setup:** Get free API key from [resend.com](https://resend.com) (100 emails/day free tier)

---

## 📊 API Endpoints

### Authentication
```
POST /api/auth/register          # Register new user
POST /api/auth/login             # Login user
POST /api/auth/logout            # Logout user
GET  /api/auth/me                # Get current user
```

### Customers
```
GET    /api/customers            # List customers (with pagination, search)
POST   /api/customers            # Create customer
GET    /api/customers/:id        # Get customer by ID
PUT    /api/customers/:id        # Update customer
DELETE /api/customers/:id        # Soft delete customer
```

### Cheques
```
GET    /api/cheques              # List cheques (with filters, search)
POST   /api/cheques              # Create cheque
GET    /api/cheques/:id          # Get cheque by ID
PUT    /api/cheques/:id          # Update cheque
PUT    /api/cheques/:id/status   # Update cheque status
DELETE /api/cheques/:id          # Soft delete cheque
```

### Transactions
```
GET    /api/transactions         # List transactions (with filters)
POST   /api/transactions         # Create transaction
GET    /api/transactions/:id     # Get transaction by ID
PUT    /api/transactions/:id     # Update transaction
DELETE /api/transactions/:id     # Soft delete transaction
```

### Dashboard
```
GET /api/dashboard/stats                # Dashboard statistics
GET /api/dashboard/customer-summary     # Customer-wise summary
GET /api/dashboard/recent-activity      # Recent activity
```

### Email
```
POST /api/email/send-reminder/:id       # Send cheque reminder
POST /api/email/send-statement/:id      # Send customer statement
POST /api/email/test                    # Test email (dev only)
```

---

## 🔧 Development Commands

### Backend
```bash
npm run dev              # Start dev server (nodemon)
npm run build            # Compile TypeScript
npm run start            # Start production server
npm run prisma:migrate   # Run database migrations
npm run prisma:generate  # Generate Prisma Client
npm run prisma:studio    # Open Prisma Studio GUI
```

### Frontend
```bash
npm run dev              # Start dev server (Turbopack)
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
```

---

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Test database connection
npm run prisma:studio

# Reset database (⚠️ deletes all data)
npx prisma migrate reset
```

### Email Not Sending
1. Check `RESEND_API_KEY` is set in `.env`
2. Verify `EMAIL_ENABLED=true`
3. Check API key validity at [resend.com/api-keys](https://resend.com/api-keys)
4. For test mode, use `EMAIL_FROM=onboarding@resend.dev`
5. Check backend logs for detailed error messages

### Port Already in Use
```bash
# Kill process on port 5000 (backend)
npx kill-port 5000

# Kill process on port 3000 (frontend)
npx kill-port 3000
```

---

## 🚀 Production Deployment

### Backend Deployment (Railway/Render/Heroku)
1. Set environment variables in hosting dashboard
2. Ensure `DATABASE_URL` points to production database
3. Run migrations: `npm run prisma:migrate deploy`
4. Build: `npm run build`
5. Start: `npm run start`

### Frontend Deployment (Vercel)
1. Connect GitHub repository
2. Set `NEXT_PUBLIC_API_URL` to production backend URL
3. Deploy automatically on push

**Note:** See `DEPLOYMENT.md` for detailed deployment guide (coming soon)

---

## 🎯 Feature Roadmap

### Completed ✅
- [x] Complete CRUD operations
- [x] Dashboard analytics
- [x] Email notifications
- [x] Search & filters
- [x] Risk scoring
- [x] Soft delete
- [x] Audit trails

### Planned 🚧
- [ ] Cheque image upload & OCR
- [ ] Excel/PDF export
- [ ] Scheduled email reminders
- [ ] Mobile app
- [ ] Multi-tenant support
- [ ] Advanced reporting
- [ ] SMS notifications

---

##b Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---


## Author

Built with  for efficient cheque and payment management

**Project Status:** Active Development 🚀

---

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- vedant.narwade.17@gmail.com

---

**⭐ Star this repo if you find it helpful!**

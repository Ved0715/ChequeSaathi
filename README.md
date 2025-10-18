# ChequeSaathi 💼

A modern Cheque & Payment Management System built to help businesses efficiently track cheques, manage customer data, and monitor payment workflows.

## 🚀 Features

### Must-Have Features ✅
- **Cheque Registry**: Complete CRUD operations for cheque management
- **Customer Database**: Comprehensive customer management with payment history
- **Smart Dashboard**:
  - Today's deposits due
  - Pending clearances
  - Next 7 days pipeline
  - Customer-wise summary
- **Status Tracking**: Full workflow - Received → Deposited → Cleared → Bounced
- **Risk Scoring**: Intelligent customer risk assessment
- **Search & Filter**: Advanced filtering and search capabilities
- **Cash Transaction Logging**: Simple and efficient transaction tracking

### Nice-to-Have Features 🎯
- Email reminders
- Export to Excel
- Mobile-responsive design

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** (App Router with Turbopack)
- **TypeScript**
- **Tailwind CSS**
- **React Hook Form** + Zod validation
- **Recharts** for data visualization
- **date-fns** for date handling
- **Lucide React** for icons

### Backend
- **Express.js**
- **TypeScript**
- **PostgreSQL**
- **Prisma ORM**
- **JWT** authentication
- **bcryptjs** for password hashing
- **Cloudinary** for file storage (optional)
- **Resend** for email notifications (optional)

## 📁 Project Structure

```
ChequeSaathi/
├── frontend/          # Next.js frontend application
│   ├── app/          # Next.js 14 App Router
│   ├── components/   # React components
│   └── lib/          # Utility functions
│
└── backend/          # Express.js backend API
    ├── src/
    │   ├── controllers/
    │   ├── routes/
    │   ├── services/
    │   ├── middleware/
    │   ├── utils/
    │   ├── types/
    │   ├── config/
    │   └── index.ts
    └── prisma/
        └── schema.prisma
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd ChequeSaathi
```

2. **Install Frontend Dependencies**
```bash
cd frontend
npm install
```

3. **Install Backend Dependencies**
```bash
cd ../backend
npm install
```

4. **Set up Environment Variables**

Create a `.env` file in the `/backend` directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/chequesaathi?schema=public"
PORT=5000
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000

# Optional
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RESEND_API_KEY=
```

5. **Set up Database**

```bash
# Run migrations
npm run prisma:migrate

# Generate Prisma Client
npm run prisma:generate
```

6. **Run the Application**

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`
- Prisma Studio: `http://localhost:5555` (run `npm run prisma:studio`)

## 📚 Development Commands

### Frontend Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Backend Commands
```bash
npm run dev          # Start development server with nodemon
npm run build        # Compile TypeScript
npm run start        # Start production server
npm run prisma:generate   # Generate Prisma Client
npm run prisma:migrate    # Run database migrations
npm run prisma:studio     # Open Prisma Studio
```

## 🗄️ Database Schema

- **User**: Authentication and user management
- **Customer**: Customer information with risk scoring
- **Cheque**: Cheque details with status tracking
- **CashTransaction**: Cash payment records

## 🔒 Authentication

The application uses JWT-based authentication with:
- Secure password hashing using bcryptjs
- Token-based session management
- Protected API routes

## 🎯 API Endpoints

```
GET  /health                    # Health check
GET  /api                       # API information
POST /api/auth/register         # User registration
POST /api/auth/login            # User login
GET  /api/customers             # Get all customers
POST /api/customers             # Create customer
GET  /api/cheques               # Get all cheques
POST /api/cheques               # Create cheque
PUT  /api/cheques/:id/status    # Update cheque status
GET  /api/transactions          # Get transactions
POST /api/transactions          # Create transaction
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

Built with ❤️ for efficient cheque and payment management

---

**Note**: This is a POC (Proof of Concept) application designed to demonstrate understanding of real business problems and scalable architecture for future features.

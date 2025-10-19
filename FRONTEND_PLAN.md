# ChequeSaathi Frontend - Complete Architecture Plan

## Tech Stack
- **Framework:** Next.js 15 (App Router, React Server Components)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **State Management:** React Context + Server Actions
- **Forms:** React Hook Form + Zod validation
- **HTTP Client:** fetch with custom wrapper
- **Icons:** Lucide React
- **Notifications:** Sonner (toast notifications)

## Folder Structure
```
frontend/
├── app/
│   ├── (auth)/                    # Route Group - Auth pages (no navbar)
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── layout.tsx
│   │   └── error.tsx
│   ├── (protected)/               # Route Group - Protected routes
│   │   ├── dashboard/page.tsx
│   │   ├── customers/
│   │   ├── cheques/
│   │   ├── transactions/
│   │   ├── layout.tsx
│   │   └── error.tsx
│   ├── (public)/                  # Route Group - Public pages
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── layout.tsx
│   ├── globals.css
│   └── not-found.tsx
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── auth/
│   ├── dashboard/
│   ├── layout/
│   └── shared/
├── lib/
│   ├── api/
│   ├── utils.ts
│   ├── validations.ts
│   └── constants.ts
├── contexts/
│   └── AuthContext.tsx
├── hooks/
│   ├── useAuth.ts
│   └── useToast.ts
├── types/
│   ├── auth.ts
│   ├── customer.ts
│   └── cheque.ts
└── middleware.ts

## Design System
**Primary Color:** Indigo/Blue (#6366F1)
**Font:** Inter
**Breakpoints:** Mobile (0-640px), Tablet (641-1024px), Desktop (1024px+)

## Implementation Phases
1. Foundation Setup
2. Authentication (Login/Register)
3. Protected Routes (Dashboard)
4. Customer Management
5. Cheque Management
6. Transaction Management

## Libraries
- react-hook-form, zod, @hookform/resolvers
- lucide-react
- sonner
- recharts
- date-fns

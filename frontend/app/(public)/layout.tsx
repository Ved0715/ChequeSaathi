import { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header/Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-indigo-600">ChequeSaathi</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors">
              About
            </Link>
            <Link href="/features" className="text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors">
              Features
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-slate-50">
        <div className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-indigo-600">ChequeSaathi</h3>
              <p className="text-sm text-slate-600">
                Simplifying cheque and payment management for businesses.
              </p>
            </div>

            {/* Product Links */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-slate-900">Product</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/features" className="text-sm text-slate-600 hover:text-indigo-600">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-sm text-slate-600 hover:text-indigo-600">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company Links */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-slate-900">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-sm text-slate-600 hover:text-indigo-600">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-sm text-slate-600 hover:text-indigo-600">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support Links */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-slate-900">Support</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/help" className="text-sm text-slate-600 hover:text-indigo-600">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-sm text-slate-600 hover:text-indigo-600">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 pt-8 border-t">
            <p className="text-sm text-center text-slate-600">
              © {new Date().getFullYear()} ChequeSaathi. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

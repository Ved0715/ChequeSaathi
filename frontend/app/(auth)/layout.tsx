import { ReactNode } from 'react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Simple Header */}
      <header className="border-b bg-white">
        <div className="container flex h-16 items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-indigo-600">ChequeSaathi</span>
          </Link>
        </div>
      </header>

      {/* Centered Auth Card */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="py-6 border-t bg-white">
        <p className="text-center text-sm text-slate-600">
          © {new Date().getFullYear()} ChequeSaathi. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

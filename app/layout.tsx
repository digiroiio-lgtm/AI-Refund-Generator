import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Footer } from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Refund Generator',
  description:
    'Check your flight compensation eligibility and instantly generate an official claim letter.'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#f5f5f7] text-gray-900`}>
        <div className="flex min-h-screen flex-col">
          <main className="flex-1">
            <div className="mx-auto w-full max-w-5xl px-6 py-12">{children}</div>
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}

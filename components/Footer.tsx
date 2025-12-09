'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';

type FooterLink = {
  href: Route;
  label: string;
};

const navLinks: FooterLink[] = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' }
];

export function Footer() {
  const pathname = usePathname();

  return (
    <footer className="mt-16 border-t border-black/5 bg-white/90 py-8 text-sm text-gray-500">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold text-gray-700">AI Refund Generator</p>
          <p>Not legal advice – informational only.</p>
        </div>
        <div className="flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              className={`transition hover:text-gray-900 ${
                pathname === link.href ? 'text-gray-900' : ''
              }`}
              key={link.href}
              href={link.href}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

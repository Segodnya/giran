import type { Metadata } from 'next';
import Link from 'next/link';
import { Geist, Geist_Mono } from 'next/font/google';

import { Providers } from './providers';

import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Giran - Article Reader',
  description: 'Read and explore curated articles on web development',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

const RootLayout = (props: RootLayoutProps) => {
  const { children } = props;

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50`}
      >
        <Providers>
          <div className="flex flex-col min-h-screen">
            {/* Header */}
            <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                <h1 className="text-2xl sm:text-3xl font-bold">
                  <Link
                    href="/"
                    className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    Giran
                  </Link>
                </h1>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">
                  Curated articles on web development
                </p>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                {children}
              </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mt-auto">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  © 2026 Giran. Articles are sourced from GitHub.
                </p>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;

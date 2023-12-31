import { ThemeProvider, ThemeToggle } from '@/components/theme-provider';
import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import './globals.scss';

import { cn } from '@/lib/utils';
import { app } from '../src/constants';

const fontSans = FontSans({
  /* eslint-disable quotes */
  subsets: ['latin'],
  variable: '--font-sans',
  /* eslint-enable quotes */
});

export const metadata: Metadata = {
  title: {
    template: `%s | ${app.title}`,
    default: app.title,
  },
  description: app.descriptionLong,
  applicationName: app.title,
  other: {
    'revisit-after': `3 days`,
  },
  generator: `Next.js`,
  referrer: `origin-when-cross-origin`,
  keywords: [`Mero QR`, `QR Generator`, `QR Scanner Online`],
  authors: [
    {
      name: `Rabindra Joshi`,
      url: `https://rjoshi.net`,
    },
  ],
  creator: `Rabindra Joshi`,
  publisher: `Rabindra Joshi`,
  //

  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body
        className={cn(
          `h-full min-h-screen bg-background font-sans antialiased`,
          fontSans.variable
        )}
      >
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <span className="absolute right-10 top-10">
            <ThemeToggle />
          </span>
        </ThemeProvider>
      </body>
    </html>
  );
}

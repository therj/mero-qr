import { ThemeProvider } from '@/components/theme-provider';
import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import './globals.scss';

import { cn } from '@/lib/utils';
import { info as appInfo } from '@/constants/app';
import { AppVersion } from '@/components/AppVersion';
import { NavBar } from '@/components/navbar';
import { SearchProvider } from '@/providers/search-provider';

const fontSans = FontSans({
  /* eslint-disable quotes */
  subsets: ['latin'],
  variable: '--font-sans',
  /* eslint-enable quotes */
});

export const metadata: Metadata = {
  title: {
    template: `%s | ${appInfo.title}`,
    default: appInfo.title,
  },
  description: appInfo.descriptionLong,
  applicationName: appInfo.title,
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
          `h-full min-h-screen font-sans antialiased`,
          fontSans.variable
        )}
      >
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SearchProvider>
            <NavBar />
            {children}
            <AppVersion />
          </SearchProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

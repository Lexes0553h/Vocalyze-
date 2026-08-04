import './globals.css';
import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { AuthProvider } from '@/lib/auth/auth-context';
import { Toaster } from '@/components/ui/toaster';
import { CustomCursor } from '@/components/cursor/custom-cursor';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Vocalyze CRM — Enterprise Telecalling & Sales Workspace',
    template: '%s | Vocalyze CRM',
  },
  description:
    'An all-in-one Telecalling CRM that helps businesses manage leads, monitor calls, automate follow-ups, collaborate with teams, and close more deals faster.',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'Vocalyze CRM — Enterprise Telecalling & Sales Workspace',
    description:
      'The smarter way to manage calls, leads & sales. Manage leads, monitor calls, automate follow-ups, and close more deals faster.',
    url: 'https://vocalyze.app',
    siteName: 'Vocalyze CRM',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vocalyze CRM',
    description: 'Enterprise Telecalling & Sales Workspace',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        <AuthProvider>
          {children}
          <Toaster />
          <CustomCursor />
        </AuthProvider>
      </body>
    </html>
  );
}

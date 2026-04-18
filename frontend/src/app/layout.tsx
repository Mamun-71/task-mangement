import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { HydrationProvider } from '@/components/HydrationProvider';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TaskFlow — Daily Task Management',
  description: 'A lightweight, professional daily task manager. Track tasks, log time, and measure your productivity.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-gray-50" suppressHydrationWarning>
        <HydrationProvider>
          {children}
        </HydrationProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}

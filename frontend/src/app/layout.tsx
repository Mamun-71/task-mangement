import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TaskManager - Professional Task Management",
  description: "A modern task management system for tracking and organizing your work efficiently. Manage tasks, track time, and analyze productivity with beautiful dashboards.",
  keywords: ["task management", "productivity", "task tracker", "project management", "todo list"],
  authors: [{ name: "TaskManager Team" }],
  openGraph: {
    title: "TaskManager - Professional Task Management",
    description: "A modern task management system for tracking and organizing your work efficiently.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50/50">
        {children}
        <Toaster 
          position="top-right"
          richColors
          toastOptions={{
            style: {
              borderRadius: '12px',
              padding: '12px 16px',
            },
          }}
        />
      </body>
    </html>
  );
}

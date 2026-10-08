import type { Metadata } from 'next';
import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Toaster } from 'react-hot-toast';

import { ThemeProvider } from '../components/ThemeProvider';

export const metadata: Metadata = {
  title: 'PlaycasthubAI',
  description: 'The ultimate store for RC, Diecast, and Hobby items',
  icons: {
    icon: '/logo.jpeg',
    shortcut: '/logo.jpeg',
    apple: '/logo.jpeg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-bubble-bg text-text-main min-h-screen flex flex-col transition-colors duration-300">
        <ThemeProvider>
          <Toaster position="top-center" />
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}

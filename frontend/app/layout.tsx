import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PlaycasthubAI',
  description: 'The ultimate store for RC, Diecast, and Hobby items',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}

import './globals.css'

export const metadata = {
  title: 'PlaycasthubAI',
  description: 'The ultimate store for RC, Diecast, and Hobby items',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">{children}</body>
    </html>
  )
}

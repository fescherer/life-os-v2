import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Life OS',
  description: 'Personal operating system',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      data-theme="silk"
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} bg-base-100 h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  )
}

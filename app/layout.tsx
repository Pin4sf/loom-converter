import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Loom Converter",
  description: "Transform video transcripts into AI-generated video scripts",
  viewport: "width=device-width, initial-scale=1",
  authors: [{ name: "Loom Converter Team" }],
  keywords: ["AI", "video", "transcript", "content generation", "script writing"],
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="min-h-screen bg-gradient-to-b from-yellow-300/30 to-white">{children}</main>
      </body>
    </html>
  )
}



import './globals.css'
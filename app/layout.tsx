import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Contentformer",
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
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <main className="min-h-screen bg-zinc-900">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'
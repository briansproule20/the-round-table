import type { Metadata } from "next"
import { Cinzel, Crimson_Pro, Geist_Mono } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const cinzel = Cinzel({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const crimsonPro = Crimson_Pro({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "The Camelot Quiz",
  description: "How well do you know your roommates?",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${crimsonPro.variable} ${geistMono.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster
          toastOptions={{
            style: {
              background: "oklch(0.14 0.012 55)",
              border: "1px solid oklch(0.73 0.06 75 / 12%)",
              color: "oklch(0.89 0.03 80)",
            },
          }}
        />
      </body>
    </html>
  )
}

import type React from "react"
import type { Metadata } from "next"
import { Raleway, Inter } from "next/font/google"
import "./globals.css"

const raleway = Raleway({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-raleway",
})

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "AREMOS - Digitale Lernkarten",
  description: "Moderne Lernplattform für digitale Karteikarten mit intelligentem Wiederholungs-Algorithmus",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${raleway.variable} ${inter.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}

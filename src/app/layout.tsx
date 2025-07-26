import { ReactQueryProvider } from "@/components/privoder/query";
import { ThemeProvider } from "@/components/privoder/theme";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Optimize font loading with display: swap for better performance
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false, // Only preload the main font
});

export const metadata: Metadata = {
  title: {
    default: "Dayah Alfhattani Konveksi",
    template: "%s | Dayah Alfhattani Konveksi",
  },
  description:
    "Sistem Konveksi Dayah Alfhattani untuk membantu pengelolaan konveksi",
  keywords: ["konveksi", "dayah alfhattani", "sistem manajemen", "inventory"],
  authors: [{ name: "Dayah Alfhattani Konveksi" }],
  creator: "Dayah Alfhattani Konveksi",
  publisher: "Dayah Alfhattani Konveksi",
  robots: {
    index: false, // Private application
    follow: false,
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  // Performance optimization
  other: {
    "color-scheme": "light dark",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload critical resources */}
        <link
          rel="preload"
          href="/logo.png"
          as="image"
          type="image/png"
        />
        {/* Optimize resource hints */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="preconnect" href="//fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReactQueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}

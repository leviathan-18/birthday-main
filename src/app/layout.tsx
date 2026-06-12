import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import ScrollProvider from "@/components/ScrollProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Happy Birthday | A Cinematic Journey of Memories ✨",
  description: "A luxury digital storytelling film made of floating memories, heartfelt thoughts, and beautiful shared moments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        {/* Preload hero images for intro loader */}
        <link rel="preload" href="/images/memory_laugh.png" as="image" />
        <link rel="preload" href="/images/memory_adventure.png" as="image" />
        <link rel="preload" href="/images/memory_cozy.png" as="image" />
        <link rel="preload" href="/images/memory_starry.png" as="image" />
        <link rel="preload" href="/images/memory_celebrate.jpg" as="image" />

        {/* Preload first 2 floating hero photos */}
        <link rel="preload" href="/images/fr-1.png" as="image" />
        <link rel="preload" href="/images/fr-5.jpg" as="image" />
      </head>
      <body className="font-sans antialiased bg-luxury-dark text-text-primary">
        <ScrollProvider>
          {children}
        </ScrollProvider>
      </body>
    </html>
  );
}

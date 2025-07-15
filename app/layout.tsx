import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./animation.css";
import AppThemeProvider from "./ThemeProvider";
import localFont from "next/font/local";
import Script from "next/script";

<Script
  strategy="beforeInteractive"
  src="https://unpkg.com/@ungap/global-this@0.4.4/min.js"
/>

const linuxLibertine = localFont({
  src: "./fonts/LinLibertine_R.ttf",
  variable: "--font-linux-libertine",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Wiki Wongos",
  description: "A little fun Wikipedia game!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${linuxLibertine.variable} antialiased`}
      >
        <AppThemeProvider>{children}</AppThemeProvider>      
      </body>
    </html>
  );
}

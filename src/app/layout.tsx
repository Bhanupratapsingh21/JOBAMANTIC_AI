import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import UserProvider from "@/providers/UserProvider";
import { Toaster } from "@/components/ui/sonner"
import { Analytics } from "@vercel/analytics/next"
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trainingbasket Resume Ai",
  description: "Get Your Resume Shortlisted Land Your Dream Job Fast",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />
      <link rel="shortcut icon" href="https://res.cloudinary.com/djwzwq4cu/image/upload/e_background_removal/f_png/v1759685702/ChatGPT_Image_Oct_5_2025_11_01_59_PM_bzlmuv.png" type="image/x-icon" />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UserProvider>
          {children}
          <Toaster />
          <Analytics />
        </UserProvider>
      </body>
    </html>
  );
}

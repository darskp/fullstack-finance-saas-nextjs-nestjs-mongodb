import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import SideBar from "@/components/sidebar";
import { Toaster } from "sonner";
import AxiosInterceptor from "@/components/AxiosInterceptor";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Expense Tracker",
  description: "Track and manage your finances with ease. Monitor your income and expenses in one place.",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <AxiosInterceptor>
            <div className="h-screen flex w-screen">
              <SideBar />
              {children}
              <Analytics />
            </div>
            <Toaster />
          </AxiosInterceptor>
        </body>
      </html>
    </ClerkProvider>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/components";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Shiftly",
  description: "Shift & Expense Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} bg-slate-50 text-slate-800 min-h-[100dvh] flex flex-col text-sm`}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}

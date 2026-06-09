import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { RoleProvider } from "@/components/layout/RoleContext";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RoleProvider>
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <TopNav />
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </RoleProvider>
  );
}

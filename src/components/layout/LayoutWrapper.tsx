"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
      <main className="flex-1 flex flex-col min-w-0 md:ml-56">
        <TopNav onMenuClick={() => setIsMobileMenuOpen(true)} />
        <div className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </div>
      </main>
    </>
  );
}

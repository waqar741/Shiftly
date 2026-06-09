import React from "react";
import { RoleProvider } from "@/components/layout/RoleContext";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RoleProvider>
      <LayoutWrapper>{children}</LayoutWrapper>
    </RoleProvider>
  );
}

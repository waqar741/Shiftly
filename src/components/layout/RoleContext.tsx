"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export type Role = "Admin" | "Branch Manager" | "Employee" | "Super Admin";

interface User {
  id: number;
  fullName: string;
  employeeCode: string;
  email: string;
  mobile?: string;
  role: { name: string };
  branch: { id: number; name: string } | null;
}

interface RoleContextType {
  role: Role;
  user: User | null;
  isLoading: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>("Employee");
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/v1/profile');
        if (res.ok) {
          const { data } = await res.json();
          setUser(data);
          setRole(data.role?.name || "Employee");
        } else if (res.status === 401) {
          router.push('/login');
        }
      } catch (error) {
        console.error("Failed to fetch user profile", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [router]);

  return (
    <RoleContext.Provider value={{ role, user, isLoading }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}

"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Clock,
  Receipt,
  Building,
  Tag,
  Wallet,
  History,
  Settings,
  LogOut,
  Bell,
  BarChart3,
  Layers,
} from "lucide-react";
import { useRole } from "./RoleContext";

const navItems = [
  {
    section: "Main",
    roles: ["ADMIN", "SUPER_ADMIN", "BRANCH_MANAGER", "EMPLOYEE"],
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "SUPER_ADMIN", "BRANCH_MANAGER", "EMPLOYEE"] },
      { href: "/admin/employees", label: "Employees", icon: Users, roles: ["ADMIN", "SUPER_ADMIN", "BRANCH_MANAGER"] },
      { href: "/admin/shifts", label: "Shift Ledger", icon: Clock, roles: ["ADMIN", "SUPER_ADMIN", "BRANCH_MANAGER"] },
      { href: "/shifts", label: "My Shifts", icon: Clock, roles: ["EMPLOYEE"] },
      { href: "/expenses", label: "Expenses", icon: Receipt, roles: ["ADMIN", "SUPER_ADMIN", "BRANCH_MANAGER", "EMPLOYEE"] },
    ],
  },
  {
    section: "Manage",
    roles: ["ADMIN", "SUPER_ADMIN", "BRANCH_MANAGER"],
    items: [
      { href: "/admin/branches", label: "Branches", icon: Building, roles: ["ADMIN", "SUPER_ADMIN"] },
      { href: "/admin/shift-types", label: "Shift Types", icon: Layers, roles: ["ADMIN", "SUPER_ADMIN"] },
      { href: "/admin/rates", label: "Rates", icon: Tag, roles: ["ADMIN", "SUPER_ADMIN"] },
      { href: "/admin/payroll", label: "Payroll", icon: Wallet, roles: ["ADMIN", "SUPER_ADMIN"] },
      { href: "/admin/reports", label: "Reports", icon: BarChart3, roles: ["ADMIN", "SUPER_ADMIN", "BRANCH_MANAGER"] },
    ],
  },
  {
    section: "System",
    roles: ["ADMIN", "SUPER_ADMIN", "BRANCH_MANAGER", "EMPLOYEE"],
    items: [
      { href: "/notifications", label: "Notifications", icon: Bell, roles: ["ADMIN", "SUPER_ADMIN", "BRANCH_MANAGER", "EMPLOYEE"] },
      { href: "/admin/audit-logs", label: "Audit Logs", icon: History, roles: ["ADMIN", "SUPER_ADMIN"] },
      { href: "/admin/settings", label: "Settings", icon: Settings, roles: ["ADMIN", "SUPER_ADMIN"] },
      { href: "/profile", label: "Profile", icon: Users, roles: ["ADMIN", "SUPER_ADMIN", "BRANCH_MANAGER", "EMPLOYEE"] },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { role } = useRole();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const currentRole = (role || "").toUpperCase().replace(" ", "_");

  return (
    <aside className="w-56 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 z-10">
      <div className="h-12 flex items-center px-4">
        <Image src="/favicon.svg" alt="Shiftly" width={18} height={18} className="mr-2" />
        <span className="font-semibold text-sm">Shiftly</span>
      </div>

      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-5">
        {navItems
          .filter(group => group.roles.includes(currentRole))
          .map((group) => {
            const filteredItems = group.items.filter(item => item.roles.includes(currentRole));
            if (filteredItems.length === 0) return null;

            return (
               <div key={group.section}>
                <p className="px-2 text-[10px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  {group.section}
                </p>
                <nav className="space-y-0.5">
                  {filteredItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center px-2 py-1.5 rounded-md transition-colors ${
                          active
                            ? "bg-slate-900 text-white font-medium shadow-sm"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <item.icon className={`w-3.5 h-3.5 mr-2 ${active ? "opacity-90" : "opacity-50"}`} />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            );
          })}
      </div>

      <div className="p-2 border-t border-slate-200">
        <button className="flex w-full items-center px-2 py-1.5 rounded-md text-slate-500 hover:text-slate-800 transition-colors">
          <LogOut className="w-3.5 h-3.5 mr-2 opacity-50" /> Logout
        </button>
      </div>
    </aside>
  );
}

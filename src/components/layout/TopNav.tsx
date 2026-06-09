"use client";

import React from "react";
import { Search, Network, ChevronDown, Bell } from "lucide-react";
import { useRole } from "./RoleContext";
import { useRouter } from "next/navigation";

export function TopNav() {
  const { role, user, isLoading } = useRole();
  const router = useRouter();

  const handleLogout = async () => {
    // In a real app we'd call an API to clear the cookie, but clearing local state works for demo
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push('/login');
  };

  return (
    <header className="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 z-20">
      <div className="flex-1 max-w-md">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search employees, branches, shift IDs..."
            className="w-full pl-8 pr-3 py-1 bg-[#f8fafc] border border-slate-200 rounded-md text-sm text-slate-600 placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:bg-white transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center space-x-5 ml-4">
        {user?.branch && (
          <div className="flex items-center text-sm text-slate-600">
            <Network className="w-3.5 h-3.5 mr-1.5 opacity-60" /> {user.branch.name}
          </div>
        )}
        <button className="text-slate-400 hover:text-slate-600 transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
        </button>
        <div className="flex items-center border-l border-slate-200 pl-5">
          <div className="w-6 h-6 rounded bg-slate-800 text-white flex items-center justify-center text-xs font-medium mr-2">
            {isLoading ? "?" : user?.fullName?.charAt(0) || "U"}
          </div>
          <div className="flex flex-col cursor-pointer" onClick={handleLogout} title="Click to logout">
            <span className="text-sm font-medium text-slate-700 leading-tight">
              {isLoading ? "Loading..." : user?.fullName || "Unknown User"}
            </span>
            <span className="text-[10px] font-medium text-slate-400 leading-tight uppercase tracking-wider">
              {role}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

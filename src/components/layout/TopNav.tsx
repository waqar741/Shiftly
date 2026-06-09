"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, Network, Bell, Menu, User, Settings, LogOut, Lock } from "lucide-react";
import { useRole } from "./RoleContext";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/components";
import Link from "next/link";

export function TopNav({ onMenuClick }: { onMenuClick?: () => void }) {
  const { role, user, isLoading } = useRole();
  const router = useRouter();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    // Clear the cookie
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    // Force a full reload to clear Next.js client-side router cache
    window.location.href = '/login';
  };

  return (
    <>
      <header className="sticky top-0 h-12 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 flex-shrink-0 z-30">
        <div className="flex items-center flex-1 max-w-md">
          <button 
            onClick={onMenuClick}
            className="mr-3 p-1.5 -ml-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md md:hidden transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="relative flex items-center w-full max-w-xs md:max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search employees, branches, shift IDs..."
              className="w-full pl-8 pr-3 py-1 bg-[#f8fafc] border border-slate-200 rounded-md text-sm text-slate-600 placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:bg-white transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3 md:space-x-5 ml-2 md:ml-4">
          {user?.branch && (
            <div className="hidden md:flex items-center text-sm text-slate-600">
              <Network className="w-3.5 h-3.5 mr-1.5 opacity-60" /> {user.branch.name}
            </div>
          )}
          <button className="text-slate-400 hover:text-slate-600 transition-colors relative p-1">
            <Bell className="w-4 h-4 md:w-4 md:h-4" />
            <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="relative flex items-center border-l border-slate-200 pl-3 md:pl-5" ref={dropdownRef}>
            <div 
              className="flex items-center cursor-pointer hover:bg-slate-50 p-1 -ml-1 rounded-md transition-colors"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="w-6 h-6 rounded bg-slate-800 text-white flex items-center justify-center text-xs font-medium mr-2">
                {isLoading ? "?" : user?.fullName?.charAt(0) || "U"}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-700 leading-tight hidden sm:block">
                  {isLoading ? "Loading..." : user?.fullName || "Unknown User"}
                </span>
                <span className="text-[10px] font-medium text-slate-400 leading-tight uppercase tracking-wider hidden sm:block">
                  {role}
                </span>
              </div>
            </div>

            {/* Profile Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-slate-200 rounded-md shadow-lg py-1 z-50">
                <div className="px-4 py-2 border-b border-slate-100 sm:hidden">
                  <span className="block text-sm font-medium text-slate-700">{user?.fullName || "User"}</span>
                  <span className="block text-xs text-slate-500 uppercase">{role}</span>
                </div>
                <Link 
                  href="/profile" 
                  className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <User className="w-4 h-4 mr-2 text-slate-400" />
                  My Profile
                </Link>
                {role === "Admin" || role === "Super Admin" ? (
                  <Link 
                    href="/admin/settings" 
                    className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <Settings className="w-4 h-4 mr-2 text-slate-400" />
                    Account Settings
                  </Link>
                ) : null}
                <button 
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setShowLogoutConfirm(true);
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left border-t border-slate-100"
                >
                  <LogOut className="w-4 h-4 mr-2 text-red-500" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Logout"
        message="Are you sure you want to logout? You will need to sign in again to access your account."
        confirmLabel="Logout"
        destructive={true}
      />
    </>
  );
}

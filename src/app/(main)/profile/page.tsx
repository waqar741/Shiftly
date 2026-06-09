"use client";

import React, { useState, useEffect } from "react";
import { Save, User, Mail, Phone, Building, Shield, Lock } from "lucide-react";
import { useRole } from "@/components/layout/RoleContext";
import { Modal, useToast } from "@/components/ui/components";

export default function ProfilePage() {
  const { user, isLoading } = useRole();
  const { success, error: toastError } = useToast();

  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    mobile: ''
  });

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || '',
        email: user.email || '',
        mobile: user.mobile || ''
      });
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    try {
      setProfileSubmitting(true);
      const res = await fetch('/api/v1/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': '3' // Mock employee user for MVP without auth context
        },
        body: JSON.stringify(profileData)
      });

      const data = await res.json();

      if (res.ok) {
        success("Profile updated successfully!");
      } else {
        toastError(data.error?.message || "Failed to update profile");
      }
    } catch (error) {
      toastError("An error occurred");
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handleChangePassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toastError("New passwords do not match");
      return;
    }

    try {
      setPasswordSubmitting(true);
      const res = await fetch('/api/v1/profile', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': '3' // Mock employee user for MVP without auth context
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await res.json();

      if (res.ok) {
        success("Password changed successfully!");
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setIsPasswordModalOpen(false);
      } else {
        toastError(data.error?.message || "Failed to change password");
      }
    } catch (error) {
      toastError("An error occurred");
    } finally {
      setPasswordSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading profile...</div>;
  }

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Profile</h1>
          <p className="text-sm text-slate-500 mt-1">
            View and update your personal information.
          </p>
        </div>
        <button 
          onClick={handleUpdateProfile} 
          disabled={profileSubmitting}
          className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 shadow-sm flex items-center transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4 mr-2" />
          {profileSubmitting ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="space-y-6 pb-10">
        <section className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-base font-semibold text-slate-900">Personal Information</h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center">
                <User className="w-8 h-8 text-slate-400" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">{user?.fullName || 'Guest'}</p>
                <p className="text-sm text-slate-500">{user?.employeeCode || '-'}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  value={profileData.fullName}
                  onChange={e => setProfileData({...profileData, fullName: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-slate-400 shadow-sm" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Employee Code</label>
                <input type="text" value={user?.employeeCode || ''} disabled className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-500 shadow-sm" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5"><Mail className="w-3.5 h-3.5 inline mr-1 opacity-50" />Email</label>
                <input 
                  type="email" 
                  value={profileData.email}
                  onChange={e => setProfileData({...profileData, email: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-slate-400 shadow-sm" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5"><Phone className="w-3.5 h-3.5 inline mr-1 opacity-50" />Mobile</label>
                <input 
                  type="tel" 
                  value={profileData.mobile}
                  onChange={e => setProfileData({...profileData, mobile: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-slate-400 shadow-sm" 
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5"><Building className="w-3.5 h-3.5 inline mr-1 opacity-50" />Branch</label>
                <input type="text" value={user?.branch?.name || 'Unassigned'} disabled className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-500 shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5"><Shield className="w-3.5 h-3.5 inline mr-1 opacity-50" />Role</label>
                <input type="text" value={user?.role?.name || ''} disabled className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-500 shadow-sm" />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Security</h2>
              <p className="text-sm text-slate-500">Manage your account security and password.</p>
            </div>
            <button 
              onClick={() => setIsPasswordModalOpen(true)}
              className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50 flex items-center transition-colors shadow-sm"
            >
              <Lock className="w-4 h-4 mr-2 opacity-70" />
              Change Password
            </button>
          </div>
        </section>
      </div>

      <Modal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
        title="Change Password"
        primaryAction={handleChangePassword}
        primaryLabel={passwordSubmitting ? "Updating..." : "Update Password"}
      >
        <form className="space-y-4" onSubmit={handleChangePassword}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Password <span className="text-red-500">*</span></label>
            <input 
              type="password" 
              value={passwordData.currentPassword}
              onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
              required
              placeholder="••••••••" 
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-slate-400 shadow-sm" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password <span className="text-red-500">*</span></label>
            <input 
              type="password" 
              value={passwordData.newPassword}
              onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
              required
              minLength={6}
              placeholder="••••••••" 
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-slate-400 shadow-sm" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm New Password <span className="text-red-500">*</span></label>
            <input 
              type="password" 
              value={passwordData.confirmPassword}
              onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
              required
              minLength={6}
              placeholder="••••••••" 
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-slate-400 shadow-sm" 
            />
          </div>
          <button type="submit" className="hidden">Submit</button>
        </form>
      </Modal>

    </div>
  );
}

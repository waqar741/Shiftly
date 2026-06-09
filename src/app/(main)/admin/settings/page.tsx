"use client";

import React, { useState } from "react";
import { Save } from "lucide-react";
import { useToast } from "@/components/ui/components";

export default function SettingsPage() {
  const { success } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const handleSave = () => {
    setSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      success("Settings saved successfully!");
      setSubmitting(false);
    }, 500);
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage global application configurations and business rules.
          </p>
        </div>
        <button onClick={handleSave} disabled={submitting} className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 shadow-sm flex items-center transition-colors disabled:opacity-50">
          <Save className="w-4 h-4 mr-2" />
          {submitting ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="space-y-6 pb-10">
        <section className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-base font-semibold text-slate-900">General Settings</h2>
            <p className="text-sm text-slate-500">Basic organization information.</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-3 gap-4 items-center">
              <label className="text-sm font-medium text-slate-700">Company Name</label>
              <div className="col-span-2">
                <input type="text" defaultValue="Shiftly Corp" className="w-full max-w-md px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-slate-400 shadow-sm" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 items-center">
              <label className="text-sm font-medium text-slate-700">Timezone</label>
              <div className="col-span-2">
                <select className="w-full max-w-md px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-slate-400 shadow-sm">
                  <option>Asia/Kolkata</option>
                  <option>UTC</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 items-center">
              <label className="text-sm font-medium text-slate-700">Currency</label>
              <div className="col-span-2">
                <select className="w-full max-w-md px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-slate-400 shadow-sm" disabled>
                  <option>INR (₹)</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 items-start">
              <label className="text-sm font-medium text-slate-700 mt-2">Logo</label>
              <div className="col-span-2">
                <div className="border-2 border-dashed border-slate-200 rounded-md p-4 text-center max-w-md hover:border-slate-300 transition-colors cursor-pointer">
                  <span className="text-sm text-slate-500">Click to upload company logo (PNG, SVG)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-base font-semibold text-slate-900">Shift Rules</h2>
            <p className="text-sm text-slate-500">Configure rules for shift submission and approval.</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-3 gap-4 items-center">
              <label className="text-sm font-medium text-slate-700">Allow Edit After Submission</label>
              <div className="col-span-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-900"></div>
                </label>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 items-center">
              <label className="text-sm font-medium text-slate-700">Auto Approve Admin Entries</label>
              <div className="col-span-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-900"></div>
                </label>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 items-center">
              <label className="text-sm font-medium text-slate-700">Maximum Back Date Entry (Days)</label>
              <div className="col-span-2">
                <input type="number" defaultValue="7" className="w-full max-w-xs px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-slate-400 shadow-sm" />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-base font-semibold text-slate-900">Expense Rules</h2>
            <p className="text-sm text-slate-500">Configure rules for expense claims.</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-3 gap-4 items-center">
              <label className="text-sm font-medium text-slate-700">Receipt Mandatory Above Amount</label>
              <div className="col-span-2 flex items-center">
                <span className="text-sm text-slate-500 mr-2">₹</span>
                <input type="number" defaultValue="500" className="w-full max-w-xs px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-slate-400 shadow-sm" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 items-center">
              <label className="text-sm font-medium text-slate-700">Maximum Expense Limit (Monthly)</label>
              <div className="col-span-2 flex items-center">
                <span className="text-sm text-slate-500 mr-2">₹</span>
                <input type="number" defaultValue="5000" className="w-full max-w-xs px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-slate-400 shadow-sm" />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-base font-semibold text-slate-900">Pagination Settings</h2>
            <p className="text-sm text-slate-500">Configure default table display settings.</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-3 gap-4 items-center">
              <label className="text-sm font-medium text-slate-700">Default Page Size</label>
              <div className="col-span-2">
                <select className="w-full max-w-xs px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-slate-400 shadow-sm">
                  <option>25</option>
                  <option>50</option>
                  <option>100</option>
                </select>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

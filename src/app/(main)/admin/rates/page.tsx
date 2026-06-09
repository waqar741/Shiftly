"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Filter, History, Edit } from "lucide-react";
import { Modal, SearchableSelect, useToast } from "@/components/ui/components";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function RatesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { success, error: toastError } = useToast();

  const [rates, setRates] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [shiftTypes, setShiftTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const branchFilter = searchParams.get("branch_id") || "";
  const shiftTypeFilter = searchParams.get("shift_type_id") || "";

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    branch_id: '',
    shift_type_id: '',
    rate: '',
    effective_from: new Date().toISOString().split('T')[0]
  });

  // Update URL on filter changes
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleBranchFilter = (val: string) => {
    router.push(pathname + "?" + createQueryString("branch_id", val));
  };

  const handleShiftTypeFilter = (val: string) => {
    router.push(pathname + "?" + createQueryString("shift_type_id", val));
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ratesRes, branchesRes, shiftTypesRes] = await Promise.all([
        fetch(`/api/v1/rates?${searchParams.toString()}`),
        fetch('/api/v1/branches'),
        fetch('/api/v1/shift-types')
      ]);

      if (ratesRes.ok) {
        const { data } = await ratesRes.json();
        setRates(data || []);
      }
      if (branchesRes.ok) {
        const { data } = await branchesRes.json();
        setBranches(data || []);
      }
      if (shiftTypesRes.ok) {
        const { data } = await shiftTypesRes.json();
        setShiftTypes(data || []);
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchParams]);

  const openAddModal = () => {
    setFormData({
      branch_id: '',
      shift_type_id: '',
      rate: '',
      effective_from: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.branch_id || !formData.shift_type_id || !formData.rate || !formData.effective_from) {
      toastError("All fields are required.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/v1/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branch_id: parseInt(formData.branch_id),
          shift_type_id: parseInt(formData.shift_type_id),
          rate: parseFloat(formData.rate),
          effective_from: formData.effective_from
        })
      });

      const data = await res.json();

      if (res.ok) {
        setIsModalOpen(false);
        success("Rate created successfully!");
        fetchData();
      } else {
        toastError(data.error?.message || "Failed to create rate");
      }
    } catch (error) {
      toastError("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const branchOptions = branches.map(b => ({ label: b.name, value: String(b.id) }));
  const shiftTypeOptions = shiftTypes.map(st => ({ label: st.name, value: String(st.id) }));

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Rate Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure rates per branch and shift type. Rates apply from their effective date.
          </p>
        </div>
        <button onClick={openAddModal} className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 shadow-sm flex items-center transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Create Rate
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex-1 flex flex-col min-h-0">
        <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap gap-2 items-center bg-slate-50/50">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 hidden sm:block" />
          <SearchableSelect
            options={[{label: "All Branches", value: ""}, ...branchOptions]}
            value={branchFilter}
            onChange={handleBranchFilter}
            placeholder="Filter by Branch"
            className="w-48"
          />
          <SearchableSelect
            options={[{label: "All Shift Types", value: ""}, ...shiftTypeOptions]}
            value={shiftTypeFilter}
            onChange={handleShiftTypeFilter}
            placeholder="Filter by Shift Type"
            className="w-48"
          />
        </div>

        <div className="overflow-auto flex-1">
          <table className="w-full text-left whitespace-nowrap border-collapse min-w-[800px]">
            <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-200">
              <tr className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3">Branch</th>
                <th className="px-6 py-3">Shift Type</th>
                <th className="px-6 py-3 text-right">Rate</th>
                <th className="px-6 py-3">Effective From</th>
                <th className="px-6 py-3">Effective To</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Loading rates...
                  </td>
                </tr>
              ) : rates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No rates found.
                  </td>
                </tr>
              ) : (
                rates.map((rate) => (
                  <tr key={rate.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-3 text-slate-900 font-medium">{rate.branch?.name}</td>
                    <td className="px-6 py-3 text-slate-600">{rate.shiftType?.name}</td>
                    <td className="px-6 py-3 text-right font-medium text-slate-900">₹ {rate.rate}</td>
                    <td className="px-6 py-3 text-slate-600">{new Date(rate.effectiveFrom).toLocaleDateString()}</td>
                    <td className="px-6 py-3 text-slate-400">{rate.effectiveTo ? new Date(rate.effectiveTo).toLocaleDateString() : '-'}</td>
                    <td className="px-6 py-3 text-right">
                      <button className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors" title="View History">
                        <History className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Create New Rate"
        primaryAction={handleSave}
        primaryLabel={submitting ? "Saving..." : "Create Rate"}
      >
        <form className="space-y-4" onSubmit={handleSave}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Branch <span className="text-red-500">*</span></label>
              <SearchableSelect
                options={branchOptions}
                value={formData.branch_id}
                onChange={(val) => setFormData({...formData, branch_id: val})}
                placeholder="Select Branch"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Shift Type <span className="text-red-500">*</span></label>
              <SearchableSelect
                options={shiftTypeOptions}
                value={formData.shift_type_id}
                onChange={(val) => setFormData({...formData, shift_type_id: val})}
                placeholder="Select Shift Type"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Rate (₹) <span className="text-red-500">*</span></label>
            <input 
              type="number" 
              step="0.01"
              value={formData.rate}
              onChange={e => setFormData({...formData, rate: e.target.value})}
              required
              placeholder="800" 
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm text-slate-900 focus:outline-none focus:border-slate-400" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Effective From <span className="text-red-500">*</span></label>
            <input 
              type="date" 
              value={formData.effective_from}
              onChange={e => setFormData({...formData, effective_from: e.target.value})}
              required
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm text-slate-900 focus:outline-none focus:border-slate-400" 
            />
          </div>
          <button type="submit" className="hidden">Submit</button>
        </form>
      </Modal>
    </div>
  );
}

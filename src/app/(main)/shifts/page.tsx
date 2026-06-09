"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Filter, Calendar, ChevronDown, Search, RotateCcw } from "lucide-react";
import { Modal, Pagination, SearchableSelect, useToast } from "@/components/ui/components";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";

export default function MyShiftsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { success, error: toastError } = useToast();

  const [shifts, setShifts] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [shiftTypes, setShiftTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const branchFilter = searchParams.get("branch_id") || "";
  const statusFilter = searchParams.get("status") || "";
  const shiftTypeFilter = searchParams.get("shift_type_id") || "";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    branch_id: '',
    shift_type_id: '',
    remarks: ''
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

  const handleBranchFilter = (val: string) => router.push(pathname + "?" + createQueryString("branch_id", val));
  const handleStatusFilter = (val: string) => router.push(pathname + "?" + createQueryString("status", val));
  const handleShiftTypeFilter = (val: string) => router.push(pathname + "?" + createQueryString("shift_type_id", val));
  const resetFilters = () => router.push(pathname);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [shiftsRes, branchesRes, shiftTypesRes] = await Promise.all([
        fetch(`/api/v1/shifts?${searchParams.toString()}`),
        fetch('/api/v1/branches'),
        fetch('/api/v1/shift-types')
      ]);

      if (shiftsRes.ok) {
        const data = await shiftsRes.json();
        setShifts(data?.data?.items || []);
      }
      if (branchesRes.ok) {
        const data = await branchesRes.json();
        setBranches(data.data || []);
      }
      if (shiftTypesRes.ok) {
        const data = await shiftTypesRes.json();
        setShiftTypes(data.data || []);
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

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.branch_id || !formData.shift_type_id || !formData.date) {
      toastError("Please fill in all required fields.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/v1/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          work_date: formData.date,
          branch_id: parseInt(formData.branch_id),
          shift_type_id: parseInt(formData.shift_type_id),
          remarks: formData.remarks,
          employee_id: 3 // Hardcoded for demo/MVP without auth
        })
      });

      const data = await res.json();

      if (res.ok) {
        setIsModalOpen(false);
        success("Shift submitted successfully!");
        fetchData();
        setFormData({
          date: new Date().toISOString().split('T')[0],
          branch_id: '',
          shift_type_id: '',
          remarks: ''
        });
      } else {
        toastError(data.error?.message || "Failed to submit shift");
      }
    } catch (error) {
      toastError("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const branchOptions = branches.map(b => ({ label: b.name, value: String(b.id) }));
  const shiftTypeOptions = shiftTypes.map(st => ({ label: st.name, value: String(st.id) }));
  const statusOptions = [
    { label: "Pending", value: "PENDING" },
    { label: "Approved", value: "APPROVED" },
    { label: "Rejected", value: "REJECTED" }
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">My Shifts</h1>
          <p className="text-sm text-slate-500 mt-1">
            Submit and view your historical shift records.
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 shadow-sm flex items-center transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Submit Shift
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex-1 flex flex-col min-h-0">
        <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap gap-3 items-center justify-between bg-slate-50/50">
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 hidden sm:block" />
            <SearchableSelect
              options={[{label: "All Branches", value: ""}, ...branchOptions]}
              value={branchFilter}
              onChange={handleBranchFilter}
              placeholder="All Branches"
              className="w-40"
            />
            <SearchableSelect
              options={[{label: "All Statuses", value: ""}, ...statusOptions]}
              value={statusFilter}
              onChange={handleStatusFilter}
              placeholder="All Statuses"
              className="w-36"
            />
            <SearchableSelect
              options={[{label: "All Shift Types", value: ""}, ...shiftTypeOptions]}
              value={shiftTypeFilter}
              onChange={handleShiftTypeFilter}
              placeholder="All Shift Types"
              className="w-40"
            />
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={resetFilters} className="px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center shadow-sm transition-colors" title="Reset Filters">
              <RotateCcw className="w-3.5 h-3.5 mr-1.5 opacity-70" /> Reset Filters
            </button>
          </div>
        </div>

        <div className="overflow-auto flex-1">
          <table className="w-full text-left whitespace-nowrap border-collapse min-w-[800px]">
            <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-200">
              <tr className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Branch</th>
                <th className="px-6 py-3">Shift Type</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3">Created At</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    Loading shifts...
                  </td>
                </tr>
              ) : shifts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    No shifts found. Submit your first shift to get started.
                  </td>
                </tr>
              ) : (
                shifts.map((shift) => (
                  <tr key={shift.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-3 text-slate-900 font-medium">{new Date(shift.workDate).toLocaleDateString()}</td>
                    <td className="px-6 py-3 text-slate-600">{shift.branch?.name}</td>
                    <td className="px-6 py-3 text-slate-600">{shift.shiftType?.name}</td>
                    <td className="px-6 py-3 text-right font-medium text-slate-900">₹ {shift.calculatedPay}</td>
                    <td className="px-6 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${shift.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : shift.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                        {shift.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-500 text-xs">{new Date(shift.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-3 text-right">
                        <button className="text-xs font-medium text-indigo-600 hover:text-indigo-500">View</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination total={shifts.length} page={1} pageSize={25} />
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Submit Shift"
        primaryAction={handleSave}
        primaryLabel={submitting ? "Submitting..." : "Submit Shift"}
      >
        <form className="space-y-4" onSubmit={handleSave}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Date <span className="text-red-500">*</span></label>
              <input 
                type="date" 
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                required 
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm text-slate-900 focus:outline-none focus:border-slate-400" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Branch <span className="text-red-500">*</span></label>
              <SearchableSelect
                options={branchOptions}
                value={formData.branch_id}
                onChange={(val) => setFormData({...formData, branch_id: val})}
                placeholder="Select Branch"
              />
            </div>
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
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Remarks (Optional)</label>
            <textarea 
              rows={3} 
              value={formData.remarks}
              onChange={e => setFormData({...formData, remarks: e.target.value})}
              placeholder="Add any notes about this shift..." 
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm text-slate-900 focus:outline-none focus:border-slate-400 resize-none"
            ></textarea>
          </div>
          <button type="submit" className="hidden">Submit</button>
        </form>
      </Modal>
    </div>
  );
}

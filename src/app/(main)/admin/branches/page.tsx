"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, Plus, MapPin, Edit, PowerOff, CheckCircle } from "lucide-react";
import { Modal, ConfirmDialog, useToast } from "@/components/ui/components";
import { useDebounce } from "@/hooks/useDebounce";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

function BranchesPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { success, error: toastError } = useToast();

  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search State
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    branchId: 0,
    newStatus: "",
  });

  const [formData, setFormData] = useState({
    id: 0,
    name: '',
    city: '',
    address: ''
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

  useEffect(() => {
    router.push(pathname + "?" + createQueryString("search", debouncedSearch));
  }, [debouncedSearch, pathname, router, createQueryString]);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/branches?${searchParams.toString()}`);
      if (res.ok) {
        const { data } = await res.json();
        setBranches(data || []);
      }
    } catch (error) {
      console.error("Failed to fetch branches", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, [searchParams]);

  const openAddModal = () => {
    setIsEditMode(false);
    setFormData({ id: 0, name: '', city: '', address: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (branch: any) => {
    setIsEditMode(true);
    setFormData({
      id: branch.id,
      name: branch.name,
      city: branch.city,
      address: branch.address || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.name || !formData.city) {
      toastError("Branch name and city are required.");
      return;
    }

    try {
      setSubmitting(true);
      const url = '/api/v1/branches';
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setIsModalOpen(false);
        success(`Branch ${isEditMode ? 'updated' : 'created'} successfully!`);
        fetchBranches();
      } else {
        toastError(data.error?.message || `Failed to ${isEditMode ? 'update' : 'create'} branch`);
      }
    } catch (error) {
      toastError("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmToggleStatus = (branch: any) => {
    const newStatus = branch.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setConfirmDialog({
      isOpen: true,
      title: `${newStatus === "ACTIVE" ? "Activate" : "Deactivate"} Branch`,
      message: `Are you sure you want to ${newStatus.toLowerCase()} the ${branch.name} branch?`,
      branchId: branch.id,
      newStatus,
    });
  };

  const handleToggleStatus = async () => {
    try {
      const res = await fetch('/api/v1/branches', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: confirmDialog.branchId, status: confirmDialog.newStatus })
      });
      const data = await res.json();
      if (res.ok) {
        success(data.message || `Branch status updated`);
        fetchBranches();
      } else {
        toastError(data.error?.message || "Failed to update status");
      }
    } catch (err) {
      toastError("An unexpected error occurred");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Branches</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your organization's physical locations and branch settings.
          </p>
        </div>
        <button onClick={openAddModal} className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 shadow-sm flex items-center transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Create Branch
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex-1 flex flex-col min-h-0">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search branches..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-300 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="overflow-auto flex-1">
          <table className="w-full text-left whitespace-nowrap border-collapse min-w-[800px]">
            <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-200">
              <tr className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3">Branch Name</th>
                <th className="px-6 py-3">City</th>
                <th className="px-6 py-3">Employees</th>
                <th className="px-6 py-3">Created Date</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Loading branches...
                  </td>
                </tr>
              ) : branches.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No branches found. Create one to get started.
                  </td>
                </tr>
              ) : (
                branches.map((branch) => (
                  <tr key={branch.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-3 font-medium text-slate-900 flex items-center">
                      <MapPin className="w-4 h-4 text-slate-400 mr-2" />
                      {branch.name}
                    </td>
                    <td className="px-6 py-3 text-slate-600">{branch.city}</td>
                    <td className="px-6 py-3 text-slate-600">{branch._count?.users || 0}</td>
                    <td className="px-6 py-3 text-slate-600">{new Date(branch.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${branch.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-800"}`}>
                        {branch.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button onClick={() => openEditModal(branch)} className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => confirmToggleStatus(branch)} className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors ml-1" title={branch.status === "ACTIVE" ? "Deactivate" : "Activate"}>
                        {branch.status === "ACTIVE" ? <PowerOff className="w-4 h-4 text-red-500" /> : <CheckCircle className="w-4 h-4 text-emerald-500" />}
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
        title={isEditMode ? "Edit Branch" : "Create Branch"}
        primaryAction={handleSave}
        primaryLabel={submitting ? "Saving..." : (isEditMode ? "Update Branch" : "Create Branch")}
      >
        <form className="space-y-4" onSubmit={handleSave}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Branch Name <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Panvel Main" 
              required
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm text-slate-900 focus:outline-none focus:border-slate-400" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">City <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              value={formData.city}
              onChange={e => setFormData({...formData, city: e.target.value})}
              placeholder="e.g. Navi Mumbai" 
              required
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm text-slate-900 focus:outline-none focus:border-slate-400" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Address</label>
            <textarea 
              rows={3} 
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
              placeholder="Full branch address..." 
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm text-slate-900 focus:outline-none focus:border-slate-400 resize-none"
            ></textarea>
          </div>
          <button type="submit" className="hidden">Submit</button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onClose={() => setConfirmDialog({...confirmDialog, isOpen: false})}
        onConfirm={handleToggleStatus}
        confirmLabel="Confirm"
        destructive={confirmDialog.newStatus === "INACTIVE"}
      />
    </div>
  );
}


export default function BranchesPage() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <BranchesPageContent />
    </React.Suspense>
  );
}
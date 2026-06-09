"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, Plus, Edit, PowerOff, CheckCircle } from "lucide-react";
import { Modal, ConfirmDialog, useToast, EmptyState } from "@/components/ui/components";
import { useDebounce } from "@/hooks/useDebounce";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

function ShiftTypesPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { success, error: toastError } = useToast();

  const [shiftTypes, setShiftTypes] = useState<any[]>([]);
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
    shiftTypeId: 0,
    newStatus: "",
  });

  const [formData, setFormData] = useState({
    id: 0,
    name: '',
    description: ''
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

  const fetchShiftTypes = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/shift-types?${searchParams.toString()}`);
      if (res.ok) {
        const { data } = await res.json();
        setShiftTypes(data || []);
      }
    } catch (error) {
      console.error("Failed to fetch shift types", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShiftTypes();
  }, [searchParams]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.name) {
      toastError("Shift type name is required.");
      return;
    }

    try {
      setSubmitting(true);
      const url = '/api/v1/shift-types';
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setIsModalOpen(false);
        success(`Shift Type ${isEditMode ? 'updated' : 'added'} successfully!`);
        fetchShiftTypes();
      } else {
        toastError(data.error?.message || `Failed to ${isEditMode ? 'update' : 'add'} shift type`);
      }
    } catch (error) {
      toastError("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      const res = await fetch('/api/v1/shift-types', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: confirmDialog.shiftTypeId, status: confirmDialog.newStatus })
      });

      const data = await res.json();

      if (res.ok) {
        success(data.message || `Shift Type status updated successfully!`);
        fetchShiftTypes();
      } else {
        toastError(data.error?.message || "Failed to update status");
      }
    } catch (error) {
      toastError("An unexpected error occurred");
    }
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setFormData({ id: 0, name: '', description: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (st: any) => {
    setIsEditMode(true);
    setFormData({ id: st.id, name: st.name, description: st.description || '' });
    setIsModalOpen(true);
  };

  const openStatusConfirm = (st: any) => {
    const newStatus = st.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setConfirmDialog({
      isOpen: true,
      title: `${newStatus === 'ACTIVE' ? "Enable" : "Disable"} Shift Type?`,
      message: newStatus === 'ACTIVE'
        ? "This will allow new shifts to be created using this type."
        : "This will prevent new shifts from using this type. Existing records won't be affected.",
      shiftTypeId: st.id,
      newStatus,
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Shift Types</h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure different types of shifts available for employees.
          </p>
        </div>
        <button onClick={openAddModal} className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 shadow-sm flex items-center transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Add Shift Type
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
              placeholder="Search shift types..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-300 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="overflow-auto flex-1">
          <table className="w-full text-left whitespace-nowrap border-collapse min-w-[600px]">
            <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-200">
              <tr className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Loading shift types...
                  </td>
                </tr>
              ) : shiftTypes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No shift types found. Add one to get started.
                  </td>
                </tr>
              ) : (
                shiftTypes.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-3 font-medium text-slate-900">{st.name}</td>
                    <td className="px-6 py-3 text-slate-600">{st.description || '-'}</td>
                    <td className="px-6 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${st.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}`}>
                        {st.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button onClick={() => openEditModal(st)} className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors" title="Edit"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => openStatusConfirm(st)} className={`p-1.5 ml-1 transition-colors ${st.status === 'ACTIVE' ? 'text-slate-400 hover:text-red-600' : 'text-slate-400 hover:text-emerald-600'}`} title={st.status === 'ACTIVE' ? 'Disable' : 'Enable'}>
                        {st.status === 'ACTIVE' ? <PowerOff className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
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
        title={isEditMode ? "Edit Shift Type" : "Add Shift Type"} 
        primaryAction={handleSave}
        primaryLabel={submitting ? "Saving..." : "Save"}
      >
        <form className="space-y-4" onSubmit={handleSave}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Name <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Sunday Shift" 
              required 
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm text-slate-900 focus:outline-none focus:border-slate-400" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea 
              rows={3} 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Brief description..." 
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm text-slate-900 focus:outline-none focus:border-slate-400 resize-none"
            ></textarea>
          </div>
          <button type="submit" className="hidden">Submit</button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={handleToggleStatus}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.newStatus === 'INACTIVE' ? "Disable" : "Enable"}
        destructive={confirmDialog.newStatus === 'INACTIVE'}
      />
    </div>
  );
}


export default function ShiftTypesPage() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <ShiftTypesPageContent />
    </React.Suspense>
  );
}
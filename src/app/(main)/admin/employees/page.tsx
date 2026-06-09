"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, Plus, Upload, MoreHorizontal, Edit, UserX, UserCheck } from "lucide-react";
import { Modal, ConfirmDialog, SearchableSelect, useToast } from "@/components/ui/components";
import { useDebounce } from "@/hooks/useDebounce";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

function EmployeesPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast, success, error: toastError } = useToast();

  const [employees, setEmployees] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filters State
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const branchFilter = searchParams.get("branch_id") || "";
  const roleFilter = searchParams.get("role_id") || "";

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    employeeId: 0,
    newStatus: "",
  });

  const [formData, setFormData] = useState({
    id: 0,
    employee_code: '',
    full_name: '',
    email: '',
    mobile: '',
    branch_id: '',
    role_id: '',
    password: ''
  });

  const roles = [
    { id: 2, name: 'BRANCH_MANAGER', label: 'Branch Manager' },
    { id: 3, name: 'EMPLOYEE', label: 'Employee' }
  ];

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

  const handleBranchFilter = (val: string) => {
    router.push(pathname + "?" + createQueryString("branch_id", val));
  };

  const handleRoleFilter = (val: string) => {
    router.push(pathname + "?" + createQueryString("role_id", val));
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/employees?${searchParams.toString()}`);
      if (res.ok) {
        const { data } = await res.json();
        setEmployees(data.items || []);
      }
    } catch (error) {
      console.error("Failed to fetch employees", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await fetch('/api/v1/branches');
      if (res.ok) {
        const { data } = await res.json();
        setBranches(data || []);
      }
    } catch (error) {
      console.error("Failed to fetch branches", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [searchParams]);

  useEffect(() => {
    fetchBranches();
  }, []);

  const openAddModal = () => {
    setIsEditMode(false);
    setFormData({
      id: 0, employee_code: '', full_name: '', email: '', mobile: '',
      branch_id: '', role_id: '', password: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (emp: any) => {
    setIsEditMode(true);
    setFormData({
      id: emp.id,
      employee_code: emp.employeeCode,
      full_name: emp.fullName,
      email: emp.email,
      mobile: emp.mobile || '',
      branch_id: String(emp.branch?.id || ''), // Assume branch might be populated or need fixing if ID isn't returned
      role_id: String(roles.find(r => r.name === emp.role?.name)?.id || ''),
      password: '' // empty means no change in backend if handled properly
    });
    // Need to make sure backend returns branchId and roleId directly if we want to populate it easily.
    // For now, doing our best mapping.
    setIsModalOpen(true);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!formData.full_name || !formData.email || !formData.employee_code || !formData.branch_id || !formData.role_id || (!isEditMode && !formData.password)) {
      toastError("Please fill in all required fields.");
      return;
    }

    try {
      setSubmitting(true);
      const url = '/api/v1/employees';
      const method = isEditMode ? 'PUT' : 'POST';
      const body = {
        ...formData,
        branch_id: parseInt(formData.branch_id),
        role_id: parseInt(formData.role_id)
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (res.ok) {
        setIsModalOpen(false);
        success(`Employee ${isEditMode ? 'updated' : 'added'} successfully!`);
        fetchEmployees();
      } else {
        toastError(data.error?.message || `Failed to ${isEditMode ? 'update' : 'add'} employee`);
      }
    } catch (err) {
      toastError("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmToggleStatus = (emp: any) => {
    const newStatus = emp.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setConfirmDialog({
      isOpen: true,
      title: `${newStatus === "ACTIVE" ? "Activate" : "Deactivate"} Employee`,
      message: `Are you sure you want to ${newStatus.toLowerCase()} ${emp.fullName}?`,
      employeeId: emp.id,
      newStatus,
    });
  };

  const handleToggleStatus = async () => {
    try {
      const res = await fetch('/api/v1/employees', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: confirmDialog.employeeId, status: confirmDialog.newStatus })
      });
      const data = await res.json();
      if (res.ok) {
        success(data.message || `Employee status updated`);
        fetchEmployees();
      } else {
        toastError(data.error?.message || "Failed to update status");
      }
    } catch (err) {
      toastError("An unexpected error occurred");
    }
  };

  const branchOptions = branches.map(b => ({ label: b.name, value: String(b.id) }));
  const roleOptions = roles.map(r => ({ label: r.label, value: String(r.id) }));

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Employees</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your workforce across all branches.
          </p>
        </div>
        <div className="flex space-x-3">
          <button onClick={openAddModal} className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 shadow-sm flex items-center transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex-1 flex flex-col min-h-0">
        <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3 items-center justify-between">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, code or email..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-300 focus:bg-white transition-all"
            />
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <SearchableSelect
              options={[{label: "All Branches", value: ""}, ...branchOptions]}
              value={branchFilter}
              onChange={handleBranchFilter}
              placeholder="Filter by Branch"
              className="w-48"
            />
            <SearchableSelect
              options={[{label: "All Roles", value: ""}, ...roleOptions]}
              value={roleFilter}
              onChange={handleRoleFilter}
              placeholder="Filter by Role"
              className="w-40"
            />
          </div>
        </div>

        <div className="overflow-auto flex-1">
          {/* Desktop Table View */}
          <table className="hidden md:table w-full text-left whitespace-nowrap border-collapse min-w-[800px]">
            <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-200">
              <tr className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3">Code</th>
                <th className="px-6 py-3">Mobile</th>
                <th className="px-6 py-3">Branch</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    Loading employees...
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    No employees found. Add one to get started.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-semibold text-xs mr-3">
                          {emp.fullName.split(" ").map((n: string) => n[0]).join("").substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{emp.fullName}</p>
                          <p className="text-xs text-slate-500">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-slate-600 font-mono text-xs">{emp.employeeCode}</td>
                    <td className="px-6 py-3 text-slate-600">{emp.mobile}</td>
                    <td className="px-6 py-3 text-slate-600">{emp.branch?.name}</td>
                    <td className="px-6 py-3 text-slate-600">{emp.role?.name}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${emp.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-800"}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button onClick={() => openEditModal(emp)} className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => confirmToggleStatus(emp)} className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors ml-1" title={emp.status === "ACTIVE" ? "Deactivate" : "Activate"}>
                        {emp.status === "ACTIVE" ? <UserX className="w-4 h-4 text-red-500" /> : <UserCheck className="w-4 h-4 text-emerald-500" />}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Mobile Cards View */}
          <div className="md:hidden flex flex-col p-4 space-y-4">
            {loading ? (
              <div className="text-center text-slate-500 py-8">Loading employees...</div>
            ) : employees.length === 0 ? (
              <div className="text-center text-slate-500 py-8">No employees found. Add one to get started.</div>
            ) : (
              employees.map((emp) => (
                <div key={emp.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-semibold text-sm mr-3">
                        {emp.fullName.split(" ").map((n: string) => n[0]).join("").substring(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 leading-tight">{emp.fullName}</p>
                        <p className="text-xs text-slate-500">{emp.email}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${emp.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-800"}`}>
                      {emp.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-4 border-t border-slate-100 pt-3">
                    <div>
                      <span className="block text-slate-400 mb-0.5 text-[10px] uppercase">Code</span>
                      <span className="font-mono">{emp.employeeCode}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 mb-0.5 text-[10px] uppercase">Mobile</span>
                      <span>{emp.mobile}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 mb-0.5 text-[10px] uppercase">Branch</span>
                      <span>{emp.branch?.name}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 mb-0.5 text-[10px] uppercase">Role</span>
                      <span>{emp.role?.name}</span>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                    <button onClick={() => openEditModal(emp)} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-md text-xs font-medium flex items-center transition-colors">
                      <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit
                    </button>
                    <button onClick={() => confirmToggleStatus(emp)} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-md text-xs font-medium flex items-center transition-colors">
                      {emp.status === "ACTIVE" ? (
                        <><UserX className="w-3.5 h-3.5 mr-1.5 text-red-500" /> Deactivate</>
                      ) : (
                        <><UserCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-500" /> Activate</>
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={isEditMode ? "Edit Employee" : "Add New Employee"}
        primaryAction={handleSave}
        primaryLabel={submitting ? "Saving..." : "Save Employee"}
      >
        <form className="space-y-4" onSubmit={handleSave}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Employee Code <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={formData.employee_code}
                onChange={e => setFormData({...formData, employee_code: e.target.value})}
                placeholder="EMP-001" 
                required
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm text-slate-900 focus:outline-none focus:border-slate-400" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={formData.full_name}
                onChange={e => setFormData({...formData, full_name: e.target.value})}
                placeholder="Jane Doe" 
                required
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm text-slate-900 focus:outline-none focus:border-slate-400" 
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email <span className="text-red-500">*</span></label>
              <input 
                type="email" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder="jane@example.com" 
                required 
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm text-slate-900 focus:outline-none focus:border-slate-400" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Mobile <span className="text-red-500">*</span></label>
              <input 
                type="tel" 
                value={formData.mobile}
                onChange={e => setFormData({...formData, mobile: e.target.value})}
                placeholder="9876543210" 
                required 
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm text-slate-900 focus:outline-none focus:border-slate-400" 
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Role <span className="text-red-500">*</span></label>
              <SearchableSelect
                options={roleOptions}
                value={formData.role_id}
                onChange={(val) => setFormData({...formData, role_id: val})}
                placeholder="Select Role"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Password {isEditMode ? <span className="text-slate-400 font-normal">(Leave blank to keep unchanged)</span> : <span className="text-red-500">*</span>}
            </label>
            <input 
              type="password" 
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              placeholder={isEditMode ? "••••••••" : "Temporary password"} 
              required={!isEditMode}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm text-slate-900 focus:outline-none focus:border-slate-400" 
            />
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


export default function EmployeesPage() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <EmployeesPageContent />
    </React.Suspense>
  );
}
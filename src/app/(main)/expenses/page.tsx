"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Filter, Calendar, ChevronDown, Check, X, Download, Search, RotateCcw } from "lucide-react";
import { Modal, ConfirmDialog, SearchableSelect, useToast } from "@/components/ui/components";
import { useRole } from "@/components/layout/RoleContext";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";

function ExpensesPageContent() {
  const { role } = useRole();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { success, error: toastError } = useToast();

  const [expenses, setExpenses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters State
  const statusFilter = searchParams.get("status") || "";
  const categoryFilter = searchParams.get("category_id") || "";
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    newStatus: "",
  });

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category_id: '',
    amount: '',
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

  const handleStatusFilter = (val: string) => router.push(pathname + "?" + createQueryString("status", val));
  const handleCategoryFilter = (val: string) => router.push(pathname + "?" + createQueryString("category_id", val));
  
  useEffect(() => {
    router.push(pathname + "?" + createQueryString("search", debouncedSearch));
  }, [debouncedSearch, pathname, router, createQueryString]);

  const resetFilters = () => {
    setSearchTerm("");
    router.push(pathname);
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/expenses?${searchParams.toString()}`);
      if (res.ok) {
        const { data } = await res.json();
        setExpenses(data || []);
      }
    } catch (error) {
      console.error("Failed to fetch expenses", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/v1/expense-categories');
      if (res.ok) {
        const { data } = await res.json();
        setCategories(data || []);
      }
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [searchParams]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.category_id || !formData.date || !formData.amount) {
      toastError("Please fill in all required fields.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/v1/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': '3' // Mock employee user for MVP without auth context
        },
        body: JSON.stringify({
          expense_date: formData.date,
          category_id: parseInt(formData.category_id),
          amount: parseFloat(formData.amount),
          description: formData.description
        })
      });

      const data = await res.json();

      if (res.ok) {
        setIsModalOpen(false);
        success("Expense claim submitted!");
        fetchExpenses();
        setFormData({
          date: new Date().toISOString().split('T')[0],
          category_id: '',
          amount: '',
          description: ''
        });
      } else {
        toastError(data.error?.message || "Failed to submit expense");
      }
    } catch (error) {
      toastError("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const openBulkStatusConfirm = (newStatus: string) => {
    if (selectedIds.size === 0) return;
    setConfirmDialog({
      isOpen: true,
      title: `${newStatus === 'APPROVED' ? 'Approve' : 'Reject'} Expenses?`,
      message: `Are you sure you want to ${newStatus.toLowerCase()} ${selectedIds.size} expense(s)?`,
      newStatus,
    });
  };

  const handleBulkStatusChange = async () => {
    try {
      const promises = Array.from(selectedIds).map(id => 
        fetch(`/api/v1/expenses`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, status: confirmDialog.newStatus })
        })
      );
      
      await Promise.all(promises);
      
      setSelectedIds(new Set());
      success(`Selected expenses marked as ${confirmDialog.newStatus}`);
      fetchExpenses();
    } catch (error) {
      toastError("An error occurred while updating expenses");
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === expenses.length && expenses.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(expenses.map(e => e.id)));
    }
  };

  const toggleSelect = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const isAdmin = role !== 'Employee';
  const categoryOptions = categories.map(c => ({ label: c.name, value: String(c.id) }));
  const statusOptions = [
    { label: "Pending", value: "PENDING" },
    { label: "Approved", value: "APPROVED" },
    { label: "Rejected", value: "REJECTED" }
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Expenses</h1>
          <p className="text-sm text-slate-500 mt-1">
            Submit and manage expense claims.
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 shadow-sm flex items-center transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          New Expense
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex-1 flex flex-col min-h-0">
        <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 hidden sm:block" />
            <SearchableSelect
              options={[{label: "All Statuses", value: ""}, ...statusOptions]}
              value={statusFilter}
              onChange={handleStatusFilter}
              placeholder="All Statuses"
              className="w-36"
            />
            <SearchableSelect
              options={[{label: "All Categories", value: ""}, ...categoryOptions]}
              value={categoryFilter}
              onChange={handleCategoryFilter}
              placeholder="All Categories"
              className="w-40"
            />
            <div className="relative w-48">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search description..." 
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs text-slate-700 focus:outline-none focus:border-slate-400 shadow-sm" 
              />
            </div>
            <button onClick={resetFilters} className="px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center shadow-sm transition-colors" title="Reset Filters">
              <RotateCcw className="w-3.5 h-3.5 opacity-70" />
            </button>
          </div>
          
          {isAdmin && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 mr-2">Admin Actions ({selectedIds.size})</span>
              <button 
                onClick={() => openBulkStatusConfirm('APPROVED')}
                disabled={selectedIds.size === 0}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 disabled:opacity-50 flex items-center shadow-sm transition-colors"
              >
                <Check className="w-3 h-3 mr-1.5 opacity-60" /> Approve
              </button>
              <button 
                onClick={() => openBulkStatusConfirm('REJECTED')}
                disabled={selectedIds.size === 0}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-medium text-slate-700 hover:bg-red-50 hover:border-red-200 hover:text-red-700 disabled:opacity-50 flex items-center shadow-sm transition-colors"
              >
                <X className="w-3 h-3 mr-1.5 opacity-60" /> Reject
              </button>
            </div>
          )}
        </div>

        <div className="overflow-auto flex-1">
          {/* Desktop Table View */}
          <table className="hidden md:table w-full text-left whitespace-nowrap border-collapse min-w-[800px]">
            <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-200">
              <tr className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                {isAdmin && (
                  <th className="px-6 py-3 w-10 text-center">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 accent-slate-800"
                      checked={selectedIds.size === expenses.length && expenses.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                )}
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-center">Receipt</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3">Created At</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={isAdmin ? 9 : 8} className="px-6 py-8 text-center text-slate-500">
                    Loading expenses...
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 9 : 8} className="px-6 py-8 text-center text-slate-500">
                    No expenses found.
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-slate-50/50 transition-colors group">
                    {isAdmin && (
                      <td className="px-6 py-3 text-center">
                        <input 
                          type="checkbox" 
                          className="rounded border-slate-300 accent-slate-800"
                          checked={selectedIds.has(expense.id)}
                          onChange={() => toggleSelect(expense.id)}
                        />
                      </td>
                    )}
                    <td className="px-6 py-3 text-slate-900 font-medium">{new Date(expense.expenseDate).toLocaleDateString()}</td>
                    <td className="px-6 py-3 text-slate-600">
                      <div>{expense.user?.fullName}</div>
                      <div className="text-xs text-slate-400">{expense.user?.employeeCode}</div>
                    </td>
                    <td className="px-6 py-3 text-slate-600">{expense.category?.name}</td>
                    <td className="px-6 py-3 text-slate-600 truncate max-w-[200px]" title={expense.description}>{expense.description || '-'}</td>
                    <td className="px-6 py-3 text-right font-medium text-slate-900">₹ {expense.amount}</td>
                    <td className="px-6 py-3 text-center">
                      {expense.receiptUrl ? (
                        <button className="text-indigo-600 hover:text-indigo-800">
                          <Download className="w-4 h-4 inline" />
                        </button>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        expense.status === "APPROVED" ? "bg-emerald-100 text-emerald-800" : 
                        expense.status === "REJECTED" ? "bg-red-100 text-red-800" :
                        "bg-amber-100 text-amber-800"
                      }`}>
                        {expense.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-500 text-xs">{new Date(expense.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Mobile Cards View */}
          <div className="md:hidden flex flex-col p-4 space-y-4">
            {loading ? (
              <div className="text-center text-slate-500 py-8">Loading expenses...</div>
            ) : expenses.length === 0 ? (
              <div className="text-center text-slate-500 py-8">No expenses found.</div>
            ) : (
              expenses.map((expense) => (
                <div key={expense.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col relative">
                  {isAdmin && (
                    <div className="absolute top-4 right-4">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300 accent-slate-800 w-5 h-5"
                        checked={selectedIds.has(expense.id)}
                        onChange={() => toggleSelect(expense.id)}
                      />
                    </div>
                  )}
                  <div className="flex items-start justify-between mb-3 pr-8">
                    <div>
                      <p className="font-medium text-slate-900 leading-tight">{expense.category?.name}</p>
                      <p className="text-xs text-slate-500">{new Date(expense.expenseDate).toLocaleDateString()} &middot; {expense.user?.fullName}</p>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      expense.status === "APPROVED" ? "bg-emerald-100 text-emerald-800" : 
                      expense.status === "REJECTED" ? "bg-red-100 text-red-800" :
                      "bg-amber-100 text-amber-800"
                    }`}>
                      {expense.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-4 bg-slate-50 p-2 rounded-md">
                    <div className="col-span-2">
                      <span className="block text-slate-400 mb-0.5 text-[10px] uppercase">Description</span>
                      <span className="truncate block" title={expense.description}>{expense.description || '-'}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 mb-0.5 text-[10px] uppercase">Amount</span>
                      <span className="font-medium text-slate-900">£ {expense.amount}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 mb-0.5 text-[10px] uppercase">Receipt</span>
                      {expense.receiptUrl ? (
                        <button className="text-indigo-600 hover:text-indigo-800 flex items-center h-full">
                          <Download className="w-4 h-4 inline mr-1" /> Download
                        </button>
                      ) : (
                        <span>-</span>
                      )}
                    </div>
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
        title="Submit Expense"
        primaryAction={handleSave}
        primaryLabel={submitting ? "Submitting..." : "Submit Expense"}
      >
        <form className="space-y-4" onSubmit={handleSave}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Category <span className="text-red-500">*</span></label>
              <SearchableSelect
                options={categoryOptions}
                value={formData.category_id}
                onChange={(val) => setFormData({...formData, category_id: val})}
                placeholder="Select Category"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount (₹) <span className="text-red-500">*</span></label>
            <input 
              type="number" 
              step="0.01"
              value={formData.amount}
              onChange={e => setFormData({...formData, amount: e.target.value})}
              required
              placeholder="1500" 
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm text-slate-900 focus:outline-none focus:border-slate-400" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea 
              rows={2} 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Cab fare from office to client..." 
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm text-slate-900 focus:outline-none focus:border-slate-400 resize-none"
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Receipt Upload (Coming Soon)</label>
            <div className="border-2 border-dashed border-slate-200 rounded-md p-4 text-center">
              <span className="text-sm text-slate-500">Drag and drop file here or click to browse</span>
            </div>
          </div>
          <button type="submit" className="hidden">Submit</button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={handleBulkStatusChange}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.newStatus === 'REJECTED' ? "Reject" : "Approve"}
        destructive={confirmDialog.newStatus === 'REJECTED'}
      />
    </div>
  );
}


export default function ExpensesPage() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <ExpensesPageContent />
    </React.Suspense>
  );
}
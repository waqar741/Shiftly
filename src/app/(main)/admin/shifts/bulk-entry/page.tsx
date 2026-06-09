"use client";

import React, { useState, useEffect } from "react";
import { Save, Plus, Trash2, Upload } from "lucide-react";
import { Select } from "@/components/ui/components";

export default function BulkShiftEntryPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [shiftTypes, setShiftTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [rows, setRows] = useState<any[]>([
    { id: Date.now(), employee_id: "", branch_id: "", date: new Date().toISOString().split("T")[0], shift_type_id: "" }
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, branchRes, typeRes] = await Promise.all([
          fetch("/api/v1/employees?page_size=100"),
          fetch("/api/v1/branches"),
          fetch("/api/v1/shift-types")
        ]);

        const empData = await empRes.json();
        const branchData = await branchRes.json();
        const typeData = await typeRes.json();

        if (empData.success) setEmployees(empData.data.items);
        if (branchData.success) setBranches(branchData.data);
        if (typeData.success) setShiftTypes(typeData.data);
      } catch (err) {
        console.error("Failed to fetch reference data", err);
        setError("Failed to load data. Please refresh.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddRow = () => {
    setRows([...rows, { id: Date.now(), employee_id: "", branch_id: "", date: new Date().toISOString().split("T")[0], shift_type_id: "" }]);
  };

  const handleRemoveRow = (id: number) => {
    if (rows.length > 1) {
      setRows(rows.filter(row => row.id !== id));
    }
  };

  const handleChange = (id: number, field: string, value: string) => {
    setRows(rows.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  const handleSaveAll = async () => {
    setError("");
    setSuccess("");
    
    // Validation
    const invalidRow = rows.find(r => !r.employee_id || !r.branch_id || !r.shift_type_id || !r.date);
    if (invalidRow) {
      setError("Please fill out all fields in all rows before saving.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        entries: rows.map(r => ({
          employee_id: parseInt(r.employee_id),
          branch_id: parseInt(r.branch_id),
          shift_type_id: parseInt(r.shift_type_id),
          work_date: r.date
        }))
      };

      const res = await fetch("/api/v1/shifts/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error?.message || "Failed to save shifts");
      } else {
        setSuccess(`Successfully saved ${data.data.success_count} shifts. ${data.data.failed_count > 0 ? `Failed: ${data.data.failed_count}` : ''}`);
        // Reset rows
        setRows([{ id: Date.now(), employee_id: "", branch_id: "", date: new Date().toISOString().split("T")[0], shift_type_id: "" }]);
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center"><p className="text-slate-500">Loading data...</p></div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Bulk Shift Entry</h1>
          <p className="text-sm text-slate-500 mt-1">
            Spreadsheet-style bulk entry for rapidly assigning shifts.
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm flex items-center transition-colors">
            <Upload className="w-4 h-4 mr-2 opacity-70" />
            Import Excel
          </button>
          <button 
            onClick={handleSaveAll}
            disabled={saving || rows.length === 0}
            className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 shadow-sm flex items-center transition-colors disabled:opacity-70"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save All"}
          </button>
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-md border border-green-200">{success}</div>}

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex-1 flex flex-col min-h-0">
        <div className="overflow-auto flex-1 p-0">
          <table className="w-full text-left whitespace-nowrap border-collapse min-w-[800px]">
            <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-200">
              <tr className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3 w-10 text-center">#</th>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Branch</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Shift Type</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {rows.map((row, index) => (
                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-4 py-3 text-center text-slate-400">{index + 1}</td>
                  <td className="px-4 py-3">
                    <Select 
                      value={row.employee_id}
                      onChange={(val: string) => handleChange(row.id, "employee_id", val)}
                      placeholder="Select Employee..."
                      options={employees.map(emp => ({ label: `${emp.fullName} (${emp.employeeCode})`, value: emp.id.toString() }))}
                      className={!row.employee_id ? 'border-red-300 ring-1 ring-red-300 rounded' : ''}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Select 
                      value={row.branch_id}
                      onChange={(val: string) => handleChange(row.id, "branch_id", val)}
                      placeholder="Select Branch..."
                      options={branches.map(branch => ({ label: branch.name, value: branch.id.toString() }))}
                      className={!row.branch_id ? 'border-red-300 ring-1 ring-red-300 rounded' : ''}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input 
                      type="date" 
                      value={row.date}
                      onChange={(e) => handleChange(row.id, "date", e.target.value)}
                      className="w-full px-2 py-1.5 bg-transparent border border-transparent hover:border-slate-200 focus:bg-white focus:border-slate-400 rounded outline-none transition-all" 
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Select 
                      value={row.shift_type_id}
                      onChange={(val: string) => handleChange(row.id, "shift_type_id", val)}
                      placeholder="Select Shift Type..."
                      options={shiftTypes.map(st => ({ label: st.name, value: st.id.toString() }))}
                      className={!row.shift_type_id ? 'border-red-300 ring-1 ring-red-300 rounded' : ''}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      onClick={() => handleRemoveRow(row.id)}
                      disabled={rows.length === 1}
                      className="p-1.5 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t border-slate-200 bg-slate-50/50 flex justify-center">
            <button 
              onClick={handleAddRow}
              className="flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
                <Plus className="w-4 h-4 mr-1.5" /> Add Row
            </button>
        </div>
      </div>
    </div>
  );
}

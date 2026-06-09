"use client";

import React, { useState, useEffect } from "react";
import { ArrowRight, ArrowLeft, Save, Check, CheckCircle2 } from "lucide-react";
import { Toast, Select } from "@/components/ui/components";

export default function BulkShiftWizardPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  
  const [branches, setBranches] = useState<any[]>([]);
  const [shiftTypes, setShiftTypes] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [date, setDate] = useState("");
  const [branchId, setBranchId] = useState("");
  const [shiftTypeId, setShiftTypeId] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [branchRes, typeRes, empRes] = await Promise.all([
          fetch("/api/v1/branches"),
          fetch("/api/v1/shift-types"),
          fetch("/api/v1/employees?page_size=100")
        ]);

        const branchData = await branchRes.json();
        const typeData = await typeRes.json();
        const empData = await empRes.json();

        if (branchData.success) setBranches(branchData.data);
        if (typeData.success) setShiftTypes(typeData.data);
        if (empData.success) setEmployees(empData.data.items);
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleNext = () => {
    setError("");
    if (currentStep === 1) {
      if (!date || !branchId || !shiftTypeId) {
        setError("Please fill out all shift details before continuing.");
        return;
      }
    }
    if (currentStep === 2) {
      if (selectedEmployees.length === 0) {
        setError("Please select at least one employee.");
        return;
      }
    }
    setCurrentStep(Math.min(3, currentStep + 1));
  };
  
  const handleBack = () => {
    setError("");
    setCurrentStep(Math.max(1, currentStep - 1));
  };
  
  const handleSave = async () => {
    setError("");
    setSaving(true);
    
    try {
      const payload = {
        entries: selectedEmployees.map(empId => ({
          employee_id: empId,
          branch_id: parseInt(branchId),
          shift_type_id: parseInt(shiftTypeId),
          work_date: date
        }))
      };

      const res = await fetch("/api/v1/shifts/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error?.message || "Failed to create shifts.");
      } else {
        setToastMessage(`Successfully created ${data.data.success_count} shifts.`);
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
          window.location.href = "/admin/shifts";
        }, 2000);
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const toggleEmployee = (id: number) => {
    setSelectedEmployees(prev => 
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const selectedBranchName = branches.find(b => b.id === parseInt(branchId))?.name || "";
  const selectedShiftTypeName = shiftTypes.find(st => st.id === parseInt(shiftTypeId))?.name || "";

  if (loading) {
    return <div className="flex h-full items-center justify-center"><p className="text-slate-500">Loading wizard...</p></div>;
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <div className="mb-8 mt-2">
        <h1 className="text-2xl font-semibold text-slate-900">Bulk Shift Wizard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Assign the same shift to multiple employees in 3 easy steps.
        </p>
      </div>

      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 w-full h-0.5 bg-slate-200 -z-10"></div>
        <div className={`absolute left-0 top-1/2 h-0.5 bg-slate-900 -z-10 transition-all duration-300 ${currentStep === 1 ? 'w-0' : currentStep === 2 ? 'w-1/2' : 'w-full'}`}></div>

        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm mb-2 shadow-sm ${currentStep >= 1 ? 'bg-slate-900 text-white' : 'bg-white border-2 border-slate-200 text-slate-400'}`}>
            {currentStep > 1 ? <Check className="w-4 h-4" /> : '1'}
          </div>
          <span className={`text-xs font-medium ${currentStep >= 1 ? 'text-slate-900' : 'text-slate-400'}`}>Shift Details</span>
        </div>
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm mb-2 shadow-sm transition-colors ${currentStep >= 2 ? 'bg-slate-900 text-white' : 'bg-white border-2 border-slate-200 text-slate-400'}`}>
            {currentStep > 2 ? <Check className="w-4 h-4" /> : '2'}
          </div>
          <span className={`text-xs font-medium ${currentStep >= 2 ? 'text-slate-900' : 'text-slate-400'}`}>Select Employees</span>
        </div>
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm mb-2 shadow-sm transition-colors ${currentStep >= 3 ? 'bg-slate-900 text-white' : 'bg-white border-2 border-slate-200 text-slate-400'}`}>
            3
          </div>
          <span className={`text-xs font-medium ${currentStep >= 3 ? 'text-slate-900' : 'text-slate-400'}`}>Preview & Save</span>
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">{error}</div>}

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* STEP 1 */}
        {currentStep === 1 && (
          <>
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-base font-semibold text-slate-900">Step 1: Shift Details</h2>
              <p className="text-sm text-slate-500">Define the shift that will be assigned.</p>
            </div>
            <div className="p-6 flex-1 space-y-5">
              <div className="max-w-md">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Date</label>
                  <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm text-slate-900 focus:outline-none focus:border-slate-400 shadow-sm" 
                  />
              </div>
              <div className="max-w-md">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Branch</label>
                  <Select 
                    value={branchId}
                    onChange={setBranchId}
                    placeholder="Select Branch..."
                    options={branches.map(b => ({ label: b.name, value: b.id.toString() }))}
                  />
              </div>
              <div className="max-w-md">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Shift Type</label>
                  <Select 
                    value={shiftTypeId}
                    onChange={setShiftTypeId}
                    placeholder="Select Shift Type..."
                    options={shiftTypes.map(st => ({ label: st.name, value: st.id.toString() }))}
                  />
              </div>
            </div>
          </>
        )}

        {/* STEP 2 */}
        {currentStep === 2 && (
          <>
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Step 2: Select Employees</h2>
                <p className="text-sm text-slate-500">Choose the employees working this shift at {selectedBranchName}.</p>
              </div>
              <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{selectedEmployees.length} Selected</span>
            </div>
            <div className="overflow-auto flex-1 p-0">
              <table className="w-full text-left whitespace-nowrap border-collapse">
                <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-200">
                  <tr className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-3 w-10 text-center">
                      <input 
                        type="checkbox" 
                        checked={selectedEmployees.length === employees.length && employees.length > 0}
                        onChange={(e) => setSelectedEmployees(e.target.checked ? employees.map(emp => emp.id) : [])}
                        className="rounded border-slate-300 accent-slate-800" 
                      />
                    </th>
                    <th className="px-6 py-3">Employee</th>
                    <th className="px-6 py-3">Code</th>
                    <th className="px-6 py-3">Role</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-100">
                  {employees.map(emp => {
                    const isSelected = selectedEmployees.includes(emp.id);
                    return (
                      <tr key={emp.id} className={`hover:bg-slate-50/50 cursor-pointer ${isSelected ? 'bg-blue-50/30' : ''}`} onClick={() => toggleEmployee(emp.id)}>
                        <td className="px-6 py-3 text-center">
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={() => {}} // Handled by tr onClick
                            className="rounded border-slate-300 accent-slate-800" 
                          />
                        </td>
                        <td className="px-6 py-3 font-medium text-slate-900">{emp.fullName}</td>
                        <td className="px-6 py-3 text-slate-600">{emp.employeeCode}</td>
                        <td className="px-6 py-3 text-slate-600">{emp.role?.name || "N/A"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* STEP 3 */}
        {currentStep === 3 && (
          <>
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-base font-semibold text-slate-900">Step 3: Preview & Save</h2>
              <p className="text-sm text-slate-500">Review your bulk assignment before saving.</p>
            </div>
            <div className="p-6 flex-1 flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Ready to create {selectedEmployees.length} shifts</h3>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 w-full max-w-md">
                <div className="flex justify-between mb-3 border-b border-slate-200 pb-3">
                  <span className="text-sm text-slate-500">Date</span>
                  <span className="text-sm font-medium text-slate-900">{date ? new Date(date).toLocaleDateString() : ""}</span>
                </div>
                <div className="flex justify-between mb-3 border-b border-slate-200 pb-3">
                  <span className="text-sm text-slate-500">Branch</span>
                  <span className="text-sm font-medium text-slate-900">{selectedBranchName}</span>
                </div>
                <div className="flex justify-between mb-3 border-b border-slate-200 pb-3">
                  <span className="text-sm text-slate-500">Shift Type</span>
                  <span className="text-sm font-medium text-slate-900">{selectedShiftTypeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Employees Selected</span>
                  <span className="text-sm font-medium text-slate-900">{selectedEmployees.length}</span>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-between">
            <button onClick={handleBack} disabled={currentStep === 1 || saving} className={`px-5 py-2 border border-slate-200 rounded-md text-sm font-medium flex items-center transition-colors ${currentStep === 1 ? 'opacity-50 cursor-not-allowed bg-slate-50 text-slate-400' : 'bg-white text-slate-700 hover:bg-slate-50 shadow-sm'}`}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </button>
            
            {currentStep < 3 ? (
              <button onClick={handleNext} className="px-5 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 shadow-sm flex items-center transition-colors">
                  Next Step <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button onClick={handleSave} disabled={saving} className="px-5 py-2 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-700 shadow-sm flex items-center transition-colors disabled:opacity-70">
                  <Save className="w-4 h-4 mr-2" /> {saving ? "Saving..." : "Confirm & Save"}
              </button>
            )}
        </div>
      </div>
      <Toast isVisible={showToast} onClose={() => setShowToast(false)} message={toastMessage} />
    </div>
  );
}

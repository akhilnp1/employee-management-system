'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, Trash2, Eye, Filter, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { employeesApi, formsApi } from '@/lib/api';
import type { Employee, EmployeeForm } from '@/types';
import { formatDate, getStatusColor, cn } from '@/lib/utils';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [forms, setForms] = useState<EmployeeForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [formFilter, setFormFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const PAGE_SIZE = 10;

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (departmentFilter) params.department = departmentFilter;
      if (formFilter) params.form = formFilter;
      const { data } = await employeesApi.list(params);
      setEmployees(data.results);
      setTotalCount(data.count);
    } catch {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, departmentFilter, formFilter, page]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);
  useEffect(() => { formsApi.active().then(r => setForms(r.data)); }, []);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete employee "${name}"? This cannot be undone.`)) return;
    try {
      await employeesApi.delete(id);
      toast.success('Employee deleted');
      fetchEmployees();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const clearFilters = () => {
    setSearch(''); setStatusFilter(''); setDepartmentFilter(''); setFormFilter(''); setPage(1);
  };

  const hasFilters = search || statusFilter || departmentFilter || formFilter;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="text-slate-400 mt-1">{totalCount} total records</p>
        </div>
        <Link href="/employees/new" className="btn-primary">
          <Plus size={16} /> Add Employee
        </Link>
      </div>

      {/* Search + Filter bar */}
      <div className="glass-card p-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name, email, department..."
              className="input-field pl-9"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn('btn-secondary', showFilters && 'border-primary-500/50 text-primary-300')}
          >
            <Filter size={15} /> Filters
            {hasFilters && <span className="w-2 h-2 bg-primary-500 rounded-full" />}
          </button>
          {hasFilters && (
            <button onClick={clearFilters} className="btn-secondary text-red-400 border-red-500/20">
              <X size={15} /> Clear
            </button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-slate-800">
            <div>
              <label className="label-text text-xs">Status</label>
              <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="input-field">
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On Leave</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
            <div>
              <label className="label-text text-xs">Department</label>
              <input
                value={departmentFilter}
                onChange={e => { setDepartmentFilter(e.target.value); setPage(1); }}
                placeholder="e.g. Engineering"
                className="input-field"
              />
            </div>
            <div>
              <label className="label-text text-xs">Form Template</label>
              <select value={formFilter} onChange={e => { setFormFilter(e.target.value); setPage(1); }} className="input-field">
                <option value="">All forms</option>
                {forms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Position</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-slate-800 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-500">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center">
                        <Search size={20} className="text-slate-600" />
                      </div>
                      <p>No employees found</p>
                      <Link href="/employees/new" className="btn-primary text-xs px-3 py-1.5">
                        <Plus size={13} /> Add Employee
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-600/20 border border-primary-500/20 flex items-center justify-center text-xs font-bold text-primary-300 flex-shrink-0">
                          {emp.first_name[0]}{emp.last_name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-200">{emp.full_name}</p>
                          <p className="text-xs text-slate-500">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-300">{emp.department || '—'}</td>
                    <td className="px-5 py-4 text-sm text-slate-300">{emp.position || '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(emp.status)}`}>
                        {emp.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-400">{formatDate(emp.date_joined)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/employees/${emp.id}`} className="p-1.5 rounded-lg text-slate-400 hover:text-primary-400 hover:bg-primary-500/10 transition-all">
                          <Eye size={15} />
                        </Link>
                        <button
                          onClick={() => handleDelete(emp.id, emp.full_name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800">
            <p className="text-sm text-slate-500">
              Page {page} of {totalPages} · {totalCount} results
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40">
                Previous
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

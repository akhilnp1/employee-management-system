'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, FileText, Hash } from 'lucide-react';
import toast from 'react-hot-toast';
import { formsApi } from '@/lib/api';
import type { EmployeeForm } from '@/types';
import { formatDate } from '@/lib/utils';

export default function FormsPage() {
  const [forms, setForms] = useState<EmployeeForm[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchForms = () => {
    formsApi.list()
      .then(r => setForms(r.data.results ?? r.data))
      .catch(() => toast.error('Failed to load forms'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchForms(); }, []);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete form "${name}"?`)) return;
    try {
      await formsApi.delete(id);
      toast.success('Form deleted');
      fetchForms();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Form Builder</h1>
          <p className="text-slate-400 mt-1">Design custom employee data collection forms</p>
        </div>
        <Link href="/forms/new" className="btn-primary">
          <Plus size={16} /> New Form
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card p-5 animate-pulse space-y-3">
              <div className="h-5 bg-slate-800 rounded w-3/4" />
              <div className="h-4 bg-slate-800 rounded w-1/2" />
              <div className="h-8 bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      ) : forms.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText size={28} className="text-slate-600" />
          </div>
          <h3 className="text-lg font-medium text-slate-300 mb-2">No forms yet</h3>
          <p className="text-slate-500 text-sm mb-6">Create your first employee form with custom fields</p>
          <Link href="/forms/new" className="btn-primary inline-flex">
            <Plus size={16} /> Create Form
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {forms.map((form) => (
            <div key={form.id} className="glass-card p-5 hover:border-slate-700/60 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-primary-600/15 border border-primary-500/20 rounded-xl flex items-center justify-center">
                  <FileText size={18} className="text-primary-400" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={`/forms/${form.id}`} className="p-1.5 rounded-lg text-slate-400 hover:text-primary-400 hover:bg-primary-500/10 transition-all">
                    <Pencil size={14} />
                  </Link>
                  <button onClick={() => handleDelete(form.id, form.name)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <h3 className="font-display font-semibold text-slate-200 mb-1">{form.name}</h3>
              {form.description && <p className="text-xs text-slate-500 mb-3 line-clamp-2">{form.description}</p>}
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Hash size={12} /> {form.field_count} fields
                </span>
                <span>·</span>
                <span>{formatDate(form.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

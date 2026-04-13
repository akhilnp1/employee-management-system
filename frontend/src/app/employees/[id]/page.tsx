'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { employeesApi } from '@/lib/api';
import type { Employee } from '@/types';
import { formatDate, getStatusColor } from '@/lib/utils';

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    employeesApi.get(Number(id))
      .then(r => {
        setEmployee(r.data);
        reset(r.data);
      })
      .catch(() => toast.error('Employee not found'))
      .finally(() => setLoading(false));
  }, [id, reset]);

  const onSubmit = async (data: Record<string, unknown>) => {
    setSaving(true);
    try {
      const res = await employeesApi.update(Number(id), data);
      setEmployee(res.data);
      setEditing(false);
      toast.success('Employee updated!');
    } catch {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this employee? This cannot be undone.')) return;
    await employeesApi.delete(Number(id));
    toast.success('Employee deleted');
    router.push('/employees');
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-slate-800 rounded" />
        <div className="glass-card p-6 space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-6 bg-slate-800 rounded" />)}
        </div>
      </div>
    );
  }

  if (!employee) return <div className="text-slate-400">Employee not found.</div>;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/employees" className="btn-secondary p-2"><ArrowLeft size={16} /></Link>
          <div>
            <h1 className="page-title">{employee.full_name}</h1>
            <p className="text-slate-400 mt-0.5">{employee.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setEditing(!editing)} className="btn-secondary">
            {editing ? 'Cancel' : 'Edit'}
          </button>
          <button onClick={handleDelete} className="btn-danger"><Trash2 size={15} /> Delete</button>
        </div>
      </div>

      {!editing ? (
        /* View mode */
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="section-title mb-4">Basic Information</h2>
            <dl className="grid grid-cols-2 gap-4">
              {[
                ['First Name', employee.first_name],
                ['Last Name', employee.last_name],
                ['Email', employee.email],
                ['Phone', employee.phone || '—'],
                ['Department', employee.department || '—'],
                ['Position', employee.position || '—'],
                ['Date Joined', formatDate(employee.date_joined)],
                ['Status', null],
              ].map(([label, value]) => (
                <div key={String(label)}>
                  <dt className="text-xs text-slate-500 uppercase tracking-wider mb-1">{label}</dt>
                  <dd className="text-sm text-slate-200">
                    {label === 'Status' ? (
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(employee.status)}`}>
                        {employee.status.replace('_', ' ')}
                      </span>
                    ) : value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {employee.form_details && Object.keys(employee.dynamic_data).length > 0 && (
            <div className="glass-card p-6">
              <h2 className="section-title mb-4">{employee.form_details.name}</h2>
              <dl className="grid grid-cols-2 gap-4">
                {employee.form_details.fields.map(field => (
                  <div key={field.id}>
                    <dt className="text-xs text-slate-500 uppercase tracking-wider mb-1">{field.label}</dt>
                    <dd className="text-sm text-slate-200">
                      {String(employee.dynamic_data[field.field_name] ?? '—')}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      ) : (
        /* Edit mode */
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="glass-card p-6 space-y-4">
            <h2 className="section-title">Edit Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-text">First Name</label>
                <input {...register('first_name', { required: true })} className="input-field" />
              </div>
              <div>
                <label className="label-text">Last Name</label>
                <input {...register('last_name', { required: true })} className="input-field" />
              </div>
            </div>
            <div>
              <label className="label-text">Email</label>
              <input {...register('email', { required: true })} type="email" className="input-field" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-text">Phone</label>
                <input {...register('phone')} className="input-field" />
              </div>
              <div>
                <label className="label-text">Date Joined</label>
                <input {...register('date_joined')} type="date" className="input-field" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-text">Department</label>
                <input {...register('department')} className="input-field" />
              </div>
              <div>
                <label className="label-text">Position</label>
                <input {...register('position')} className="input-field" />
              </div>
            </div>
            <div>
              <label className="label-text">Status</label>
              <select {...register('status')} className="input-field">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On Leave</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary">
              <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => { setEditing(false); reset(employee); }} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

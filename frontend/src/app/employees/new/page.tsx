'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { employeesApi, formsApi } from '@/lib/api';
import type { EmployeeForm } from '@/types';

export default function NewEmployeePage() {
  const router = useRouter();
  const [forms, setForms] = useState<EmployeeForm[]>([]);
  const [selectedForm, setSelectedForm] = useState<EmployeeForm | null>(null);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();

  const selectedFormId = watch('form');

  useEffect(() => {
    formsApi.active().then(r => setForms(r.data));
  }, []);

  useEffect(() => {
    if (selectedFormId) {
      formsApi.getWithFields(Number(selectedFormId)).then(r => setSelectedForm(r.data));
    } else {
      setSelectedForm(null);
    }
  }, [selectedFormId]);

  const onSubmit = async (data: Record<string, unknown>) => {
    setLoading(true);
    try {
      const dynamic_data: Record<string, unknown> = {};
      if (selectedForm) {
        selectedForm.fields.forEach(field => {
          if (data[`dynamic_${field.field_name}`] !== undefined) {
            dynamic_data[field.field_name] = data[`dynamic_${field.field_name}`];
            delete data[`dynamic_${field.field_name}`];
          }
        });
      }
      await employeesApi.create({ ...data, dynamic_data });
      toast.success('Employee created!');
      router.push('/employees');
    } catch (err: unknown) {
      const errData = (err as { response?: { data?: Record<string, string[]> } })?.response?.data;
      const msg = errData ? Object.values(errData).flat().join(' ') : 'Failed to create employee';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/employees" className="btn-secondary p-2">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="page-title">Add Employee</h1>
          <p className="text-slate-400 mt-0.5">Fill in employee details below</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Core Info */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="section-title">Basic Information</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">First Name *</label>
              <input {...register('first_name', { required: 'Required' })} className="input-field" placeholder="John" />
              {errors.first_name && <p className="error-text">{String(errors.first_name.message)}</p>}
            </div>
            <div>
              <label className="label-text">Last Name *</label>
              <input {...register('last_name', { required: 'Required' })} className="input-field" placeholder="Doe" />
              {errors.last_name && <p className="error-text">{String(errors.last_name.message)}</p>}
            </div>
          </div>

          <div>
            <label className="label-text">Email *</label>
            <input {...register('email', { required: 'Required' })} type="email" className="input-field" placeholder="john@example.com" />
            {errors.email && <p className="error-text">{String(errors.email.message)}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">Phone</label>
              <input {...register('phone')} className="input-field" placeholder="+1 555 000 0000" />
            </div>
            <div>
              <label className="label-text">Date Joined</label>
              <input {...register('date_joined')} type="date" className="input-field" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">Department</label>
              <input {...register('department')} className="input-field" placeholder="Engineering" />
            </div>
            <div>
              <label className="label-text">Position</label>
              <input {...register('position')} className="input-field" placeholder="Software Engineer" />
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

        {/* Dynamic Form */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="section-title">Dynamic Form Fields</h2>
          <p className="text-sm text-slate-400">Select an optional form template to include custom fields.</p>

          <div>
            <label className="label-text">Form Template</label>
            <select {...register('form')} className="input-field">
              <option value="">— No template —</option>
              {forms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>

          {selectedForm && selectedForm.fields.length > 0 && (
            <div className="space-y-4 border-t border-slate-800 pt-4">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                {selectedForm.name} fields
              </p>
              {selectedForm.fields.map((field) => (
                <div key={field.id}>
                  <label className="label-text">
                    {field.label}
                    {field.is_required && <span className="text-red-400 ml-1">*</span>}
                  </label>
                  {field.help_text && <p className="text-xs text-slate-500 mb-1">{field.help_text}</p>}
                  <DynamicField field={field} register={register} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary">
            <Save size={16} />
            {loading ? 'Saving...' : 'Create Employee'}
          </button>
          <Link href="/employees" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}

function DynamicField({ field, register }: { field: import('@/types').FormField; register: ReturnType<typeof useForm>['register'] }) {
  const name = `dynamic_${field.field_name}`;
  const rules = field.is_required ? { required: `${field.label} is required` } : {};

  if (field.field_type === 'textarea') {
    return <textarea {...register(name, rules)} placeholder={field.placeholder || ''} rows={3} className="input-field" />;
  }
  if (field.field_type === 'select') {
    return (
      <select {...register(name, rules)} className="input-field">
        <option value="">— Select —</option>
        {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    );
  }
  if (field.field_type === 'checkbox') {
    return (
      <div className="flex flex-wrap gap-3">
        {field.options.map(opt => (
          <label key={opt} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input type="checkbox" value={opt} {...register(name)} className="w-4 h-4 rounded accent-primary-500" />
            {opt}
          </label>
        ))}
      </div>
    );
  }
  if (field.field_type === 'radio') {
    return (
      <div className="flex flex-wrap gap-3">
        {field.options.map(opt => (
          <label key={opt} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input type="radio" value={opt} {...register(name, rules)} className="w-4 h-4 accent-primary-500" />
            {opt}
          </label>
        ))}
      </div>
    );
  }
  return (
    <input
      type={field.field_type === 'datetime' ? 'datetime-local' : field.field_type}
      placeholder={field.placeholder || ''}
      {...register(name, rules)}
      className="input-field"
    />
  );
}

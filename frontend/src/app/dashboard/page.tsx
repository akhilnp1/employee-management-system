'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, UserCheck, UserX, Clock, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import { employeesApi, formsApi } from '@/lib/api';
import type { EmployeeStats, EmployeeForm } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<EmployeeStats | null>(null);
  const [forms, setForms] = useState<EmployeeForm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([employeesApi.stats(), formsApi.active()])
      .then(([s, f]) => {
        setStats(s.data);
        setForms(f.data.slice(0, 4));
      })
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Total Employees', value: stats?.total ?? '—', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Active', value: stats?.active ?? '—', icon: UserCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'On Leave', value: stats?.on_leave ?? '—', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { label: 'Inactive / Terminated', value: (stats?.inactive ?? 0) + (stats?.terminated ?? 0), icon: UserX, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="page-title">Good {getGreeting()}, {user?.first_name || 'there'} 👋</h1>
        <p className="text-slate-400 mt-1">Here&apos;s what&apos;s happening with your team today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`glass-card p-5 border ${bg}`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-400">{label}</p>
              <div className={`p-2 rounded-lg ${bg}`}>
                <Icon size={18} className={color} />
              </div>
            </div>
            <p className={`text-3xl font-display font-bold ${loading ? 'animate-pulse text-slate-600' : color}`}>
              {loading ? '—' : value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* By Department */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title flex items-center gap-2">
              <TrendingUp size={18} className="text-primary-400" />
              By Department
            </h2>
          </div>
          {loading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 bg-slate-800 rounded-lg animate-pulse" />
            ))}</div>
          ) : stats?.by_department?.length ? (
            <div className="space-y-3">
              {stats.by_department.map(({ department, count }) => {
                const pct = stats.total ? Math.round((count / stats.total) * 100) : 0;
                return (
                  <div key={department}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">{department || 'Unassigned'}</span>
                      <span className="text-slate-500">{count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No department data yet.</p>
          )}
        </div>

        {/* Recent Forms */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title">Form Templates</h2>
            <Link href="/forms/new" className="btn-primary text-xs px-3 py-1.5">
              <Plus size={14} /> New Form
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 bg-slate-800 rounded-lg animate-pulse" />
            ))}</div>
          ) : forms.length ? (
            <div className="space-y-2">
              {forms.map((form) => (
                <Link
                  key={form.id}
                  href={`/forms/${form.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 hover:bg-slate-800/80 transition-all group"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-200">{form.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{form.field_count} fields · {formatDate(form.created_at)}</p>
                  </div>
                  <ArrowRight size={14} className="text-slate-600 group-hover:text-primary-400 transition-colors" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-slate-500 text-sm mb-3">No forms yet</p>
              <Link href="/forms/new" className="btn-primary text-xs px-3 py-1.5 inline-flex">
                <Plus size={14} /> Create your first form
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/employees/new" className="glass-card p-5 flex items-center gap-4 hover:border-primary-500/30 transition-all group">
          <div className="w-10 h-10 bg-primary-600/20 rounded-xl flex items-center justify-center group-hover:bg-primary-600/30 transition-all">
            <Users size={20} className="text-primary-400" />
          </div>
          <div>
            <p className="font-medium text-slate-200">Add Employee</p>
            <p className="text-sm text-slate-500">Create a new employee record</p>
          </div>
          <ArrowRight size={16} className="ml-auto text-slate-600 group-hover:text-primary-400 transition-colors" />
        </Link>
        <Link href="/forms/new" className="glass-card p-5 flex items-center gap-4 hover:border-primary-500/30 transition-all group">
          <div className="w-10 h-10 bg-violet-600/20 rounded-xl flex items-center justify-center group-hover:bg-violet-600/30 transition-all">
            <Plus size={20} className="text-violet-400" />
          </div>
          <div>
            <p className="font-medium text-slate-200">Build Form</p>
            <p className="text-sm text-slate-500">Design a custom employee form</p>
          </div>
          <ArrowRight size={16} className="ml-auto text-slate-600 group-hover:text-violet-400 transition-colors" />
        </Link>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

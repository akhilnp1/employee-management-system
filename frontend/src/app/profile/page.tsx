'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Save, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api';
import { getInitials } from '@/lib/utils';

const profileSchema = z.object({
  first_name: z.string().min(1, 'Required'),
  last_name: z.string().min(1, 'Required'),
  username: z.string().min(3, 'Min 3 chars'),
  phone: z.string().optional(),
  bio: z.string().optional(),
  department: z.string().optional(),
});
type ProfileForm = z.infer<typeof profileSchema>;

const pwSchema = z.object({
  old_password: z.string().min(1, 'Required'),
  new_password: z.string().min(8, 'Min 8 characters'),
  new_password2: z.string(),
}).refine(d => d.new_password === d.new_password2, {
  message: 'Passwords do not match', path: ['new_password2'],
});
type PwForm = z.infer<typeof pwSchema>;

export default function ProfilePage() {
  const { user, updateProfile } = useAuthStore();
  const [tab, setTab] = useState<'profile' | 'password'>('profile');
  const [saving, setSaving] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      username: user?.username || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
      department: user?.department || '',
    },
  });

  const pwForm = useForm<PwForm>({ resolver: zodResolver(pwSchema) });

  const onProfileSave = async (data: ProfileForm) => {
    setSaving(true);
    try {
      await updateProfile(data);
      toast.success('Profile updated!');
    } catch {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  const onPasswordChange = async (data: PwForm) => {
    setSaving(true);
    try {
      await authApi.changePassword(data);
      toast.success('Password changed!');
      pwForm.reset();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: Record<string, string[]> } })?.response?.data;
      toast.error(msg ? Object.values(msg).flat().join(' ') : 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="page-title">Profile</h1>
        <p className="text-slate-400 mt-1">Manage your account settings</p>
      </div>

      {/* Avatar card */}
      <div className="glass-card p-6 flex items-center gap-5">
        <div className="w-20 h-20 rounded-2xl bg-primary-600/20 border border-primary-500/30 flex items-center justify-center text-2xl font-bold text-primary-300">
          {user ? getInitials(`${user.first_name} ${user.last_name}`) : 'U'}
        </div>
        <div>
          <h2 className="text-xl font-display font-semibold text-slate-100">
            {user?.first_name} {user?.last_name}
          </h2>
          <p className="text-slate-400 text-sm">{user?.email}</p>
          {user?.department && <p className="text-slate-500 text-xs mt-1">{user.department}</p>}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 w-fit">
        {[
          { key: 'profile', label: 'Profile Info', icon: User },
          { key: 'password', label: 'Change Password', icon: Lock },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key as 'profile' | 'password')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === key ? 'bg-primary-600/20 text-primary-300 border border-primary-500/20' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="glass-card p-6 animate-fade-in">
          <form onSubmit={profileForm.handleSubmit(onProfileSave)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-text">First Name</label>
                <input {...profileForm.register('first_name')} className="input-field" />
                {profileForm.formState.errors.first_name && <p className="error-text">{profileForm.formState.errors.first_name.message}</p>}
              </div>
              <div>
                <label className="label-text">Last Name</label>
                <input {...profileForm.register('last_name')} className="input-field" />
                {profileForm.formState.errors.last_name && <p className="error-text">{profileForm.formState.errors.last_name.message}</p>}
              </div>
            </div>
            <div>
              <label className="label-text">Username</label>
              <input {...profileForm.register('username')} className="input-field" />
              {profileForm.formState.errors.username && <p className="error-text">{profileForm.formState.errors.username.message}</p>}
            </div>
            <div>
              <label className="label-text">Email</label>
              <input value={user?.email || ''} disabled className="input-field opacity-50 cursor-not-allowed" />
              <p className="text-xs text-slate-600 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="label-text">Phone</label>
              <input {...profileForm.register('phone')} placeholder="+1 555 000 0000" className="input-field" />
            </div>
            <div>
              <label className="label-text">Department</label>
              <input {...profileForm.register('department')} placeholder="Engineering" className="input-field" />
            </div>
            <div>
              <label className="label-text">Bio</label>
              <textarea {...profileForm.register('bio')} rows={3} placeholder="Tell us about yourself" className="input-field resize-none" />
            </div>
            <button type="submit" disabled={saving} className="btn-primary">
              <Save size={15} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {tab === 'password' && (
        <div className="glass-card p-6 animate-fade-in">
          <form onSubmit={pwForm.handleSubmit(onPasswordChange)} className="space-y-4">
            <div>
              <label className="label-text">Current Password</label>
              <div className="relative">
                <input {...pwForm.register('old_password')} type={showOld ? 'text' : 'password'} placeholder="••••••••" className="input-field pr-10" />
                <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {pwForm.formState.errors.old_password && <p className="error-text">{pwForm.formState.errors.old_password.message}</p>}
            </div>
            <div>
              <label className="label-text">New Password</label>
              <div className="relative">
                <input {...pwForm.register('new_password')} type={showNew ? 'text' : 'password'} placeholder="••••••••" className="input-field pr-10" />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {pwForm.formState.errors.new_password && <p className="error-text">{pwForm.formState.errors.new_password.message}</p>}
            </div>
            <div>
              <label className="label-text">Confirm New Password</label>
              <input {...pwForm.register('new_password2')} type="password" placeholder="••••••••" className="input-field" />
              {pwForm.formState.errors.new_password2 && <p className="error-text">{pwForm.formState.errors.new_password2.message}</p>}
            </div>
            <button type="submit" disabled={saving} className="btn-primary">
              <Lock size={15} /> {saving ? 'Saving...' : 'Change Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

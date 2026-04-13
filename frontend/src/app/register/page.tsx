'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Eye, EyeOff, UserPlus, Users } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const schema = z.object({
  username: z.string().min(3, 'At least 3 characters'),
  email: z.string().email('Invalid email'),
  first_name: z.string().min(1, 'Required'),
  last_name: z.string().min(1, 'Required'),
  password: z.string().min(8, 'At least 8 characters'),
  password2: z.string(),
}).refine((d) => d.password === d.password2, {
  message: 'Passwords do not match',
  path: ['password2'],
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isLoading } = useAuthStore();
  const [showPass, setShowPass] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await registerUser(data);
      toast.success('Account created! Welcome aboard.');
      window.location.href = '/dashboard';
    } catch (err: unknown) {
      const errData = (err as { response?: { data?: Record<string, string[]> } })?.response?.data;
      const msg = errData ? Object.values(errData).flat().join(' ') : 'Registration failed';
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600/20 border border-primary-500/30 rounded-2xl mb-4">
            <Users className="w-7 h-7 text-primary-400" />
          </div>
          <h1 className="text-3xl font-display font-bold text-slate-100">EmpMS</h1>
          <p className="text-slate-400 mt-1 text-sm">Create your account</p>
        </div>

        <div className="glass-card p-8">
          <h2 className="text-xl font-display font-semibold text-slate-100 mb-6">Get started for free</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-text">First Name</label>
                <input {...register('first_name')} placeholder="John" className="input-field" />
                {errors.first_name && <p className="error-text">{errors.first_name.message}</p>}
              </div>
              <div>
                <label className="label-text">Last Name</label>
                <input {...register('last_name')} placeholder="Doe" className="input-field" />
                {errors.last_name && <p className="error-text">{errors.last_name.message}</p>}
              </div>
            </div>

            <div>
              <label className="label-text">Username</label>
              <input {...register('username')} placeholder="johndoe" className="input-field" />
              {errors.username && <p className="error-text">{errors.username.message}</p>}
            </div>

            <div>
              <label className="label-text">Email address</label>
              <input {...register('email')} type="email" placeholder="you@example.com" className="input-field" />
              {errors.email && <p className="error-text">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label-text">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input-field pr-10"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="error-text">{errors.password.message}</p>}
            </div>

            <div>
              <label className="label-text">Confirm Password</label>
              <input {...register('password2')} type="password" placeholder="••••••••" className="input-field" />
              {errors.password2 && <p className="error-text">{errors.password2.message}</p>}
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full mt-2">
              <UserPlus size={16} />
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}



'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Eye, EyeOff, LogIn, Users } from 'lucide-react';
import Cookies from 'js-cookie';
import axios from 'axios';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [debugMsg, setDebugMsg] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setDebugMsg('Connecting to backend...');
    try {
      const res = await axios.post(`${API_URL}/auth/login/`, {
        email: data.email,
        password: data.password,
      });

      setDebugMsg('Login OK, saving tokens...');
      Cookies.set('access_token', res.data.access, { expires: 1 });
      Cookies.set('refresh_token', res.data.refresh, { expires: 7 });

      if (res.data.user) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }

      setDebugMsg('Redirecting...');
      toast.success('Welcome back!');
      setTimeout(() => { window.location.href = '/dashboard'; }, 300);

    } catch (err: unknown) {
      setLoading(false);
      const e = err as {
        response?: { data?: { detail?: string }; status?: number };
        message?: string;
        code?: string;
      };
      if (e.code === 'ERR_NETWORK' || e.message === 'Network Error') {
        setDebugMsg('Cannot reach backend at ' + API_URL);
        toast.error('Cannot connect to backend. Is Django running on port 8000?');
      } else {
        setDebugMsg('Error ' + e?.response?.status + ': ' + (e?.response?.data?.detail || e?.message));
        toast.error(e?.response?.data?.detail || 'Invalid credentials');
      }
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
          <p className="text-slate-400 mt-1 text-sm">Employee Management System</p>
        </div>

        <div className="glass-card p-8">
          <h2 className="text-xl font-display font-semibold text-slate-100 mb-6">Sign in to your account</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="label-text">Email address</label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="input-field"
              />
              {errors.email && <p className="error-text">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label-text">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="input-field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="error-text">{errors.password.message}</p>}
            </div>

            {debugMsg && (
              <div className="text-xs text-slate-400 bg-slate-800/60 rounded px-3 py-2 font-mono">
                {debugMsg}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              <LogIn size={16} />
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary-400 hover:text-primary-300 font-medium">
              Create account
            </Link>
          </p>
        </div>
        <p className="text-center text-xs text-slate-600 mt-4">Backend: {API_URL}</p>
      </div>
    </div>
  );
}
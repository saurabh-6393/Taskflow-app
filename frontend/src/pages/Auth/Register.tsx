import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Min 6 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match", path: ['confirmPassword'],
});

type FormData = z.infer<typeof registerSchema>;

// Password strength calculator
const getPasswordStrength = (pw: string): { score: number; label: string; color: string; bgColor: string } => {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { score, label: 'Weak', color: 'bg-rose-500', bgColor: 'text-rose-600' };
  if (score <= 2) return { score, label: 'Fair', color: 'bg-amber-500', bgColor: 'text-amber-600' };
  if (score <= 3) return { score, label: 'Good', color: 'bg-blue-500', bgColor: 'text-blue-600' };
  if (score <= 4) return { score, label: 'Strong', color: 'bg-emerald-500', bgColor: 'text-emerald-600' };
  return { score, label: 'Very Strong', color: 'bg-emerald-600', bgColor: 'text-emerald-700' };
};

const Register: React.FC = () => {
  const { register: regUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(registerSchema) });

  const strength = getPasswordStrength(passwordValue);

  const onSubmit = async (data: FormData) => {
    try { setError(''); setLoading(true); await regUser(data.name, data.email, data.password); toast.success('Account created!'); navigate('/dashboard'); }
    catch (e: any) { const msg = e.response?.data?.message || 'Registration failed'; setError(msg); toast.error(msg); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">TaskFlow</h1>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create your account</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Start managing your projects today</p>
        {error && <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">{error}</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <Input label="Full Name" placeholder="John Doe" error={errors.name?.message} {...register('name')} />
          <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />

          {/* Password with Strength Meter */}
          <div className="space-y-2">
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password', {
                onChange: (e) => setPasswordValue(e.target.value),
              })}
            />
            {passwordValue.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                        i <= strength.score ? strength.color : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <p className={`text-xs font-medium ${strength.bgColor}`}>{strength.label}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                    <span className={`text-[10px] ${/[A-Z]/.test(passwordValue) ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {/[A-Z]/.test(passwordValue) ? '✓' : '○'} Uppercase
                    </span>
                    <span className={`text-[10px] ${/[0-9]/.test(passwordValue) ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {/[0-9]/.test(passwordValue) ? '✓' : '○'} Number
                    </span>
                    <span className={`text-[10px] ${/[^A-Za-z0-9]/.test(passwordValue) ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {/[^A-Za-z0-9]/.test(passwordValue) ? '✓' : '○'} Symbol
                    </span>
                    <span className={`text-[10px] ${passwordValue.length >= 10 ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {passwordValue.length >= 10 ? '✓' : '○'} 10+ chars
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Input label="Confirm Password" type="password" placeholder="••••••••" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
          <Button type="submit" isLoading={loading} className="w-full" size="lg">Create Account</Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          Already have an account? <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

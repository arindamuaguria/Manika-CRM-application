import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Lock, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      await login(email, password);
      // Determine redirect path
      const from = (location.state as any)?.from?.pathname;
      if (from && from !== '/login') {
        navigate(from, { replace: true });
      } else {
        // Redirect based on role
        const currentUser = useAuthStore.getState().user;
        const isAdmin = currentUser?.roles?.some((r) => r.name === 'Admin');
        navigate(isAdmin ? '/dashboard' : '/dashboard', { replace: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-950 via-neutral-900 to-primary-950 p-6">
      {/* Premium Glassmorphism Card */}
      <div className="glass rounded-2xl p-8 w-full max-w-md shadow-2xl border border-white/10 animate-slide-up">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 mb-2">
            Manika CRM
          </h1>
          <p className="text-sm text-neutral-500">
            Territory-driven Partner Onboarding & CRM
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-danger-50 border border-danger-100 text-danger-700 flex items-center gap-3 text-sm animate-fade-in">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                <Mail size={18} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-white/50 border border-neutral-200 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-sm font-medium text-neutral-700">
                Password
              </label>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-white/50 border border-neutral-200 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all cursor-pointer"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

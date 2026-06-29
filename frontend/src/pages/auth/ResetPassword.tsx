import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '@/services/authService';
import { Lock, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const t = searchParams.get('token') || '';
    const e = searchParams.get('email') || '';
    setToken(t);
    setEmail(e);
    if (!t || !e) {
      setError('Invalid or expired password reset link.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== passwordConfirmation) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.resetPassword({
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      setSuccess(response.message || 'Password reset successfully.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-950 via-neutral-900 to-primary-950 p-6">
      <div className="glass rounded-2xl p-8 w-full max-w-md shadow-2xl border border-white/10 animate-slide-up">
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to login
        </button>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 mb-2">
            Set New Password
          </h1>
          <p className="text-sm text-neutral-500">
            Please enter your new password below.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-danger-50 border border-danger-100 text-danger-700 flex items-center gap-3 text-sm animate-fade-in">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-lg bg-success-50 border border-success-100 text-success-700 flex items-center gap-3 text-sm animate-fade-in">
            <CheckCircle size={18} className="shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {!success && !error && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-white/50 border border-neutral-200 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  required
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-white/50 border border-neutral-200 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all cursor-pointer"
            >
              {isLoading ? 'Updating password...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

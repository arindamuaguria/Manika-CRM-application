import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { Mail, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const response = await authService.forgotPassword(email);
      setSuccess(response.message || 'Password reset link sent successfully.');
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
            Reset Password
          </h1>
          <p className="text-sm text-neutral-500">
            Enter your email and we'll send you a link to reset your password.
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

        {!success && (
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all cursor-pointer"
            >
              {isLoading ? 'Sending link...' : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

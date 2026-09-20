import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { api } from '@/services/api';
import { useToast } from '@/components/ui/Toast';

export function SignupPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    setLoading(true);
    try {
      await api.auth.signup(email, password, name);
      showToast('Account created successfully. Please verify your email.', 'info');
      navigate(`/verify?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setDemoLoading(true);
    try {
      await api.auth.login('demo@lifeos.internal', 'DemoUser123!');
      showToast('Signed in as Demo User', 'success');
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demo sign in failed.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <AuthLayout title="Create account" subtitle="Start turning your information into intelligence.">
      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-400 animate-slideUp">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Quick Demo User Login Button */}
      <button
        type="button"
        onClick={handleDemoLogin}
        disabled={demoLoading || loading}
        className="w-full py-2.5 px-4 text-sm font-medium rounded-lg bg-gradient-to-r from-accent/20 to-purple-500/20 border border-accent/40 text-accent hover:border-accent hover:bg-accent/30 transition-all flex items-center justify-center gap-2 shadow-sm mb-4 cursor-pointer"
      >
        {demoLoading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Signing in as Demo User...
          </>
        ) : (
          <>
            <Sparkles size={16} className="text-accent" />
            ⚡ Quick Demo User Login
          </>
        )}
      </button>

      <div className="mb-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-text-tertiary">or create an account</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5" htmlFor="name">Full name</label>
          <div className="relative">
            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              className="input-field w-full pl-10 pr-3 py-2.5 text-sm"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5" htmlFor="email">Email</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input-field w-full pl-10 pr-3 py-2.5 text-sm"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5" htmlFor="password">Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="input-field w-full pl-10 pr-3 py-2.5 text-sm"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || demoLoading}
          className="btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </button>
      </form>

      <p className="text-center text-sm text-text-secondary mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-accent hover:text-accent-hover font-medium">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}

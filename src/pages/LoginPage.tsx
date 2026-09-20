import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Mail, Lock, Loader2, AlertCircle, KeyRound, X } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { api } from '@/services/api';
import { useToast } from '@/components/ui/Toast';

export function LoginPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState('');

  // Password Reset state
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [demoCode, setDemoCode] = useState('');
  const [sendingReset, setSendingReset] = useState(false);
  const [submittingReset, setSubmittingReset] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.auth.login(email, password);
      showToast('Welcome back to LifeOS', 'success');
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed. Please try again.');
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

  const handleGoogle = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await api.auth.googleSignIn();
      showToast('Welcome back to LifeOS', 'success');
      navigate('/dashboard');
    } catch {
      setError('Google sign-in is not yet configured.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleOpenResetModal = async () => {
    const targetEmail = email.trim() || 'user@lifeos.app';
    setResetEmail(targetEmail);
    setSendingReset(true);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setDemoCode(code);
    setResetCode('');
    setNewPassword('');
    setConfirmPassword('');
    try {
      await api.auth.forgotPassword(targetEmail);
      showToast(`Password reset code triggered for ${targetEmail}`, 'success');
      setResetModalOpen(true);
    } catch (err: any) {
      showToast(err.message || 'Failed to trigger password reset', 'error');
    } finally {
      setSendingReset(false);
    }
  };

  const handleConfirmResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetCode.trim()) {
      showToast('Please enter your 6-digit reset code', 'error');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    setSubmittingReset(true);
    try {
      await api.auth.forgotPassword(resetEmail, resetCode, newPassword);
      showToast('Password updated successfully! You may now sign in with your new password.', 'success');
      setResetModalOpen(false);
      setPassword(newPassword);
      setEmail(resetEmail);
    } catch (err: any) {
      showToast(err.message || 'Failed to update password', 'error');
    } finally {
      setSubmittingReset(false);
    }
  };

  return (
    <AuthLayout title="Sign in" subtitle="Welcome back. Let's check what needs your attention.">
      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-400 animate-slideUp">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="button"
        onClick={handleDemoLogin}
        disabled={demoLoading || loading}
        className="w-full py-2.5 px-4 text-sm font-medium rounded-lg bg-gradient-to-r from-accent/20 to-purple-500/20 border border-accent/40 text-accent hover:border-accent hover:bg-accent/30 transition-all flex items-center justify-center gap-2 shadow-sm mb-4"
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
        <span className="text-xs text-text-tertiary">or sign in with email</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium text-text-secondary" htmlFor="password">Password</label>
            <button
              type="button"
              className="text-xs text-accent hover:text-accent-hover font-medium"
              onClick={handleOpenResetModal}
              disabled={sendingReset}
            >
              {sendingReset ? 'Sending code...' : 'Forgot password?'}
            </button>
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-field w-full pl-10 pr-3 py-2.5 text-sm"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Signing in...
            </>
          ) : (
            'Continue'
          )}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-text-tertiary">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <button
        onClick={handleGoogle}
        disabled={googleLoading}
        className="btn-secondary w-full py-2.5 text-sm flex items-center justify-center gap-2.5"
      >
        {googleLoading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        )}
        Continue with Google
      </button>

      <p className="text-center text-sm text-text-secondary mt-6">
        Don't have an account?{' '}
        <Link to="/signup" className="text-accent hover:text-accent-hover font-medium">
          Create account
        </Link>
      </p>

      <div className="mt-8 flex items-center justify-center gap-2 text-xs text-text-tertiary">
        <Sparkles size={12} />
        <span>Authentication is ready for Amazon Cognito integration</span>
      </div>

      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="card w-full max-w-md p-6 space-y-5 border-border bg-bg-secondary relative text-left">
            <button
              onClick={() => setResetModalOpen(false)}
              className="absolute top-4 right-4 text-text-tertiary hover:text-text-primary p-1 rounded-lg hover:bg-white/5"
            >
              <X size={18} />
            </button>

            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-text-primary mb-1">
                <KeyRound size={18} className="text-accent" />
                Reset Password Verification
              </div>
              <p className="text-xs text-text-secondary">
                Verification request triggered for <span className="font-semibold text-text-primary">{resetEmail}</span>.
              </p>
            </div>

            <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between text-blue-400 font-semibold">
                <span>📩 Email Verification Code</span>
                <button
                  type="button"
                  onClick={() => setResetCode(demoCode)}
                  className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 px-2 py-0.5 rounded text-[11px] font-mono transition-colors"
                >
                  Use Code: {demoCode}
                </button>
              </div>
              <p className="text-text-tertiary leading-relaxed">
                If your email provider filters unverified senders or AWS SES is in Sandbox mode, click <strong className="text-blue-300">"Use Code: {demoCode}"</strong> above to autofill instantly.
              </p>
            </div>

            <form onSubmit={handleConfirmResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Email Address</label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="input-field w-full p-2.5 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">6-Digit Verification Code</label>
                <input
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  placeholder="e.g. 584920"
                  className="input-field w-full p-2.5 text-sm font-mono tracking-widest text-center"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field w-full p-2.5 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field w-full p-2.5 text-sm"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetModalOpen(false)}
                  className="btn-secondary px-4 py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReset}
                  className="btn-primary px-4 py-2 text-xs flex items-center gap-1.5"
                >
                  {submittingReset ? <Loader2 size={14} className="animate-spin" /> : null}
                  Confirm & Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}

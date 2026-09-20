import React, { Component, ErrorInfo, ReactNode, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ToastProvider } from '@/components/ui/Toast';
import { ThemeProvider } from '@/context/ThemeContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { VerifyEmailPage } from '@/pages/VerifyEmailPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { InboxPage } from '@/pages/InboxPage';
import { KnowledgePage } from '@/pages/KnowledgePage';
import { ActionsPage } from '@/pages/ActionsPage';
import { DocumentsPage } from '@/pages/DocumentsPage';
import { DocumentDetailPage } from '@/pages/DocumentDetailPage';
import { WorkflowsPage } from '@/pages/WorkflowsPage';
import { ChangesPage } from '@/pages/ChangesPage';
import { CareerPage } from '@/pages/CareerPage';
import { FinancePage } from '@/pages/FinancePage';
import { SecurityPage } from '@/pages/SecurityPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { SystemHealthPage } from '@/pages/SystemHealthPage';
import { WebSearchPage } from '@/pages/WebSearchPage';
import { api } from '@/services/api';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#07080b] text-white flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-xl font-bold mb-2">LifeOS Session Loaded</h2>
          <p className="text-sm text-gray-400 mb-6 max-w-md">
            {this.state.error?.message || 'An unexpected rendering issue occurred.'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                try {
                  localStorage.removeItem('lifeos_auth_token');
                  localStorage.removeItem('lifeos_user_profile');
                } catch {}
                window.location.href = '/login';
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium text-white transition-colors"
            >
              Sign In to LifeOS
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function KeyboardShortcutsListener() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        navigate('/knowledge');
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        navigate('/documents');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return null;
}

function Protected({ children }: { children: React.ReactNode }) {
  const isAuth = api.auth.isAuthenticated();
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }
  return <AppLayout>{children}</AppLayout>;
}

function EntryRoute() {
  const isAuth = api.auth.isAuthenticated();
  if (isAuth) {
    return <Navigate to="/dashboard" replace />;
  }
  return <LoginPage />;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <BrowserRouter>
            <KeyboardShortcutsListener />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/verify" element={<VerifyEmailPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              <Route path="/dashboard" element={<AppLayout><DashboardPage /></AppLayout>} />
              <Route path="/inbox" element={<AppLayout><InboxPage /></AppLayout>} />
              <Route path="/knowledge" element={<AppLayout><KnowledgePage /></AppLayout>} />
              <Route path="/actions" element={<AppLayout><ActionsPage /></AppLayout>} />
              <Route path="/documents" element={<AppLayout><DocumentsPage /></AppLayout>} />
              <Route path="/documents/:id" element={<AppLayout><DocumentDetailPage /></AppLayout>} />
              <Route path="/workflows" element={<AppLayout><WorkflowsPage /></AppLayout>} />
              <Route path="/changes" element={<AppLayout><ChangesPage /></AppLayout>} />
              <Route path="/career" element={<AppLayout><CareerPage /></AppLayout>} />
              <Route path="/finance" element={<AppLayout><FinancePage /></AppLayout>} />
              <Route path="/security" element={<AppLayout><SecurityPage /></AppLayout>} />
              <Route path="/settings" element={<AppLayout><SettingsPage /></AppLayout>} />
              <Route path="/health" element={<AppLayout><SystemHealthPage /></AppLayout>} />
              <Route path="/web-search" element={<AppLayout><WebSearchPage /></AppLayout>} />

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

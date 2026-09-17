import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw, Home, LogOut } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[SEVA AI Uncaught Runtime Error]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  private handleClearAndRestart = () => {
    try {
      localStorage.removeItem('sevaai_access_token');
      localStorage.removeItem('sevaai_user');
      localStorage.removeItem('sevaai_saved_schemes');
    } catch {
      // Ignore
    }
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="w-7 h-7" />
            </div>
            
            <h2 className="text-xl font-bold text-slate-900 font-heading">
              Notice: UI Refresh Required
            </h2>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              The application encountered an unexpected state while rendering. You can refresh the view or reset your session below.
            </p>

            {this.state.error && (
              <div className="w-full text-left bg-slate-100 rounded-xl p-3 text-[11px] font-mono text-slate-700 overflow-x-auto max-h-32 border border-slate-200">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2.5 w-full mt-2">
              <button
                onClick={this.handleReset}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-govblue-800 text-white font-semibold text-xs hover:bg-govblue-900 transition-colors shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>
              
              <button
                onClick={this.handleClearAndRestart}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 border border-slate-300 transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>Reset to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

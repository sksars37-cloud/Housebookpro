import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('HouseBook Uncaught Error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleClearStorageAndReload = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl text-center">
            <div className="w-14 h-14 mx-auto mb-4 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <h1 className="text-xl font-bold text-slate-100 mb-2">
              HouseBook Encountered an Issue
            </h1>
            
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              The application encountered an unexpected issue while loading. You can refresh the page or reset the local cache to restore the portal.
            </p>

            {this.state.error && (
              <div className="text-left bg-slate-950 p-3 rounded-lg text-xs font-mono text-rose-400 mb-6 overflow-auto max-h-32 border border-slate-800">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-md transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Portal</span>
              </button>

              <button
                onClick={this.handleClearStorageAndReload}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium rounded-xl transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>Reset Local Cache</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

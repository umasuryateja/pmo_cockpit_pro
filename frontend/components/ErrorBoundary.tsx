import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  moduleName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[ErrorBoundary] ${this.props.moduleName || 'Module'} crashed:`, error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 p-8">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
            <AlertTriangle size={28} className="text-red-400" />
          </div>
          <div className="text-center max-w-sm">
            <p className="text-slate-900 font-bold text-sm">
              {this.props.moduleName ? `${this.props.moduleName} failed to load` : 'Something went wrong'}
            </p>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
          </div>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-indigo-600 border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-all"
          >
            <RefreshCw size={12} /> Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

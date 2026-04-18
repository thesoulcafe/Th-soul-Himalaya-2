import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    (this as any).state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    const state = (this as any).state as State;
    const props = (this as any).props as Props;

    if (state.hasError) {
      let errorMessage = "Something went wrong. Please try again later.";
      
      try {
        // Check if it's a JSON string from our Firestore error handler
        const parsed = JSON.parse(state.error?.message || "");
        if (parsed.error && parsed.error.includes("insufficient permissions")) {
          errorMessage = "You don't have permission to perform this action. Please check if you are logged in.";
        }
      } catch (e) {
        // Not a JSON error, keep default
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-cream p-6">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 text-center space-y-6">
            <div className="bg-terracotta/10 p-4 rounded-full w-fit mx-auto">
              <AlertTriangle className="h-12 w-12 text-terracotta" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-forest">Oops! An error occurred</h2>
            <p className="text-forest/60 text-sm leading-relaxed">
              {errorMessage}
            </p>
            <Button 
              onClick={() => window.location.reload()}
              className="w-full bg-forest hover:bg-forest/90 text-white rounded-full flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-4 w-4" /> Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return props.children;
  }
}

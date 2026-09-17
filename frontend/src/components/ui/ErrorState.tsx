import React from 'react';
import { AlertCircle, RefreshCw, MessageSquare } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  onAskAI?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "We couldn't load schemes right now.",
  description = 'Please check your connection or try again. You can also consult the SEVA Assistant for guidance.',
  onRetry,
  onAskAI
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-10 bg-rose-50/50 rounded-2xl border border-rose-200 my-6">
      <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center mb-4 text-rose-600">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-600 max-w-md mb-6">{description}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <Button variant="secondary" size="sm" onClick={onRetry} leftIcon={<RefreshCw className="w-4 h-4" />}>
            Retry
          </Button>
        )}
        {onAskAI && (
          <Button variant="primary" size="sm" onClick={onAskAI} leftIcon={<MessageSquare className="w-4 h-4" />}>
            Ask SEVA
          </Button>
        )}
      </div>
    </div>
  );
};

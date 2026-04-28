import React from 'react';

export default function ErrorAlert({ error, onDismiss }) {
  return (
    <section className="glass-card p-5 border-red-500/30 animate-in">
      <div className="flex items-start gap-3">
        <span className="text-xl">❌</span>
        <div className="w-full">
          <h3 className="text-sm font-semibold text-red-300 mb-1">API Error</h3>
          <p className="text-xs text-red-300/90 leading-relaxed">{error.message}</p>
          <div className="mt-3 text-xs text-red-200/80 space-y-1">
            <p><span className="font-semibold">Type:</span> {error.error_type}</p>
            <p><span className="font-semibold">Step Failed:</span> {error.step_failed}</p>
            <p><span className="font-semibold">Retryable:</span> {error.retryable ? 'Yes' : 'No'}</p>
          </div>
          <button
            onClick={onDismiss}
            className="mt-3 text-xs text-purple-400 hover:text-purple-300 underline"
            type="button"
          >
            Dismiss
          </button>
        </div>
      </div>
    </section>
  );
}

import React from 'react';

/**
 * ErrorMessage
 * Displays a styled error banner with optional retry callback.
 *
 * Props:
 *   message  {string}   — human-readable error message
 *   onDismiss {function} — clears the error
 *   onRetry   {function} — optional retry handler
 */
export default function ErrorMessage({ message, onDismiss, onRetry }) {
  if (!message) return null;

  return (
    <div
      id="error-message"
      role="alert"
      aria-live="assertive"
      className="animate-slide-up rounded-2xl p-5 flex gap-4 items-start"
      style={{
        background: 'rgba(239,68,68,0.08)',
        border: '1px solid rgba(239,68,68,0.25)',
      }}
    >
      {/* Icon */}
      <div
        className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0"
        style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold mb-1" style={{ color: '#f87171' }}>
          Something went wrong
        </p>
        <p className="text-xs leading-relaxed" style={{ color: '#fca5a5' }}>
          {message}
        </p>

        {/* Actions */}
        {onRetry && (
          <button
            id="btn-error-retry"
            onClick={onRetry}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200"
            style={{
              background: 'rgba(239,68,68,0.15)',
              color: '#f87171',
              border: '1px solid rgba(239,68,68,0.3)',
            }}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
          </button>
        )}
      </div>

      {/* Dismiss */}
      <button
        id="btn-error-dismiss"
        onClick={onDismiss}
        aria-label="Dismiss error"
        className="flex-shrink-0 transition-opacity duration-200 hover:opacity-60"
        style={{ color: '#f87171' }}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

import React from 'react';

export default function LoadingSpinner({ message }) {
  return (
    <div className="glass-card p-10 flex flex-col items-center justify-center gap-5 animate-in">
      {/* Spinner */}
      <div className="relative">
        <div className="spinner" />
        <div className="absolute inset-0 flex items-center justify-center text-xl">
          🧬
        </div>
      </div>

      {/* Status Message */}
      <div className="text-center">
        <p className="text-sm font-medium text-purple-300">
          {message || 'Analyzing your symptoms…'}
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-2">
          This may take 30–60 seconds as our multi-agent pipeline researches your condition.
        </p>
      </div>

      {/* Step indicators */}
      <div className="flex gap-4 mt-2">
        {['LLM Extract', 'ML Predict', 'Research', 'Review'].map((step, i) => (
          <div key={step} className="flex flex-col items-center gap-1">
            <div
              className="w-3 h-3 rounded-full bg-purple-500/40 animate-pulse"
              style={{ animationDelay: `${i * 0.4}s` }}
            />
            <span className="text-[10px] text-[var(--text-muted)]">{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

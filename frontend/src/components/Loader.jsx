import React, { useEffect, useState } from 'react';

const STEPS = {
  research: [
    { label: 'Parsing query',         icon: '🔍', color: '#60a5fa' },
    { label: 'Searching Wikipedia',   icon: '📖', color: '#a78bfa' },
    { label: 'Generating summary',    icon: '🧠', color: '#34d399' },
    { label: 'Compiling report',      icon: '📋', color: '#fbbf24' },
  ],
  diagnosis: [
    { label: 'Extracting symptoms',   icon: '🔬', color: '#60a5fa' },
    { label: 'ML model predicting',   icon: '⚙️', color: '#a78bfa' },
    { label: 'Fetching knowledge',    icon: '📖', color: '#34d399' },
    { label: 'Generating report',     icon: '🧠', color: '#fbbf24' },
  ],
};

export default function Loader({ mode = 'diagnosis' }) {
  const steps = STEPS[mode] || STEPS.diagnosis;
  const [activeStep, setActiveStep] = useState(0);

  // Cycle through steps to simulate progress
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div id="loader" className="animate-fade-in" role="status" aria-live="polite" aria-label="Loading">
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(20,18,36,0.75)', border: '1px solid rgba(255,255,255,0.07)' }}>

        {/* Animated gradient top bar */}
        <div className="h-1 w-full" style={{
          background: 'linear-gradient(90deg,#3b82f6,#8b5cf6,#10b981,#3b82f6)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s linear infinite',
        }} />

        <div className="p-8 flex flex-col items-center gap-6">
          {/* Triple-ring spinner */}
          <div className="relative flex items-center justify-center w-24 h-24">
            <div className="absolute inset-0 rounded-full border-2 border-transparent animate-spin"
              style={{ borderTopColor: '#3b82f6', borderRightColor: 'rgba(59,130,246,0.15)', animationDuration: '1.1s' }} />
            <div className="absolute inset-2 rounded-full border-2 border-transparent animate-spin"
              style={{ borderTopColor: '#8b5cf6', borderRightColor: 'rgba(139,92,246,0.15)', animationDuration: '0.75s', animationDirection: 'reverse' }} />
            <div className="absolute inset-4 rounded-full border-2 border-transparent animate-spin"
              style={{ borderTopColor: '#10b981', borderRightColor: 'rgba(16,185,129,0.15)', animationDuration: '0.55s' }} />
            <div className="w-5 h-5 rounded-full animate-pulse"
              style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)' }} />
          </div>

          {/* Active step text */}
          <div className="text-center">
            <p className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              {mode === 'research' ? 'Researching…' : 'Analysing Symptoms…'}
            </p>
            <p className="text-sm font-medium transition-all duration-500" style={{ color: steps[activeStep].color }}>
              {steps[activeStep].icon} {steps[activeStep].label}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>This may take 10–30 seconds</p>
          </div>

          {/* Step indicators with active highlight */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
            {steps.map((step, i) => {
              const isActive = i === activeStep;
              const isDone   = i < activeStep;
              return (
                <div key={i}
                  className="flex flex-col items-center gap-2 px-3 py-4 rounded-xl text-center transition-all duration-500"
                  style={{
                    background: isActive ? `${step.color}15` : 'rgba(255,255,255,0.03)',
                    border: isActive ? `1px solid ${step.color}40` : '1px solid rgba(255,255,255,0.06)',
                    transform: isActive ? 'scale(1.03)' : 'scale(1)',
                  }}
                >
                  <div className="relative">
                    <span className="text-xl">{isDone ? '✓' : step.icon}</span>
                    {isActive && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full animate-pulse"
                        style={{ background: step.color }} />
                    )}
                  </div>
                  <span className="text-[10px] font-semibold leading-snug"
                    style={{ color: isActive ? step.color : isDone ? '#34d399' : 'var(--text-muted)' }}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Progress dots */}
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <div key={i} className="rounded-full transition-all duration-500"
                style={{
                  width: i === activeStep ? '20px' : '6px',
                  height: '6px',
                  background: i === activeStep ? steps[activeStep].color : 'rgba(255,255,255,0.15)',
                }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';

export default function MedicalDisclaimer() {
  return (
    <div className="glass-card p-5 animate-in delay-400 border-yellow-500/20">
      <div className="flex items-start gap-3">
        <span className="text-xl mt-0.5">⚕️</span>
        <div>
          <h3 className="text-sm font-semibold text-yellow-300 mb-1">
            Medical Disclaimer
          </h3>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            This AI assistant is for <strong className="text-yellow-200/80">educational and informational purposes only</strong>.
            It does <strong className="text-yellow-200/80">not</strong> provide medical diagnoses, treatment plans, or professional
            medical advice. Predictions are based on statistical models and may not be accurate.
            Always consult a qualified healthcare professional for any medical concerns.
            <strong className="text-yellow-200/80"> If you are experiencing a medical emergency, call your local emergency number immediately.</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

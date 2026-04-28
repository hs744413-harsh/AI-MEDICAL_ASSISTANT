import React, { useState } from 'react';

/**
 * SymptomInput — Text area + Analyze button.
 *
 * @param {function} onAnalyze  - Called with the text when user clicks Analyze
 * @param {boolean}  loading    - Disables input while analysis is running
 */
export default function SymptomInput({ onAnalyze, loading }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim().length >= 10 && !loading) {
      onAnalyze(text.trim());
    }
  };

  const charCount = text.trim().length;
  const isValid   = charCount >= 10;

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8 animate-in">
      {/* Section Title */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🩺</span>
        <h2 className="text-lg font-semibold">Describe Your Symptoms</h2>
      </div>

      <p className="text-sm text-[var(--text-muted)] mb-4 leading-relaxed">
        Tell us what you're experiencing in plain language. Our AI will extract medical
        symptoms, predict possible conditions, and provide a research-backed analysis.
      </p>

      {/* Text Area */}
      <textarea
        id="symptom-input"
        className="input-dark min-h-[140px]"
        placeholder="e.g. I've had a persistent dry cough and fever for 3 days, along with fatigue and shortness of breath…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={loading}
        rows={5}
      />

      {/* Footer: char count + button */}
      <div className="flex items-center justify-between mt-4">
        <span className={`text-xs ${isValid ? 'text-green-400' : 'text-[var(--text-muted)]'}`}>
          {charCount} characters {!isValid && '(min 10)'}
        </span>

        <button
          type="submit"
          className="btn-gradient"
          disabled={!isValid || loading}
        >
          <span className="flex items-center gap-2">
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing…
              </>
            ) : (
              <>🔬 Analyze Symptoms</>
            )}
          </span>
        </button>
      </div>
    </form>
  );
}

import React, { useState, useCallback } from 'react';
import Navbar         from './components/Navbar.jsx';
import InputBox       from './components/InputBox.jsx';
import ResultCard     from './components/ResultCard.jsx';
import PredictionCard from './components/PredictionCard.jsx';
import Loader         from './components/Loader.jsx';
import ErrorMessage   from './components/ErrorMessage.jsx';
import { analyzeText, researchQuery } from './services/api.js';

/* ──────────────────────────────────────────────
   Shared SVG icons for ResultCards
   ────────────────────────────────────────────── */
const ICONS = {
  summary: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  report: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  analysis: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
};

/* ──────────────────────────────────────────────
   Mode Toggle — Premium tab-style switch
   ────────────────────────────────────────────── */
function ModeToggle({ mode, onChange }) {
  const modes = [
    {
      id: 'research',
      label: 'Research Mode',
      shortLabel: 'Research',
      desc: 'Ask any medical question',
      emoji: '🔬',
      gradient: 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
      glow: 'rgba(59,130,246,0.4)',
    },
    {
      id: 'diagnosis',
      label: 'Diagnosis Mode',
      shortLabel: 'Diagnosis',
      desc: 'Analyse symptoms',
      emoji: '🩺',
      gradient: 'linear-gradient(135deg,#8b5cf6,#059669)',
      glow: 'rgba(139,92,246,0.4)',
    },
  ];

  return (
    <div id="mode-toggle" className="animate-fade-in">
      <div
        className="flex items-stretch rounded-2xl p-1 gap-1"
        role="tablist"
        aria-label="Select mode"
        style={{ background: 'rgba(10,8,18,0.7)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {modes.map((m) => {
          const active = mode === m.id;
          return (
            <button
              key={m.id}
              id={`mode-btn-${m.id}`}
              role="tab"
              aria-selected={active}
              onClick={() => onChange(m.id)}
              className="flex-1 flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 relative overflow-hidden"
              style={
                active
                  ? { background: m.gradient, color: '#fff', boxShadow: `0 4px 20px ${m.glow}` }
                  : { color: 'var(--text-muted)', background: 'transparent' }
              }
            >
              {/* Shimmer on active */}
              {active && (
                <div className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.12) 50%, transparent 70%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 2s linear infinite',
                  }}
                />
              )}
              <span className={`text-lg transition-transform duration-300 ${active ? 'scale-110' : 'scale-90 opacity-60'}`}>
                {m.emoji}
              </span>
              <span className="hidden sm:inline relative z-10">{m.label}</span>
              <span className="sm:hidden relative z-10">{m.shortLabel}</span>
            </button>
          );
        })}
      </div>
      {/* Mode description */}
      <p className="text-center text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
        {modes.find((m) => m.id === mode)?.desc}
      </p>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Hero — shown before any result
   ────────────────────────────────────────────── */
function Hero({ mode }) {
  const isResearch = mode === 'research';
  return (
    <div className="text-center py-12 px-4 animate-fade-in select-none">
      {/* Floating icon */}
      <div
        className="inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-6 relative"
        style={{
          background: isResearch
            ? 'linear-gradient(135deg,rgba(59,130,246,0.18),rgba(29,78,216,0.1))'
            : 'linear-gradient(135deg,rgba(139,92,246,0.18),rgba(5,150,105,0.1))',
          border: isResearch
            ? '1px solid rgba(59,130,246,0.3)'
            : '1px solid rgba(139,92,246,0.3)',
          boxShadow: isResearch
            ? '0 0 40px rgba(59,130,246,0.12)'
            : '0 0 40px rgba(139,92,246,0.12)',
        }}
      >
        <span className="text-5xl">{isResearch ? '🔬' : '🩺'}</span>
        {/* Pulse ring */}
        <div className="absolute inset-0 rounded-3xl animate-ping opacity-10"
          style={{ background: isResearch ? '#3b82f6' : '#8b5cf6' }} />
      </div>

      {/* Headline */}
      <h1
        className="text-4xl sm:text-5xl font-display font-extrabold mb-4 leading-tight"
        style={{
          background: isResearch
            ? 'linear-gradient(135deg,#60a5fa 0%,#93c5fd 100%)'
            : 'linear-gradient(135deg,#a78bfa 0%,#34d399 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        {isResearch ? 'Medical Research' : 'Symptom Diagnosis'}
      </h1>

      <p className="text-sm sm:text-base max-w-lg mx-auto leading-relaxed mb-6" style={{ color: 'var(--text-muted)' }}>
        {isResearch
          ? 'Ask any medical question and get a comprehensive AI-powered research report backed by real-time web search and Wikipedia.'
          : 'Describe your symptoms in plain English. Our ML model extracts, predicts, and explains your condition with urgency guidance.'}
      </p>

      {/* Feature chips */}
      <div className="flex flex-wrap justify-center gap-2">
        {(isResearch
          ? [{ l: 'Web Search',     c: 'badge-blue'   },
             { l: 'AI Summary',     c: 'badge-blue'   },
             { l: 'Medical Report', c: 'badge-purple' },
             { l: 'Deep Analysis',  c: 'badge-purple' }]
          : [{ l: 'LLM Extraction',   c: 'badge-purple' },
             { l: 'ML Prediction',    c: 'badge-blue'   },
             { l: 'Confidence Score', c: 'badge-green'  },
             { l: 'Urgency Rating',   c: 'badge-yellow' }]
        ).map(({ l, c }) => (
          <span key={l} className={`badge ${c} text-[11px] px-3 py-1`}>{l}</span>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Results header row
   ────────────────────────────────────────────── */
function ResultsHeader({ mode, elapsed }) {
  return (
    <div className="flex items-center justify-between py-1 animate-fade-in">
      <div className="flex items-center gap-2.5">
        <div className="w-1.5 h-5 rounded-full"
          style={{ background: mode === 'research' ? 'linear-gradient(#3b82f6,#1d4ed8)' : 'linear-gradient(#8b5cf6,#059669)' }} />
        <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
          {mode === 'research' ? '📋 Research Results' : '🩺 Diagnosis Results'}
        </h2>
      </div>
      {elapsed && (
        <span className="badge badge-green text-[10px] gap-1.5">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Completed in {elapsed}s
        </span>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Disclaimer
   ────────────────────────────────────────────── */
function Disclaimer() {
  return (
    <div className="rounded-2xl px-5 py-4 flex items-start gap-3 animate-slide-up"
      style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.18)', animationDelay: '0.4s' }}>
      <span className="text-lg flex-shrink-0">⚠️</span>
      <p className="text-xs leading-relaxed" style={{ color: '#fde68a' }}>
        <strong>Medical Disclaimer:</strong> This tool is for educational and informational purposes only.
        It does <strong>not</strong> constitute professional medical advice, diagnosis, or treatment.
        Always consult a qualified healthcare professional for any medical concerns.
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN APP
   ══════════════════════════════════════════════ */
export default function App() {
  const [mode,      setMode]      = useState('research');
  const [loading,   setLoading]   = useState(false);
  const [result,    setResult]    = useState(null);
  const [error,     setError]     = useState(null);
  const [elapsed,   setElapsed]   = useState(null);
  const [lastInput, setLastInput] = useState('');

  function handleModeChange(newMode) {
    setMode(newMode);
    setResult(null);
    setError(null);
    setElapsed(null);
  }

  const handleSubmit = useCallback(async (inputText) => {
    setLoading(true);
    setResult(null);
    setError(null);
    setElapsed(null);
    setLastInput(inputText);

    const t0 = Date.now();
    try {
      const data = mode === 'research'
        ? await researchQuery(inputText)
        : await analyzeText(inputText);
      setResult(data);
      setElapsed(((Date.now() - t0) / 1000).toFixed(1));
    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [mode]);

  const handleRetry = () => lastInput && handleSubmit(lastInput);
  const hasResult = result && !loading;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 pb-20 pt-6">

        {/* Mode Toggle */}
        <div className="mb-6">
          <ModeToggle mode={mode} onChange={handleModeChange} />
        </div>

        {/* Hero */}
        {!loading && !result && !error && <Hero mode={mode} />}

        {/* Input */}
        <div className="mb-6">
          <InputBox mode={mode} onSubmit={handleSubmit} loading={loading} />
        </div>

        {/* Loader */}
        {loading && (
          <div className="mb-6">
            <Loader mode={mode} />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="mb-6">
            <ErrorMessage message={error} onDismiss={() => setError(null)} onRetry={handleRetry} />
          </div>
        )}

        {/* ═══ RESULTS ═══ */}
        {hasResult && (
          <div id="results-section" className="space-y-4">
            <ResultsHeader mode={mode} elapsed={elapsed} />

            {/* Diagnosis-specific cards */}
            {mode === 'diagnosis' && (
              <PredictionCard
                predictions={result.predictions ?? []}
                extractedSymptoms={result.extracted_symptoms ?? []}
                topDisease={result.disease}
                delay={0.05}
              />
            )}

            {/* Summary */}
            <ResultCard
              title="Summary"
              content={result.summary}
              icon={ICONS.summary}
              accentColor="var(--primary)"
              delay={0.1}
            />

            {/* Full Report */}
            <ResultCard
              title="Full Report"
              content={result.report}
              icon={ICONS.report}
              accentColor="var(--accent)"
              delay={0.17}
              defaultOpen={false}
            />

            {/* AI Analysis */}
            <ResultCard
              title="AI Analysis"
              content={result.analysis}
              icon={ICONS.analysis}
              accentColor="var(--emerald)"
              delay={0.24}
              defaultOpen={false}
            />

            <Disclaimer />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-5 text-center text-xs border-t"
        style={{ color: 'var(--text-faint)', borderColor: 'var(--border-subtle)' }}>
        MedAI Assistant · ML + LLM Medical Intelligence · For educational use only
      </footer>
    </div>
  );
}

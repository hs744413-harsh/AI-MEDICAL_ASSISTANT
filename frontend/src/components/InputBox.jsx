import React, { useState, useRef, useEffect } from 'react';

const EXAMPLES = {
  research: [
    'What is hypertension?',
    'Causes of type 2 diabetes',
    'How does asthma affect breathing?',
    'What is Alzheimer\'s disease?',
  ],
  diagnosis: [
    'I have fever, headache and body ache for 3 days',
    'Experiencing chest pain, shortness of breath and fatigue',
    'Persistent cough, night sweats and weight loss',
    'Frequent urination, excessive thirst and blurred vision',
  ],
};

const CFG = {
  research: {
    label: 'Medical Question',
    placeholder: 'e.g. What causes high blood pressure? How does diabetes affect the body?',
    buttonLabel: 'Research',
    buttonId: 'btn-research-submit',
    gradient: 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
    glow: 'rgba(59,130,246,0.45)',
    focusRing: 'rgba(59,130,246,0.25)',
    rows: 3,
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
      </svg>
    ),
  },
  diagnosis: {
    label: 'Describe Your Symptoms',
    placeholder: 'Describe your symptoms in detail, e.g. "I have been experiencing fever, headache and fatigue for the past 3 days…"',
    buttonLabel: 'Analyse Symptoms',
    buttonId: 'btn-diagnosis-submit',
    gradient: 'linear-gradient(135deg,#8b5cf6,#059669)',
    glow: 'rgba(139,92,246,0.45)',
    focusRing: 'rgba(139,92,246,0.25)',
    rows: 4,
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
};

export default function InputBox({ mode, onSubmit, loading }) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef(null);
  const cfg = CFG[mode] || CFG.diagnosis;
  const examples = EXAMPLES[mode] || EXAMPLES.diagnosis;
  const isEmpty = value.trim().length === 0;
  const charCount = value.length;
  const maxChars = mode === 'research' ? 500 : 2000;
  const charPct = Math.min((charCount / maxChars) * 100, 100);

  // Reset on mode change
  useEffect(() => { setValue(''); }, [mode]);

  function handleKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isEmpty && !loading) handleSubmit();
    }
  }

  function handleSubmit() {
    if (isEmpty || loading) return;
    onSubmit(value.trim());
    setValue('');
    textareaRef.current?.focus();
  }

  function useExample(ex) {
    setValue(ex);
    textareaRef.current?.focus();
  }

  return (
    <div id="input-box" className="animate-slide-up" style={{ animationDelay: '0.05s' }}>
      {/* Glass card wrapper */}
      <div
        className="rounded-2xl overflow-hidden transition-all duration-300"
        style={{
          background: 'rgba(20,18,36,0.75)',
          backdropFilter: 'blur(20px)',
          border: focused
            ? `1px solid ${cfg.focusRing.replace('0.25', '0.6')}`
            : '1px solid rgba(255,255,255,0.08)',
          boxShadow: focused ? `0 0 0 3px ${cfg.focusRing}` : 'none',
        }}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <label htmlFor="main-textarea"
            className="flex items-center gap-2 text-sm font-semibold"
            style={{ color: 'var(--text-primary)' }}>
            <span className="flex items-center justify-center w-7 h-7 rounded-lg text-white flex-shrink-0"
              style={{ background: cfg.gradient }}>
              {cfg.icon}
            </span>
            {cfg.label}
          </label>
          <div className="flex items-center gap-3">
            {charCount > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="w-16 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div className="h-full rounded-full transition-all duration-200"
                    style={{
                      width: `${charPct}%`,
                      background: charPct > 90 ? '#ef4444' : charPct > 70 ? '#f59e0b' : cfg.gradient,
                    }} />
                </div>
                <span className="text-[10px] tabular-nums" style={{ color: 'var(--text-faint)' }}>
                  {charCount}/{maxChars}
                </span>
              </div>
            )}
            {charCount === 0 && (
              <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>
                Ctrl+Enter to submit
              </span>
            )}
          </div>
        </div>

        {/* Textarea */}
        <div className="px-5 pb-3">
          <textarea
            id="main-textarea"
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            rows={cfg.rows}
            placeholder={cfg.placeholder}
            disabled={loading}
            maxLength={maxChars}
            aria-label={cfg.label}
            className="w-full bg-transparent outline-none resize-none text-sm leading-relaxed transition-all duration-200"
            style={{
              color: 'var(--text-primary)',
              minHeight: '80px',
            }}
          />
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

        {/* Example chips */}
        <div className="px-5 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-2"
            style={{ color: 'var(--text-faint)' }}>
            Try an example
          </p>
          <div className="flex flex-wrap gap-1.5">
            {examples.map((ex) => (
              <button
                key={ex}
                onClick={() => useExample(ex)}
                disabled={loading}
                className="text-[11px] px-3 py-1 rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'var(--text-muted)',
                }}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

        {/* Submit button */}
        <div className="p-3">
          <button
            id={cfg.buttonId}
            onClick={handleSubmit}
            disabled={isEmpty || loading}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-300"
            style={
              isEmpty || loading
                ? { background: 'rgba(255,255,255,0.04)', color: 'var(--text-faint)', cursor: 'not-allowed' }
                : { background: cfg.gradient, boxShadow: `0 4px 24px ${cfg.glow}`, cursor: 'pointer' }
            }
            onMouseEnter={(e) => { if (!isEmpty && !loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing…
              </>
            ) : (
              <>
                {cfg.icon}
                {cfg.buttonLabel}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

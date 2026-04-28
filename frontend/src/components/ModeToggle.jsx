import React from 'react';

/**
 * ModeToggle
 * Toggles between 'research' and 'diagnosis' mode.
 * Props:
 *   mode     {string}   — current mode ('research' | 'diagnosis')
 *   onChange {function} — called with new mode string
 */
export default function ModeToggle({ mode, onChange }) {
  const modes = [
    {
      id: 'research',
      label: 'Research Mode',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      description: 'Ask any medical question',
      gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      glowColor: 'rgba(59,130,246,0.35)',
      activeText: '#93c5fd',
    },
    {
      id: 'diagnosis',
      label: 'Diagnosis Mode',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      description: 'Analyse symptoms & predict disease',
      gradient: 'linear-gradient(135deg, #8b5cf6, #10b981)',
      glowColor: 'rgba(139,92,246,0.35)',
      activeText: '#c4b5fd',
    },
  ];

  return (
    <div id="mode-toggle" className="animate-fade-in">
      {/* Pill toggle bar */}
      <div
        className="flex items-center rounded-2xl p-1 gap-1"
        style={{
          background: 'rgba(15,13,26,0.8)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
        role="tablist"
        aria-label="Select mode"
      >
        {modes.map((m) => {
          const isActive = mode === m.id;
          return (
            <button
              key={m.id}
              id={`mode-btn-${m.id}`}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(m.id)}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden"
              style={
                isActive
                  ? {
                      background: m.gradient,
                      color: '#fff',
                      boxShadow: `0 4px 20px ${m.glowColor}`,
                    }
                  : {
                      color: 'var(--text-muted)',
                      background: 'transparent',
                    }
              }
            >
              <span className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'scale-100'}`}>
                {m.icon}
              </span>
              <span className="hidden sm:inline">{m.label}</span>
              <span className="sm:hidden">{m.id === 'research' ? 'Research' : 'Diagnosis'}</span>
            </button>
          );
        })}
      </div>

      {/* Description beneath toggle */}
      <p
        className="text-center text-xs mt-2 transition-all duration-300"
        style={{ color: 'var(--text-muted)' }}
      >
        {modes.find((m) => m.id === mode)?.description}
      </p>
    </div>
  );
}

import React from 'react';

function BrainIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
      <defs>
        <linearGradient id="ng" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#60a5fa" />
          <stop offset="1" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
      <circle cx="14" cy="14" r="13" stroke="url(#ng)" strokeWidth="1.5" fill="rgba(139,92,246,0.08)" />
      <path d="M6 14 Q8 9 11 12 Q13 14 14 11 Q15 8 17 11 Q19 14 21 12 Q23 9 22 14"
        stroke="url(#ng)" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Navbar() {
  return (
    <header id="navbar" className="sticky top-0 z-50 w-full"
      style={{
        background: 'rgba(10,8,18,0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Brand */}
        <div className="flex items-center gap-3 select-none">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl"
            style={{ background: 'linear-gradient(135deg,rgba(59,130,246,0.25),rgba(139,92,246,0.25))', border: '1px solid rgba(139,92,246,0.35)' }}>
            <BrainIcon />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-display font-bold text-[15px] tracking-tight"
              style={{ background: 'linear-gradient(135deg,#60a5fa,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              MedAI Assistant
            </span>
            <span className="text-[10px] font-medium tracking-wide" style={{ color: 'var(--text-muted)' }}>
              ML + LLM · Medical Intelligence
            </span>
          </div>
        </div>

        {/* Status pills */}
        <div className="hidden sm:flex items-center gap-2">
          {[
            { label: 'ML Model', dot: 'bg-blue-400',   badge: 'badge-blue'   },
            { label: 'LLM',      dot: 'bg-purple-400', badge: 'badge-purple' },
            { label: 'Wikipedia',dot: 'bg-emerald-400',badge: 'badge-green'  },
          ].map(({ label, dot, badge }) => (
            <span key={label} className={`badge ${badge} text-[10px] gap-1.5`}>
              <span className={`w-1.5 h-1.5 rounded-full ${dot} animate-pulse`} />
              {label}
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}

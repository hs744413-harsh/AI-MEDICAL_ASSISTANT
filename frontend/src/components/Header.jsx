import React from 'react';

export default function Header() {
  return (
    <header className="w-full py-6 px-6 flex items-center justify-between">
      {/* Logo / Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
             style={{ background: 'var(--gradient-1)' }}>
          🏥
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Medical AI Assistant
          </h1>
          <p className="text-xs text-[var(--text-muted)] tracking-wide">
            Powered by ML + LLM Multi-Agent Pipeline
          </p>
        </div>
      </div>

      {/* Status Dot */}
      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        System Online
      </div>
    </header>
  );
}

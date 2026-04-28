import React, { useState, useRef } from 'react';

/**
 * ResultCard — collapsible card with copy-to-clipboard and smooth height animation.
 * Props: title, content, icon, accentColor, delay, collapsible, defaultOpen
 */
export default function ResultCard({
  title,
  content,
  icon,
  accentColor = 'var(--primary)',
  delay = 0,
  collapsible = true,
  defaultOpen = true,
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);
  const bodyRef = useRef(null);

  if (!content) return null;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  }

  return (
    <div
      id={`result-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
      className="rounded-2xl overflow-hidden animate-slide-up transition-shadow duration-300"
      style={{
        animationDelay: `${delay}s`,
        background: 'rgba(20,18,36,0.7)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderLeft: `3px solid ${accentColor}`,
        boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px ${accentColor}22`; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.2)'; }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-4">
        <button
          onClick={() => collapsible && setOpen((o) => !o)}
          className="flex items-center gap-3 flex-1 text-left"
          aria-expanded={open}
          disabled={!collapsible}
        >
          {icon && (
            <span
              className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 transition-all duration-200"
              style={{ background: `${accentColor}20`, color: accentColor }}
            >
              {icon}
            </span>
          )}
          <h3 className="text-sm font-bold tracking-wide" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h3>
        </button>

        <div className="flex items-center gap-2 ml-3">
          {/* Copy button */}
          <button
            onClick={handleCopy}
            title="Copy to clipboard"
            className="flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              background: copied ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
              color: copied ? '#34d399' : 'var(--text-muted)',
              border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)'}`,
            }}
          >
            {copied ? (
              <>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </>
            )}
          </button>

          {/* Collapse toggle */}
          {collapsible && (
            <button
              onClick={() => setOpen((o) => !o)}
              className="flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200 hover:bg-white/5"
              style={{ color: 'var(--text-muted)' }}
              aria-label={open ? 'Collapse' : 'Expand'}
            >
              <svg
                className="w-4 h-4 transition-transform duration-300"
                style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div
        ref={bodyRef}
        className="overflow-hidden"
        style={{
          maxHeight: open ? '9999px' : '0px',
          transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />
        <div className="px-5 py-5">
          <div
            className="text-sm leading-relaxed whitespace-pre-wrap"
            style={{ color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}
          >
            {content}
          </div>
        </div>
      </div>
    </div>
  );
}

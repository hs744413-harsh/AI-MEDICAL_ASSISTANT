import React, { useEffect, useState } from 'react';

/* ── helpers ── */
function confidenceInfo(conf) {
  if (conf >= 0.75) return { bar: 'linear-gradient(90deg,#10b981,#34d399)', badge: 'badge-green',  label: 'High',   dot: '#34d399' };
  if (conf >= 0.40) return { bar: 'linear-gradient(90deg,#f59e0b,#fbbf24)', badge: 'badge-yellow', label: 'Medium', dot: '#fbbf24' };
  return               { bar: 'linear-gradient(90deg,#ef4444,#f87171)',     badge: 'badge-red',    label: 'Low',    dot: '#f87171' };
}

function urgencyInfo(urgency = '') {
  const u = urgency.toUpperCase();
  if (u.startsWith('EMERGENCY')) return { emoji: '🔴', color: '#f87171', bg: 'rgba(239,68,68,0.12)',    border: 'rgba(239,68,68,0.3)'    };
  if (u.startsWith('URGENT'))    return { emoji: '🔴', color: '#f87171', bg: 'rgba(239,68,68,0.08)',    border: 'rgba(239,68,68,0.2)'    };
  if (u.startsWith('HIGH'))      return { emoji: '🟠', color: '#fbbf24', bg: 'rgba(245,158,11,0.1)',   border: 'rgba(245,158,11,0.25)'  };
  if (u.startsWith('MODERATE'))  return { emoji: '🟡', color: '#fde68a', bg: 'rgba(253,230,138,0.08)', border: 'rgba(253,230,138,0.2)'  };
  return                                { emoji: '🟢', color: '#34d399', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.2)'   };
}

function SymptomChip({ label }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105"
      style={{ background: 'rgba(139,92,246,0.12)', color: '#c4b5fd', border: '1px solid rgba(139,92,246,0.25)' }}>
      <svg className="w-2.5 h-2.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
      {label.replace(/_/g, ' ')}
    </span>
  );
}

/* Animated confidence bar — grows in after mount */
function ConfidenceBar({ pct, gradient }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 120);
    return () => clearTimeout(t);
  }, [pct]);

  return (
    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
      <div className="h-full rounded-full" style={{ width: `${width}%`, background: gradient, transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)' }} />
    </div>
  );
}

export default function PredictionCard({ predictions = [], extractedSymptoms = [], topDisease, delay = 0 }) {
  if (!predictions.length && !extractedSymptoms.length) return null;

  const topPred  = predictions[0] ?? null;
  const topConf  = topPred ? Math.round((topPred.confidence ?? 0) * 100) : 0;
  const topCI    = topPred ? confidenceInfo(topPred.confidence ?? 0) : null;
  const topUrgUI = topPred ? urgencyInfo(topPred.urgency ?? '') : null;

  return (
    <div id="prediction-card" className="space-y-4 animate-slide-up" style={{ animationDelay: `${delay}s` }}>

      {/* ══ 1. HERO DISEASE BANNER ══ */}
      {topDisease && topPred && (
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.1),rgba(59,130,246,0.07))', border: '1px solid rgba(16,185,129,0.2)' }}>

          {/* Top stripe */}
          <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg,#10b981,#3b82f6)' }} />

          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">

              {/* Icon */}
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.2),rgba(59,130,246,0.15))', border: '1px solid rgba(16,185,129,0.25)' }}>
                <svg className="w-8 h-8" style={{ color: '#34d399' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>

              {/* Text */}
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>
                  Top Predicted Condition
                </p>
                <h2 className="text-2xl sm:text-3xl font-display font-bold mb-1" style={{ color: '#6ee7b7' }}>
                  {topDisease}
                </h2>
                {topPred.is_critical && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
                    🚨 Critical Condition — Seek Medical Attention
                  </span>
                )}
              </div>

              {/* Confidence ring */}
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className="relative flex items-center justify-center w-20 h-20">
                  <svg className="absolute inset-0 w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
                    <circle cx="40" cy="40" r="34" fill="none"
                      stroke={topCI?.dot ?? '#34d399'}
                      strokeWidth="7"
                      strokeDasharray={`${2 * Math.PI * 34}`}
                      strokeDashoffset={`${2 * Math.PI * 34 * (1 - topConf / 100)}`}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
                    />
                  </svg>
                  <div className="text-center">
                    <span className="text-lg font-bold tabular-nums" style={{ color: topCI?.dot ?? '#34d399' }}>
                      {topConf}
                    </span>
                    <span className="text-[10px] block -mt-1" style={{ color: 'var(--text-muted)' }}>%</span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>Confidence</span>
              </div>
            </div>

            {/* Urgency badge */}
            {topPred.urgency && (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl px-4 py-3"
                style={{ background: topUrgUI.bg, border: `1px solid ${topUrgUI.border}` }}>
                <span className="text-base flex-shrink-0">{topUrgUI.emoji}</span>
                <div>
                  <p className="text-xs font-bold mb-0.5" style={{ color: topUrgUI.color }}>Urgency Level</p>
                  <p className="text-xs leading-snug" style={{ color: 'var(--text-secondary)' }}>{topPred.urgency}</p>
                </div>
              </div>
            )}

            {/* Advice */}
            {topPred.advice && (
              <p className="mt-3 text-xs leading-relaxed italic" style={{ color: 'var(--text-muted)' }}>
                💡 {topPred.advice}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ══ 2. EXTRACTED SYMPTOMS ══ */}
      {extractedSymptoms.length > 0 && (
        <div className="rounded-2xl p-5"
          style={{ background: 'rgba(20,18,36,0.7)', border: '1px solid rgba(255,255,255,0.07)', borderLeft: '3px solid var(--accent)' }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
              style={{ background: 'rgba(139,92,246,0.15)', color: 'var(--accent-light)' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Extracted Symptoms</h3>
              <span className="badge badge-purple">{extractedSymptoms.length} found</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {extractedSymptoms.map((s, i) => <SymptomChip key={i} label={s} />)}
          </div>
        </div>
      )}

      {/* ══ 3. ALL PREDICTIONS ══ */}
      {predictions.length > 0 && (
        <div className="rounded-2xl p-5"
          style={{ background: 'rgba(20,18,36,0.7)', border: '1px solid rgba(255,255,255,0.07)', borderLeft: '3px solid var(--primary)' }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
              style={{ background: 'rgba(59,130,246,0.15)', color: 'var(--primary-light)' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </span>
            <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              All Predictions
            </h3>
            <span className="badge badge-blue">{predictions.length}</span>
          </div>

          <div className="space-y-5">
            {predictions.map((p, i) => {
              const pct  = Math.round((p.confidence ?? 0) * 100);
              const ci   = confidenceInfo(p.confidence ?? 0);
              const urgUI = urgencyInfo(p.urgency ?? '');
              return (
                <div key={i} id={`prediction-item-${i}`}>
                  {/* Disease row */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {i === 0 && (
                        <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#fbbf24' }} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      )}
                      <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                        {p.disease}
                      </span>
                      {p.is_critical && (
                        <span className="badge badge-red text-[9px] flex-shrink-0">Critical</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <span className="text-base flex-shrink-0">{urgUI.emoji}</span>
                      <span className={`badge ${ci.badge} text-[10px]`}>{ci.label}</span>
                      <span className="text-sm font-bold tabular-nums" style={{ color: ci.dot }}>
                        {pct}%
                      </span>
                    </div>
                  </div>
                  {/* Animated bar */}
                  <ConfidenceBar pct={pct} gradient={ci.bar} />
                  {/* Urgency sub-label */}
                  {p.urgency && (
                    <p className="mt-1.5 text-[10px]" style={{ color: 'var(--text-faint)' }}>
                      {urgUI.emoji} {p.urgency}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══ 4. KEY SYMPTOMS PRESENT / MISSING (top disease) ══ */}
      {topPred && (topPred.key_symptoms_present?.length > 0 || topPred.key_symptoms_missing?.length > 0) && (
        <div className="grid sm:grid-cols-2 gap-3">
          {topPred.key_symptoms_present?.length > 0 && (
            <div className="rounded-xl p-4"
              style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.18)' }}>
              <p className="text-xs font-bold mb-2 flex items-center gap-1.5" style={{ color: '#34d399' }}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Matching Symptoms ({topPred.key_symptoms_present.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {topPred.key_symptoms_present.map((s) => (
                  <span key={s} className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(16,185,129,0.15)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.25)' }}>
                    {s.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
          {topPred.key_symptoms_missing?.length > 0 && (
            <div className="rounded-xl p-4"
              style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.18)' }}>
              <p className="text-xs font-bold mb-2 flex items-center gap-1.5" style={{ color: '#fbbf24' }}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Missing Symptoms ({topPred.key_symptoms_missing.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {topPred.key_symptoms_missing.slice(0, 8).map((s) => (
                  <span key={s} className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(245,158,11,0.12)', color: '#fde68a', border: '1px solid rgba(245,158,11,0.22)' }}>
                    {s.replace(/_/g, ' ')}
                  </span>
                ))}
                {topPred.key_symptoms_missing.length > 8 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    +{topPred.key_symptoms_missing.length - 8} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

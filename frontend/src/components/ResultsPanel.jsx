import React from 'react';

/**
 * ResultsPanel — Displays ML predictions (disease, confidence, urgency, etc.)
 *
 * @param {object[]} predictions       - Array of PredictionResult
 * @param {string[]} extractedSymptoms - Symptoms the LLM extracted
 * @param {string}   warning           - Optional warning text
 */
export default function ResultsPanel({ predictions, extractedSymptoms, warning }) {
  if (!predictions || predictions.length === 0) return null;

  return (
    <div className="glass-card p-6 md:p-8 animate-in delay-100">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-5">
        <span className="text-2xl">🔬</span>
        <h2 className="text-lg font-semibold">Prediction Results</h2>
      </div>

      {/* Warning Banner */}
      {warning && (
        <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-sm">
          {warning}
        </div>
      )}

      {/* Extracted Symptoms Tags */}
      {extractedSymptoms && extractedSymptoms.length > 0 && (
        <div className="mb-5">
          <p className="text-xs text-[var(--text-muted)] mb-2 uppercase tracking-wider font-medium">
            Extracted Symptoms
          </p>
          <div className="flex flex-wrap gap-2">
            {extractedSymptoms.map((s) => (
              <span
                key={s}
                className="px-3 py-1 text-xs rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/20"
              >
                {s.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="section-divider" />

      {/* Prediction Cards */}
      <div className="space-y-4">
        {predictions.map((pred, idx) => (
          <PredictionCard key={pred.disease} pred={pred} rank={idx + 1} />
        ))}
      </div>
    </div>
  );
}


/* ── Individual Prediction Card ─────────────────────────── */

function PredictionCard({ pred, rank }) {
  const urgencyClass = getUrgencyClass(pred.urgency);
  const confColor    = getConfidenceColor(pred.confidence);

  return (
    <div className={`glass-card p-5 animate-in delay-${rank * 100}`}>
      {/* Top Row: Rank, Disease, Badges */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">
            {pred.is_critical ? '🚨' : rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
          </span>
          <div>
            <h3 className="text-base font-bold">{pred.disease}</h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Rank #{rank}</p>
          </div>
        </div>
        <span className={`badge ${urgencyClass}`}>
          {pred.urgency.split('—')[0].trim()}
        </span>
      </div>

      {/* Confidence Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-[var(--text-muted)]">Confidence</span>
          <span className="font-semibold" style={{ color: confColor }}>
            {pred.confidence}%
          </span>
        </div>
        <div className="confidence-bar">
          <div
            className="confidence-fill"
            style={{
              width: `${Math.min(pred.confidence, 100)}%`,
              background: `linear-gradient(90deg, ${confColor}88, ${confColor})`,
            }}
          />
        </div>
      </div>

      {/* Urgency Detail */}
      <p className="text-xs text-[var(--text-muted)] mb-3">{pred.urgency}</p>

      {/* Symptoms Present / Missing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        {pred.key_symptoms_present?.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-wider text-green-400/70 font-medium mb-1">
              ✓ Symptoms Present
            </p>
            <div className="flex flex-wrap gap-1">
              {pred.key_symptoms_present.map((s) => (
                <span key={s} className="text-[11px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-300 border border-green-500/15">
                  {s.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}
        {pred.key_symptoms_missing?.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-wider text-yellow-400/70 font-medium mb-1">
              ⚠ Symptoms Missing
            </p>
            <div className="flex flex-wrap gap-1">
              {pred.key_symptoms_missing.map((s) => (
                <span key={s} className="text-[11px] px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-300 border border-yellow-500/15">
                  {s.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Advice */}
      <p className="text-xs text-[var(--text-muted)] italic leading-relaxed">
        {pred.advice}
      </p>
    </div>
  );
}


/* ── Helpers ────────────────────────────────────────────── */

function getUrgencyClass(urgency) {
  const u = urgency.toLowerCase();
  if (u.includes('emergency'))  return 'badge-emergency';
  if (u.includes('urgent'))     return 'badge-urgent';
  if (u.includes('high'))       return 'badge-high';
  return 'badge-moderate';
}

function getConfidenceColor(conf) {
  if (conf >= 70) return '#4ade80';    // green
  if (conf >= 40) return '#fbbf24';    // amber
  if (conf >= 20) return '#fb923c';    // orange
  return '#f87171';                    // red
}

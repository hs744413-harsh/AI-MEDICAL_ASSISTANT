import React from 'react';

function urgencyBadgeClass(urgency = '') {
  const text = urgency.toLowerCase();
  if (text.includes('emergency')) return 'badge-emergency';
  if (text.includes('urgent')) return 'badge-urgent';
  if (text.includes('high')) return 'badge-high';
  return 'badge-moderate';
}

function confidenceColor(confidence = 0) {
  if (confidence >= 70) return '#4ade80';
  if (confidence >= 40) return '#fbbf24';
  if (confidence >= 20) return '#fb923c';
  return '#f87171';
}

export default function AnalysisResult({ result, elapsed }) {
  const primary = result?.predictions?.[0];
  if (!primary) return null;

  const conf = Number(primary.confidence || 0);
  const barColor = confidenceColor(conf);

  return (
    <section className="space-y-5 animate-in">
      <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
        <span>Analysis complete</span>
        <span>⏱ {result.response_time || elapsed}s</span>
      </div>

      <div className="glass-card p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-[var(--text-muted)] mb-1">
              Top Predicted Disease
            </p>
            <h2 className="text-2xl md:text-3xl font-bold">{primary.disease}</h2>
          </div>
          <span className={`badge ${urgencyBadgeClass(primary.urgency)}`}>
            {primary.urgency.split('—')[0].trim()}
          </span>
        </div>

        <div className="mt-5">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[var(--text-muted)]">Confidence</span>
            <span className="font-semibold" style={{ color: barColor }}>{conf}%</span>
          </div>
          <div className="confidence-bar">
            <div
              className="confidence-fill"
              style={{
                width: `${Math.min(conf, 100)}%`,
                background: `linear-gradient(90deg, ${barColor}88, ${barColor})`,
              }}
            />
          </div>
        </div>

        <div className="mt-4 text-sm text-[var(--text-muted)]">
          <span className="font-semibold text-[var(--text-primary)]">Urgency:</span> {primary.urgency}
        </div>
      </div>

      <div className="glass-card p-6 md:p-8">
        <h3 className="text-lg font-semibold mb-3">Explanation</h3>
        <p className="text-sm leading-relaxed text-[var(--text-muted)] whitespace-pre-wrap">
          {result.report || 'No explanation available.'}
        </p>
      </div>

      <div className="glass-card p-6 md:p-8">
        <h3 className="text-lg font-semibold mb-3">Critical Analysis</h3>
        <p className="text-sm leading-relaxed text-[var(--text-muted)] whitespace-pre-wrap">
          {result.analysis || 'No critical analysis available.'}
        </p>
      </div>
    </section>
  );
}

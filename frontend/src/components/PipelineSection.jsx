import React, { useState } from 'react';

/**
 * PipelineSection — Shows the research pipeline output:
 *   - Medical report (writer agent)
 *   - Critical analysis (reviewer agent)
 *   - Collapsible raw search/scrape data
 *
 * @param {string}   report         - Writer agent's structured summary
 * @param {string}   analysis       - Critical reviewer's improved version
 * @param {string}   searchSummary  - Raw search results text
 * @param {string}   scrapedContent - Raw scraped text
 * @param {number}   sourcesUsed    - Number of sources
 * @param {string[]} stepsCompleted - Pipeline steps that completed
 * @param {string[]} errors         - Pipeline errors
 */
export default function PipelineSection({
  report,
  analysis,
  searchSummary,
  scrapedContent,
  sourcesUsed,
  stepsCompleted,
  errors,
}) {
  const [showRaw, setShowRaw] = useState(false);

  const hasContent = report || analysis;
  if (!hasContent) return null;

  return (
    <div className="glass-card p-6 md:p-8 animate-in delay-200">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">📋</span>
        <h2 className="text-lg font-semibold">Research Analysis</h2>
      </div>

      {/* Pipeline Status */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {['search', 'scrape', 'writer', 'critical'].map((step) => {
          const done = stepsCompleted?.includes(step);
          return (
            <div key={step} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${done ? 'bg-green-400' : 'bg-red-400/60'}`} />
              <span className="text-xs text-[var(--text-muted)] capitalize">{step}</span>
            </div>
          );
        })}
        {sourcesUsed > 0 && (
          <span className="text-xs text-[var(--text-muted)] ml-auto">
            {sourcesUsed} source{sourcesUsed > 1 ? 's' : ''} used
          </span>
        )}
      </div>

      {/* Errors */}
      {errors && errors.length > 0 && (
        <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <p className="text-xs font-medium text-red-300 mb-1">Pipeline Errors:</p>
          <ul className="text-xs text-red-300/80 list-disc list-inside space-y-1">
            {errors.map((err, i) => <li key={i}>{err}</li>)}
          </ul>
        </div>
      )}

      {/* Critical Analysis (Primary) */}
      {analysis && (
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-purple-300 mb-2 flex items-center gap-2">
            <span>🔍</span> Critical Analysis
          </h3>
          <div className="p-4 rounded-xl bg-black/20 border border-purple-500/10 text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-wrap">
            {analysis}
          </div>
        </div>
      )}

      {/* Medical Report */}
      {report && report !== analysis && (
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-blue-300 mb-2 flex items-center gap-2">
            <span>📝</span> Medical Report
          </h3>
          <div className="p-4 rounded-xl bg-black/20 border border-blue-500/10 text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-wrap">
            {report}
          </div>
        </div>
      )}

      {/* Toggle for raw search/scrape data */}
      {(searchSummary || scrapedContent) && (
        <div>
          <button
            onClick={() => setShowRaw(!showRaw)}
            className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
          >
            {showRaw ? '▾ Hide' : '▸ Show'} Raw Research Data
          </button>

          {showRaw && (
            <div className="mt-3 space-y-3 animate-in">
              {searchSummary && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-medium mb-1">Search Results</p>
                  <pre className="p-3 rounded-lg bg-black/30 text-xs text-[var(--text-muted)] overflow-x-auto max-h-48 overflow-y-auto whitespace-pre-wrap">
                    {searchSummary}
                  </pre>
                </div>
              )}
              {scrapedContent && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-medium mb-1">Scraped Content</p>
                  <pre className="p-3 rounded-lg bg-black/30 text-xs text-[var(--text-muted)] overflow-x-auto max-h-48 overflow-y-auto whitespace-pre-wrap">
                    {scrapedContent.slice(0, 1500)}{scrapedContent.length > 1500 ? '…' : ''}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

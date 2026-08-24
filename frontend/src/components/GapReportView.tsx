'use client';

import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  ArrowRight, 
  RotateCcw,
  Sparkles,
  Layers
} from 'lucide-react';
import { AuditAnalyzeResponse, GapItem } from '@/lib/api';

interface GapReportViewProps {
  report: AuditAnalyzeResponse;
  targetRole: string;
  onProceedToSprint: () => void;
  onReset: () => void;
}

export default function GapReportView({
  report,
  targetRole,
  onProceedToSprint,
  onReset,
}: GapReportViewProps) {
  const getSeverityBadge = (severity: string) => {
    switch (severity.toUpperCase()) {
      case 'HIGH':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            HIGH SEVERITY
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-400/10 text-amber-400 border border-amber-400/30">
            MEDIUM SEVERITY
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">
            LOW SEVERITY
          </span>
        );
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 60) return 'text-amber-400 border-amber-400/30 bg-amber-400/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-emerald-400 text-xs font-mono mb-2">
            <Sparkles className="w-3 h-3" /> Gemini LLM Audit Complete
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Role Gap Report: <span className="text-emerald-400 font-mono">{targetRole}</span>
          </h2>
        </div>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors border border-slate-700 self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Re-audit
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Score Meter Card */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between items-center text-center">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-mono uppercase tracking-wider mb-4">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>360° Readiness Index</span>
          </div>

          <div
            className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center my-2 shadow-inner ${getScoreColor(
              report.readiness_score
            )}`}
          >
            <span className="text-4xl font-extrabold font-mono tracking-tight">
              {report.readiness_score}
            </span>
            <span className="text-[10px] text-slate-400 font-mono uppercase">out of 100</span>
          </div>

          <p className="text-xs text-slate-400 mt-3">
            {report.readiness_score >= 75
              ? 'Strong alignment with target role standard.'
              : 'Gap areas detected requiring a focused sprint.'}
          </p>
        </div>

        {/* Top Strengths Card */}
        <div className="md:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-4 h-4" />
              <span>Verified Code Strengths</span>
            </h3>

            <div className="space-y-2.5">
              {report.top_strengths.map((strength, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-200"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span>{strength}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Harvested from repository signals</span>
            <span>Gemini Evaluated</span>
          </div>
        </div>
      </div>

      {/* Detected Gaps Section */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Detected Technical Role Gaps ({report.detected_gaps.length})</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">Prioritized by severity</span>
        </div>

        {report.detected_gaps.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            No critical gaps detected! Profile meets target role requirements.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {report.detected_gaps.map((gap: GapItem, index: number) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wide">
                      {gap.category}
                    </span>
                  </div>
                  <p className="text-sm text-slate-200 font-medium">{gap.issue}</p>
                </div>
                <div className="shrink-0">{getSeverityBadge(gap.severity)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommended Sprint Action Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-slate-900/80 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-mono font-semibold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>Recommended 48-Hour Sprint Roadmap</span>
          </div>
          <h3 className="text-lg font-bold text-white">
            {report.recommended_sprint.title}
          </h3>
          <p className="text-xs text-slate-400">
            Contains {report.recommended_sprint.milestones.length} actionable proof-of-work milestones.
          </p>
        </div>

        <button
          onClick={onProceedToSprint}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-[0_0_25px_rgba(16,185,129,0.3)] shrink-0"
        >
          <span>Launch Sprint Board</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

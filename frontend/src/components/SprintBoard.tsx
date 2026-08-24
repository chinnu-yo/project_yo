'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ExternalLink, 
  GitPullRequest, 
  Layers, 
  Award, 
  AlertCircle,
  Loader2,
  Sparkles
} from 'lucide-react';
import { RecommendedSprint, verifySprintStep } from '@/lib/api';

interface SprintBoardProps {
  sprint: RecommendedSprint;
  sprintId?: string;
  onBackToReport: () => void;
}

export default function SprintBoard({
  sprint,
  sprintId = 'sp_12345',
  onBackToReport,
}: SprintBoardProps) {
  const [evidenceUrls, setEvidenceUrls] = useState<Record<number, string>>({
    1: 'https://github.com/candidate/sample-backend-service/pull/1',
  });
  const [verifyingStep, setVerifyingStep] = useState<number | null>(null);
  const [verifiedSteps, setVerifiedSteps] = useState<Record<number, boolean>>({});
  const [progressPct, setProgressPct] = useState(0);
  const [messages, setMessages] = useState<Record<number, string>>({});

  const handleVerifyStep = async (stepNumber: number) => {
    const evidenceUrl = evidenceUrls[stepNumber] || '';
    if (!evidenceUrl.trim()) {
      setMessages((prev) => ({
        ...prev,
        [stepNumber]: 'Please provide a valid GitHub Pull Request URL.',
      }));
      return;
    }

    setVerifyingStep(stepNumber);
    setMessages((prev) => ({ ...prev, [stepNumber]: '' }));

    try {
      const response = await verifySprintStep({
        sprint_id: sprintId,
        milestone_step: stepNumber,
        evidence_url: evidenceUrl,
      });

      if (response.status === 'VERIFIED') {
        setVerifiedSteps((prev) => ({ ...prev, [stepNumber]: true }));
        setProgressPct(response.sprint_progress_pct);
        setMessages((prev) => ({ ...prev, [stepNumber]: response.message }));
      } else {
        setMessages((prev) => ({ ...prev, [stepNumber]: response.message }));
      }
    } catch (err: any) {
      setMessages((prev) => ({
        ...prev,
        [stepNumber]: err.message || 'Verification failed.',
      }));
    } finally {
      setVerifyingStep(null);
    }
  };

  const isFullyVerified =
    sprint.milestones.length > 0 &&
    sprint.milestones.every((m) => verifiedSteps[m.step]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Top Header Card */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-emerald-400 text-xs font-mono mb-2">
              <Layers className="w-3.5 h-3.5" /> 48-Hour Proof of Work Sprint Execution
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {sprint.title}
            </h2>
          </div>
          <button
            onClick={onBackToReport}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 transition-colors self-start sm:self-auto"
          >
            ← Back to Gap Report
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Sprint Completion Progress</span>
            <span className="text-emerald-400 font-bold">{progressPct}% Complete</span>
          </div>
          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Verified Badge Header Banner if Completed */}
      {isFullyVerified && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-teal-950/60 to-slate-900/90 border border-emerald-500/40 flex items-center gap-5 animate-in fade-in duration-300 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
          <div className="p-3.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Verified Candidate Badge Issued
            </div>
            <h4 className="text-lg font-bold text-white">
              Sprint Verified! 100% Proof of Work Complete
            </h4>
            <p className="text-xs text-slate-300 mt-1">
              Candidate badge hash: <code className="font-mono text-emerald-300">0x8f3a...d91c</code> (Shareable on recruiter candidate discovery portal)
            </p>
          </div>
        </div>
      )}

      {/* Milestones List */}
      <div className="space-y-6">
        {sprint.milestones.map((milestone) => {
          const isVerified = verifiedSteps[milestone.step];
          const isVerifying = verifyingStep === milestone.step;
          const currentUrl = evidenceUrls[milestone.step] || '';
          const msg = messages[milestone.step];

          return (
            <div
              key={milestone.step}
              className={`p-6 rounded-2xl border transition-all ${
                isVerified
                  ? 'bg-emerald-950/10 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-sm shrink-0 ${
                      isVerified
                        ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {isVerified ? <CheckCircle2 className="w-5 h-5" /> : milestone.step}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                        Milestone Checkpoint {milestone.step}
                      </span>
                      {isVerified && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          VERIFIED
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-white">{milestone.title}</h3>
                  </div>
                </div>

                {milestone.resource_url && (
                  <a
                    href={milestone.resource_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 text-xs font-mono text-slate-300 border border-slate-800 hover:text-emerald-400 hover:border-slate-700 transition-colors shrink-0 self-start"
                  >
                    <span>Learning Resource</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <p className="text-sm text-slate-300 leading-relaxed mb-6 pl-0 md:pl-13">
                {milestone.description}
              </p>

              {/* Proof of Work PR Input Form */}
              <div className="pl-0 md:pl-13 pt-4 border-t border-slate-800/80 space-y-3">
                <label className="text-xs font-mono text-slate-400 flex items-center gap-2">
                  <GitPullRequest className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Submit GitHub Pull Request Evidence URL</span>
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="url"
                    value={currentUrl}
                    onChange={(e) =>
                      setEvidenceUrls({
                        ...evidenceUrls,
                        [milestone.step]: e.target.value,
                      })
                    }
                    placeholder="https://github.com/username/repo/pull/1"
                    disabled={isVerified}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono disabled:opacity-50 transition-colors"
                  />
                  <button
                    onClick={() => handleVerifyStep(milestone.step)}
                    disabled={isVerifying || isVerified}
                    className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs font-mono transition-all flex items-center justify-center gap-2 shrink-0 ${
                      isVerified
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.2)] disabled:opacity-50'
                    }`}
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : isVerified ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verified</span>
                      </>
                    ) : (
                      <span>Verify Submission</span>
                    )}
                  </button>
                </div>

                {msg && (
                  <p
                    className={`text-xs font-mono flex items-center gap-1.5 mt-2 ${
                      isVerified ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {isVerified ? (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span>{msg}</span>
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

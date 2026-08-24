'use client';

import React, { useState } from 'react';
import { 
  GitBranch, 
  ShieldCheck, 
  Terminal, 
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import RoleSelector from '@/components/RoleSelector';
import GapReportView from '@/components/GapReportView';
import SprintBoard from '@/components/SprintBoard';
import AuthButton from '@/components/AuthButton';
import { useAuthState } from '@/lib/auth';
import { analyzeAudit, AuditAnalyzeRequest, AuditAnalyzeResponse } from '@/lib/api';

type Step = 'selector' | 'analyzing' | 'report' | 'sprint';

export default function Home() {
  const { user, githubToken } = useAuthState();
  const [currentStep, setCurrentStep] = useState<Step>('selector');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [auditRequest, setAuditRequest] = useState<AuditAnalyzeRequest | null>(null);
  const [auditResponse, setAuditResponse] = useState<AuditAnalyzeResponse | null>(null);

  const handleStartAudit = async (request: AuditAnalyzeRequest) => {
    setAuditRequest(request);
    setIsLoading(true);
    setErrorMessage(null);
    setCurrentStep('analyzing');

    try {
      const response = await analyzeAudit(request);
      setAuditResponse(response);
      setCurrentStep('report');
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Failed to complete repository audit. Please ensure backend server is running.'
      );
      setCurrentStep('selector');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentStep('selector');
    setAuditResponse(null);
    setErrorMessage(null);
  };

  return (
    <main className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Sticky Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={handleReset}
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold text-lg shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              SR
            </div>
            <span className="font-bold text-xl tracking-tight text-white">SprintReady</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-mono">
              Phase 3 Engine
            </span>
          </div>

          <div className="flex items-center gap-4">
            {currentStep !== 'selector' && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Start New Audit
              </button>
            )}
            
            {/* Firebase Auth & GitHub Connect Button */}
            <AuthButton />
          </div>
        </div>
      </header>

      {/* Hero Header Area */}
      <div className="py-10 px-6 max-w-7xl mx-auto w-full">
        {/* Navigation Step Pills */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono transition-all ${
              currentStep === 'selector'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold'
                : 'bg-slate-900 text-slate-500 border border-slate-800'
            }`}
          >
            <span>1. Role Selector</span>
          </div>
          <span className="text-slate-700 font-mono">→</span>
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono transition-all ${
              currentStep === 'analyzing'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold'
                : currentStep === 'report' || currentStep === 'sprint'
                ? 'bg-slate-900 text-emerald-400 border border-slate-800'
                : 'bg-slate-900 text-slate-500 border border-slate-800'
            }`}
          >
            <span>2. Gap Audit Report</span>
          </div>
          <span className="text-slate-700 font-mono">→</span>
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono transition-all ${
              currentStep === 'sprint'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold'
                : 'bg-slate-900 text-slate-500 border border-slate-800'
            }`}
          >
            <span>3. Sprint Board</span>
          </div>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="max-w-4xl mx-auto mb-8 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-3">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Step 1: Role Selector View */}
        {currentStep === 'selector' && (
          <RoleSelector
            onAnalyze={handleStartAudit}
            isLoading={isLoading}
            activeGithubToken={githubToken}
          />
        )}

        {/* Step 2: Analyzing Loading View */}
        {currentStep === 'analyzing' && (
          <div className="max-w-xl mx-auto py-16 px-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-6 shadow-2xl">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-ping" />
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center text-emerald-400">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white tracking-tight">
                Evaluating GitHub Repository Signals
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Calling FastAPI backend & Gemini LLM gap analyzer...
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-left font-mono text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>[1/3] Fetching public user repositories via REST API...</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>[2/3] Inspecting test suites, Dockerfiles & architecture...</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                <span>[3/3] Saving audit & sprint plan to Supabase Postgres...</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Gap Report Display */}
        {currentStep === 'report' && auditResponse && (
          <GapReportView
            report={auditResponse}
            targetRole={auditRequest?.target_role || 'backend_go_sde1'}
            onProceedToSprint={() => setCurrentStep('sprint')}
            onReset={handleReset}
          />
        )}

        {/* Step 4: Sprint Board Execution */}
        {currentStep === 'sprint' && auditResponse && (
          <SprintBoard
            sprint={auditResponse.recommended_sprint}
            onBackToReport={() => setCurrentStep('report')}
          />
        )}
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 py-8 px-6 text-center text-xs text-slate-500 font-mono">
        SprintReady B2B2C Assessment Engine • Firebase Auth & Supabase Postgres Integration
      </footer>
    </main>
  );
}

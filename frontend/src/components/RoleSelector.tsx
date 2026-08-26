'use client';

import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Code, 
  Globe, 
  Building2, 
  Rocket, 
  Key, 
  Zap, 
  CheckCircle2,
  Clock
} from 'lucide-react';
import { AuditAnalyzeRequest } from '@/lib/api';

interface RoleSelectorProps {
  onAnalyze: (request: AuditAnalyzeRequest) => void;
  isLoading: boolean;
  activeGithubToken?: string | null;
}

export const ROLES = [
  {
    id: 'backend_go_sde1',
    title: 'Backend Engineer (Go)',
    icon: Server,
    description: 'High concurrency API design, gRPC, microservices & Redis caching',
    badge: 'Popular',
  },
  {
    id: 'backend_python_sde1',
    title: 'Backend Engineer (Python)',
    icon: Code,
    description: 'FastAPI, async ORM, Celery background tasks & SQL optimization',
    badge: 'Trending',
  },
  {
    id: 'frontend_react_sde1',
    title: 'Frontend Engineer (React/Next)',
    icon: Globe,
    description: 'Next.js App Router, Tailwind CSS, state management & Web Vitals',
    badge: 'New',
  },
];

export const COMPANY_TIERS = [
  {
    id: 'startup',
    title: 'High-Growth Startup',
    icon: Rocket,
    description: 'Rapid iteration, full ownership, testing & clean MVPs',
  },
  {
    id: 'bigtech',
    title: 'Big Tech Enterprise',
    icon: Building2,
    description: 'Strict architectural patterns, high test coverage & scale',
  },
];

export default function RoleSelector({
  onAnalyze,
  isLoading,
  activeGithubToken,
}: RoleSelectorProps) {
  const [selectedRole, setSelectedRole] = useState('backend_go_sde1');
  const [companyTier, setCompanyTier] = useState('startup');
  const [githubToken, setGithubToken] = useState(
    activeGithubToken || 'gho_demo_token_123456'
  );
  const [sprintDuration, setSprintDuration] = useState(7);

  useEffect(() => {
    if (activeGithubToken) {
      setGithubToken(activeGithubToken);
    }
  }, [activeGithubToken]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze({
      github_token: githubToken,
      target_role: selectedRole,
      company_tier: companyTier,
      sprint_duration_days: sprintDuration,
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 bg-slate-900/60 p-8 rounded-3xl border border-slate-800 backdrop-blur shadow-2xl">
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Select Your Target Job Role & Benchmark Tier
        </h2>
        <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
          SprintReady will harvest your GitHub code signals and run a Gemini LLM gap analysis tailored to your target position.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Target Role Cards */}
        <div className="space-y-3">
          <label className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <span>1. Select Target Job Lane</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ROLES.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;
              return (
                <button
                  type="button"
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`p-5 rounded-2xl border text-left transition-all duration-200 relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-950'
                  }`}
                >
                  {isSelected && (
                    <CheckCircle2 className="absolute top-4 right-4 w-5 h-5 text-emerald-400" />
                  )}
                  <div>
                    <div className="flex items-center gap-2.5 mb-3">
                      <div
                        className={`p-2 rounded-xl border ${
                          isSelected
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {role.badge}
                      </span>
                    </div>
                    <h4 className="font-bold text-base mb-1 text-white">{role.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {role.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Company Tier & Sprint Duration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company Tier */}
          <div className="space-y-3">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <span>2. Target Company Tier</span>
            </label>
            <div className="grid grid-cols-1 gap-3">
              {COMPANY_TIERS.map((tier) => {
                const Icon = tier.icon;
                const isSelected = companyTier === tier.id;
                return (
                  <button
                    type="button"
                    key={tier.id}
                    onClick={() => setCompanyTier(tier.id)}
                    className={`p-4 rounded-xl border text-left flex items-center gap-3 transition-all ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-slate-900 text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-sm text-white">{tier.title}</h5>
                      <p className="text-xs text-slate-400">{tier.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration & GitHub Token */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                <span>Sprint Plan Duration</span>
              </label>
              <select
                value={sprintDuration}
                onChange={(e) => setSprintDuration(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
              >
                <option value={2}>48 Hours (Rapid Sprint)</option>
                <option value={7}>7 Days (Standard Sprint)</option>
                <option value={14}>14 Days (Comprehensive Sprint)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <Key className="w-3.5 h-3.5" />
                <span>GitHub Connection Status</span>
              </label>
              {githubToken ? (
                <div className="w-full bg-slate-950/80 border border-emerald-500/30 rounded-xl px-4 py-2.5 text-sm text-emerald-400 font-medium flex items-center gap-2 font-mono">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>✓ GitHub Account Connected</span>
                </div>
              ) : (
                <div className="w-full bg-slate-950/80 border border-amber-500/30 rounded-xl px-4 py-2.5 text-sm text-amber-400 font-medium flex items-center gap-2 font-mono">
                  <span>GitHub Account Not Connected</span>
                </div>
              )}
              <p className="text-[11px] text-slate-500">
                Secure session active. Token is used strictly to read public repo structures & commits.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-base transition-all shadow-[0_0_30px_rgba(16,185,129,0.25)] disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Harvesting GitHub Signals & Running Gemini Audit...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 fill-slate-950" />
                <span>Execute Role Gap Audit</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

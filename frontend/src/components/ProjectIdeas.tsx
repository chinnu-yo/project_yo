'use client';

import React from 'react';
import { 
  FolderGit2, 
  Sparkles, 
  ArrowRight, 
  Code2, 
  Rocket,
  ShieldCheck,
  Terminal,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { ProjectRecommendation } from '@/lib/api';

interface ProjectIdeasProps {
  projects?: ProjectRecommendation[];
  auditData?: any;
  targetRole: string;
  onLaunchSprint: () => void;
  onReset?: () => void;
}

const DEFAULT_PROJECT_MAP: Record<string, ProjectRecommendation[]> = {
  python: [
    {
      id: 'proj_1',
      title: 'Distributed API Rate Limiter & Token Bucket Gateway',
      description: 'Prevents API abuse and token bucket exhaustion across multi-tenant microservices. Implements sliding window rate limiting with Redis.',
      tech_stack: ['FastAPI', 'Redis', 'Docker', 'PyTest', 'PostgreSQL'],
      key_features: [
        'Redis sliding window rate limiting middleware for FastAPI endpoints',
        'Automated PyTest suite achieving 90%+ code coverage on edge cases',
        'Docker-compose multi-container orchestration setup with health checks'
      ],
      portfolio_impact: 'Demonstrates production concurrency control, high-throughput caching, and containerized deployment skills recruiters seek.'
    },
    {
      id: 'proj_2',
      title: 'Async Background Task Worker Engine',
      description: 'Processes heavy background jobs asynchronously without blocking HTTP APIs. Uses Celery and Redis task queues.',
      tech_stack: ['FastAPI', 'Celery', 'Redis', 'SQLAlchemy', 'Docker'],
      key_features: [
        'Celery/Redis worker queue integration with dynamic progress polling',
        'PostgreSQL transactional status updates with SQLAlchemy ORM',
        'Automated CI/CD GitHub Actions workflow running tests on pull requests'
      ],
      portfolio_impact: 'Proves mastery of asynchronous system design, ORM database transactions, and automated CI/CD pipelines.'
    },
    {
      id: 'proj_3',
      title: 'Multi-Tenant Enterprise Audit Log Microservice',
      description: 'Captures immutable audit logs for regulatory compliance and security vulnerability tracing. Cryptographically hashes event records.',
      tech_stack: ['FastAPI', 'Pydantic', 'PyTest', 'PostgreSQL', 'Docker'],
      key_features: [
        'Cryptographically hashed event log stream storing immutable records',
        'Role-based JWT token authentication with rate-limited access',
        'Comprehensive OpenAPI/Swagger documentation with Pydantic validation'
      ],
      portfolio_impact: 'Showcases enterprise security standards, strict Pydantic data validation, and clear API architecture documentation.'
    }
  ],
  go: [
    {
      id: 'proj_1',
      title: 'Distributed High-Concurrency Rate Limiter Microservice',
      description: 'Protects microservices from DDoS traffic spikes and token bucket resource exhaustion. Implements sliding window concurrency control with Redis.',
      tech_stack: ['Go', 'Gin', 'Redis', 'Docker', 'GoTest'],
      key_features: [
        'Sliding window algorithm backed by Redis memory store',
        'Concurrent gRPC and HTTP endpoint handlers with Go routines',
        'Dockerized deployment setup with benchmark load tests'
      ],
      portfolio_impact: 'Demonstrates system-level concurrency control and low-latency network performance for Go engineering roles.'
    },
    {
      id: 'proj_2',
      title: 'Async Distributed Event Task Queue Engine',
      description: 'Offloads heavy background computations from core web services into isolated worker pools. Processes background queues reliably.',
      tech_stack: ['Go', 'Redis', 'Docker', 'Prometheus'],
      key_features: [
        'Worker queue pool management with automatic retry logic',
        'Structured JSON event serialization with dead-letter queue',
        'Prometheus metrics scraping endpoint for queue throughput'
      ],
      portfolio_impact: 'Proves understanding of distributed queuing, worker synchronization, and system reliability.'
    },
    {
      id: 'proj_3',
      title: 'Cloud Infrastructure Log Aggregator API',
      description: 'Streams and indexes multi-tenant microservice logs for real-time security auditing. Handles high-throughput log streams.',
      tech_stack: ['Go', 'FastAPI', 'JWT', 'Docker'],
      key_features: [
        'High-throughput log stream parser with regex pattern filters',
        'JWT authentication middleware and role-based access control',
        'Comprehensive automated test suite covering edge cases'
      ],
      portfolio_impact: 'Showcases production backend API design, authentication security, and unit testing practices.'
    }
  ],
  frontend: [
    {
      id: 'proj_1',
      title: 'Enterprise Collaborative Workspace Dashboard',
      description: 'Enables distributed teams to manage real-time project state and interactive analytics. Built with optimistic UI state updates.',
      tech_stack: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Zustand'],
      key_features: [
        'Dynamic drag-and-drop Kanban interface with optimistic UI updates',
        'Real-time state management with custom React hooks & Zustand',
        'Accessible WCAG 2.1 compliant UI design system with dark mode'
      ],
      portfolio_impact: 'Demonstrates advanced React state architecture, custom hooks, and polished frontend UI components.'
    },
    {
      id: 'proj_2',
      title: 'High-Performance Data Visualization Studio',
      description: 'Renders massive real-time financial time-series data without UI frame drops. Implements virtualized list rendering.',
      tech_stack: ['React', 'TypeScript', 'Vitest', 'Tailwind CSS'],
      key_features: [
        'Virtualized list rendering for 10,000+ data points',
        'Debounced search and multi-facet filtering engine',
        'Comprehensive Vitest unit component test coverage'
      ],
      portfolio_impact: 'Proves frontend performance optimization, memory management, and automated UI testing capability.'
    },
    {
      id: 'proj_3',
      title: 'AI Prompt Design System & Portal',
      description: 'Streamlines prompt engineering workflows for generative AI applications. Includes variable token slot builders.',
      tech_stack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
      key_features: [
        'Modular template builder with dynamic variable token slots',
        'OAuth 2.0 authentication flow with persistent session storage',
        'Automated Lighthouse CI performance score > 95'
      ],
      portfolio_impact: 'Highlights modern Next.js App Router patterns, TypeScript type safety, and product aesthetics.'
    }
  ]
};

export default function ProjectIdeas({
  projects = [],
  auditData,
  targetRole,
  onLaunchSprint,
  onReset,
}: ProjectIdeasProps) {
  const roleTitle = targetRole.replace(/_/g, ' ').toUpperCase();

  // Extract from props or auditData fallback
  const rawList = 
    (projects && Array.isArray(projects) && projects.length > 0)
      ? projects
      : (auditData?.recommended_projects || auditData?.projects || []);

  let projectList: ProjectRecommendation[] = Array.isArray(rawList) ? rawList : [];

  // If array is still empty, populate role-tailored defaults
  if (projectList.length === 0) {
    const roleKey = targetRole.toLowerCase().includes('go')
      ? 'go'
      : targetRole.toLowerCase().includes('react') || targetRole.toLowerCase().includes('frontend')
      ? 'frontend'
      : 'python';

    projectList = DEFAULT_PROJECT_MAP[roleKey] || DEFAULT_PROJECT_MAP.python;
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Banner Header */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-teal-400 text-xs font-mono mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Curated Resume Proof-of-Work Projects
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Recommended Portfolio Projects: <span className="text-emerald-400 font-mono">{roleTitle}</span>
            </h2>
          </div>
          <button
            onClick={onLaunchSprint}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] shrink-0"
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>Launch Active Sprint</span>
          </button>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          These enterprise-grade projects directly target your detected technical role gaps. Replacing generic tutorial CRUDs with these high-impact systems proves production readiness to technical recruiters.
        </p>
      </div>

      {/* Projects Cards List */}
      <div className="space-y-6">
        {projectList.map((project, index) => {
          // Parse tech stack safely whether array or string
          let stackTags: string[] = [];
          if (Array.isArray(project.tech_stack)) {
            stackTags = project.tech_stack;
          } else if (typeof project.tech_stack === 'string') {
            const rawStack: string = project.tech_stack;
            stackTags = rawStack
              .split(/[\+\,\/]/)
              .map((t: string) => t.trim())
              .filter(Boolean);
          }

          const problemDesc = project.description || project.problem_statement || 'Enterprise grade microservice solving real-world architecture challenges.';

          return (
            <div
              key={project.id || index}
              className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 transition-all space-y-5 shadow-xl relative overflow-hidden group"
            >
              {/* Top Accent Stripe */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 opacity-60 group-hover:opacity-100 transition-opacity" />

              {/* Title & Stack Row */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                      <FolderGit2 className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      {project.title}
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-mono text-slate-400 bg-slate-950 border border-slate-800">
                    Project #{index + 1}
                  </span>
                </div>

                {/* Tech Stack Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1 mr-1">
                    <Code2 className="w-3 h-3" /> Stack:
                  </span>
                  {stackTags.map((tech: string, tIdx: number) => (
                    <span
                      key={tIdx}
                      className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-medium bg-slate-950 text-emerald-300 border border-emerald-500/20"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Real-world Problem Statement */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                  Real-World Problem Solved
                </span>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {problemDesc}
                </p>
              </div>

              {/* Key Features List */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-teal-400 font-bold flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Key Micro-Features & Architecture Requirements</span>
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  {(project.key_features || []).map((feat: string, fIdx: number) => (
                    <div
                      key={fIdx}
                      className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 flex items-start gap-2.5 text-xs text-slate-300"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Portfolio Impact Highlight Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/30 via-slate-950/80 to-slate-950/80 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 tracking-wider">
                      Recruiter Resume Impact
                    </span>
                    <p className="text-xs text-slate-300">
                      {project.portfolio_impact}
                    </p>
                  </div>
                </div>

                <button
                  onClick={onLaunchSprint}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold border border-emerald-400 transition-all shrink-0 flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                >
                  <span>Start Project Sprint</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

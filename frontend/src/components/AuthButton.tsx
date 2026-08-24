'use client';

import React, { useState } from 'react';
import { GitBranch, LogOut, Loader2, User as UserIcon } from 'lucide-react';
import { signInWithGithub, signOutUser, useAuthState } from '@/lib/auth';

interface AuthButtonProps {
  onTokenRetrieved?: (token: string) => void;
}

export default function AuthButton({ onTokenRetrieved }: AuthButtonProps) {
  const { user, githubToken, loading } = useAuthState();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleLogin = async () => {
    setIsAuthenticating(true);
    try {
      const { token } = await signInWithGithub();
      if (token && onTokenRetrieved) {
        onTokenRetrieved(token);
      }
    } catch (err) {
      console.error('Authentication error:', err);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    await signOutUser();
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-500">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span>Auth Loading...</span>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3 p-1 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2.5 px-2">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User Avatar'}
              className="w-7 h-7 rounded-full border border-emerald-500/40"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
              <UserIcon className="w-4 h-4" />
            </div>
          )}
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-white leading-tight">
              {user.displayName || 'GitHub User'}
            </span>
            <span className="text-[10px] font-mono text-emerald-400 leading-none">
              OAuth Token Active
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="Sign Out"
          className="p-2 rounded-lg bg-slate-950 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition-colors border border-slate-800"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleLogin}
      disabled={isAuthenticating}
      className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-50 font-mono"
    >
      {isAuthenticating ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Connecting...</span>
        </>
      ) : (
        <>
          <GitBranch className="w-4 h-4" />
          <span>Connect GitHub</span>
        </>
      )}
    </button>
  );
}

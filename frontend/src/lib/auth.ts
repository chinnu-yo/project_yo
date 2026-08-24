import { useState, useEffect } from 'react';
import { 
  GithubAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { auth } from './firebase';

export interface UserSession {
  user: User | null;
  githubToken: string | null;
  loading: boolean;
}

/**
 * Trigger GitHub OAuth authentication with 'repo' scope.
 */
export async function signInWithGithub(): Promise<{ user: User; token: string | null }> {
  const provider = new GithubAuthProvider();
  // Add required scopes for harvesting user repos & directory trees
  provider.addScope('repo');
  provider.addScope('read:user');

  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GithubAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken || null;
    
    if (token) {
      localStorage.setItem('github_oauth_token', token);
    }
    
    return { user: result.user, token };
  } catch (error: any) {
    console.error('GitHub authentication error:', error);
    throw error;
  }
}

/**
 * Sign out current user.
 */
export async function signOutUser(): Promise<void> {
  localStorage.removeItem('github_oauth_token');
  await firebaseSignOut(auth);
}

/**
 * Custom React Hook to observe user authentication state and GitHub OAuth token.
 */
export function useAuthState(): UserSession {
  const [user, setUser] = useState<User | null>(null);
  const [githubToken, setGithubToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      const savedToken = localStorage.getItem('github_oauth_token');
      setGithubToken(savedToken);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, githubToken, loading };
}

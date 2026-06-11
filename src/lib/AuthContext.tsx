import React, { createContext, useContext, useEffect, useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { isUserAdmin } from './auth';

export interface AppUser {
  email: string;
  name: string;
  picture: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: AppUser | null;
  isAdmin: boolean;
  isLoading: boolean;
  loginWithGoogle: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Restaurer la session depuis localStorage au démarrage
  useEffect(() => {
    const token = localStorage.getItem('session_token');
    if (!token) {
      setIsLoading(false);
      return;
    }
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.user) {
          setUser(data.user);
          setIsAdmin(isUserAdmin(data.user.email));
        } else {
          localStorage.removeItem('session_token');
        }
      })
      .catch(() => localStorage.removeItem('session_token'))
      .finally(() => setIsLoading(false));
  }, []);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: tokenResponse.access_token })
        });
        if (!res.ok) throw new Error('Échec de l\'authentification');
        const data = await res.json();
        localStorage.setItem('session_token', data.token);
        setUser(data.user);
        setIsAdmin(isUserAdmin(data.user.email));
      } catch (error) {
        console.error('Erreur de connexion:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.error('Erreur Google OAuth:', error);
      setIsLoading(false);
    }
  });

  const loginWithGoogle = () => {
    setIsLoading(true);
    googleLogin();
  };

  const logout = () => {
    localStorage.removeItem('session_token');
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, isLoading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return context;
}

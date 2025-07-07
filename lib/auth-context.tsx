"use client"

import { createContext, useContext, ReactNode, useEffect, useState } from 'react';

interface User {
  name?: string;
  email?: string;
  picture?: string;
}

interface AuthContextType {
  user: User | undefined;
  isLoading: boolean;
  error: Error | undefined;
}

const AuthContext = createContext<AuthContextType>({
  user: undefined,
  isLoading: false,
  error: undefined,
});

export function useUser() {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/me');
        
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else if (response.status === 401) {
          // No session or expired session
          setUser(undefined);
        } else {
          throw new Error('Failed to check session');
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const contextValue: AuthContextType = {
    user,
    isLoading,
    error,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
} 
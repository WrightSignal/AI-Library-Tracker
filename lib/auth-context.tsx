"use client"

import { createContext, useContext, ReactNode } from 'react';

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
  // For now, return a mock state indicating Auth0 setup is needed
  const contextValue: AuthContextType = {
    user: undefined,
    isLoading: false,
    error: undefined,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
} 
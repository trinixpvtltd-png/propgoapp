import React, { createContext, useContext, useMemo, useState } from 'react';

type AuthContextType = {
  isAuthenticated: boolean;
  didSkip: boolean;
  login: () => void;
  signup: () => void;
  skip: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [didSkip, setDidSkip] = useState(false);

  const value = useMemo<AuthContextType>(() => ({
    isAuthenticated,
    didSkip,
    login: () => {
      setIsAuthenticated(true);
      setDidSkip(false);
    },
    signup: () => {
      setIsAuthenticated(true);
      setDidSkip(false);
    },
    skip: () => {
      setIsAuthenticated(false);
      setDidSkip(true);
    },
    logout: () => {
      setIsAuthenticated(false);
      setDidSkip(false);
    },
  }), [isAuthenticated, didSkip]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

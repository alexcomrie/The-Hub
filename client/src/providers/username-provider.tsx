import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Username } from '@shared/schema';

interface UsernameContextType {
  username: string | null;
  setUsername: (username: string) => void;
  clearUsername: () => void;
  isUsernameSet: boolean;
  lastUsernameChange: number | null;
}

const UsernameContext = createContext<UsernameContextType | undefined>(undefined);

export function useUsername() {
  const context = useContext(UsernameContext);
  if (context === undefined) {
    throw new Error('useUsername must be used within a UsernameProvider');
  }
  return context;
}

interface UsernameProviderProps {
  children: ReactNode;
}

export function UsernameProvider({ children }: UsernameProviderProps) {
  const [username, setUsernameState] = useState<string | null>(null);
  
  // Load username from localStorage on mount
  useEffect(() => {
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
      setUsernameState(savedUsername);
    }
  }, []);

  const setUsername = (newUsername: string) => {
    if (newUsername && newUsername.trim().length >= 3) {
      // Save to localStorage
      localStorage.setItem('username', newUsername);
      
      // Update state
      setUsernameState(newUsername);
      
      // Create timestamp for tracking when username was set/updated
      const timestamp = Date.now();
      localStorage.setItem('username_created_at', timestamp.toString());
      localStorage.setItem('username_updated_at', timestamp.toString());
    }
  };

  const clearUsername = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('username_created_at');
    localStorage.removeItem('username_updated_at');
    setUsernameState(null);
  };

  const value = {
    username,
    setUsername,
    clearUsername,
    isUsernameSet: !!username,
    lastUsernameChange: localStorage.getItem('username_updated_at') ? parseInt(localStorage.getItem('username_updated_at')!) : null,
  };

  return (
    <UsernameContext.Provider value={value}>
      {children}
    </UsernameContext.Provider>
  );
}
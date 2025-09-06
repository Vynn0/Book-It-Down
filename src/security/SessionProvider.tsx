import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { SessionManager } from './sessionManager';
import type { SessionData } from './sessionManager';
import { useAuth } from '../hooks/useAuth';

interface SessionContextType {
  session: SessionData | null;
  isSessionValid: boolean;
  timeRemaining: number;
  refreshSession: () => void;
  clearSession: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
};

interface SessionProviderProps {
  children: React.ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const [session, setSession] = useState<SessionData | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const { user, logout } = useAuth();

  // Initialize session on component mount (handles page refresh)
  useEffect(() => {
    const existingSession = SessionManager.getSession();
    if (existingSession && SessionManager.isSessionValid()) {
      console.log('Restoring existing session from localStorage');
      setSession(existingSession);
      setTimeRemaining(SessionManager.getTimeRemaining());
    }
  }, []); // Run only on mount

  // Refresh session data (extend session without resetting timer display)
  const refreshSession = useCallback(() => {
    if (user && session) {
      const updatedSession = SessionManager.updateActivity();
      if (updatedSession) {
        setSession(updatedSession);
        // Don't update timeRemaining here to avoid timer jumps
      }
    }
  }, [user, session]);

  // Clear session
  const clearSession = useCallback(() => {
    console.log('Clearing session and logging out user');
    SessionManager.clearSession();
    setSession(null);
    setTimeRemaining(0);
    logout();
  }, [logout]);

  // Initialize session when user logs in (but not on refresh)
  useEffect(() => {
    if (user && !session) {
      // Only create new session if user exists but no session is active
      // This happens on fresh login, not on page refresh
      const existingSession = SessionManager.getSession();
      if (!existingSession || !SessionManager.isSessionValid()) {
        console.log('Creating new session for user login');
        const newSession = SessionManager.createSession(user.userID, user.email, 'search');
        setSession(newSession);
        setTimeRemaining(SessionManager.getTimeRemaining());
      }
    } else if (!user && session) {
      // User logged out, clear session
      console.log('User logged out, clearing session');
      setSession(null);
      setTimeRemaining(0);
    }
  }, [user, session]);

  // Activity tracking - throttled to prevent excessive updates
  useEffect(() => {
    if (!user || !session) return;

    let lastActivityTime = 0;
    const ACTIVITY_THROTTLE = 2 * 60 * 1000; // Only update activity every 2 minutes
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    const handleActivity = () => {
      const now = Date.now();
      // Only update activity if enough time has passed since last update
      if (now - lastActivityTime > ACTIVITY_THROTTLE) {
        lastActivityTime = now;
        refreshSession();
      }
    };

    // Add event listeners for user activity
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [user, session, refreshSession]);

  // Session validation timer
  useEffect(() => {
    if (!user || !session) return;

    const checkSession = () => {
      const currentSession = SessionManager.getSession();
      
      if (!currentSession || !SessionManager.isSessionValid()) {
        console.warn('Session expired - logging out user');
        clearSession();
        return;
      }

      setSession(currentSession);
      setTimeRemaining(SessionManager.getTimeRemaining());
    };

    // Check session validity every 30 seconds
    const interval = setInterval(checkSession, SessionManager.getActivityCheckInterval());

    return () => clearInterval(interval);
  }, [user, session, clearSession]);

  // Update time remaining every second for UI display
  useEffect(() => {
    if (!session) return;

    const interval = setInterval(() => {
      const remaining = SessionManager.getTimeRemaining();
      setTimeRemaining(remaining);
      
      // Only clear session if it's actually expired
      if (remaining <= 0 && !SessionManager.isSessionValid()) {
        clearSession();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session, clearSession]); // Removed timeRemaining dependency to prevent restarts

  const contextValue: SessionContextType = {
    session,
    isSessionValid: SessionManager.isSessionValid(),
    timeRemaining,
    refreshSession,
    clearSession
  };

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
};

// Simple session management for client-side security
// This provides basic session timeout and activity tracking

export interface SessionData {
  userId: string;
  email: string;
  loginTime: number;
  lastActivity: number;
  expiresAt: number;
  currentPage?: string; // Track current page/route
  subView?: string; // Track sub-views like 'admin' within search page
}

export class SessionManager {
  private static readonly SESSION_KEY = 'app_session';
  private static readonly SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds
  private static readonly ACTIVITY_CHECK_INTERVAL = 30 * 1000; // Check every 30 seconds
  private static readonly MIN_EXTEND_THRESHOLD = 5 * 60 * 1000; // Only extend if less than 5 minutes remaining
  private static readonly EXTEND_AMOUNT = 10 * 60 * 1000; // Extend by 10 minutes, not full reset

  // Create a new session
  static createSession(userId: string, email: string, currentPage: string = 'search'): SessionData {
    const now = Date.now();
    const session: SessionData = {
      userId,
      email,
      loginTime: now,
      lastActivity: now,
      expiresAt: now + this.SESSION_TIMEOUT,
      currentPage
    };

    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    console.log(`Session created for user ${email} on page: ${currentPage}`);
    return session;
  }

  // Get current session
  static getSession(): SessionData | null {
    try {
      const sessionStr = localStorage.getItem(this.SESSION_KEY);
      if (!sessionStr) return null;

      const session: SessionData = JSON.parse(sessionStr);
      
      // Check if session has expired
      if (Date.now() > session.expiresAt) {
        this.clearSession();
        return null;
      }

      return session;
    } catch (error) {
      console.error('Error getting session:', error);
      this.clearSession();
      return null;
    }
  }

  // Update last activity and extend session
  static updateActivity(): SessionData | null {
    const session = this.getSession();
    if (!session) return null;

    const now = Date.now();
    const timeRemaining = session.expiresAt - now;
    
    // Update last activity time
    session.lastActivity = now;
    
    // Only extend session if it's getting close to expiry (less than 5 minutes remaining)
    if (timeRemaining < this.MIN_EXTEND_THRESHOLD) {
      // Extend by 10 minutes from current time, not full reset
      session.expiresAt = now + this.EXTEND_AMOUNT;
      console.log(`Session extended by 10 minutes. New expiry: ${new Date(session.expiresAt).toLocaleTimeString()}`);
    } else {
      console.log(`Session activity recorded. ${Math.floor(timeRemaining / 60000)} minutes remaining - no extension needed`);
    }

    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    return session;
  }

  // Check if session is valid
  static isSessionValid(): boolean {
    const session = this.getSession();
    return session !== null && Date.now() < session.expiresAt;
  }

  // Get time remaining until session expires (in milliseconds)
  static getTimeRemaining(): number {
    const session = this.getSession();
    if (!session) return 0;

    return Math.max(0, session.expiresAt - Date.now());
  }

  // Clear session
  static clearSession(): void {
    localStorage.removeItem(this.SESSION_KEY);
  }

  // Update current page and subview in session
  static updateCurrentPage(currentPage: string, subView?: string): SessionData | null {
    const session = this.getSession();
    if (!session) return null;

    session.currentPage = currentPage;
    if (subView !== undefined) {
      session.subView = subView;
    }
    session.lastActivity = Date.now();

    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    console.log(`Session updated - Page: ${currentPage}, SubView: ${subView || 'none'}`);
    return session;
  }

  // Get session timeout duration
  static getSessionTimeout(): number {
    return this.SESSION_TIMEOUT;
  }

  // Get activity check interval
  static getActivityCheckInterval(): number {
    return this.ACTIVITY_CHECK_INTERVAL;
  }
}

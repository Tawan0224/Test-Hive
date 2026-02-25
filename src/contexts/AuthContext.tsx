import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { loginRequest } from '../config/msalConfig';

/**
 * Safe wrapper around useMsal() – returns a no-op instance object
 * when <MsalProvider> is missing (e.g. MSAL init failed).
 */
function useMsalSafe() {
  try {
    return useMsal();
  } catch {
    return { instance: null as any };
  }
}

interface User {
  _id: string;
  email: string;
  username: string;
  displayName: string;
  profilePicture: string;
  authProvider: string;
  stats: {
    quizzesCompleted: number;
    currentStreak: number;
    longestStreak: number;
    totalScore: number;
    averageScore: number;
  };
  achievements: Array<{
    achievementId: string;
    unlockedAt: string;
  }>;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, username: string) => Promise<{ success: boolean; error?: string }>;
  googleAuth: (accessToken: string) => Promise<{ success: boolean; error?: string }>;
  microsoftLogin: () => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('testhive_token'));
  const [isLoading, setIsLoading] = useState(true);
  const { instance: msalInstance } = useMsalSafe();

  // On mount, check if we have a saved token and fetch user data
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('testhive_token');
      if (savedToken) {
        const response = await authAPI.getMe();
        if (response.success && response.data) {
          setUser((response.data as any).user);
          setToken(savedToken);
        } else {
          // Token is invalid/expired, clear it
          localStorage.removeItem('testhive_token');
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authAPI.login(email, password);

    if (response.success && response.data) {
      const { user: userData, token: newToken } = response.data as any;
      localStorage.setItem('testhive_token', newToken);
      setUser(userData);
      setToken(newToken);
      return { success: true };
    }

    return {
      success: false,
      error: response.error?.message || 'Login failed',
    };
  };

  const signup = async (email: string, password: string, username: string) => {
    const response = await authAPI.signup(email, password, username);

    if (response.success && response.data) {
      const { user: userData, token: newToken } = response.data as any;
      localStorage.setItem('testhive_token', newToken);
      setUser(userData);
      setToken(newToken);
      return { success: true };
    }

    return {
      success: false,
      error: response.error?.message || 'Signup failed',
    };
  };

  const googleAuth = async (accessToken: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const profile = await res.json();

      const response = await authAPI.googleAuth({
        email: profile.email,
        googleId: profile.sub,
        displayName: profile.name,
        profilePicture: profile.picture || '',
      });

      if (response.success && response.data) {
        const { user: u, token: t } = response.data as any;
        localStorage.setItem('testhive_token', t);
        setUser(u);
        setToken(t);
        return { success: true };
      }

      return {
        success: false,
        error: response.error?.message || 'Google login failed',
      };
    } catch (err) {
      console.error('Google login error:', err);
      return { success: false, error: 'Google login failed' };
    }
  };

  const microsoftLogin = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const loginResponse = await msalInstance.loginPopup(loginRequest);
      const account = loginResponse.account;

      if (!account) {
        return { success: false, error: 'Microsoft login failed - no account returned' };
      }

      const response = await authAPI.microsoftAuth({
        email: account.username,
        microsoftId: account.localAccountId,
        displayName: account.name || account.username.split('@')[0],
        profilePicture: '',
      });

      if (response.success && response.data) {
        const { user: u, token: t } = response.data as any;
        localStorage.setItem('testhive_token', t);
        setUser(u);
        setToken(t);
        return { success: true };
      }

      return {
        success: false,
        error: response.error?.message || 'Microsoft login failed',
      };
    } catch (err: any) {
      console.error('Microsoft login error:', err);
      return {
        success: false,
        error: err?.errorMessage || 'Microsoft login failed',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('testhive_token');
    setUser(null);
    setToken(null);
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        googleAuth,
        microsoftLogin,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return context;
}
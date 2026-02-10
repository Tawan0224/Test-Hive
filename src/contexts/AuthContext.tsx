import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';

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
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('testhive_token'));
  const [isLoading, setIsLoading] = useState(true);

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

  const logout = () => {
    localStorage.removeItem('testhive_token');
    setUser(null);
    setToken(null);
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
        logout,
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
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserProfile } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<User>;
  register: (data: any) => Promise<void>;
  sendOtp: (identifier: string, purpose?: 'login' | 'register') => Promise<{ message: string; status: string; success: boolean }>;
  verifyOtp: (identifier: string, otp_code: string, purpose?: 'login' | 'register') => Promise<{ success: boolean; verified: boolean; message: string; verification_token?: string }>;
  loginWithOtp: (identifier: string, otpCode: string) => Promise<void>;
  registerWithOtp: (data: {
    email: string;
    password: string;
    full_name: string;
    otp_code?: string;
    verification_token?: string;
    phone_number?: string;
    role?: 'user' | 'admin';
    state?: string;
    preferred_language?: string;
  }) => Promise<any>;
  logout: () => void;
  updateProfile: (profile: UserProfile) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const current = authService.getCurrentUser();
    setUser(current);
    setLoading(false);
  }, []);

  const isAdmin = Boolean(user && user.role === 'admin');

  const login = async (email: string, pass: string) => {
    const res = await authService.login(email, pass);
    setUser(res.user);
    return res.user;
  };

  const register = async (data: any) => {
    const res = await authService.register(data);
    setUser(res.user);
  };

  const sendOtp = async (identifier: string, purpose: 'login' | 'register' = 'login') => {
    return await authService.sendOtp(identifier, purpose);
  };

  const verifyOtp = async (identifier: string, otp_code: string, purpose: 'login' | 'register' = 'register') => {
    return await authService.verifyOtp(identifier, otp_code, purpose);
  };

  const loginWithOtp = async (identifier: string, otpCode: string) => {
    const res = await authService.loginWithOtp(identifier, otpCode);
    setUser(res.user);
  };

  const registerWithOtp = async (data: {
    email: string;
    password: string;
    full_name: string;
    otp_code?: string;
    verification_token?: string;
    phone_number?: string;
    role?: 'user' | 'admin';
    state?: string;
    preferred_language?: string;
  }) => {
    const res = await authService.registerWithOtp(data);
    setUser(res.user);
    return res;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateProfile = async (profile: UserProfile) => {
    const updated = await authService.updateProfile(profile);
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin,
        loading,
        login,
        register,
        sendOtp,
        verifyOtp,
        loginWithOtp,
        registerWithOtp,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

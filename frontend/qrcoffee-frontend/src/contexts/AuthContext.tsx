import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthContextType, LoginRequest, SignupRequest } from '../types/auth';
import { authService } from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && authService.hasToken();

  // 컴포넌트 마운트 시 토큰 확인 및 사용자 정보 로드
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (authService.hasToken()) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error('사용자 정보 로드 실패:', error);
        authService.clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      setIsLoading(true);
      const jwtResponse = await authService.login(credentials);
      
      // JWT 응답에서 사용자 정보 설정
      const userData: User = {
        id: jwtResponse.userId,
        email: jwtResponse.email,
        name: jwtResponse.name,
        role: jwtResponse.role as 'MASTER' | 'SUB',
        storeId: jwtResponse.storeId,
        isActive: true,
        createdAt: new Date().toISOString()
      };
      
      setUser(userData);
    } catch (error) {
      console.error('로그인 실패:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    authService.logout();
  };

  const signup = async (userData: SignupRequest): Promise<void> => {
    try {
      setIsLoading(true);
      await authService.signup(userData);
    } catch (error) {
      console.error('회원가입 실패:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async (): Promise<void> => {
    try {
      await authService.refreshToken();
    } catch (error) {
      console.error('토큰 갱신 실패:', error);
      logout();
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    signup,
    refreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth는 AuthProvider 내에서 사용되어야 합니다');
  }
  return context;
}; 
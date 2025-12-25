// 인증 관련 타입 정의

export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  role: 'MASTER' | 'SUB';
  storeId: number;
  parentUserId?: number;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  storeId: number;
  parentUserId?: number;
}

export interface JwtResponse {
  accessToken: string;
  refreshToken: string;
  type: string;
  userId: number;
  email: string;
  name: string;
  role: string;
  storeId: number;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  signup: (userData: SignupRequest) => Promise<void>;
  refreshToken: () => Promise<void>;
}

export interface PrivateRouteProps {
  children: React.ReactNode;
  requireMaster?: boolean;
} 

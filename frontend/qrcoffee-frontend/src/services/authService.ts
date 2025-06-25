import axios from 'axios';
import { LoginRequest, SignupRequest, JwtResponse, User } from '../types/auth';
import { ApiResponse } from '../types/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Axios 인스턴스 생성
const authApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// 요청 인터셉터: 토큰 자동 추가
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터: 토큰 만료 시 자동 갱신 또는 로그아웃
authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        await refreshToken();
        const newToken = localStorage.getItem('accessToken');
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return authApi(originalRequest);
        }
      } catch (refreshError) {
        // 토큰 갱신 실패 시 로그아웃 처리
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export const authService = {
  /**
   * 로그인
   */
  async login(credentials: LoginRequest): Promise<JwtResponse> {
    try {
      const response = await authApi.post<ApiResponse<JwtResponse>>('/auth/login', credentials);
      
      if (response.data.success && response.data.data) {
        const jwtResponse = response.data.data;
        
        // 토큰 저장
        localStorage.setItem('accessToken', jwtResponse.accessToken);
        localStorage.setItem('refreshToken', jwtResponse.refreshToken);
        
        return jwtResponse;
      } else {
        throw new Error(response.data.message || '로그인에 실패했습니다.');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('로그인 중 오류가 발생했습니다.');
      }
    }
  },

  /**
   * 회원가입
   */
  async signup(userData: SignupRequest): Promise<User> {
    try {
      const response = await authApi.post<ApiResponse<User>>('/auth/signup', userData);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || '회원가입에 실패했습니다.');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('회원가입 중 오류가 발생했습니다.');
      }
    }
  },

  /**
   * 현재 사용자 정보 조회
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await authApi.get<ApiResponse<User>>('/auth/me');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || '사용자 정보를 가져올 수 없습니다.');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('사용자 정보 조회 중 오류가 발생했습니다.');
      }
    }
  },

  /**
   * 로그아웃
   */
  async logout(): Promise<void> {
    try {
      await authApi.post('/auth/logout');
    } catch (error) {
      console.warn('로그아웃 API 호출 실패:', error);
    } finally {
      // 로컬 스토리지에서 토큰 제거
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },

  /**
   * 토큰 갱신
   */
  async refreshToken(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      throw new Error('Refresh token이 없습니다.');
    }

    try {
      // TODO: 백엔드에 토큰 갱신 API가 구현되면 여기서 호출
      // 현재는 단순히 기존 토큰을 유지
      console.log('토큰 갱신 기능은 아직 구현되지 않았습니다.');
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      throw error;
    }
  },

  /**
   * 토큰 존재 여부 확인
   */
  hasToken(): boolean {
    return !!localStorage.getItem('accessToken');
  },

  /**
   * 토큰 제거
   */
  clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};

/**
 * 현재 저장된 액세스 토큰 반환
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

// 토큰 갱신 함수를 별도로 export (인터셉터에서 사용)
async function refreshToken(): Promise<void> {
  return authService.refreshToken();
} 
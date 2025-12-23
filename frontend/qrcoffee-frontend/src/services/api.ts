import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { ApiResponse, ErrorResponse } from '../types/api';

// API 기본 설정
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Axios 인스턴스 생성
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    // 인증 토큰이 있으면 헤더에 추가
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, config.data);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    return response;
  },
  (error: AxiosError<ErrorResponse>) => {
    console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.data);
    
    // 401 에러 시 로그인 페이지로 리디렉션
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      // window.location.href = '/login';
    }
    
    // 에러 응답을 표준화
    const errorResponse: ErrorResponse = {
      success: false,
      message: error.response?.data?.message || '서버 오류가 발생했습니다.',
      error: error.response?.data?.error || error.message,
      timestamp: new Date().toISOString(),
    };
    
    return Promise.reject(errorResponse);
  }
);

// API 메소드들
export const api = {
  // GET 요청
  get: <T>(url: string, params?: any): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.get(url, { params });
  },
  
  // POST 요청
  post: <T>(url: string, data?: any): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.post(url, data);
  },
  
  // PUT 요청
  put: <T>(url: string, data?: any): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.put(url, data);
  },
  
  // DELETE 요청
  delete: <T>(url: string): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.delete(url);
  },
  
  // PATCH 요청
  patch: <T>(url: string, data?: any): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.patch(url, data);
  },
  
  // 파일 업로드
  upload: <T>(url: string, formData: FormData): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// 헬스체크 API
export const healthApi = {
  check: () => api.get<any>('/health'),
};

export default apiClient; 
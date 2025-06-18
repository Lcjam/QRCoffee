// API 응답 기본 인터페이스
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

// 페이지네이션을 위한 인터페이스
export interface PaginationRequest {
  page: number;
  size: number;
  sort?: string;
}

export interface PaginationResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
  first: boolean;
  last: boolean;
}

// 에러 응답 인터페이스
export interface ErrorResponse {
  success: false;
  message: string;
  error: string;
  timestamp: string;
} 
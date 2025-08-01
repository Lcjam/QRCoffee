import { ApiResponse } from '../types/api';
import { Seat, SeatRequest, SeatStats } from '../types/seat';
import { getAuthToken } from './authService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// 공통 헤더 생성
const getHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// API 응답 처리 헬퍼
const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// 좌석 관리 API
export const seatService = {
  // 좌석 목록 조회
  getSeats: async (): Promise<Seat[]> => {
    const response = await fetch(`${API_BASE_URL}/api/seats`, {
      method: 'GET',
      headers: getHeaders(),
    });
    const apiResponse = await handleResponse<Seat[]>(response);
    return apiResponse.data || [];
  },

  // 좌석 통계 조회
  getStats: async (): Promise<SeatStats> => {
    const response = await fetch(`${API_BASE_URL}/api/seats/stats`, {
      method: 'GET',
      headers: getHeaders(),
    });
    const apiResponse = await handleResponse<SeatStats>(response);
    if (!apiResponse.data) {
      throw new Error('통계 데이터를 가져올 수 없습니다.');
    }
    return apiResponse.data;
  },

  // 좌석 생성
  createSeat: async (seatData: SeatRequest): Promise<Seat> => {
    const response = await fetch(`${API_BASE_URL}/api/seats`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(seatData),
    });
    const apiResponse = await handleResponse<Seat>(response);
    if (!apiResponse.data) {
      throw new Error('좌석 생성에 실패했습니다.');
    }
    return apiResponse.data;
  },

  // 좌석 수정
  updateSeat: async (id: number, seatData: SeatRequest): Promise<Seat> => {
    const response = await fetch(`${API_BASE_URL}/api/seats/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(seatData),
    });
    const apiResponse = await handleResponse<Seat>(response);
    if (!apiResponse.data) {
      throw new Error('좌석 수정에 실패했습니다.');
    }
    return apiResponse.data;
  },

  // 좌석 활성화 상태 토글
  toggleSeatStatus: async (id: number): Promise<Seat> => {
    const response = await fetch(`${API_BASE_URL}/api/seats/${id}/toggle-status`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    const apiResponse = await handleResponse<Seat>(response);
    if (!apiResponse.data) {
      throw new Error('좌석 상태 변경에 실패했습니다.');
    }
    return apiResponse.data;
  },



  // QR코드 재생성
  regenerateQRCode: async (id: number): Promise<Seat> => {
    const response = await fetch(`${API_BASE_URL}/api/seats/${id}/regenerate-qr`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    const apiResponse = await handleResponse<Seat>(response);
    if (!apiResponse.data) {
      throw new Error('QR코드 재생성에 실패했습니다.');
    }
    return apiResponse.data;
  },

  // 좌석 삭제
  deleteSeat: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/seats/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    await handleResponse<null>(response);
  },
};

// 고객용 좌석 API
export const publicSeatService = {
  // QR코드로 좌석 조회
  getSeatByQRCode: async (qrCode: string): Promise<Seat> => {
    const response = await fetch(`${API_BASE_URL}/api/public/seats/qr/${qrCode}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const apiResponse = await handleResponse<Seat>(response);
    if (!apiResponse.data) {
      throw new Error('좌석을 찾을 수 없습니다.');
    }
    return apiResponse.data;
  },

  // 사용 가능한 좌석 목록 조회
  getAvailableSeats: async (storeId: number): Promise<Seat[]> => {
    const response = await fetch(`${API_BASE_URL}/api/public/seats/available/${storeId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const apiResponse = await handleResponse<Seat[]>(response);
    return apiResponse.data || [];
  },
}; 
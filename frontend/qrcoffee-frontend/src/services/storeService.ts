import { api } from './api';
import { Store, StoreRequest } from '../types/store';

export const storeService = {
  /**
   * 내 매장 정보 조회
   */
  async getMyStore(): Promise<Store> {
    try {
      const response = await api.get<Store>('/stores/my');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || '매장 정보를 가져올 수 없습니다.');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('매장 정보 조회 중 오류가 발생했습니다.');
      }
    }
  },

  /**
   * 매장 정보 수정
   */
  async updateMyStore(storeData: StoreRequest): Promise<Store> {
    try {
      const response = await api.put<Store>('/stores/my', storeData);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || '매장 정보 수정에 실패했습니다.');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('매장 정보 수정 중 오류가 발생했습니다.');
      }
    }
  },

  /**
   * 매장 ID로 조회
   */
  async getStoreById(storeId: number): Promise<Store> {
    try {
      const response = await api.get<Store>(`/stores/${storeId}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || '매장 정보를 가져올 수 없습니다.');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('매장 정보 조회 중 오류가 발생했습니다.');
      }
    }
  },

  /**
   * 활성 매장 목록 조회 (시스템 관리자용)
   */
  async getActiveStores(): Promise<Store[]> {
    try {
      const response = await api.get<Store[]>('/stores/active');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || '매장 목록을 가져올 수 없습니다.');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('매장 목록 조회 중 오류가 발생했습니다.');
      }
    }
  }
}; 
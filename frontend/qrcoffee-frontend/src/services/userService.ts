import { api } from './api';
import { User } from '../types/auth';
import { SubAccountRequest } from '../types/user';

export const userService = {
  /**
   * 서브계정 목록 조회 (마스터 계정만)
   */
  async getSubAccounts(): Promise<User[]> {
    try {
      const response = await api.get<User[]>('/users/sub-accounts');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || '서브계정 목록을 가져올 수 없습니다.');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('서브계정 목록 조회 중 오류가 발생했습니다.');
      }
    }
  },

  /**
   * 서브계정 생성 (마스터 계정만)
   */
  async createSubAccount(subAccountData: SubAccountRequest): Promise<User> {
    try {
      const response = await api.post<User>('/users/sub-accounts', subAccountData);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || '서브계정 생성에 실패했습니다.');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('서브계정 생성 중 오류가 발생했습니다.');
      }
    }
  },

  /**
   * 사용자 상태 변경 (활성/비활성)
   */
  async toggleUserStatus(userId: number): Promise<User> {
    try {
      const response = await api.put<User>(`/users/${userId}/status`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || '사용자 상태 변경에 실패했습니다.');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('사용자 상태 변경 중 오류가 발생했습니다.');
      }
    }
  },

  /**
   * 매장별 사용자 목록 조회
   */
  async getUsersByStore(storeId: number): Promise<User[]> {
    try {
      const response = await api.get<User[]>(`/users/store/${storeId}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || '사용자 목록을 가져올 수 없습니다.');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('사용자 목록 조회 중 오류가 발생했습니다.');
      }
    }
  },

  /**
   * 사용자 ID로 조회
   */
  async getUserById(userId: number): Promise<User> {
    try {
      const response = await api.get<User>(`/users/${userId}`);
      
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
  }
}; 

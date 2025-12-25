// 확장된 사용자 관리 관련 타입 정의

import { User, SignupRequest } from './auth';

export interface SubAccountRequest extends Omit<SignupRequest, 'storeId'> {
  // storeId는 현재 사용자의 storeId를 자동으로 사용
}

export interface UserManagementContextType {
  users: User[];
  subAccounts: User[];
  isLoading: boolean;
  getSubAccounts: () => Promise<void>;
  createSubAccount: (data: SubAccountRequest) => Promise<void>;
  toggleUserStatus: (userId: number) => Promise<void>;
  getUsersByStore: (storeId: number) => Promise<void>;
  refreshUsers: () => Promise<void>;
}

export interface CreateSubAccountFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  phone?: string;
}

export interface UserTableRow {
  id: number;
  email: string;
  name: string;
  phone?: string;
  role: 'MASTER' | 'SUB';
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface UserStatusChangeRequest {
  userId: number;
  isActive: boolean;
} 

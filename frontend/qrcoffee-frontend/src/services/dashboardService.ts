import { api } from './api';
import { DashboardStats } from '../types/dashboard';

export const dashboardService = {
  /**
   * 전체 대시보드 통계 조회
   */
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/dashboard/stats');
    return response.data.data!;
  },

  /**
   * 기본 통계 조회
   */
  getBasicStats: async () => {
    const response = await api.get('/dashboard/stats/basic');
    return response.data.data;
  },

  /**
   * 매출 통계 조회
   */
  getSalesStats: async () => {
    const response = await api.get('/dashboard/stats/sales');
    return response.data.data;
  },

  /**
   * 주문 현황 조회
   */
  getOrderStats: async () => {
    const response = await api.get('/dashboard/stats/orders');
    return response.data.data;
  },

  /**
   * 인기 메뉴 조회
   */
  getPopularMenus: async (limit: number = 10) => {
    const response = await api.get('/dashboard/stats/popular-menus', { limit });
    return response.data.data;
  },

  /**
   * 시간대별 통계 조회
   */
  getHourlyStats: async () => {
    const response = await api.get('/dashboard/stats/hourly');
    return response.data.data;
  }
};

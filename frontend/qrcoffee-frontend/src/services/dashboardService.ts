import { menuService } from './menuService';
import { seatService } from './seatService';

export interface DashboardStats {
  totalMenus: number;
  activeMenus: number;
  totalSeats: number;
  activeSeats: number;
  todayOrders: number;
  todayRevenue: number;
  weeklyGrowth: number;
}

export const dashboardService = {
  // 대시보드 통계 조회
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      // 병렬로 데이터 가져오기
      const [allMenus, seatStats] = await Promise.all([
        menuService.getAllMenus(),
        seatService.getStats()
      ]);

      // 활성 메뉴 개수 계산
      const activeMenus = allMenus.filter(menu => menu.isAvailable).length;

      // 주문 및 매출 데이터 (현재는 임시값, 나중에 주문 시스템 구현시 실제 데이터 연동)
      const todayOrders = 0;
      const todayRevenue = 0;
      const weeklyGrowth = 0;

      return {
        totalMenus: allMenus.length,
        activeMenus,
        totalSeats: seatStats.totalSeats,
        activeSeats: seatStats.activeSeats,
        todayOrders,
        todayRevenue,
        weeklyGrowth
      };
    } catch (error) {
      console.error('대시보드 통계 조회 실패:', error);
      // 에러 발생 시 기본값 반환
      return {
        totalMenus: 0,
        activeMenus: 0,
        totalSeats: 0,
        activeSeats: 0,
        todayOrders: 0,
        todayRevenue: 0,
        weeklyGrowth: 0
      };
    }
  },

  // 인기 메뉴 데이터 (임시 - 주문 시스템 구현 후 실제 데이터로 교체)
  getPopularMenus: async () => {
    try {
      const allMenus = await menuService.getAllMenus();
      
      // 임시로 랜덤하게 인기 메뉴 생성 (실제로는 주문 통계 기반)
      const popularMenus = allMenus
        .slice(0, 5)
        .map((menu, index) => ({
          name: menu.name,
          주문수: Math.floor(Math.random() * 100) + 10
        }))
        .sort((a, b) => b.주문수 - a.주문수);

      return popularMenus;
    } catch (error) {
      console.error('인기 메뉴 조회 실패:', error);
      return [
        { name: '아메리카노', 주문수: 0 },
        { name: '카페라떼', 주문수: 0 },
        { name: '카푸치노', 주문수: 0 },
        { name: '바닐라라떼', 주문수: 0 },
        { name: '에스프레소', 주문수: 0 },
      ];
    }
  },

  // 최근 활동 데이터 (임시 - 실제 활동 로그 시스템 구현 후 교체)
  getRecentActivities: async () => {
    try {
      const seats = await seatService.getSeats();
      const menus = await menuService.getAllMenus();
      
      const activities = [];
      
      // 최근 좌석 활동
      if (seats.length > 0) {
        const recentSeat = seats[Math.floor(Math.random() * seats.length)];
        activities.push({
          time: '방금 전',
          action: `좌석 ${recentSeat.seatNumber} QR코드 활동`,
          type: 'info',
          icon: 'QrcodeOutlined'
        });
      }
      
      // 최근 메뉴 활동
      if (menus.length > 0) {
        const recentMenu = menus[Math.floor(Math.random() * menus.length)];
        activities.push({
          time: '10분 전',
          action: `메뉴 "${recentMenu.name}" 상태 변경`,
          type: 'success',
          icon: 'AppstoreOutlined'
        });
      }
      
      return activities;
    } catch (error) {
      console.error('최근 활동 조회 실패:', error);
      return [];
    }
  }
}; 
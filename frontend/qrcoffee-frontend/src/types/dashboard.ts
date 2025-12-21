// 대시보드 통계 관련 타입 정의

export interface BasicStats {
  todayOrderCount: number;
  pendingOrderCount: number;
  todaySalesAmount: number;
  totalOrderCount: number;
}

export interface DailySales {
  date: string;
  amount: number;
  orderCount: number;
}

export interface SalesStats {
  todaySales: number;
  weekSales: number;
  monthSales: number;
  dailySales: DailySales[];
}

export interface OrderStats {
  pendingCount: number;
  preparingCount: number;
  completedCount: number;
  pickedUpCount: number;
  cancelledCount: number;
}

export interface PopularMenu {
  menuId: number;
  menuName: string;
  orderCount: number;
  totalQuantity: number;
  totalRevenue: number;
}

export interface HourlyStats {
  hour: number;
  orderCount: number;
  salesAmount: number;
}

export interface DashboardStats {
  basicStats: BasicStats;
  salesStats: SalesStats;
  orderStats: OrderStats;
  popularMenus: PopularMenu[];
  hourlyStats: HourlyStats[];
}

export interface Seat {
  id: number;
  storeId: number;
  seatNumber: string;
  description?: string;
  qrCode: string;
  isActive: boolean;
  isOccupied: boolean;
  maxCapacity: number;
  createdAt: string;
  updatedAt: string;
}

export interface SeatRequest {
  seatNumber: string;
  description?: string;
  maxCapacity: number;
}

export interface SeatStats {
  totalSeats: number;
  activeSeats: number;
  occupiedSeats: number;
  availableSeats: number;
}

export interface SeatManagementContextType {
  seats: Seat[];
  stats: SeatStats | null;
  loading: boolean;
  error: string | null;
  fetchSeats: () => Promise<void>;
  fetchStats: () => Promise<void>;
  createSeat: (seatData: SeatRequest) => Promise<void>;
  updateSeat: (id: number, seatData: SeatRequest) => Promise<void>;
  toggleSeatStatus: (id: number) => Promise<void>;
  toggleOccupancy: (id: number) => Promise<void>;
  regenerateQRCode: (id: number) => Promise<void>;
  deleteSeat: (id: number) => Promise<void>;
} 

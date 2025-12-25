/**
 * 공통 상수 정의
 */

// API 관련 상수
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// 에러 메시지
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: '필수 정보를 모두 입력해주세요.',
  NETWORK_ERROR: '네트워크 오류가 발생했습니다.',
  SERVER_ERROR: '서버 오류가 발생했습니다.',
  UNAUTHORIZED: '인증이 필요합니다.',
  FORBIDDEN: '접근 권한이 없습니다.',
  NOT_FOUND: '요청한 데이터를 찾을 수 없습니다.',
} as const;

// 성공 메시지
export const SUCCESS_MESSAGES = {
  CREATED: '성공적으로 생성되었습니다.',
  UPDATED: '성공적으로 수정되었습니다.',
  DELETED: '성공적으로 삭제되었습니다.',
  SAVED: '성공적으로 저장되었습니다.',
} as const;

// 결제 관련 에러 코드
export const PAYMENT_ERROR_CODES = {
  PAY_PROCESS_CANCELED: '결제가 취소되었습니다.',
  USER_CANCEL: '결제가 취소되었습니다.',
  PAY_PROCESS_ABORTED: '결제가 중단되었습니다.',
  REJECT_CARD_COMPANY: '유효하지 않은 카드 정보입니다.',
  INVALID_CARD: '유효하지 않은 카드 정보입니다.',
  INSUFFICIENT_FUNDS: '잔액이 부족합니다.',
  DEFAULT: '결제에 실패했습니다. 다시 시도해주세요.',
} as const;

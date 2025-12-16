import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PaymentFailPage from '../PaymentFailPage';

// 모킹
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useSearchParams: () => [
    new URLSearchParams('?errorCode=USER_CANCEL&errorMessage=결제가 취소되었습니다.'),
    jest.fn()
  ],
  useNavigate: () => jest.fn()
}));

describe('PaymentFailPage', () => {
  it('에러 메시지 표시', () => {
    // When
    render(
      <BrowserRouter>
        <PaymentFailPage />
      </BrowserRouter>
    );

    // Then
    expect(screen.getByText('결제 실패')).toBeInTheDocument();
    expect(screen.getByText('결제가 취소되었습니다.')).toBeInTheDocument();
    expect(screen.getByText(/에러 코드: USER_CANCEL/i)).toBeInTheDocument();
  });

  it('errorCode에 따른 적절한 에러 메시지 표시', () => {
    // Given - USER_CANCEL
    jest.doMock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useSearchParams: () => [
        new URLSearchParams('?errorCode=USER_CANCEL'),
        jest.fn()
      ],
      useNavigate: () => jest.fn()
    }));

    // When
    render(
      <BrowserRouter>
        <PaymentFailPage />
      </BrowserRouter>
    );

    // Then
    expect(screen.getByText(/결제가 취소되었습니다/i)).toBeInTheDocument();
  });

  it('errorCode가 INVALID_CARD일 때 적절한 메시지 표시', () => {
    // Given
    jest.doMock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useSearchParams: () => [
        new URLSearchParams('?errorCode=INVALID_CARD'),
        jest.fn()
      ],
      useNavigate: () => jest.fn()
    }));

    // When
    render(
      <BrowserRouter>
        <PaymentFailPage />
      </BrowserRouter>
    );

    // Then
    expect(screen.getByText(/유효하지 않은 카드 정보입니다/i)).toBeInTheDocument();
  });

  it('errorCode가 없을 때 기본 메시지 표시', () => {
    // Given
    jest.doMock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useSearchParams: () => [new URLSearchParams(), jest.fn()],
      useNavigate: () => jest.fn()
    }));

    // When
    render(
      <BrowserRouter>
        <PaymentFailPage />
      </BrowserRouter>
    );

    // Then
    expect(screen.getByText(/결제에 실패했습니다/i)).toBeInTheDocument();
  });

  it('돌아가기 및 홈으로 버튼 표시', () => {
    // When
    render(
      <BrowserRouter>
        <PaymentFailPage />
      </BrowserRouter>
    );

    // Then
    expect(screen.getByText('돌아가기')).toBeInTheDocument();
    expect(screen.getByText('홈으로')).toBeInTheDocument();
  });
});


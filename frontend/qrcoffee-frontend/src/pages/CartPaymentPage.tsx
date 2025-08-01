import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Button, 
  Typography, 
  Spin, 
  Alert, 
  Result, 
  notification
} from 'antd';
import { 
  ArrowLeftOutlined,
  CreditCardOutlined
} from '@ant-design/icons';
import { paymentService } from '../services/paymentService';
import { CartPaymentRequest } from '../types/payment';

const { Title, Text } = Typography;

// v1 SDK 타입 정의
declare global {
  interface Window {
    TossPayments: any;
  }
}

const CartPaymentPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [cartData, setCartData] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializePayment = async () => {
      const cartPaymentData = sessionStorage.getItem('cartPaymentData');
      if (!cartPaymentData) {
        setError('장바구니 정보가 없습니다.');
        setLoading(false);
        return;
      }

      try {
        const data = JSON.parse(cartPaymentData);
        setCartData(data);
        
        // 결제 설정 로드
        await loadPaymentConfig();
      } catch (error) {
        setError('장바구니 정보를 불러올 수 없습니다.');
        setLoading(false);
      }
    };

    initializePayment();
  }, []);

  const loadPaymentConfig = async () => {
    try {
      const configResponse = await paymentService.getConfig();
      setConfig(configResponse);
      
      // v1 SDK 로드
      await loadTossPaymentsV1SDK();
      
    } catch (error: any) {
      console.error('결제 설정 로드 실패:', error);
      setError('결제 시스템을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadTossPaymentsV1SDK = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.TossPayments) {
        console.log('토스페이먼츠 v1 SDK 이미 로드됨');
        resolve();
        return;
      }

      console.log('토스페이먼츠 v1 SDK 스크립트 추가 중...');
      const script = document.createElement('script');
      script.src = 'https://js.tosspayments.com/v1/payment';
      script.onload = () => {
        console.log('토스페이먼츠 v1 SDK 스크립트 로드 완료');
        if (window.TossPayments) {
          console.log('window.TossPayments 사용 가능:', typeof window.TossPayments);
          resolve();
        } else {
          console.error('토스페이먼츠 v1 SDK 로드되었지만 window.TossPayments가 없음');
          reject(new Error('토스페이먼츠 v1 SDK 초기화 실패'));
        }
      };
      script.onerror = (err) => {
        console.error('토스페이먼츠 v1 SDK 스크립트 로드 실패:', err);
        reject(new Error('토스페이먼츠 v1 SDK 로드 실패'));
      };
      document.head.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!cartData || !config) {
      notification.error({
        message: '결제 오류',
        description: '결제 정보가 준비되지 않았습니다.'
      });
      return;
    }

    try {
      setPaying(true);

      // 장바구니 결제 준비
      const cartPaymentRequest: CartPaymentRequest = {
        storeId: cartData.storeId,
        seatId: cartData.seatId,
        orderItems: cartData.orderItems,
        totalAmount: cartData.totalAmount,
        orderName: cartData.orderName,
        customerRequest: cartData.customerRequest,
        customerName: '고객',
        successUrl: cartData.successUrl,
        failUrl: cartData.failUrl
      };

      console.log('장바구니 결제 준비 중...', cartPaymentRequest);
      const preparedPayment = await paymentService.prepareCartPayment(cartPaymentRequest);
      console.log('결제 준비 완료:', preparedPayment);

      // v1 토스페이먼츠 SDK로 결제창 띄우기
      const tossPayments = window.TossPayments(config.clientKey);
      
      console.log('v1 결제창 띄우기 시작...');
      await tossPayments.requestPayment('카드', {
        amount: cartData.totalAmount,
        orderId: preparedPayment.orderIdToss,
        orderName: cartData.orderName,
        customerName: '고객',
        customerEmail: cartPaymentRequest.customerEmail || 'customer@example.com',
        successUrl: cartData.successUrl,
        failUrl: cartData.failUrl,
      });

    } catch (error: any) {
      console.error('결제 요청 실패:', error);
      
      let errorMessage = '결제 요청 중 오류가 발생했습니다.';
      
      if (error.code === 'USER_CANCEL') {
        errorMessage = '결제가 취소되었습니다.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      notification.error({
        message: '결제 요청 실패',
        description: errorMessage
      });
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)'
      }}>
        <Card style={{ textAlign: 'center', minWidth: 300 }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text>결제 시스템을 준비하는 중...</Text>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%)',
        padding: '20px'
      }}>
        <Result
          status="error"
          title="오류 발생"
          subTitle={error}
          extra={[
            <Button key="back" type="primary" onClick={() => navigate(-1)}>
              뒤로 가기
            </Button>
          ]}
        />
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        {/* 헤더 */}
        <div style={{ marginBottom: 24 }}>
          <Button 
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            style={{ marginBottom: 16 }}
          >
            뒤로 가기
          </Button>
          
          <Title level={2} style={{ color: 'white', textAlign: 'center', margin: 0 }}>
            <CreditCardOutlined /> 결제하기
          </Title>
        </div>

        {/* 주문 정보 */}
        {cartData && (
          <Card style={{ marginBottom: 24 }}>
            <Title level={4}>주문 정보</Title>
            <div style={{ marginBottom: 16 }}>
              <Text strong>주문 상품:</Text>
               {cartData.orderItems?.map((item: any, index: number) => (
                 <div key={index} style={{ marginLeft: 16, marginTop: 8 }}>
                   <Text>메뉴 ID: {item.menuId} x {item.quantity}</Text>
                 </div>
               ))}
            </div>
            <div style={{ 
              borderTop: '1px solid #f0f0f0', 
              paddingTop: 16, 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Text strong style={{ fontSize: 18 }}>총 결제금액</Text>
              <Text strong style={{ fontSize: 20, color: '#1890ff' }}>
                {cartData.totalAmount?.toLocaleString()}원
              </Text>
            </div>
          </Card>
        )}

        {/* v1 결제창 안내 */}
        <Card style={{ marginBottom: 24, textAlign: 'center' }}>
          <Title level={4}>
            <CreditCardOutlined style={{ color: '#1890ff', marginRight: 8 }} />
            토스페이먼츠 결제창
          </Title>
          <Text>
            "결제하기" 버튼을 클릭하면 토스페이먼츠 결제창이 열립니다.<br/>
            카드, 계좌이체, 가상계좌 등 다양한 결제수단을 사용할 수 있습니다.
          </Text>
        </Card>

        {/* 결제하기 버튼 */}
        <Button
          type="primary"
          size="large"
          block
          loading={paying}
          disabled={paying}
          onClick={handlePayment}
          style={{
            height: 56,
            fontSize: 18,
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #1890ff, #36cfc9)',
            border: 'none',
            boxShadow: '0 4px 15px rgba(24, 144, 255, 0.4)'
          }}
        >
          {paying ? '결제창 열기 중...' : `${cartData?.totalAmount?.toLocaleString()}원 결제하기`}
        </Button>

        {/* 결제 안내 */}
        <Card style={{ marginTop: 16 }}>
          <Alert
            message="결제 안내"
            description={
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>안전한 결제를 위해 토스페이먼츠를 사용합니다</li>
                <li>결제 완료 후 주문이 자동으로 접수됩니다</li>
                <li>결제 관련 문의는 매장으로 연락해주세요</li>
                <li>테스트 환경에서는 실제 결제가 이루어지지 않습니다</li>
              </ul>
            }
            type="info"
            showIcon
          />
        </Card>
      </div>
    </div>
  );
};

export default CartPaymentPage; 
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Button, 
  Typography, 
  Spin, 
  Alert, 
  Result, 
  Space,
  notification
} from 'antd';
import { 
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CreditCardOutlined
} from '@ant-design/icons';
import { paymentService } from '../services/paymentService';
import { customerOrderService } from '../services/orderService';
import { PaymentConfig, PaymentResponse } from '../types/payment';
import { Order } from '../types/order';

const { Title, Text } = Typography;

declare global {
  interface Window {
    TossPayments: any;
  }
}

const PaymentPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<Order | null>(null);
  const [payment, setPayment] = useState<PaymentResponse | null>(null);
  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [widgets, setWidgets] = useState<any>(null);
  const [paymentMethodWidget, setPaymentMethodWidget] = useState<any>(null);
  const [agreementWidget, setAgreementWidget] = useState<any>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // 고유한 customerKey 생성 (실제로는 로그인된 사용자 기반으로 생성해야 함)
  const customerKey = useRef(`GUEST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (!orderId) {
      setError('주문 ID가 없습니다.');
      setLoading(false);
      return;
    }

    loadData();
  }, [orderId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // 병렬로 데이터 로드
      const [orderResponse, configResponse] = await Promise.all([
        customerOrderService.getOrder(Number(orderId)),
        paymentService.getConfig()
      ]);

      setOrder(orderResponse);
      setConfig(configResponse);

      // 이미 결제된 주문인지 확인
      try {
        const paymentResponse = await paymentService.getPaymentByOrderId(Number(orderId));
        setPayment(paymentResponse);
        
        if (paymentResponse.status === 'DONE') {
          // 이미 결제 완료된 경우
          return;
        }
      } catch (error) {
        // 결제 정보가 없는 경우 (정상)
        console.log('결제 정보 없음 - 새로운 결제 진행');
      }

      // 토스페이먼츠 v2 SDK 로드 및 위젯 초기화
      if (configResponse.clientKey && orderResponse) {
        await initializeTossPayments(configResponse.clientKey, orderResponse);
      }

    } catch (error: any) {
      console.error('데이터 로드 실패:', error);
      setError(error.message || '데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const initializeTossPayments = async (clientKey: string, orderData: Order) => {
    try {
      // v2 SDK 로드
      await loadTossPaymentsSDK();
      
      if (!window.TossPayments) {
        throw new Error('토스페이먼츠 SDK 로드 실패');
      }

      // 토스페이먼츠 초기화
      const tossPayments = window.TossPayments(clientKey);
      
      // 위젯 초기화 (customerKey 포함)
      const widgetsInstance = tossPayments.widgets({
        customerKey: customerKey.current
      });

      // 결제 금액 설정
      await widgetsInstance.setAmount({
        currency: 'KRW',
        value: orderData.totalAmount
      });

      setWidgets(widgetsInstance);

      // 결제 UI 및 약관 UI 렌더링
      await renderPaymentUI(widgetsInstance);

    } catch (error: any) {
      console.error('토스페이먼츠 초기화 실패:', error);
      setError('결제 시스템 초기화에 실패했습니다.');
    }
  };

  const loadTossPaymentsSDK = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.TossPayments) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://js.tosspayments.com/v2/standard';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('토스페이먼츠 SDK 로드 실패'));
      document.head.appendChild(script);
    });
  };

  const renderPaymentUI = async (widgetsInstance: any) => {
    try {
      // 기존 위젯이 있으면 제거
      if (paymentMethodWidget) {
        await paymentMethodWidget.destroy();
      }
      if (agreementWidget) {
        await agreementWidget.destroy();
      }

      // 결제 UI 렌더링
      const paymentWidget = await widgetsInstance.renderPaymentMethods({
        selector: '#payment-method',
        variantKey: 'DEFAULT'
      });

      // 약관 UI 렌더링
      const agreementWidgetInstance = await widgetsInstance.renderAgreement({
        selector: '#agreement',
        variantKey: 'AGREEMENT'
      });

      // 약관 상태 변경 이벤트 구독
      agreementWidgetInstance.on('agreementStatusChange', (agreementStatus: any) => {
        setAgreedToTerms(agreementStatus.agreedRequiredTerms);
      });

      setPaymentMethodWidget(paymentWidget);
      setAgreementWidget(agreementWidgetInstance);

    } catch (error: any) {
      console.error('결제 UI 렌더링 실패:', error);
      setError('결제 UI를 불러오는데 실패했습니다.');
    }
  };

  const handlePayment = async () => {
    if (!order || !widgets || !agreedToTerms) {
      if (!agreedToTerms) {
        notification.warning({
          message: '이용약관 동의 필요',
          description: '결제를 진행하려면 이용약관에 동의해주세요.'
        });
      }
      return;
    }

    try {
      setPaying(true);

      // 결제 준비
      const paymentRequest = {
        orderId: order.id,
        amount: order.totalAmount,
        orderName: `${order.orderItems?.[0]?.menuName || '커피'}${order.orderItems && order.orderItems.length > 1 ? ` 외 ${order.orderItems.length - 1}건` : ''}`,
        customerName: '고객',
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`
      };

      const preparedPayment = await paymentService.preparePayment(paymentRequest);

      // 토스페이먼츠 결제 요청 (Redirect 방식)
      await widgets.requestPayment({
        orderId: preparedPayment.orderIdToss,
        orderName: paymentRequest.orderName,
        customerName: paymentRequest.customerName,
        successUrl: paymentRequest.successUrl,
        failUrl: paymentRequest.failUrl,
      });

    } catch (error: any) {
      console.error('결제 요청 실패:', error);
      notification.error({
        message: '결제 요청 실패',
        description: error.message || '결제 요청 중 오류가 발생했습니다.'
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Card style={{ textAlign: 'center', minWidth: 300 }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text>결제 정보를 불러오는 중...</Text>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px'
      }}>
        <Result
          status="error"
          title="오류 발생"
          subTitle={error}
          extra={[
            <Button key="back" onClick={() => navigate(-1)}>
              뒤로 가기
            </Button>
          ]}
        />
      </div>
    );
  }

  // 이미 결제 완료된 경우
  if (payment && payment.status === 'DONE') {
    return (
      <div style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
        padding: '20px'
      }}>
        <Result
          status="success"
          title="이미 결제 완료"
          subTitle="이 주문은 이미 결제가 완료되었습니다."
          extra={[
            <Button 
              key="home" 
              type="primary" 
              onClick={() => navigate('/customer/order')}
            >
              새로운 주문하기
            </Button>
          ]}
        />
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        {/* 헤더 */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: 24,
          color: 'white'
        }}>
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(-1)}
            style={{ color: 'white', marginRight: 16 }}
          />
          <Title level={3} style={{ color: 'white', margin: 0 }}>
            <CreditCardOutlined style={{ marginRight: 8 }} />
            결제하기
          </Title>
        </div>

        {/* 주문 정보 카드 */}
        {order && (
          <Card style={{ marginBottom: 24 }}>
            <Title level={4}>주문 정보</Title>
            <div style={{ marginBottom: 16 }}>
              <Text strong>주문번호: </Text>
              <Text>{order.id}</Text>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>매장 ID: </Text>
              <Text>{order.storeId}</Text>
            </div>
            <div style={{ marginBottom: 16 }}>
                             <Text strong>주문 상품:</Text>
               {order.orderItems?.map((item, index) => (
                 <div key={index} style={{ marginLeft: 16, marginTop: 8 }}>
                   <Text>{item.menuName} x {item.quantity}</Text>
                   <Text style={{ float: 'right' }}>
                     {item.totalPrice?.toLocaleString()}원
                   </Text>
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
                {order.totalAmount?.toLocaleString()}원
              </Text>
            </div>
          </Card>
        )}

        {/* 결제 수단 선택 */}
        <Card style={{ marginBottom: 24 }}>
          <Title level={4}>결제 수단</Title>
          <div id="payment-method" style={{ minHeight: 200 }}></div>
        </Card>

        {/* 이용약관 */}
        <Card style={{ marginBottom: 24 }}>
          <Title level={4}>이용약관</Title>
          <div id="agreement"></div>
        </Card>

        {/* 결제하기 버튼 */}
        <Button
          type="primary"
          size="large"
          block
          loading={paying}
          disabled={!agreedToTerms || paying}
          onClick={handlePayment}
          style={{
            height: 56,
            fontSize: 18,
            fontWeight: 'bold',
            background: agreedToTerms 
              ? 'linear-gradient(45deg, #1890ff, #36cfc9)' 
              : undefined,
            border: 'none',
            boxShadow: agreedToTerms 
              ? '0 4px 15px rgba(24, 144, 255, 0.4)' 
              : undefined
          }}
        >
          {paying ? '결제 처리 중...' : `${order?.totalAmount?.toLocaleString()}원 결제하기`}
        </Button>

        {/* 결제 안내 */}
        <Card style={{ marginTop: 16 }}>
          <Alert
            message="결제 안내"
            description={
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>안전한 결제를 위해 토스페이먼츠를 사용합니다</li>
                <li>결제 완료 후 주문이 접수됩니다</li>
                <li>결제 관련 문의는 매장으로 연락해주세요</li>
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

export default PaymentPage; 
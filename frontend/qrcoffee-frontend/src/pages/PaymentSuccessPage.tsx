import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Result, 
  Button, 
  Card, 
  Typography, 
  Spin, 
  Alert,
  Row,
  Col,
  Divider,
  Space
} from 'antd';
import { 
  CheckCircleOutlined,
  ShoppingCartOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { paymentService } from '../services/paymentService';
import { customerOrderService } from '../services/orderService';
import { PaymentResponse } from '../types/payment';
import { Order } from '../types/order';

const { Title, Text } = Typography;

const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const paymentKey = searchParams.get('paymentKey');
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');
  
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<PaymentResponse | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!paymentKey || !orderId || !amount) {
      setError('결제 정보가 누락되었습니다.');
      setLoading(false);
      return;
    }

    confirmPayment();
  }, [paymentKey, orderId, amount]);

  const confirmPayment = async () => {
    try {
      setLoading(true);
      
      // 결제 승인 처리
      const paymentResponse = await paymentService.confirmPayment(
        paymentKey!,
        orderId!,
        Number(amount!)
      );
      
      setPayment(paymentResponse);
      
      // 주문 정보 조회
      const orderResponse = await customerOrderService.getOrder(paymentResponse.orderId);
      setOrder(orderResponse);
      
    } catch (error: any) {
      console.error('결제 승인 실패:', error);
      setError(error.message || '결제 승인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)'
      }}>
        <Card style={{ textAlign: 'center', minWidth: 300 }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text style={{ color: '#52c41a' }}>결제를 처리하는 중...</Text>
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
          title="결제 승인 실패"
          subTitle={error}
          extra={[
            <Button key="back" type="primary" onClick={() => navigate('/')}>
              홈으로 돌아가기
            </Button>
          ]}
        />
      </div>
    );
  }

  const getPaymentMethodText = (method?: string) => {
    const methodMap: Record<string, string> = {
      'CARD': '신용카드',
      'VIRTUAL_ACCOUNT': '가상계좌',
      'SIMPLE_PAYMENT': '간편결제',
      'MOBILE_PHONE': '휴대폰',
      'ACCOUNT_TRANSFER': '계좌이체',
      'CULTURE_GIFT_CERTIFICATE': '문화상품권'
    };
    return methodMap[method || ''] || method || '알 수 없음';
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        
        {/* 성공 메시지 */}
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <CheckCircleOutlined 
            style={{ 
              fontSize: 80, 
              color: 'white',
              marginBottom: 20
            }} 
          />
          <Title level={1} style={{ color: 'white', marginBottom: 8 }}>
            결제 완료!
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16 }}>
            주문이 성공적으로 접수되었습니다
          </Text>
        </div>

        {/* 결제 정보 카드 */}
        <Card style={{ marginBottom: 20 }}>
          <Title level={4}>결제 정보</Title>
          
          <Row justify="space-between" style={{ marginBottom: 12 }}>
            <Col>
              <Text type="secondary">주문번호</Text>
            </Col>
            <Col>
              <Text strong>{order?.orderNumber}</Text>
            </Col>
          </Row>
          
          <Row justify="space-between" style={{ marginBottom: 12 }}>
            <Col>
              <Text type="secondary">결제 금액</Text>
            </Col>
            <Col>
              <Text strong style={{ color: '#52c41a', fontSize: 16 }}>
                {payment?.amount.toLocaleString()}원
              </Text>
            </Col>
          </Row>
          
          <Row justify="space-between" style={{ marginBottom: 12 }}>
            <Col>
              <Text type="secondary">결제 수단</Text>
            </Col>
            <Col>
              <Text>{getPaymentMethodText(payment?.method)}</Text>
            </Col>
          </Row>
          
          <Row justify="space-between" style={{ marginBottom: 12 }}>
            <Col>
              <Text type="secondary">결제 시간</Text>
            </Col>
            <Col>
              <Text>
                {payment?.approvedAt ? 
                  new Date(payment.approvedAt).toLocaleString('ko-KR') : 
                  '처리 중'
                }
              </Text>
            </Col>
          </Row>

          {payment?.receiptUrl && (
            <>
              <Divider />
              <Button 
                type="link" 
                href={payment.receiptUrl}
                target="_blank"
                block
              >
                영수증 보기
              </Button>
            </>
          )}
        </Card>

        {/* 주문 상품 정보 */}
        <Card style={{ marginBottom: 20 }}>
          <Title level={4}>주문 상품</Title>
          {order?.orderItems?.map((item, index) => (
            <Row key={index} justify="space-between" style={{ marginBottom: 8 }}>
              <Col span={16}>
                <Text>{item.menuName}</Text>
                <Text type="secondary"> x{item.quantity}</Text>
              </Col>
              <Col span={8} style={{ textAlign: 'right' }}>
                <Text>{item.totalPrice.toLocaleString()}원</Text>
              </Col>
            </Row>
          ))}
          
          {order?.customerRequest && (
            <>
              <Divider />
              <div>
                <Text type="secondary">요청사항: </Text>
                <Text>{order.customerRequest}</Text>
              </div>
            </>
          )}
        </Card>

        {/* 안내 메시지 */}
        <Alert
          message="주문이 접수되었습니다"
          description="매장에서 음료를 준비 중입니다. 아래 버튼을 통해 주문 상태를 확인하실 수 있습니다."
          type="success"
          showIcon
          style={{ marginBottom: 20 }}
        />

        {/* 액션 버튼들 */}
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Button 
            type="primary" 
            size="large" 
            block
            icon={<EyeOutlined />}
            onClick={() => window.open(`/order-status?orderNumber=${order?.orderNumber}`, '_blank')}
          >
            주문 상태 확인하기
          </Button>
          
          <Button 
            size="large" 
            block
            icon={<ShoppingCartOutlined />}
            onClick={() => navigate('/')}
          >
            추가 주문하기
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default PaymentSuccessPage; 
import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Result, 
  Button, 
  Card, 
  Typography, 
  Alert,
  Space
} from 'antd';
import { 
  CloseCircleOutlined,
  ArrowLeftOutlined,
  ReloadOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const PaymentFailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const code = searchParams.get('code');
  const message = searchParams.get('message');
  const orderId = searchParams.get('orderId');

  const getErrorMessage = (code?: string, message?: string) => {
    const errorMap: Record<string, string> = {
      'PAY_PROCESS_CANCELED': '사용자가 결제를 취소했습니다.',
      'PAY_PROCESS_ABORTED': '결제 진행 중 오류가 발생했습니다.',
      'REJECT_CARD_COMPANY': '카드사에서 결제를 승인하지 않았습니다.',
      'INSUFFICIENT_FUNDS': '잔액이 부족합니다.',
      'INVALID_CARD_EXPIRATION': '카드 유효기간을 확인해주세요.',
      'INVALID_STOPPED_CARD': '정지된 카드입니다.',
      'INVALID_UNKNOWN_CARD': '알 수 없는 카드입니다.',
      'NOT_SUPPORTED_CARD': '지원하지 않는 카드입니다.',
      'INVALID_PASSWORD': '비밀번호가 틀렸습니다.',
      'EXCEED_MAX_DAILY_PAYMENT_COUNT': '일일 결제 한도를 초과했습니다.',
      'EXCEED_MAX_DAILY_PAYMENT_AMOUNT': '일일 결제 금액을 초과했습니다.',
      'CANCELED_PAYMENT': '이미 취소된 결제입니다.'
    };
    
    return errorMap[code || ''] || message || '알 수 없는 오류가 발생했습니다.';
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        
        {/* 실패 메시지 */}
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <CloseCircleOutlined 
            style={{ 
              fontSize: 80, 
              color: 'white',
              marginBottom: 20
            }} 
          />
          <Title level={1} style={{ color: 'white', marginBottom: 8 }}>
            결제 실패
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16 }}>
            결제 처리 중 문제가 발생했습니다
          </Text>
        </div>

        {/* 오류 정보 카드 */}
        <Card style={{ marginBottom: 20 }}>
          <Alert
            message="결제가 완료되지 않았습니다"
            description={getErrorMessage(code || undefined, message || undefined)}
            type="error"
            showIcon
            style={{ marginBottom: 20 }}
          />
          
          {code && (
            <div style={{ marginBottom: 12 }}>
              <Text type="secondary">오류 코드: </Text>
              <Text code>{code}</Text>
            </div>
          )}
          
          {orderId && (
            <div style={{ marginBottom: 12 }}>
              <Text type="secondary">주문 ID: </Text>
              <Text>{orderId}</Text>
            </div>
          )}
        </Card>

        {/* 해결 방법 안내 */}
        <Card style={{ marginBottom: 20 }}>
          <Title level={4}>해결 방법</Title>
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            <li style={{ marginBottom: 8 }}>
              <Text>카드 정보를 다시 확인해주세요</Text>
            </li>
            <li style={{ marginBottom: 8 }}>
              <Text>잔액이 충분한지 확인해주세요</Text>
            </li>
            <li style={{ marginBottom: 8 }}>
              <Text>다른 결제 수단을 이용해보세요</Text>
            </li>
            <li style={{ marginBottom: 8 }}>
              <Text>문제가 지속되면 카드사에 문의해주세요</Text>
            </li>
          </ul>
        </Card>

        {/* 액션 버튼들 */}
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Button 
            type="primary" 
            size="large" 
            block
            icon={<ReloadOutlined />}
            onClick={() => {
              if (orderId) {
                navigate(`/payment?orderId=${orderId}`);
              } else {
                navigate(-1);
              }
            }}
          >
            다시 결제하기
          </Button>
          
          <Button 
            size="large" 
            block
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
          >
            이전 페이지로
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default PaymentFailPage; 
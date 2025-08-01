import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Space,
  Alert,
  Row,
  Col,
  Divider,
  theme
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  CoffeeOutlined,
  LoginOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { LoginRequest } from '../types/auth';

const { Title, Text, Paragraph } = Typography;

const NewLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuth();
  const { token } = theme.useToken();

  const [error, setError] = useState<string>('');
  const [form] = Form.useForm();

  // 로그인 성공 후 이동할 경로 (이전 경로 또는 기본 경로)
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (values: LoginRequest) => {
    try {
      setError('');
      await login(values);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || '로그인에 실패했습니다.');
    }
  };

  const handleInputChange = () => {
    if (error) setError('');
  };

  return (
    <div 
      style={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${token.colorPrimary} 0%, #1677ff 25%, #69c0ff  50%, #91caff  75%, #bae0ff 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <Row gutter={[48, 48]} style={{ width: '100%', maxWidth: 1200 }} align="middle">
        {/* 좌측 브랜드 영역 */}
        <Col xs={0} lg={12}>
          <div style={{ textAlign: 'center', color: 'white' }}>
            <div style={{ fontSize: 120, marginBottom: 24 }}>
              ☕
            </div>
            <Title level={1} style={{ color: 'white', marginBottom: 16 }}>
              QR Coffee
            </Title>
            <Title level={3} style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 'normal' }}>
              스마트한 매장 관리 시스템
            </Title>
            <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, marginTop: 24 }}>
              QR코드로 간편한 주문, 효율적인 매장 운영을 경험해보세요
            </Paragraph>
            
            {/* 특징 */}
            <div style={{ marginTop: 48, textAlign: 'left' }}>
              <Space direction="vertical" size="large">
                <div style={{ color: 'rgba(255,255,255,0.9)' }}>
                  ✨ 간편한 QR코드 주문 시스템
                </div>
                <div style={{ color: 'rgba(255,255,255,0.9)' }}>
                  📊 실시간 매장 관리 대시보드
                </div>
                <div style={{ color: 'rgba(255,255,255,0.9)' }}>
                  💳 안전한 온라인 결제 시스템
                </div>
                <div style={{ color: 'rgba(255,255,255,0.9)' }}>
                  📱 모바일 최적화된 고객 인터페이스
                </div>
              </Space>
            </div>
          </div>
        </Col>

        {/* 우측 로그인 폼 */}
        <Col xs={24} lg={12}>
          <Card
            style={{
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              borderRadius: 16,
              border: 'none'
            }}
            bodyStyle={{ padding: 48 }}
          >
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <CoffeeOutlined style={{ fontSize: 48, color: token.colorPrimary, marginBottom: 16 }} />
              <Title level={2} style={{ marginBottom: 8 }}>
                관리자 로그인
              </Title>
              <Text type="secondary">
                QR Coffee 관리자 계정으로 로그인하세요
              </Text>
            </div>

            {error && (
              <Alert
                message={error}
                type="error"
                showIcon
                style={{ marginBottom: 24 }}
                closable
                onClose={() => setError('')}
              />
            )}

            <Form
              form={form}
              name="login"
              size="large"
              onFinish={handleSubmit}
              layout="vertical"
              requiredMark={false}
            >
              <Form.Item
                name="email"
                label="이메일"
                rules={[
                  { required: true, message: '이메일을 입력해주세요' },
                  { type: 'email', message: '올바른 이메일 형식을 입력해주세요' }
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="이메일을 입력하세요"
                  onChange={handleInputChange}
                  style={{ height: 48 }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="비밀번호"
                rules={[
                  { required: true, message: '비밀번호를 입력해주세요' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="비밀번호를 입력하세요"
                  onChange={handleInputChange}
                  style={{ height: 48 }}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 16 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isLoading}
                  block
                  icon={<LoginOutlined />}
                  style={{ 
                    height: 48,
                    fontSize: 16,
                    fontWeight: 'bold'
                  }}
                >
                  로그인
                </Button>
              </Form.Item>

              <Divider style={{ margin: '24px 0' }}>또는</Divider>

              <div style={{ textAlign: 'center' }}>
                <Text>
                  아직 계정이 없으신가요?{' '}
                  <Link 
                    to="/signup" 
                    style={{ 
                      color: token.colorPrimary,
                      fontWeight: 'bold',
                      textDecoration: 'none'
                    }}
                  >
                    회원가입하기
                  </Link>
                </Text>
              </div>
            </Form>

            {/* 데모 계정 정보 */}
            <Card 
              size="small" 
              style={{ 
                marginTop: 24, 
                background: '#f8f9fa',
                border: '1px dashed #d9d9d9'
              }}
            >
              <Text type="secondary" style={{ fontSize: 12 }}>
                <strong>개발용 데모 계정:</strong><br />
                이메일: admin@qrcoffee.com<br />
                비밀번호: admin123
              </Text>
            </Card>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default NewLoginPage; 
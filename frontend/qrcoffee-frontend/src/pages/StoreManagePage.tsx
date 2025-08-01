import React, { useState, useEffect } from 'react';
import {
  Card,
  Alert,
  Spin,
  Breadcrumb,
  Typography,
  Row,
  Col,
  Divider,
  Result
} from 'antd';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { HomeOutlined, ShopOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { storeService } from '../services/storeService';
import { Store, StoreRequest } from '../types/store';
import StoreInfoForm from '../components/StoreInfoForm';

const { Title, Paragraph } = Typography;

const StoreManagePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [store, setStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // 마스터 계정만 접근 가능
    if (user && user.role !== 'MASTER') {
      navigate('/dashboard');
      return;
    }

    loadStoreData();
  }, [user, navigate]);

  const loadStoreData = async () => {
    try {
      setIsLoading(true);
      setError('');
      const storeData = await storeService.getMyStore();
      setStore(storeData);
    } catch (err: any) {
      setError(err.message || '매장 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStoreUpdate = async (storeData: StoreRequest) => {
    try {
      setIsSaving(true);
      const updatedStore = await storeService.updateMyStore(storeData);
      setStore(updatedStore);
    } catch (err: any) {
      throw err; // StoreInfoForm에서 처리
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (user.role !== 'MASTER') {
    return (
      <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
        <Card>
          <Result
            status="403"
            title="접근 권한이 없습니다"
            subTitle="매장 관리는 마스터 계정만 접근할 수 있습니다."
            extra={
              <RouterLink to="/dashboard">
                대시보드로 돌아가기
              </RouterLink>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Breadcrumb */}
      <Row style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Breadcrumb>
            <Breadcrumb.Item>
              <RouterLink to="/dashboard">
                <HomeOutlined style={{ marginRight: 4 }} />
                대시보드
              </RouterLink>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <ShopOutlined style={{ marginRight: 4 }} />
              매장 관리
            </Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>

      {/* Page Header */}
      <Row style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Title level={2} style={{ margin: 0 }}>
            매장 관리
          </Title>
          <Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>
            매장의 기본 정보와 운영 시간을 관리할 수 있습니다.
          </Paragraph>
        </Col>
      </Row>

      {/* Error Display */}
      {error && (
        <Row style={{ marginBottom: 24 }}>
          <Col span={24}>
            <Alert
              type="error"
              message="오류 발생"
              description={error}
              showIcon
              closable
              onClose={() => setError('')}
            />
          </Col>
        </Row>
      )}

      {/* Content */}
      <Row>
        <Col span={24}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <ShopOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                매장 정보 설정
              </div>
            }
            bordered={false}
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)' }}
          >
            {isLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                <Spin size="large" tip="매장 정보를 불러오는 중..." />
              </div>
            ) : (
              <StoreInfoForm
                store={store}
                onSubmit={handleStoreUpdate}
                isLoading={isSaving}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StoreManagePage; 
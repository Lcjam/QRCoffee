import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Progress, 
  Typography, 
  Space, 
  Button,
  Timeline,
  Tag,
  Divider,
  Alert,
  Spin
} from 'antd';
import {
  ShopOutlined,
  TeamOutlined,
  AppstoreOutlined,
  QrcodeOutlined,
  TrophyOutlined,
  RiseOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { dashboardService, DashboardStats } from '../services/dashboardService';

const { Title, Text } = Typography;

const NewDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // 상태 관리
  const [stats, setStats] = useState<DashboardStats>({
    totalMenus: 0,
    activeMenus: 0,
    totalSeats: 0,
    activeSeats: 0,
    todayOrders: 0,
    todayRevenue: 0,
    weeklyGrowth: 0
  });
  
  const [popularMenus, setPopularMenus] = useState<Array<{name: string, 주문수: number}>>([]);
  const [recentActivities, setRecentActivities] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 차트 데이터 (임시 - 주문 시스템 구현 후 실제 데이터로 교체)
  const weeklyData = [
    { name: '월', 주문수: 45, 매출: 850000 },
    { name: '화', 주문수: 52, 매출: 920000 },
    { name: '수', 주문수: 38, 매출: 750000 },
    { name: '목', 주문수: 61, 매출: 1100000 },
    { name: '금', 주문수: 73, 매출: 1350000 },
    { name: '토', 주문수: 89, 매출: 1650000 },
    { name: '일', 주문수: 67, 매출: 1280000 },
  ];

  // 데이터 로드
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [dashboardStats, popularMenusData, activitiesData] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getPopularMenus(),
        dashboardService.getRecentActivities()
      ]);
      
      setStats(dashboardStats);
      setPopularMenus(popularMenusData);
      setRecentActivities(activitiesData);
      
    } catch (err: any) {
      console.error('대시보드 데이터 로드 실패:', err);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // 최근 활동 아이콘 매핑
  const getActivityIcon = (iconName: string) => {
    switch (iconName) {
      case 'QrcodeOutlined':
        return <QrcodeOutlined />;
      case 'AppstoreOutlined':
        return <AppstoreOutlined />;
      case 'ShopOutlined':
        return <ShopOutlined />;
      case 'TeamOutlined':
        return <TeamOutlined />;
      default:
        return <QrcodeOutlined />;
    }
  };

  if (loading) {
    return (
      <div style={{ 
        padding: '24px', 
        background: '#f0f2f5', 
        minHeight: '100vh',
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center'
      }}>
        <Spin size="large" tip="대시보드를 불러오는 중..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* 에러 메시지 */}
      {error && (
        <Alert
          message="오류 발생"
          description={error}
          type="error"
          showIcon
          closable
          style={{ marginBottom: 24 }}
          action={
            <Button size="small" onClick={loadDashboardData}>
              다시 시도
            </Button>
          }
        />
      )}

      {/* 환영 메시지 */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card>
            <Row justify="space-between" align="middle">
              <Col>
                <Space direction="vertical" size={0}>
                  <Title level={2} style={{ margin: 0 }}>
                    안녕하세요, {user?.name}님! 👋
                  </Title>
                  <Text type="secondary">
                    오늘도 멋진 하루 되세요. 매장 운영 현황을 확인해보세요.
                  </Text>
                </Space>
              </Col>
              <Col>
                <Space>
                  <Button 
                    icon={<ReloadOutlined />} 
                    onClick={loadDashboardData}
                    loading={loading}
                  >
                    새로고침
                  </Button>
                  <Button type="primary" onClick={() => navigate('/menu-management')}>
                    메뉴 관리
                  </Button>
                  <Button onClick={() => navigate('/seat-management')}>
                    좌석 관리
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* 주요 통계 카드 */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="등록된 메뉴"
              value={stats.totalMenus}
              prefix={<AppstoreOutlined style={{ color: '#1890ff' }} />}
              suffix="개"
            />
            <Progress 
              percent={stats.totalMenus > 0 ? (stats.activeMenus / stats.totalMenus) * 100 : 0} 
              size="small" 
              showInfo={false}
              strokeColor="#1890ff"
            />
            <Text type="secondary">활성 메뉴: {stats.activeMenus}개</Text>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="활성 좌석"
              value={stats.activeSeats}
              prefix={<QrcodeOutlined style={{ color: '#52c41a' }} />}
              suffix={`/ ${stats.totalSeats}`}
            />
            <Progress 
              percent={stats.totalSeats > 0 ? (stats.activeSeats / stats.totalSeats) * 100 : 0} 
              size="small" 
              showInfo={false}
              strokeColor="#52c41a"
            />
            <Text type="secondary">비활성: {stats.totalSeats - stats.activeSeats}석</Text>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="오늘 주문"
              value={stats.todayOrders}
              prefix={<ShopOutlined style={{ color: '#faad14' }} />}
              suffix="건"
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">
                {stats.todayOrders === 0 ? '아직 주문이 없습니다' : `매출: ${stats.todayRevenue.toLocaleString()}원`}
              </Text>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="주간 성장률"
              value={stats.weeklyGrowth}
              prefix={<RiseOutlined style={{ color: '#f5222d' }} />}
              suffix="%"
              valueStyle={{ color: stats.weeklyGrowth > 0 ? '#3f8600' : '#cf1322' }}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">지난주 대비</Text>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* 주간 주문 현황 */}
        <Col xs={24} lg={16}>
          <Card title="주간 주문 현황 (시뮬레이션)" extra={<Button size="small">더보기</Button>}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="주문수" 
                  stroke="#1890ff" 
                  fill="#1890ff" 
                  fillOpacity={0.1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* 최근 활동 */}
        <Col xs={24} lg={8}>
          <Card title="최근 활동" extra={<Button size="small">전체보기</Button>}>
            {recentActivities.length > 0 ? (
              <Timeline
                items={recentActivities.map((activity, index) => ({
                  dot: getActivityIcon(activity.icon),
                  children: (
                    <div key={index}>
                      <Text strong>{activity.action}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {activity.time}
                      </Text>
                    </div>
                  ),
                }))}
              />
            ) : (
              <Text type="secondary">최근 활동이 없습니다.</Text>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        {/* 인기 메뉴 */}
        <Col xs={24} lg={12}>
          <Card title="인기 메뉴 TOP 5" extra={<TrophyOutlined />}>
            {popularMenus.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={popularMenus} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="주문수" fill="#52c41a" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', padding: '50px 0' }}>
                <Text type="secondary">메뉴 데이터가 없습니다.</Text>
              </div>
            )}
          </Card>
        </Col>

        {/* 개발 진행 상황 */}
        <Col xs={24} lg={12}>
          <Card title="개발 진행 상황" extra={<Tag color="blue">5/10 단계</Tag>}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <Text strong>✅ 사용자 관리 시스템</Text>
                <Progress percent={100} size="small" status="success" />
              </div>
              <div>
                <Text strong>✅ 매장 관리 시스템</Text>
                <Progress percent={100} size="small" status="success" />
              </div>
              <div>
                <Text strong>✅ 메뉴 관리 시스템</Text>
                <Progress percent={100} size="small" status="success" />
              </div>
              <div>
                <Text strong>✅ 좌석 및 QR코드 관리</Text>
                <Progress percent={100} size="small" status="success" />
              </div>
              <div>
                <Text strong>🚧 주문 시스템</Text>
                <Progress percent={0} size="small" status="normal" />
              </div>
              <div>
                <Text strong>⏳ 결제 시스템</Text>
                <Progress percent={0} size="small" status="normal" />
              </div>
            </Space>
            
            <Divider />
            
            <Alert
              message="다음 단계: 주문 시스템 개발"
              description="고객용 주문 인터페이스와 관리자용 주문 관리 시스템을 개발할 예정입니다."
              type="info"
              showIcon
              style={{ marginTop: 16 }}
            />
          </Card>
        </Col>
      </Row>

      {/* 빠른 액션 */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="빠른 액션">
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={8} md={6} lg={4}>
                <Button 
                  block 
                  size="large" 
                  icon={<AppstoreOutlined />}
                  onClick={() => navigate('/menu-management')}
                >
                  새 메뉴 추가
                </Button>
              </Col>
              <Col xs={12} sm={8} md={6} lg={4}>
                <Button 
                  block 
                  size="large" 
                  icon={<QrcodeOutlined />}
                  onClick={() => navigate('/seat-management')}
                >
                  QR코드 생성
                </Button>
              </Col>
              {user?.role === 'MASTER' && (
                <Col xs={12} sm={8} md={6} lg={4}>
                  <Button 
                    block 
                    size="large" 
                    icon={<TeamOutlined />}
                    onClick={() => navigate('/sub-account-management')}
                  >
                    서브계정 추가
                  </Button>
                </Col>
              )}
              {user?.role === 'MASTER' && (
                <Col xs={12} sm={8} md={6} lg={4}>
                  <Button 
                    block 
                    size="large" 
                    icon={<ShopOutlined />}
                    onClick={() => navigate('/store-management')}
                  >
                    매장 설정
                  </Button>
                </Col>
              )}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default NewDashboardPage; 
import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, Typography, Space, Badge } from 'antd';
import {
  DashboardOutlined,
  ShopOutlined,
  TeamOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  AppstoreOutlined,
  QrcodeOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
  SettingOutlined,
  TableOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 메뉴 아이템들
  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/dashboard">대시보드</Link>,
    },
    ...(user?.role === 'MASTER' ? [
      {
        key: '/store-management',
        icon: <ShopOutlined />,
        label: <Link to="/store-management">매장 관리</Link>,
      },
      {
        key: '/sub-account-management',
        icon: <TeamOutlined />,
        label: <Link to="/sub-account-management">서브계정 관리</Link>,
      },
    ] : []),
    {
      key: '/menu-management',
      icon: <AppstoreOutlined />,
      label: <Link to="/menu-management">메뉴 관리</Link>,
    },
    {
      key: '/seat-management',
      icon: <QrcodeOutlined />,
      label: <Link to="/seat-management">좌석 관리</Link>,
    },
    {
      key: '/order-management',
      icon: <ShoppingCartOutlined />,
      label: <Link to="/order-management">주문 관리</Link>,
    },
  ];

  // 프로필 드롭다운 메뉴
  const profileMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '프로필 설정',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '설정',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '로그아웃',
      onClick: handleLogout,
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 사이드바 */}
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        style={{
          background: '#001529',
          boxShadow: '2px 0 6px rgba(0,21,41,.35)',
        }}
      >
        {/* 로고 영역 */}
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: '#002140',
          color: '#fff',
          fontSize: collapsed ? 16 : 18,
          fontWeight: 'bold',
        }}>
          {collapsed ? '☕' : '☕ QR Coffee'}
        </div>
        
        {/* 메뉴 */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
        />
      </Sider>

      <Layout>
        {/* 상단 헤더 */}
        <Header 
          style={{ 
            padding: '0 24px', 
            background: '#fff', 
            boxShadow: '0 1px 4px rgba(0,21,41,.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* 좌측: 메뉴 토글 버튼 */}
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16, width: 64, height: 64 }}
          />

          {/* 우측: 알림, 프로필 */}
          <Space size="middle">
            {/* 알림 */}
            <Badge count={0} size="small">
              <Button type="text" icon={<BellOutlined />} size="large" />
            </Badge>

            {/* 프로필 드롭다운 */}
            <Dropdown menu={{ items: profileMenuItems }} placement="bottomRight">
              <Button type="text" style={{ height: 'auto', padding: '4px 8px' }}>
                <Space>
                  <Avatar size="small" icon={<UserOutlined />} />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{user?.name}</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {user?.role === 'MASTER' ? '마스터' : '서브'} 계정
                    </Text>
                  </div>
                </Space>
              </Button>
            </Dropdown>
          </Space>
        </Header>

        {/* 메인 컨텐츠 */}
        <Content
          style={{
            margin: '24px',
            padding: '24px',
            background: '#f0f2f5',
            borderRadius: 8,
            minHeight: 'calc(100vh - 112px)',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout; 
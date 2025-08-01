import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Select,
  Statistic,
  Modal,
  Descriptions,
  Alert,
  Row,
  Col,
  Typography,
  Badge,
  Divider,
  Spin,
  message,
  Dropdown,
  Menu,
  Tooltip,
  Avatar
} from 'antd';
import {
  ReloadOutlined,
  ClockCircleOutlined,
  CoffeeOutlined,
  CheckCircleOutlined,
  UserOutlined,
  CloseCircleOutlined,
  MoreOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  SoundOutlined,
  SoundFilled
} from '@ant-design/icons';
import { 
  Order, 
  OrderStatus, 
  OrderStats, 
  OrderStatusStats 
} from '../types/order';
import { adminOrderService } from '../services/orderService';

const { Title, Text } = Typography;
const { Option } = Select;

const OrderManagePage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [statusStats, setStatusStats] = useState<OrderStatusStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastOrderCount, setLastOrderCount] = useState(0);

  // 알림음 재생 함수
  const playNotificationSound = () => {
    if (soundEnabled) {
      const audio = new Audio('/notification.mp3');
      audio.play().catch(() => {
        // 브라우저 정책으로 인한 오디오 재생 실패 무시
        console.log('알림음 재생에 실패했습니다.');
      });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 자동 새로고침 설정 (30초마다)
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadData();
    }, 30000); // 30초

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const loadData = async () => {
    await Promise.all([
      fetchOrders(),
      fetchStats(),
      fetchStatusStats()
    ]);
  };

  const fetchOrders = async (status?: OrderStatus) => {
    try {
      setLoading(true);
      const orderList = await adminOrderService.getOrders(status);
      
      // 새 주문 알림
      if (soundEnabled && !status && orderList.length > lastOrderCount && lastOrderCount > 0) {
        playNotificationSound();
        message.info({
          content: '새 주문이 접수되었습니다!',
          duration: 3,
        });
      }
      
      if (!status) {
        setLastOrderCount(orderList.length);
      }
      
      setOrders(orderList);
    } catch (err: any) {
      message.error(err.message || '주문 목록 조회에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const todayStats = await adminOrderService.getTodayStats();
      setStats(todayStats);
    } catch (err: any) {
      console.error('통계 조회 실패:', err.message);
    }
  };

  const fetchStatusStats = async () => {
    try {
      const statusStatsData = await adminOrderService.getStatusStats();
      setStatusStats(statusStatsData);
    } catch (err: any) {
      console.error('상태별 통계 조회 실패:', err.message);
    }
  };

  const handleStatusChange = (value: OrderStatus | '') => {
    setSelectedStatus(value);
    fetchOrders(value || undefined);
  };

  const handleOrderStatusUpdate = async (orderId: number, newStatus: OrderStatus) => {
    try {
      await adminOrderService.updateOrderStatus(orderId, newStatus);
      message.success('주문 상태가 변경되었습니다.');
      await loadData();
    } catch (err: any) {
      message.error(err.message || '주문 상태 변경에 실패했습니다.');
    }
  };

  const handleOrderCancel = async (orderId: number) => {
    try {
      await adminOrderService.cancelOrder(orderId);
      message.success('주문이 취소되었습니다.');
      await loadData();
    } catch (err: any) {
      message.error(err.message || '주문 취소에 실패했습니다.');
    }
  };

  const showOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const getStatusConfig = (status: OrderStatus) => {
    const configs = {
      [OrderStatus.PENDING]: {
        color: 'orange',
        text: '주문접수',
        icon: <ClockCircleOutlined />
      },
      [OrderStatus.PREPARING]: {
        color: 'blue',
        text: '제조중',
        icon: <CoffeeOutlined />
      },
      [OrderStatus.COMPLETED]: {
        color: 'green',
        text: '제조완료',
        icon: <CheckCircleOutlined />
      },
      [OrderStatus.PICKED_UP]: {
        color: 'default',
        text: '수령완료',
        icon: <UserOutlined />
      },
      [OrderStatus.CANCELLED]: {
        color: 'red',
        text: '취소됨',
        icon: <CloseCircleOutlined />
      }
    };
    return configs[status];
  };

  const getActionMenu = (record: Order) => (
    <Menu>
      <Menu.Item 
        key="view" 
        icon={<EyeOutlined />}
        onClick={() => showOrderDetail(record)}
      >
        상세보기
      </Menu.Item>
      {record.status === OrderStatus.PENDING && (
        <Menu.Item 
          key="prepare"
          icon={<CoffeeOutlined />}
          onClick={() => handleOrderStatusUpdate(record.id, OrderStatus.PREPARING)}
        >
          제조시작
        </Menu.Item>
      )}
      {record.status === OrderStatus.PREPARING && (
        <Menu.Item 
          key="complete"
          icon={<CheckCircleOutlined />}
          onClick={() => handleOrderStatusUpdate(record.id, OrderStatus.COMPLETED)}
        >
          제조완료
        </Menu.Item>
      )}
      {record.status === OrderStatus.COMPLETED && (
        <Menu.Item 
          key="pickup"
          icon={<UserOutlined />}
          onClick={() => handleOrderStatusUpdate(record.id, OrderStatus.PICKED_UP)}
        >
          수령완료
        </Menu.Item>
      )}
      {record.canCancel && (
        <>
          <Menu.Divider />
          <Menu.Item 
            key="cancel"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: '주문 취소',
                content: '정말로 이 주문을 취소하시겠습니까?',
                okText: '취소',
                cancelText: '닫기',
                okType: 'danger',
                onOk: () => handleOrderCancel(record.id)
              });
            }}
          >
            주문취소
          </Menu.Item>
        </>
      )}
    </Menu>
  );

  const columns = [
    {
      title: '주문번호',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 160,
      render: (text: string, record: Order) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {new Date(record.createdAt).toLocaleString()}
          </Text>
        </div>
      )
    },
    {
      title: '좌석',
      dataIndex: 'seatNumber',
      key: 'seatNumber',
      width: 80,
      render: (text: string, record: Order) => (
        <Tag color="geekblue">
          {text || `좌석 ${record.seatId}`}
        </Tag>
      )
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: OrderStatus) => {
        const config = getStatusConfig(status);
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      }
    },
    {
      title: '주문 내용',
      key: 'items',
      render: (record: Order) => (
        <div>
          <Text strong>
            {record.orderItems.length > 1 
              ? `${record.orderItems[0].menuName} 외 ${record.orderItems.length - 1}개`
              : record.orderItems[0]?.menuName || '항목 없음'
            }
          </Text>
          <br />
          <Text type="secondary">
            총 {record.orderItems.reduce((sum, item) => sum + item.quantity, 0)}개 상품
          </Text>
        </div>
      )
    },
    {
      title: '금액',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      render: (amount: number) => (
        <Text strong style={{ color: '#1890ff' }}>
          {amount.toLocaleString()}원
        </Text>
      )
    },
    {
      title: '액션',
      key: 'actions',
      width: 80,
      render: (record: Order) => (
        <Dropdown overlay={getActionMenu(record)} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      )
    }
  ];

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* 헤더 */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            주문 관리
          </Title>
        </Col>
        <Col>
          <Space>
            <Button 
              icon={soundEnabled ? <SoundFilled /> : <SoundOutlined />}
              onClick={() => setSoundEnabled(!soundEnabled)}
              type={soundEnabled ? "primary" : "default"}
              ghost={soundEnabled}
            >
              {soundEnabled ? '알림음 ON' : '알림음 OFF'}
            </Button>
            <Button 
              icon={autoRefresh ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={() => setAutoRefresh(!autoRefresh)}
              type={autoRefresh ? "default" : "dashed"}
            >
              {autoRefresh ? '자동새로고침 중지' : '자동새로고침 시작'}
            </Button>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={loadData}
              loading={loading}
            >
              새로고침
            </Button>
          </Space>
        </Col>
      </Row>

      {/* 통계 카드 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="오늘 주문"
              value={stats?.todayOrderCount || 0}
              suffix="건"
              valueStyle={{ color: '#1890ff' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="대기 중"
              value={stats?.pendingOrderCount || 0}
              suffix="건"
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="제조 중"
              value={statusStats?.preparingCount || 0}
              suffix="건"
              valueStyle={{ color: '#1890ff' }}
              prefix={<CoffeeOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="제조 완료"
              value={statusStats?.completedCount || 0}
              suffix="건"
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 필터 및 주문 목록 */}
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Space>
              <Text strong>상태 필터:</Text>
              <Select
                style={{ width: 120 }}
                value={selectedStatus}
                onChange={handleStatusChange}
                placeholder="전체"
              >
                <Option value="">전체</Option>
                <Option value={OrderStatus.PENDING}>주문접수</Option>
                <Option value={OrderStatus.PREPARING}>제조중</Option>
                <Option value={OrderStatus.COMPLETED}>제조완료</Option>
                <Option value={OrderStatus.PICKED_UP}>수령완료</Option>
                <Option value={OrderStatus.CANCELLED}>취소됨</Option>
              </Select>
            </Space>
          </Col>
          <Col>
            <Badge count={orders.length} showZero>
              <Text type="secondary">총 주문</Text>
            </Badge>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / 총 ${total}개`
          }}
          locale={{
            emptyText: '주문이 없습니다.'
          }}
        />
      </Card>

      {/* 주문 상세 모달 */}
      <Modal
        title="주문 상세 정보"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            닫기
          </Button>
        ]}
        width={700}
      >
        {selectedOrder && (
          <div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="주문번호" span={2}>
                <Text strong>{selectedOrder.orderNumber}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="좌석">
                <Tag color="geekblue">
                  {selectedOrder.seatNumber || `좌석 ${selectedOrder.seatId}`}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="상태">
                {(() => {
                  const config = getStatusConfig(selectedOrder.status);
                  return (
                    <Tag color={config.color} icon={config.icon}>
                      {config.text}
                    </Tag>
                  );
                })()}
              </Descriptions.Item>
              <Descriptions.Item label="주문 시간">
                {new Date(selectedOrder.createdAt).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="총 금액">
                <Text strong style={{ color: '#1890ff' }}>
                  {selectedOrder.totalAmount.toLocaleString()}원
                </Text>
              </Descriptions.Item>
              {selectedOrder.customerRequest && (
                <Descriptions.Item label="요청사항" span={2}>
                  <Text>{selectedOrder.customerRequest}</Text>
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider>주문 항목</Divider>
            
            <div style={{ marginTop: 16 }}>
              {selectedOrder.orderItems.map((item, index) => (
                <Card key={index} size="small" style={{ marginBottom: 8 }}>
                  <Row justify="space-between" align="middle">
                    <Col span={16}>
                      <div>
                        <Text strong>{item.menuName}</Text>
                        <br />
                        <Text type="secondary">
                          {item.unitPrice.toLocaleString()}원 × {item.quantity}개
                        </Text>
                        {item.options && (
                          <>
                            <br />
                            <Text type="secondary">옵션: {item.options}</Text>
                          </>
                        )}
                      </div>
                    </Col>
                    <Col span={8} style={{ textAlign: 'right' }}>
                      <Text strong style={{ color: '#1890ff' }}>
                        {item.totalPrice.toLocaleString()}원
                      </Text>
                    </Col>
                  </Row>
                </Card>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrderManagePage; 
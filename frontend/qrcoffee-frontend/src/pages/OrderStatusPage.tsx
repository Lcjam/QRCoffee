import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Card,
  Input,
  Button,
  Typography,
  Space,
  Tag,
  Alert,
  Row,
  Col,
  Divider,
  Spin,
  message,
  Steps
} from 'antd';
import {
  SearchOutlined,
  ClockCircleOutlined,
  CoffeeOutlined,
  CheckCircleOutlined,
  UserOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { Order, OrderStatus } from '../types/order';
import { customerOrderService } from '../services/orderService';

const { Title, Text } = Typography;

const OrderStatusPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get('orderNumber') || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialOrderNumber = searchParams.get('orderNumber');
    if (initialOrderNumber) {
      setOrderNumber(initialOrderNumber);
      fetchOrderByNumber(initialOrderNumber);
    }
  }, [searchParams]);

  const fetchOrderByNumber = async (orderNum: string) => {
    if (!orderNum.trim()) {
      message.warning('주문번호를 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const orderData = await customerOrderService.getOrderByNumber(orderNum.trim());
      setOrder(orderData);
    } catch (err: any) {
      setError(err.message || '주문을 찾을 수 없습니다.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchOrderByNumber(orderNumber);
  };

  const getStatusConfig = (status: OrderStatus) => {
    const configs = {
      [OrderStatus.PENDING]: {
        color: 'orange',
        text: '주문접수',
        icon: <ClockCircleOutlined />,
        description: '주문이 접수되었습니다.'
      },
      [OrderStatus.PREPARING]: {
        color: 'blue',
        text: '제조중',
        icon: <CoffeeOutlined />,
        description: '음료를 제조하고 있습니다.'
      },
      [OrderStatus.COMPLETED]: {
        color: 'green',
        text: '제조완료',
        icon: <CheckCircleOutlined />,
        description: '제조가 완료되었습니다. 수령해주세요!'
      },
      [OrderStatus.PICKED_UP]: {
        color: 'default',
        text: '수령완료',
        icon: <UserOutlined />,
        description: '주문이 완료되었습니다.'
      },
      [OrderStatus.CANCELLED]: {
        color: 'red',
        text: '주문취소',
        icon: <CloseCircleOutlined />,
        description: '주문이 취소되었습니다.'
      }
    };
    return configs[status];
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f5f5f5',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* 헤더 */}
        <Card style={{ marginBottom: '20px' }}>
          <Title level={2} style={{ textAlign: 'center', margin: 0 }}>
            주문 상태 조회
          </Title>
        </Card>

        {/* 검색 */}
        <Card style={{ marginBottom: '20px' }}>
          <Space.Compact style={{ width: '100%' }}>
            <Input
              placeholder="주문번호를 입력하세요"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              onPressEnter={handleSearch}
              size="large"
            />
            <Button 
              type="primary" 
              icon={<SearchOutlined />}
              onClick={handleSearch}
              loading={loading}
              size="large"
            >
              조회
            </Button>
          </Space.Compact>
        </Card>

        {/* 로딩 */}
        {loading && (
          <Card style={{ textAlign: 'center' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px' }}>
              <Text>주문 정보를 조회하고 있습니다...</Text>
            </div>
          </Card>
        )}

        {/* 에러 */}
        {error && (
          <Alert
            message="조회 실패"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: '20px' }}
          />
        )}

        {/* 주문 정보 */}
        {order && !loading && (
          <div>
            {/* 주문 기본 정보 */}
            <Card style={{ marginBottom: '20px' }}>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <div>
                    <Text type="secondary">주문번호</Text>
                    <Title level={4} style={{ margin: '4px 0' }}>
                      {order.orderNumber}
                    </Title>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div>
                    <Text type="secondary">좌석</Text>
                    <div style={{ marginTop: '4px' }}>
                      <Tag color="geekblue" style={{ fontSize: '14px' }}>
                        {order.seatNumber || `좌석 ${order.seatId}`}
                      </Tag>
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div>
                    <Text type="secondary">주문시간</Text>
                    <div style={{ marginTop: '4px' }}>
                      <Text>{new Date(order.createdAt).toLocaleString()}</Text>
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div>
                    <Text type="secondary">총 금액</Text>
                    <Title level={4} style={{ margin: '4px 0', color: '#1890ff' }}>
                      {order.totalAmount.toLocaleString()}원
                    </Title>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* 주문 상태 */}
            <Card style={{ marginBottom: '20px' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                {(() => {
                  const config = getStatusConfig(order.status);
                  return (
                    <div>
                      <Tag 
                        color={config.color} 
                        icon={config.icon}
                        style={{ fontSize: '16px', padding: '8px 16px' }}
                      >
                        {config.text}
                      </Tag>
                      <div style={{ marginTop: '8px' }}>
                        <Text>{config.description}</Text>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {order.status !== OrderStatus.CANCELLED && (
                <Steps
                  current={[OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.COMPLETED, OrderStatus.PICKED_UP].indexOf(order.status)}
                  status="process"
                  items={[
                    {
                      title: '주문접수',
                      icon: <ClockCircleOutlined />
                    },
                    {
                      title: '제조중',
                      icon: <CoffeeOutlined />
                    },
                    {
                      title: '제조완료',
                      icon: <CheckCircleOutlined />
                    },
                    {
                      title: '수령완료',
                      icon: <UserOutlined />
                    }
                  ]}
                />
              )}
            </Card>

            {/* 주문 항목 */}
            <Card>
              <Title level={4}>주문 내역</Title>
              <Divider />
              {order.orderItems.map((item, index) => (
                <Card key={index} size="small" style={{ marginBottom: '8px' }}>
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
              
              {order.customerRequest && (
                <>
                  <Divider />
                  <div>
                    <Text strong>요청사항: </Text>
                    <Text>{order.customerRequest}</Text>
                  </div>
                </>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderStatusPage; 
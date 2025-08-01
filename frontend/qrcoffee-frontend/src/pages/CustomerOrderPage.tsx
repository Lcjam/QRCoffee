import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Button, 
  Card, 
  Input, 
  InputNumber, 
  Modal, 
  notification, 
  Row, 
  Col, 
  Typography, 
  Space, 
  Badge,
  List,
  Divider,
  Spin,
  Alert,
  Tag,
  FloatButton,
  Affix,
  Image,
  Empty,
  Steps,
  Result
} from 'antd';
import { 
  ShoppingCartOutlined, 
  PlusOutlined, 
  MinusOutlined, 
  DeleteOutlined,
  CheckCircleOutlined,
  CoffeeOutlined,
  CloseOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import { Menu } from '../types/menu';
import { Order, OrderRequest, OrderItemRequest, CartItem } from '../types/order';
import { customerOrderService } from '../services/orderService';
import { publicSeatService } from '../services/seatService';

const { Title, Text, Paragraph } = Typography;

interface SeatInfo {
  id: number;
  storeId: number;
  seatNumber: string;
}

const CustomerOrderPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // 상태 관리
  const [loading, setLoading] = useState(false);
  const [seatInfo, setSeatInfo] = useState<SeatInfo | null>(null);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [orderCompleteModalOpen, setOrderCompleteModalOpen] = useState(false);
  const [customerRequest, setCustomerRequest] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');

  // URL 파라미터에서 좌석 정보 추출
  const seatQrCode = searchParams.get('qr');

  useEffect(() => {
    if (seatQrCode) {
      loadSeatAndMenus(seatQrCode);
    } else {
      setError('유효하지 않은 접근입니다. QR코드를 다시 스캔해주세요.');
    }
  }, [seatQrCode]);

  const loadSeatAndMenus = async (qrCode: string) => {
    try {
      setLoading(true);
      setError(null);

      // 좌석 정보 조회
      const seat = await publicSeatService.getSeatByQRCode(qrCode);
      setSeatInfo({
        id: seat.id,
        storeId: seat.storeId,
        seatNumber: seat.seatNumber
      });

      // 메뉴 목록 조회
      const menuList = await customerOrderService.getMenusByQrCode(qrCode);
      setMenus(menuList);

    } catch (err: any) {
      console.error('좌석/메뉴 조회 실패:', err);
      setError(err.message || '좌석 정보를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 장바구니에 추가
  const addToCart = (menu: Menu, quantity: number = 1) => {
    const existingItem = cart.find(item => item.menuId === menu.id);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.menuId === menu.id 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      const newItem: CartItem = {
        menuId: menu.id,
        menuName: menu.name,
        price: menu.price,
        quantity
      };
      setCart([...cart, newItem]);
    }

    notification.success({
      message: '장바구니 추가',
      description: `${menu.name}이(가) 장바구니에 추가되었습니다.`,
      duration: 2,
      placement: 'top'
    });
  };

  // 장바구니에서 제거
  const removeFromCart = (menuId: number) => {
    setCart(cart.filter(item => item.menuId !== menuId));
  };

  // 수량 변경
  const updateQuantity = (menuId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuId);
      return;
    }
    setCart(cart.map(item => 
      item.menuId === menuId ? { ...item, quantity } : item
    ));
  };

  // 총액 계산
  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // 총 수량 계산
  const getTotalQuantity = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // 장바구니에서 바로 결제로 이동
  const proceedToPayment = async () => {
    if (!seatInfo || cart.length === 0) {
      notification.error({
        message: '결제 불가',
        description: '장바구니가 비어있습니다.',
        placement: 'top'
      });
      return;
    }

    try {
      setLoading(true);

      const orderItems = cart.map(item => ({
        menuId: item.menuId,
        quantity: item.quantity,
        options: item.options
      }));

      const totalAmount = getTotalAmount();
      const orderName = `${cart[0].menuName}${cart.length > 1 ? ` 외 ${cart.length - 1}건` : ''}`;

      // 장바구니 정보를 세션에 저장 (결제 페이지에서 사용)
      const cartPaymentData = {
        storeId: seatInfo.storeId,
        seatId: seatInfo.id,
        orderItems,
        totalAmount,
        orderName,
        customerRequest: customerRequest.trim() || undefined,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`
      };

      sessionStorage.setItem('cartPaymentData', JSON.stringify(cartPaymentData));

      // 결제 페이지로 이동
      window.location.href = `/payment/cart?seatId=${seatInfo.id}&amount=${totalAmount}`;

    } catch (err: any) {
      console.error('결제 진행 실패:', err);
      notification.error({
        message: '결제 진행 실패',
        description: err.message || '결제 진행 중 오류가 발생했습니다.',
        placement: 'top'
      });
    } finally {
      setLoading(false);
    }
  };

  // 카테고리별 메뉴 그룹화
  const menusByCategory = menus.reduce((acc, menu) => {
    const categoryName = menu.categoryName || '기타';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(menu);
    return acc;
  }, {} as Record<string, Menu[]>);

  const categories = ['전체', ...Object.keys(menusByCategory)];

  // 필터된 메뉴
  const filteredMenus = selectedCategory === '전체' 
    ? menus 
    : menusByCategory[selectedCategory] || [];

  if (loading && !seatInfo) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <Spin size="large" />
        <Title level={4} style={{ color: 'white', marginTop: 16 }}>
          메뉴를 불러오고 있습니다...
        </Title>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <Result
          status="error"
          title="접근 오류"
          subTitle={error}
          extra={
            <Button type="primary" onClick={() => window.history.back()}>
              뒤로 가기
            </Button>
          }
          style={{ background: 'white', borderRadius: 12 }}
        />
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: '#f8f9fa'
    }}>
      {/* 상단 헤더 */}
      <Affix offsetTop={0}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '16px 20px',
          color: 'white',
          boxShadow: '0 2px 12px rgba(0,0,0,0.15)'
        }}>
          <Row justify="space-between" align="middle">
            <Col>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CoffeeOutlined style={{ fontSize: 24 }} />
                <div>
                  <Title level={4} style={{ color: 'white', margin: 0 }}>
                    카페 메뉴
                  </Title>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                    <EnvironmentOutlined /> 좌석: {seatInfo?.seatNumber}
                  </Text>
                </div>
              </div>
            </Col>
            <Col>
              <Badge count={getTotalQuantity()} size="small" offset={[-5, 5]}>
                <Button 
                  type="primary"
                  ghost
                  icon={<ShoppingCartOutlined />}
                  onClick={() => setCartModalOpen(true)}
                  style={{ 
                    borderColor: 'white',
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                >
                  장바구니
                </Button>
              </Badge>
            </Col>
          </Row>
        </div>
      </Affix>

      {/* 카테고리 탭 */}
      <div style={{
        background: 'white',
        padding: '12px 0',
        borderBottom: '1px solid #f0f0f0',
        position: 'sticky',
        top: 73,
        zIndex: 100
      }}>
        <div style={{ 
          display: 'flex', 
          gap: 8, 
          overflowX: 'auto', 
          padding: '0 20px',
          scrollbarWidth: 'none'
        }}>
          {categories.map(category => (
            <Button
              key={category}
              type={selectedCategory === category ? "primary" : "default"}
              size="small"
              onClick={() => setSelectedCategory(category)}
              style={{
                minWidth: 'auto',
                whiteSpace: 'nowrap',
                borderRadius: 20,
                fontWeight: selectedCategory === category ? 'bold' : 'normal'
              }}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* 메뉴 리스트 */}
      <div style={{ padding: '20px' }}>
        {filteredMenus.length === 0 ? (
          <Empty 
            description="메뉴가 없습니다"
            style={{ marginTop: 60 }}
          />
        ) : (
          <Row gutter={[16, 16]}>
            {filteredMenus.map(menu => (
              <Col xs={24} sm={12} md={8} lg={6} key={menu.id}>
                <Card
                  hoverable
                  style={{
                    borderRadius: 12,
                    overflow: 'hidden',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease'
                  }}
                  bodyStyle={{ padding: 0 }}
                  cover={
                    <div style={{ position: 'relative', height: 200 }}>
                      {menu.imageUrl ? (
                        <Image
                          alt={menu.name}
                          src={menu.imageUrl}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover' 
                          }}
                          preview={false}
                        />
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(45deg, #f0f0f0, #e0e0e0)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <CoffeeOutlined style={{ fontSize: 40, color: '#999' }} />
                        </div>
                      )}
                      
                      {/* 품절 오버레이 */}
                      {!menu.isAvailable && (
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'rgba(0,0,0,0.6)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Tag color="red" style={{ fontSize: 14, padding: '4px 12px' }}>
                            품절
                          </Tag>
                        </div>
                      )}
                    </div>
                  }
                >
                  <div style={{ padding: 16 }}>
                    <div style={{ marginBottom: 8 }}>
                      <Title level={5} style={{ margin: 0, fontSize: 16 }}>
                        {menu.name}
                      </Title>
                      {menu.description && (
                        <Paragraph 
                          ellipsis={{ rows: 2 }} 
                          style={{ 
                            fontSize: 12, 
                            color: '#666', 
                            margin: '4px 0 8px 0' 
                          }}
                        >
                          {menu.description}
                        </Paragraph>
                      )}
                    </div>

                    <Row justify="space-between" align="middle">
                      <Col>
                        <Text strong style={{ 
                          fontSize: 18, 
                          color: '#1890ff',
                          fontWeight: 'bold'
                        }}>
                          {menu.price.toLocaleString()}원
                        </Text>
                      </Col>
                      <Col>
                        <Button
                          type="primary"
                          size="small"
                          icon={<PlusOutlined />}
                          onClick={() => addToCart(menu)}
                          disabled={!menu.isAvailable}
                          style={{
                            borderRadius: 20,
                            fontWeight: 'bold',
                            background: menu.isAvailable ? '#52c41a' : undefined,
                            borderColor: menu.isAvailable ? '#52c41a' : undefined
                          }}
                        >
                          담기
                        </Button>
                      </Col>
                    </Row>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      {/* 플로팅 장바구니 버튼 */}
      {cart.length > 0 && (
        <FloatButton
          icon={<ShoppingCartOutlined />}
          badge={{ count: getTotalQuantity() }}
          onClick={() => setCartModalOpen(true)}
          style={{
            width: 60,
            height: 60,
            bottom: 24,
            right: 24
          }}
        />
      )}

      {/* 장바구니 모달 */}
      <Modal
        title={
          <div style={{ textAlign: 'center' }}>
            <ShoppingCartOutlined style={{ marginRight: 8 }} />
            장바구니
          </div>
        }
        open={cartModalOpen}
        onCancel={() => setCartModalOpen(false)}
        footer={null}
        width="100%"
        style={{ 
          maxWidth: 500, 
          top: 20 
        }}
        bodyStyle={{ 
          maxHeight: '70vh', 
          overflowY: 'auto',
          padding: cart.length === 0 ? 40 : 16
        }}
      >
        {cart.length === 0 ? (
          <Empty 
            description="장바구니가 비어있습니다"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <>
            <List
              itemLayout="horizontal"
              dataSource={cart}
              renderItem={item => (
                <List.Item
                  style={{
                    background: '#fafafa',
                    borderRadius: 8,
                    padding: '12px 16px',
                    marginBottom: 8
                  }}
                  actions={[
                    <Button 
                      size="small" 
                      shape="circle"
                      icon={<MinusOutlined />}
                      onClick={() => updateQuantity(item.menuId, item.quantity - 1)}
                    />,
                    <Text strong style={{ minWidth: 30, textAlign: 'center' }}>
                      {item.quantity}
                    </Text>,
                    <Button 
                      size="small" 
                      shape="circle"
                      icon={<PlusOutlined />}
                      onClick={() => updateQuantity(item.menuId, item.quantity + 1)}
                    />,
                    <Button 
                      size="small" 
                      danger
                      shape="circle"
                      icon={<DeleteOutlined />}
                      onClick={() => removeFromCart(item.menuId)}
                    />
                  ]}
                >
                  <List.Item.Meta
                    title={<Text strong>{item.menuName}</Text>}
                    description={
                      <Text type="secondary">
                        {item.price.toLocaleString()}원
                      </Text>
                    }
                  />
                  <div style={{ textAlign: 'right' }}>
                    <Text strong style={{ color: '#1890ff' }}>
                      {(item.price * item.quantity).toLocaleString()}원
                    </Text>
                  </div>
                </List.Item>
              )}
            />
            
            <Divider />
            
            {/* 요청사항 */}
            <div style={{ marginBottom: 16 }}>
              <Text strong>요청사항</Text>
              <Input.TextArea
                placeholder="매장에 전달할 요청사항을 입력해주세요 (선택사항)"
                value={customerRequest}
                onChange={(e) => setCustomerRequest(e.target.value)}
                rows={3}
                maxLength={200}
                style={{ marginTop: 8 }}
                showCount
              />
            </div>

            {/* 주문 요약 */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 12,
              padding: 16,
              color: 'white'
            }}>
              <Row justify="space-between" align="middle" style={{ marginBottom: 12 }}>
                <Col>
                  <Text style={{ color: 'white' }}>총 {getTotalQuantity()}개 상품</Text>
                </Col>
                <Col>
                  <Title level={3} style={{ color: 'white', margin: 0 }}>
                    {getTotalAmount().toLocaleString()}원
                  </Title>
                </Col>
              </Row>
              
              <Button 
                type="primary"
                size="large"
                block
                loading={loading}
                onClick={proceedToPayment}
                style={{
                  background: 'white',
                  borderColor: 'white',
                  color: '#667eea',
                  fontWeight: 'bold',
                  height: 50,
                  borderRadius: 8
                }}
              >
                결제하기
              </Button>
            </div>
          </>
        )}
      </Modal>

      {/* 주문 완료 모달은 제거됨 - 결제 성공 후 주문이 생성되므로 불필요 */}
    </div>
  );
};

export default CustomerOrderPage; 
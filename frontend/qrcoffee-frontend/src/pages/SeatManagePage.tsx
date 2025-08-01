import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  message,
  Row,
  Col,
  Typography,
  Tabs,
  Popconfirm,
  Statistic,
  Empty,
  Dropdown,
  Menu as AntdMenu,
  Tooltip,
  Badge,
  QRCode,
  Image
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  QrcodeOutlined,
  HomeOutlined,
  MoreOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { Seat, SeatRequest, SeatStats } from '../types/seat';
import { seatService } from '../services/seatService';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const SeatManagePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('management');
  const [seats, setSeats] = useState<Seat[]>([]);
  const [stats, setStats] = useState<SeatStats | null>(null);
  const [loading, setLoading] = useState(false);

  // 모달 상태
  const [seatModalVisible, setSeatModalVisible] = useState(false);
  const [editingSeat, setEditingSeat] = useState<Seat | null>(null);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);

  // 폼
  const [seatForm] = Form.useForm();

  useEffect(() => {
    fetchSeats();
    fetchStats();
  }, []);

  const fetchSeats = async () => {
    try {
      setLoading(true);
      const seatsData = await seatService.getSeats();
      setSeats(seatsData);
    } catch (err: any) {
      message.error(err.message || '좌석 목록을 가져오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await seatService.getStats();
      setStats(statsData);
    } catch (err: any) {
      console.error('통계 조회 실패:', err);
    }
  };

  const loadData = async () => {
    await Promise.all([fetchSeats(), fetchStats()]);
  };

  const handleCreateSeat = () => {
    setEditingSeat(null);
    seatForm.resetFields();
    seatForm.setFieldsValue({
      seatNumber: '',
      description: '',
      maxCapacity: 2
    });
    setSeatModalVisible(true);
  };

  const handleEditSeat = (seat: Seat) => {
    setEditingSeat(seat);
    seatForm.setFieldsValue({
      seatNumber: seat.seatNumber,
      description: seat.description || '',
      maxCapacity: seat.maxCapacity
    });
    setSeatModalVisible(true);
  };

  const handleSaveSeat = async () => {
    try {
      const values = await seatForm.validateFields();
      if (editingSeat) {
        await seatService.updateSeat(editingSeat.id, values);
        message.success('좌석이 수정되었습니다.');
      } else {
        await seatService.createSeat(values);
        message.success('좌석이 생성되었습니다.');
      }
      setSeatModalVisible(false);
      await loadData();
    } catch (err: any) {
      if (err.errorFields) return; // 폼 검증 에러
      message.error(err.message || '좌석 저장에 실패했습니다.');
    }
  };

  const handleToggleStatus = async (seat: Seat) => {
    try {
      await seatService.toggleSeatStatus(seat.id);
      message.success('좌석 상태가 변경되었습니다.');
      await loadData();
    } catch (err: any) {
      message.error(err.message || '상태 변경에 실패했습니다.');
    }
  };

  const handleRegenerateQR = async (seat: Seat) => {
    try {
      await seatService.regenerateQRCode(seat.id);
      message.success('QR코드가 재생성되었습니다.');
      await fetchSeats();
    } catch (err: any) {
      message.error(err.message || 'QR코드 재생성에 실패했습니다.');
    }
  };

  const handleDeleteSeat = async (seat: Seat) => {
    try {
      await seatService.deleteSeat(seat.id);
      message.success('좌석이 삭제되었습니다.');
      await loadData();
    } catch (err: any) {
      message.error(err.message || '좌석 삭제에 실패했습니다.');
    }
  };

  const handleShowQR = (seat: Seat) => {
    setSelectedSeat(seat);
    setQrModalVisible(true);
  };

  // 좌석 액션 메뉴
  const getSeatActionMenu = (record: Seat) => (
    <AntdMenu>
      <AntdMenu.Item
        key="qr"
        icon={<QrcodeOutlined />}
        onClick={() => handleShowQR(record)}
      >
        QR코드 보기
      </AntdMenu.Item>
      <AntdMenu.Item
        key="edit"
        icon={<EditOutlined />}
        onClick={() => handleEditSeat(record)}
      >
        수정
      </AntdMenu.Item>
      <AntdMenu.Item
        key="toggle"
        icon={record.isActive ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
        onClick={() => handleToggleStatus(record)}
      >
        {record.isActive ? '비활성화' : '활성화'}
      </AntdMenu.Item>
      <AntdMenu.Item
        key="regenerate"
        icon={<ReloadOutlined />}
        onClick={() => handleRegenerateQR(record)}
      >
        QR코드 재생성
      </AntdMenu.Item>
      <AntdMenu.Divider />
      <AntdMenu.Item
        key="delete"
        danger
        icon={<DeleteOutlined />}
      >
        <Popconfirm
          title="좌석 삭제"
          description={`좌석 ${record.seatNumber}을(를) 삭제하시겠습니까?`}
          onConfirm={() => handleDeleteSeat(record)}
          okText="삭제"
          cancelText="취소"
          okType="danger"
        >
          삭제
        </Popconfirm>
      </AntdMenu.Item>
    </AntdMenu>
  );

  // 좌석 테이블 컬럼
  const seatColumns = [
    {
      title: '좌석 정보',
      key: 'seatInfo',
      render: (record: Seat) => (
        <div>
          <Text strong style={{ fontSize: '16px' }}>{record.seatNumber}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.description || '설명 없음'}
          </Text>
        </div>
      )
    },
    {
      title: '수용 인원',
      dataIndex: 'maxCapacity',
      key: 'maxCapacity',
      width: 100,
      render: (capacity: number) => (
        <Text>
          <HomeOutlined style={{ marginRight: 4, color: '#1890ff' }} />
          {capacity}명
        </Text>
      )
    },
    {
      title: '상태',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean) => (
        <Tag
          color={isActive ? 'blue' : 'red'}
          icon={isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
        >
          {isActive ? '활성' : '비활성'}
        </Tag>
      )
    },
    {
      title: 'QR코드',
      key: 'qrCode',
      width: 80,
      render: (record: Seat) => (
        <Tooltip title="QR코드 보기">
          <Button
            type="text"
            icon={<QrcodeOutlined />}
            onClick={() => handleShowQR(record)}
          />
        </Tooltip>
      )
    },
    {
      title: '액션',
      key: 'actions',
      width: 80,
      render: (record: Seat) => (
        <Dropdown overlay={getSeatActionMenu(record)} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      )
    }
  ];

  // 현황 테이블 컬럼
  const statusColumns = [
    {
      title: '좌석번호',
      dataIndex: 'seatNumber',
      key: 'seatNumber',
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: '수용인원',
      dataIndex: 'maxCapacity',
      key: 'maxCapacity',
      width: 100,
      render: (capacity: number) => (
        <Text>
          <HomeOutlined style={{ marginRight: 4, color: '#1890ff' }} />
          {capacity}명
        </Text>
      )
    },
    {
      title: '상태',
      key: 'status',
      width: 120,
      render: (record: Seat) => (
        <Space direction="vertical" size={4}>
          <Switch
            checked={record.isActive}
            onChange={() => handleToggleStatus(record)}
            checkedChildren="활성"
            unCheckedChildren="비활성"
            style={{ backgroundColor: record.isActive ? '#1890ff' : undefined }}
          />
        </Space>
      )
    },
    {
      title: '설명',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => <Text type="secondary">{text || '없음'}</Text>
    }
  ];

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* 헤더 */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            좌석 관리
          </Title>
        </Col>
        <Col>
          <Space>
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
              title="총 좌석"
              value={stats?.totalSeats || 0}
              suffix="개"
              valueStyle={{ color: '#1890ff' }}
              prefix={<HomeOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="활성 좌석"
              value={stats?.activeSeats || 0}
              suffix="개"
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="비활성 좌석"
              value={(stats?.totalSeats || 0) - (stats?.activeSeats || 0)}
              suffix="개"
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 탭 및 콘텐츠 */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          tabBarExtraContent={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateSeat}
            >
              좌석 추가
            </Button>
          }
        >
          <TabPane
            tab={
              <span>
                <EditOutlined />
                좌석 관리
              </span>
            }
            key="management"
          >
            <Table
              columns={seatColumns}
              dataSource={seats}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} / 총 ${total}개`
              }}
              locale={{
                emptyText: <Empty description="등록된 좌석이 없습니다." />
              }}
            />
          </TabPane>

          <TabPane
            tab={
              <span>
                <HomeOutlined />
                좌석 현황
              </span>
            }
            key="status"
          >
            <Table
              columns={statusColumns}
              dataSource={seats}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 15,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} / 총 ${total}개`
              }}
              locale={{
                emptyText: <Empty description="등록된 좌석이 없습니다." />
              }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* 좌석 추가/수정 모달 */}
      <Modal
        title={editingSeat ? "좌석 수정" : "좌석 추가"}
        open={seatModalVisible}
        onOk={handleSaveSeat}
        onCancel={() => setSeatModalVisible(false)}
        okText="저장"
        cancelText="취소"
      >
        <Form
          form={seatForm}
          layout="vertical"
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="seatNumber"
            label="좌석 번호"
            rules={[{ required: true, message: '좌석 번호를 입력해주세요.' }]}
          >
            <Input placeholder="좌석 번호를 입력하세요 (예: A1, B2)" />
          </Form.Item>
          <Form.Item
            name="description"
            label="설명"
          >
            <Input.TextArea
              rows={3}
              placeholder="좌석 설명을 입력하세요"
            />
          </Form.Item>
          <Form.Item
            name="maxCapacity"
            label="최대 수용 인원"
            rules={[{ required: true, message: '최대 수용 인원을 입력해주세요.' }]}
          >
            <InputNumber
              min={1}
              max={10}
              style={{ width: '100%' }}
              placeholder="최대 수용 인원을 입력하세요"
              addonAfter="명"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* QR코드 모달 */}
      <Modal
        title={`좌석 ${selectedSeat?.seatNumber} QR코드`}
        open={qrModalVisible}
        onCancel={() => setQrModalVisible(false)}
        footer={[
          <Button key="regenerate" onClick={() => selectedSeat && handleRegenerateQR(selectedSeat)}>
            QR코드 재생성
          </Button>,
          <Button key="close" type="primary" onClick={() => setQrModalVisible(false)}>
            닫기
          </Button>
        ]}
        width={400}
      >
        {selectedSeat && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ fontSize: '16px' }}>
                좌석: {selectedSeat.seatNumber}
              </Text>
              <br />
              <Text type="secondary">
                수용인원: {selectedSeat.maxCapacity}명
              </Text>
            </div>
            <div style={{ marginBottom: 16 }}>
              <QRCode
                value={selectedSeat.qrCode || ''}
                size={200}
                style={{ margin: '0 auto' }}
              />
            </div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              고객이 이 QR코드를 스캔하면 주문할 수 있습니다.
            </Text>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SeatManagePage; 
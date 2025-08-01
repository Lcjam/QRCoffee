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
  Select,
  message,
  Row,
  Col,
  Typography,
  Tabs,
  Image,
  Popconfirm,
  Tooltip,
  Statistic,
  Empty,
  Dropdown,
  Menu as AntdMenu
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  MoreOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { categoryService, menuService } from '../services/menuService';
import { Category, CategoryRequest, Menu, MenuRequest } from '../types/menu';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const MenuManagePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('categories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(false);

  // 카테고리 모달 관련
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [categoryForm] = Form.useForm();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // 메뉴 모달 관련
  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const [menuForm] = Form.useForm();
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);

  // 데이터 로드
  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (err: any) {
      message.error('카테고리 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadMenus = async () => {
    try {
      setLoading(true);
      const data = await menuService.getAllMenus();
      setMenus(data);
    } catch (err: any) {
      message.error('메뉴 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    await Promise.all([loadCategories(), loadMenus()]);
  };

  useEffect(() => {
    loadData();
  }, []);

  // 카테고리 관련 핸들러
  const handleCreateCategory = () => {
    setEditingCategory(null);
    categoryForm.resetFields();
    categoryForm.setFieldsValue({
      name: '',
      displayOrder: 0,
      isActive: true
    });
    setCategoryModalVisible(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    categoryForm.setFieldsValue({
      name: category.name,
      displayOrder: category.displayOrder,
      isActive: category.isActive
    });
    setCategoryModalVisible(true);
  };

  const handleSaveCategory = async () => {
    try {
      const values = await categoryForm.validateFields();
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, values);
        message.success('카테고리가 수정되었습니다.');
      } else {
        await categoryService.createCategory(values);
        message.success('카테고리가 생성되었습니다.');
      }
      setCategoryModalVisible(false);
      loadCategories();
    } catch (err: any) {
      if (err.errorFields) return; // 폼 검증 에러
      message.error('카테고리 저장에 실패했습니다.');
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    try {
      await categoryService.deleteCategory(categoryId);
      message.success('카테고리가 삭제되었습니다.');
      loadCategories();
    } catch (err: any) {
      message.error('카테고리 삭제에 실패했습니다.');
    }
  };

  const handleToggleCategoryStatus = async (categoryId: number) => {
    try {
      await categoryService.toggleCategoryStatus(categoryId);
      message.success('카테고리 상태가 변경되었습니다.');
      loadCategories();
    } catch (err: any) {
      message.error('카테고리 상태 변경에 실패했습니다.');
    }
  };

  // 메뉴 관련 핸들러
  const handleCreateMenu = () => {
    setEditingMenu(null);
    menuForm.resetFields();
    menuForm.setFieldsValue({
      categoryId: categories.length > 0 ? categories[0].id : undefined,
      name: '',
      description: '',
      price: 0,
      imageUrl: '',
      isAvailable: true,
      displayOrder: 0
    });
    setMenuModalVisible(true);
  };

  const handleEditMenu = (menu: Menu) => {
    setEditingMenu(menu);
    menuForm.setFieldsValue({
      categoryId: menu.categoryId,
      name: menu.name,
      description: menu.description || '',
      price: menu.price,
      imageUrl: menu.imageUrl || '',
      isAvailable: menu.isAvailable,
      displayOrder: menu.displayOrder
    });
    setMenuModalVisible(true);
  };

  const handleSaveMenu = async () => {
    try {
      const values = await menuForm.validateFields();
      if (editingMenu) {
        await menuService.updateMenu(editingMenu.id, values);
        message.success('메뉴가 수정되었습니다.');
      } else {
        await menuService.createMenu(values);
        message.success('메뉴가 생성되었습니다.');
      }
      setMenuModalVisible(false);
      loadMenus();
    } catch (err: any) {
      if (err.errorFields) return; // 폼 검증 에러
      message.error('메뉴 저장에 실패했습니다.');
    }
  };

  const handleDeleteMenu = async (menuId: number) => {
    try {
      await menuService.deleteMenu(menuId);
      message.success('메뉴가 삭제되었습니다.');
      loadMenus();
    } catch (err: any) {
      message.error('메뉴 삭제에 실패했습니다.');
    }
  };

  const handleToggleMenuAvailability = async (menuId: number) => {
    try {
      await menuService.toggleMenuAvailability(menuId);
      message.success('메뉴 상태가 변경되었습니다.');
      loadMenus();
    } catch (err: any) {
      message.error('메뉴 상태 변경에 실패했습니다.');
    }
  };

  const getCategoryName = (categoryId: number): string => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : '알 수 없음';
  };

  // 카테고리 액션 메뉴
  const getCategoryActionMenu = (record: Category) => (
    <AntdMenu>
      <AntdMenu.Item 
        key="edit" 
        icon={<EditOutlined />}
        onClick={() => handleEditCategory(record)}
      >
        수정
      </AntdMenu.Item>
      <AntdMenu.Item 
        key="toggle"
        icon={record.isActive ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
        onClick={() => handleToggleCategoryStatus(record.id)}
      >
        {record.isActive ? '비활성화' : '활성화'}
      </AntdMenu.Item>
      <AntdMenu.Divider />
      <AntdMenu.Item 
        key="delete"
        danger
        icon={<DeleteOutlined />}
      >
        <Popconfirm
          title="카테고리 삭제"
          description="정말로 이 카테고리를 삭제하시겠습니까?"
          onConfirm={() => handleDeleteCategory(record.id)}
          okText="삭제"
          cancelText="취소"
          okType="danger"
        >
          삭제
        </Popconfirm>
      </AntdMenu.Item>
    </AntdMenu>
  );

  // 메뉴 액션 메뉴
  const getMenuActionMenu = (record: Menu) => (
    <AntdMenu>
      <AntdMenu.Item 
        key="edit" 
        icon={<EditOutlined />}
        onClick={() => handleEditMenu(record)}
      >
        수정
      </AntdMenu.Item>
      <AntdMenu.Item 
        key="toggle"
        icon={record.isAvailable ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
        onClick={() => handleToggleMenuAvailability(record.id)}
      >
        {record.isAvailable ? '품절처리' : '판매시작'}
      </AntdMenu.Item>
      <AntdMenu.Divider />
      <AntdMenu.Item 
        key="delete"
        danger
        icon={<DeleteOutlined />}
      >
        <Popconfirm
          title="메뉴 삭제"
          description="정말로 이 메뉴를 삭제하시겠습니까?"
          onConfirm={() => handleDeleteMenu(record.id)}
          okText="삭제"
          cancelText="취소"
          okType="danger"
        >
          삭제
        </Popconfirm>
      </AntdMenu.Item>
    </AntdMenu>
  );

  // 카테고리 테이블 컬럼
  const categoryColumns = [
    {
      title: '카테고리명',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Category) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            순서: {record.displayOrder}
          </Text>
        </div>
      )
    },
    {
      title: '상태',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'} icon={isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
          {isActive ? '활성' : '비활성'}
        </Tag>
      )
    },
    {
      title: '메뉴 수',
      key: 'menuCount',
      width: 100,
      render: (record: Category) => {
        const menuCount = menus.filter(menu => menu.categoryId === record.id).length;
        return <Text>{menuCount}개</Text>;
      }
    },
    {
      title: '액션',
      key: 'actions',
      width: 80,
      render: (record: Category) => (
        <Dropdown overlay={getCategoryActionMenu(record)} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      )
    }
  ];

  // 메뉴 테이블 컬럼
  const menuColumns = [
    {
      title: '메뉴',
      key: 'menu',
      render: (record: Menu) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {record.imageUrl ? (
            <Image
              width={50}
              height={50}
              src={record.imageUrl}
              style={{ borderRadius: 8, objectFit: 'cover' }}
              preview={false}
            />
          ) : (
            <div style={{ 
              width: 50, 
              height: 50, 
              backgroundColor: '#f5f5f5', 
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShoppingOutlined style={{ color: '#d9d9d9' }} />
            </div>
          )}
          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.description || '설명 없음'}
            </Text>
          </div>
        </div>
      )
    },
    {
      title: '카테고리',
      dataIndex: 'categoryId',
      key: 'categoryId',
      width: 120,
      render: (categoryId: number) => (
        <Tag color="blue">{getCategoryName(categoryId)}</Tag>
      )
    },
    {
      title: '가격',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (price: number) => (
        <Text strong style={{ color: '#1890ff' }}>
          {price.toLocaleString()}원
        </Text>
      )
    },
    {
      title: '상태',
      dataIndex: 'isAvailable',
      key: 'isAvailable',
      width: 100,
      render: (isAvailable: boolean) => (
        <Tag color={isAvailable ? 'green' : 'volcano'} icon={isAvailable ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
          {isAvailable ? '판매중' : '품절'}
        </Tag>
      )
    },
    {
      title: '액션',
      key: 'actions',
      width: 80,
      render: (record: Menu) => (
        <Dropdown overlay={getMenuActionMenu(record)} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      )
    }
  ];

  // 통계 계산
  const activeCategories = categories.filter(c => c.isActive).length;
  const availableMenus = menus.filter(m => m.isAvailable).length;

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* 헤더 */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            메뉴 관리
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
              title="총 카테고리"
              value={categories.length}
              suffix="개"
              valueStyle={{ color: '#1890ff' }}
              prefix={<AppstoreOutlined />}
            />
            <Text type="secondary">활성: {activeCategories}개</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="총 메뉴"
              value={menus.length}
              suffix="개"
              valueStyle={{ color: '#52c41a' }}
              prefix={<ShoppingOutlined />}
            />
            <Text type="secondary">판매중: {availableMenus}개</Text>
          </Card>
        </Col>
      </Row>

      {/* 탭 및 콘텐츠 */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          tabBarExtraContent={
            <Space>
              {activeTab === 'categories' && (
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={handleCreateCategory}
                >
                  카테고리 추가
                </Button>
              )}
              {activeTab === 'menus' && (
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={handleCreateMenu}
                  disabled={categories.length === 0}
                >
                  메뉴 추가
                </Button>
              )}
            </Space>
          }
        >
          <TabPane 
            tab={
              <span>
                <AppstoreOutlined />
                카테고리 관리
              </span>
            } 
            key="categories"
          >
            <Table
              columns={categoryColumns}
              dataSource={categories}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} / 총 ${total}개`
              }}
              locale={{
                emptyText: <Empty description="등록된 카테고리가 없습니다." />
              }}
            />
          </TabPane>

          <TabPane 
            tab={
              <span>
                <ShoppingOutlined />
                메뉴 관리
              </span>
            } 
            key="menus"
          >
            <Table
              columns={menuColumns}
              dataSource={menus}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} / 총 ${total}개`
              }}
              locale={{
                emptyText: <Empty description="등록된 메뉴가 없습니다." />
              }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* 카테고리 추가/수정 모달 */}
      <Modal
        title={editingCategory ? "카테고리 수정" : "카테고리 추가"}
        open={categoryModalVisible}
        onOk={handleSaveCategory}
        onCancel={() => setCategoryModalVisible(false)}
        okText="저장"
        cancelText="취소"
      >
        <Form
          form={categoryForm}
          layout="vertical"
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="name"
            label="카테고리명"
            rules={[{ required: true, message: '카테고리명을 입력해주세요.' }]}
          >
            <Input placeholder="카테고리명을 입력하세요" />
          </Form.Item>
          <Form.Item
            name="displayOrder"
            label="표시 순서"
            rules={[{ required: true, message: '표시 순서를 입력해주세요.' }]}
          >
            <InputNumber 
              min={0} 
              style={{ width: '100%' }}
              placeholder="표시 순서를 입력하세요"
            />
          </Form.Item>
          <Form.Item
            name="isActive"
            label="활성 상태"
            valuePropName="checked"
          >
            <Switch checkedChildren="활성" unCheckedChildren="비활성" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 메뉴 추가/수정 모달 */}
      <Modal
        title={editingMenu ? "메뉴 수정" : "메뉴 추가"}
        open={menuModalVisible}
        onOk={handleSaveMenu}
        onCancel={() => setMenuModalVisible(false)}
        okText="저장"
        cancelText="취소"
        width={600}
      >
        <Form
          form={menuForm}
          layout="vertical"
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="categoryId"
            label="카테고리"
            rules={[{ required: true, message: '카테고리를 선택해주세요.' }]}
          >
            <Select placeholder="카테고리를 선택하세요">
              {categories.map(category => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="name"
            label="메뉴명"
            rules={[{ required: true, message: '메뉴명을 입력해주세요.' }]}
          >
            <Input placeholder="메뉴명을 입력하세요" />
          </Form.Item>
          <Form.Item
            name="description"
            label="메뉴 설명"
          >
            <Input.TextArea 
              rows={3}
              placeholder="메뉴 설명을 입력하세요"
            />
          </Form.Item>
          <Form.Item
            name="price"
            label="가격"
            rules={[{ required: true, message: '가격을 입력해주세요.' }]}
          >
                         <InputNumber 
               min={0} 
               style={{ width: '100%' }}
               placeholder="가격을 입력하세요"
               addonAfter="원"
             />
          </Form.Item>
          <Form.Item
            name="imageUrl"
            label="이미지 URL"
          >
            <Input placeholder="이미지 URL을 입력하세요" />
          </Form.Item>
          <Form.Item
            name="displayOrder"
            label="표시 순서"
            rules={[{ required: true, message: '표시 순서를 입력해주세요.' }]}
          >
            <InputNumber 
              min={0} 
              style={{ width: '100%' }}
              placeholder="표시 순서를 입력하세요"
            />
          </Form.Item>
          <Form.Item
            name="isAvailable"
            label="판매 상태"
            valuePropName="checked"
          >
            <Switch checkedChildren="판매중" unCheckedChildren="품절" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MenuManagePage; 
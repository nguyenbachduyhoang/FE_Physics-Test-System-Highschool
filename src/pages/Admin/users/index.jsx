/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tag, Button, Avatar, Space, Modal, Form, Input, Select, Switch, Pagination, Spin } from "antd";
import SafeTable from "../../../components/uiBasic/SafeTable";
import { UserOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import { userService } from "../../../services";
import toast from "react-hot-toast";
import "./index.scss";

const { Option } = Select;
const { Search } = Input;

export default function UsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('username');
  const [sortDirection, setSortDirection] = useState('asc');
  const [form] = Form.useForm();

  // Fetch users with pagination and filters
  const fetchUsers = async (page = 1, pageSize = 10, search = '', sort = 'username', direction = 'asc') => {
    setLoading(true);
    try {
      const params = {
        page,
        pageSize,
        search: search || searchTerm,
        sortBy: sort,
        sortDirection: direction
      };
      
      const response = await userService.getAllUsers(params);
      // Chuẩn hóa lấy dữ liệu phân trang từ backend
      if (response?.success && response.data) {
        const responseData = response.data;
        const usersArray = responseData.items || responseData.users || [];
        setUsers(usersArray);
        setPagination({
          current: responseData.currentPage || page,
          pageSize: responseData.pageSize || pageSize,
          total: responseData.totalCount || usersArray.length
        });
      } else {
        setUsers([]);
        setPagination(prev => ({ ...prev, total: 0 }));
      }
    } catch (err) {
      setUsers([]);
      setPagination(prev => ({ ...prev, total: 0 }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
    fetchUsers(1, pagination.pageSize, value, sortBy, sortDirection);
  };

  // Handle table change (pagination, filters, sorter)
  const handleTableChange = (paginationInfo, filters, sorter) => {
    let newSortBy = sortBy;
    let newSortDirection = sortDirection;
    if (sorter && sorter.field) {
      newSortBy = sorter.field;
      newSortDirection = sorter.order === 'descend' ? 'desc' : 'asc';
      setSortBy(newSortBy);
      setSortDirection(newSortDirection);
    }
    fetchUsers(
      paginationInfo.current, 
      paginationInfo.pageSize, 
      searchTerm,
      newSortBy,
      newSortDirection
    );
  };

  // Add or update user
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      console.log('Form values:', values); // Debug log
      
      if (editingUser) {
        // Update user
        const response = await userService.updateUser(editingUser.id, values);
        console.log('Update response:', response); // Debug log
        if (response?.success) {
          toast.success("Cập nhật người dùng thành công!");
        } else {
          throw new Error(response?.message || 'Cập nhật thất bại');
        }
      } else {
        // Create user
        const response = await userService.createUser(values);
        console.log('Create response:', response); // Debug log
        if (response?.success) {
          toast.success("Thêm người dùng thành công!");
        } else {
          throw new Error(response?.message || 'Thêm thất bại');
        }
      }
      
      setIsModalVisible(false);
      setEditingUser(null);
      form.resetFields();
      fetchUsers(pagination.current, pagination.pageSize, searchTerm, sortBy, sortDirection);
    } catch (err) {
      console.error('Save user error:', err);
      const errorMessage = userService.formatError(err);
      if (err.response?.data?.errors) {
        // Log validation errors from backend
        console.log('Validation errors:', err.response.data.errors);
        Object.entries(err.response.data.errors).forEach(([field, errors]) => {
          form.setFields([{
            name: field,
            errors: Array.isArray(errors) ? errors : [errors]
          }]);
        });
      }
      toast.error(`Lỗi lưu người dùng: ${errorMessage}`);
    }
  };

  // Delete user
  const handleDelete = async (userId) => {
    
    if (!userId) {
      toast.error("Không tìm thấy ID người dùng!");
      return;
    }

    const confirmDelete = window.confirm("Bạn chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.");
    
    if (confirmDelete) {
      setLoading(true);
      try {
        const response = await userService.deleteUser(userId);
        if (response?.success) {
          toast.success("Xóa người dùng thành công!");
          
          // Cập nhật state users ngay lập tức
          setUsers(prevUsers => {
            const newUsers = prevUsers.filter(user => {
              const currentId = user.userId || user.UserId || user.id;
              return currentId !== userId;
            });
            return newUsers;
          });
          
          await fetchUsers(pagination.current, pagination.pageSize, searchTerm, sortBy, sortDirection);
        } else {
          throw new Error(response?.message || 'Xóa thất bại');
        }
      } catch (err) {
        console.error('Delete user error:', err);
        const errorMessage = userService.formatError(err);
        toast.error(`Lỗi xóa người dùng: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const renderUserId = (user, idx) => {
    if (user.id && user.id.startsWith('u') && user.id.length <= 5) return user.id;
    return `u${String(idx + 1).padStart(3, '0')}`;
  };
  // Open modal for edit
  const handleEdit = (user) => {
    setEditingUser(user);
    setIsModalVisible(true);
    form.setFieldsValue({
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      isActive: user.is_active
    });
  };

  // Open modal for add
  const handleAdd = () => {
    setEditingUser(null);
    setIsModalVisible(true);
    form.resetFields();
  };

  // Handle view user details
  const handleView = (userId) => {
    navigate(`/admin/users/${userId}`);
  };

  // Format role display
  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'red';
      case 'teacher': return 'blue';
      case 'student': return 'green';
      default: return 'default';
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'admin': return 'Quản trị viên';
      // case 'teacher': return 'Giáo viên';
      case 'student': return 'Học sinh';
      default: return role;
    }
  };


  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 60,
      align: 'center',
      render: (text, record, idx) => ((pagination.current - 1) * pagination.pageSize + idx + 1),
    },
    {
      title: "",
      dataIndex: "avatarUrl",
      key: "avatarUrl",
      render: () => <Avatar icon={<UserOutlined />} />,
      width: 48,
    },
    {
      title: "User ID",
      dataIndex: "id",
      key: "id",
      render: (id, record, idx) => (
        <Tag color="purple" style={{ fontFamily: 'monospace', fontSize: '11px' }}>
          {renderUserId(record, idx)}
        </Tag>
      ),
      width: 150,
    },
    {
      title: "Tên đăng nhập",
      dataIndex: "username",
      key: "username",
      sorter: true,
      render: (text) => <b>{text}</b>,
    },
    {
      title: "Họ tên",
      dataIndex: "full_name",
      key: "full_name",
      sorter: true,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: true,
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <Tag color={getRoleColor(role)}>
          {getRoleText(role)}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      key: "is_active",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Hoạt động" : "Không hoạt động"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => {
        const userId = record.id || record.userId || record.UserId;
        return (
          <Space>
            <Button 
              icon={<EyeOutlined />} 
              size="small" 
              onClick={() => handleView(userId)}
              title="Xem chi tiết"
            />
            <Button 
              icon={<EditOutlined />} 
              size="small" 
              onClick={() => handleEdit(record)}
              title="Chỉnh sửa"
            />
            <Button 
              icon={<DeleteOutlined />} 
              size="small" 
              danger 
              onClick={() => {
                handleDelete(userId);
              }}
              title="Xóa"
            />
          </Space>
        );
      },
    },
  ];

  return (
    <div className="admin-users-page">
      <div className="users-header">
        <h1>Quản lý người dùng</h1>
        <div className="users-actions">
          <Search
            placeholder="Tìm kiếm theo tên, email..."
            allowClear
            enterButton={<SearchOutlined />}
            size="middle"
            onSearch={handleSearch}
            style={{ width: 300, marginRight: 16 }}
          />
          <Button 
            icon={<ReloadOutlined />} 
            onClick={() => fetchUsers(pagination.current, pagination.pageSize, searchTerm, sortBy, sortDirection)}
            style={{ marginRight: 8 }}
          >
            Làm mới
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Thêm người dùng
          </Button>
        </div>
      </div>

      <div className="users-stats">
        <div className="stat-item">
          <span className="stat-label">Tổng số người dùng:</span>
          <span className="stat-value">{pagination.total}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Hiển thị:</span>
          <span className="stat-value">
            {users.length} / {pagination.total}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Quản trị viên:</span>
          <span className="stat-value">
            {Array.isArray(users) ? users.filter(u => u.role === 'admin').length : 0}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Giáo viên:</span>
          <span className="stat-value">
            {Array.isArray(users) ? users.filter(u => u.role === 'teacher').length : 0}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Học sinh:</span>
          <span className="stat-value">
            {Array.isArray(users) ? users.filter(u => u.role === 'student').length : 0}
          </span>
        </div>
      </div>

      <SafeTable
        columns={columns}
        dataSource={users}
        rowKey={(record) => record.id}
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} của ${total} người dùng`,
          pageSizeOptions: ['10', '20', '50', '100','150','200']
        }}
        onChange={handleTableChange}
        className="users-table"
        scroll={{ x: 1000 }}
      />

      <Modal
        title={editingUser ? "Cập nhật người dùng" : "Thêm người dùng"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingUser(null);
          form.resetFields();
        }}
        destroyOnClose
        width={600}
        okText={editingUser ? "Cập nhật" : "Thêm"}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item 
            name="username" 
            label="Tên đăng nhập" 
            rules={[
              { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
              { min: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự!' }
            ]}
          >
            <Input placeholder="Nhập tên đăng nhập" />
          </Form.Item>

          <Form.Item 
            name="full_name" 
            label="Họ tên" 
            rules={[
              { required: true, message: 'Vui lòng nhập họ tên!' }
            ]}
          >
            <Input placeholder="Nhập họ tên đầy đủ" />
          </Form.Item>

          <Form.Item 
            name="email" 
            label="Email" 
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: "email", message: 'Email không hợp lệ!' }
            ]}
          >
            <Input placeholder="Nhập địa chỉ email" />
          </Form.Item>

          {!editingUser && (
            <Form.Item 
              name="password" 
              label="Mật khẩu" 
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu!' },
                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
              ]}
            >
              <Input.Password placeholder="Nhập mật khẩu" />
            </Form.Item>
          )}

          <Form.Item 
            name="role" 
            label="Vai trò" 
            rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
          >
            <Select placeholder="Chọn vai trò">
              <Option value="student">Học sinh</Option>
              <Option value="teacher">Giáo viên</Option>
              <Option value="admin">Quản trị viên</Option>
            </Select>
          </Form.Item>
{/* 
          <Form.Item
            name="isActive"
            label="Trạng thái"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="Hoạt động" unCheckedChildren="Không hoạt động" />
          </Form.Item> */}

        </Form>
      </Modal>
    </div>
  );
}

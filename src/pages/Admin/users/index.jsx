import React, { useEffect, useState } from "react";
import { Table, Tag, Button, Avatar, Space, Modal, Form, Input, Select, message } from "antd";
import { UserOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import "./index.scss";

const { Option } = Select;

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://103.252.92.182/users");
      setUsers(res.data);
    } catch (err) {
      message.error("Lỗi tải danh sách người dùng");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Add or update user
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const token = localStorage.getItem("token");
      console.log("Token:", token); // Thêm dòng này trước khi gọi API
      if (editingUser) {
        // Update user
        await axios.patch(
          `http://103.252.92.182/users/${editingUser.userId}`,
          values,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        message.success("Cập nhật thành công!");
      } else {
        // Create user
        await axios.post("http://103.252.92.182/users", values);
        message.success("Thêm mới thành công!");
      }
      setIsModalVisible(false);
      setEditingUser(null);
      form.resetFields();
      fetchUsers();
    } catch (err) {
      message.error("Có lỗi xảy ra!");
    }
  };

  // Delete user
  const handleDelete = async (userId) => {
    console.log("Delete userId:", userId); // Thêm dòng này
    Modal.confirm({
      title: "Bạn chắc chắn muốn xóa người dùng này?",
      content: `ID: ${userId}`,
      onOk: async () => {
        try {
          const token = localStorage.getItem("token");
          await axios.delete(
            `http://103.252.92.182/users/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          message.success("Xóa thành công!");
          fetchUsers();
        } catch (err) {
          message.error("Xóa thất bại!");
          console.log("Delete error:", err?.response?.data || err); // Thêm dòng này
        }
      },
    });
  };

  // Open modal for edit
  const handleEdit = (user) => {
    setEditingUser(user);
    setIsModalVisible(true);
    form.setFieldsValue(user);
  };

  // Open modal for add
  const handleAdd = () => {
    setEditingUser(null);
    setIsModalVisible(true);
    form.resetFields();
  };

  const columns = [
    {
      title: "",
      dataIndex: "avatarUrl",
      key: "avatarUrl",
      render: (avatar) => <Avatar src={avatar} icon={<UserOutlined />} />,
      width: 48,
    },
    {
      title: "Tên đăng nhập",
      dataIndex: "username",
      key: "username",
      render: (text) => <b>{text}</b>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role) => <Tag color={role === "teacher" ? "blue" : "purple"}>{role}</Tag>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "green";
        if (status === "pending") color = "gold";
        if (status === "disabled") color = "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => date && date.slice(0, 10),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} />
          <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDelete(record.userId)} />
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-users-page">
      <div className="users-header">
        <h1>Quản lý người dùng</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm người dùng
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={users}
        rowKey="userId"
        loading={loading}
        pagination={false}
        className="users-table"
      />

      <Modal
        title={editingUser ? "Cập nhật người dùng" : "Thêm người dùng"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Vai trò" rules={[{ required: true }]}>
            <Select>
              <Option value="student">Học sinh</Option>
              <Option value="teacher">Giáo viên</Option>
            </Select>
          </Form.Item>
          <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
            <Select>
              <Option value="active">Hoạt động</Option>
              <Option value="pending">Chờ xác thực</Option>
              <Option value="disabled">Không hoạt động</Option>
            </Select>
          </Form.Item>
          <Form.Item name="avatarUrl" label="Avatar URL">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

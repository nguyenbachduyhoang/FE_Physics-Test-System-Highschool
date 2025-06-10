import React from "react";
import { Table, Tag, Button, Avatar, Space } from "antd";
import { UserOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import "./index.scss";

const data = [
  {
    key: "1",
    name: "Nguyễn Văn An",
    email: "an.nguyen@email.com",
    role: "Học sinh",
    status: "Hoạt động",
    joined: "10/06/2025",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    key: "2",
    name: "Trần Thị Bình",
    email: "binh.tran@email.com",
    role: "Giáo viên",
    status: "Hoạt động",
    joined: "09/06/2025",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    key: "3",
    name: "Lê Minh Châu",
    email: "chau.le@email.com",
    role: "Học sinh",
    status: "Chờ xác thực",
    joined: "09/06/2025",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
  },
  {
    key: "4",
    name: "Phạm Thị Dung",
    email: "dung.pham@email.com",
    role: "Học sinh",
    status: "Không hoạt động",
    joined: "08/06/2025",
    avatar: "https://randomuser.me/api/portraits/women/12.jpg",
  },
];

const columns = [
  {
    title: "",
    dataIndex: "avatar",
    key: "avatar",
    render: (avatar) => <Avatar src={avatar} icon={<UserOutlined />} />,
    width: 48,
  },
  {
    title: "Tên",
    dataIndex: "name",
    key: "name",
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
    render: (role) => <Tag color={role === "Giáo viên" ? "blue" : "purple"}>{role}</Tag>,
  },
  {
    title: "Trạng thái",
    dataIndex: "status",
    key: "status",
    render: (status) => {
      let color = "green";
      if (status === "Chờ xác thực") color = "gold";
      if (status === "Không hoạt động") color = "red";
      return <Tag color={color}>{status}</Tag>;
    },
  },
  {
    title: "Ngày tham gia",
    dataIndex: "joined",
    key: "joined",
  },
  {
    title: "Thao tác",
    key: "action",
    render: (_, record) => (
      <Space>
        <Button icon={<EditOutlined />} size="small" />
        <Button icon={<DeleteOutlined />} size="small" danger />
      </Space>
    ),
  },
];

export default function UsersPage() {
  return (
    <div className="admin-users-page">
      <div className="users-header">
        <h1>Quản lý người dùng</h1>
        <Button type="primary" icon={<PlusOutlined />}>Thêm người dùng</Button>
      </div>
      <Table columns={columns} dataSource={data} pagination={false} className="users-table" />
    </div>
  );
}

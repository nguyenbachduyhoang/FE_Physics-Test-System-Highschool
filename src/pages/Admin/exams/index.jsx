import React from "react";
import { Table, Tag, Button, Space } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import "./index.scss";

const data = [
  {
    key: "1",
    name: "Đề thi thử THPT Quốc Gia 2025 - Lần 1",
    questions: 40,
    status: "Đã duyệt",
    created: "10/06/2025",
  },
  {
    key: "2",
    name: "Đề kiểm tra giữa kỳ 2 - Vật lý 11",
    questions: 30,
    status: "Chờ duyệt",
    created: "09/06/2025",
  },
  {
    key: "3",
    name: "Đề thi học kỳ 1 - Vật lý 10",
    questions: 35,
    status: "Không duyệt",
    created: "08/06/2025",
  },
  {
    key: "4",
    name: "Đề kiểm tra 15 phút - Vật lý 12",
    questions: 10,
    status: "Đã duyệt",
    created: "07/06/2025",
  },
];

const columns = [
  {
    title: "Tên đề thi",
    dataIndex: "name",
    key: "name",
    render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
  },
  {
    title: "Số câu hỏi",
    dataIndex: "questions",
    key: "questions",
    render: (num) => <Tag color="blue">{num}</Tag>,
  },
  {
    title: "Trạng thái",
    dataIndex: "status",
    key: "status",
    render: (status) => {
      let color = "green";
      if (status === "Chờ duyệt") color = "gold";
      if (status === "Không duyệt") color = "red";
      return <Tag color={color}>{status}</Tag>;
    },
  },
  {
    title: "Ngày tạo",
    dataIndex: "created",
    key: "created",
  },
  {
    title: "Thao tác",
    key: "action",
    render: (_, record) => (
      <Space>
        <Button icon={<EyeOutlined />} size="small" />
        <Button icon={<EditOutlined />} size="small" />
        <Button icon={<DeleteOutlined />} size="small" danger />
      </Space>
    ),
  },
];

export default function ExamsPage() {
  return (
    <div className="admin-exams-page">
      <div className="exams-header">
        <h1>Quản lý đề thi</h1>
        <Button type="primary" icon={<PlusOutlined />}>Tạo đề thi mới</Button>
      </div>
      <Table columns={columns} dataSource={data} pagination={false} className="exams-table" />
    </div>
  );
}

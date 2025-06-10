import React from "react";
import { Table, Tag, Button, Space } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import "./index.scss";

const data = [
  {
    key: "1",
    content: "Một vật chuyển động thẳng đều với vận tốc 5 m/s. Hỏi sau 10 giây vật đi được bao nhiêu mét?",
    subject: "Vật lý 10",
    level: "Dễ",
    status: "Đã duyệt",
    created: "10/06/2025",
  },
  {
    key: "2",
    content: "Công thức định luật II Newton là gì?",
    subject: "Vật lý 10",
    level: "Trung bình",
    status: "Chờ duyệt",
    created: "09/06/2025",
  },
  {
    key: "3",
    content: "Tính điện trở tương đương của hai điện trở mắc nối tiếp.",
    subject: "Vật lý 11",
    level: "Khó",
    status: "Đã duyệt",
    created: "08/06/2025",
  },
  {
    key: "4",
    content: "Nêu định nghĩa về công suất điện.",
    subject: "Vật lý 12",
    level: "Dễ",
    status: "Không duyệt",
    created: "07/06/2025",
  },
];

const columns = [
  {
    title: "Nội dung câu hỏi",
    dataIndex: "content",
    key: "content",
    render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
  },
  {
    title: "Chủ đề",
    dataIndex: "subject",
    key: "subject",
    render: (subject) => <Tag color="blue">{subject}</Tag>,
  },
  {
    title: "Mức độ",
    dataIndex: "level",
    key: "level",
    render: (level) => {
      let color = "green";
      if (level === "Trung bình") color = "gold";
      if (level === "Khó") color = "red";
      return <Tag color={color}>{level}</Tag>;
    },
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

export default function QuestionsPage() {
  return (
    <div className="admin-questions-page">
      <div className="questions-header">
        <h1>Ngân hàng câu hỏi</h1>
        <Button type="primary" icon={<PlusOutlined />}>Thêm câu hỏi</Button>
      </div>
      <Table columns={columns} dataSource={data} pagination={false} className="questions-table" />
    </div>
  );
}

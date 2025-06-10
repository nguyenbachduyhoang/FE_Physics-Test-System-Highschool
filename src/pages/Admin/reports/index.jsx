import React from "react";
import { Card, Row, Col, Statistic } from "antd";
import { Bar, Line } from "@ant-design/charts";
import {
  UserOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import "./index.scss";

const stats = [
  {
    title: "Người dùng",
    value: 2847,
    icon: <UserOutlined style={{ color: "#4c51bf" }} />,
    color: "#e0e7ff",
  },
  {
    title: "Câu hỏi",
    value: 15672,
    icon: <QuestionCircleOutlined style={{ color: "#10b981" }} />,
    color: "#d1fae5",
  },
  {
    title: "Đề thi",
    value: 4261,
    icon: <FileTextOutlined style={{ color: "#f59e42" }} />,
    color: "#fef3c7",
  },
];

const barData = [
  { type: "T1", users: 500, questions: 2000, exams: 300 },
  { type: "T2", users: 800, questions: 2500, exams: 400 },
  { type: "T3", users: 1200, questions: 4000, exams: 600 },
  { type: "T4", users: 1000, questions: 3500, exams: 500 },
  { type: "T5", users: 900, questions: 3200, exams: 450 },
  { type: "T6", users: 1100, questions: 3700, exams: 550 },
  { type: "T7", users: 1300, questions: 3900, exams: 600 },
];

const lineData = [
  { month: "T1", value: 500, category: "Người dùng" },
  { month: "T2", value: 800, category: "Người dùng" },
  { month: "T3", value: 1200, category: "Người dùng" },
  { month: "T4", value: 1000, category: "Người dùng" },
  { month: "T5", value: 900, category: "Người dùng" },
  { month: "T6", value: 1100, category: "Người dùng" },
  { month: "T7", value: 1300, category: "Người dùng" },
  { month: "T1", value: 2000, category: "Câu hỏi" },
  { month: "T2", value: 2500, category: "Câu hỏi" },
  { month: "T3", value: 4000, category: "Câu hỏi" },
  { month: "T4", value: 3500, category: "Câu hỏi" },
  { month: "T5", value: 3200, category: "Câu hỏi" },
  { month: "T6", value: 3700, category: "Câu hỏi" },
  { month: "T7", value: 3900, category: "Câu hỏi" },
  { month: "T1", value: 300, category: "Đề thi" },
  { month: "T2", value: 400, category: "Đề thi" },
  { month: "T3", value: 600, category: "Đề thi" },
  { month: "T4", value: 500, category: "Đề thi" },
  { month: "T5", value: 450, category: "Đề thi" },
  { month: "T6", value: 550, category: "Đề thi" },
  { month: "T7", value: 600, category: "Đề thi" },
];

const barConfig = {
  data: barData,
  xField: "type",
  yField: ["users", "questions", "exams"],
  seriesField: "type",
  isGroup: true,
  legend: false,
  color: ["#4c51bf", "#10b981", "#f59e42"],
  label: false,
};

const lineConfig = {
  data: lineData,
  xField: "month",
  yField: "value",
  seriesField: "category",
  color: ["#4c51bf", "#10b981", "#f59e42"],
  smooth: true,
  legend: { position: "top" },
};

export default function ReportsPage() {
  return (
    <div className="admin-reports-page">
      <div className="reports-header">
        <h1>Thống kê & Báo cáo</h1>
      </div>
      <Row gutter={24} className="stats-row">
        {stats.map((item) => (
          <Col span={8} key={item.title}>
            <Card bordered={false} style={{ background: item.color }}>
              <Statistic
                title={item.title}
                value={item.value}
                prefix={item.icon}
                valueStyle={{ fontWeight: 700, fontSize: 28 }}
              />
            </Card>
          </Col>
        ))}
      </Row>
      <Row gutter={24} style={{ marginTop: 32 }}>
        <Col span={12}>
          <Card title="Thống kê theo cột" bordered={false}>
            <Bar {...barConfig} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Xu hướng theo thời gian" bordered={false}>
            <Line {...lineConfig} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

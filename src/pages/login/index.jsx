/* eslint-disable no-unused-vars */
import { Form, Button, Row, Col, Checkbox } from "antd";
import { RiLoginCircleLine } from "react-icons/ri";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import CInputLabel from "../../components/uiBasic/CInputLabel";
import CInputLabelPass from "../../components/uiBasic/CInputLabelPass";
import "./index.scss";
import { useRef, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const onFinish = (values) => {
    navigate("/home");
  };
  const recaptchaRef = useRef();
  const [captchaValue, setCaptchaValue] = useState(null);
  const handleCaptchaChange = (value) => {
    setCaptchaValue(value);
  };

  return (
    <div className="login-container">
      <Row className="login-layout">
        <Col xs={0} sm={0} md={16} className="left-section" />
        <Col xs={24} sm={24} md={8} className="right-section">
          <div className="login-card">
            <p className="title">Đăng Nhập</p>
            <img src="/logo/22.png" alt="Logo 1" />

            <Form
              name="login"
              initialValues={{ remember: true }}
              className="login-form"
              onFinish={onFinish}
              layout="vertical"
            >
              <Row gutter={[8, 8]}>
                <Col span={24}>
                  <Form.Item
                    name="username"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập tên đăng nhập!",
                      },
                    ]}
                  >
                    <CInputLabel
                      label="TÊN ĐĂNG NHẬP"
                      prefix={<UserOutlined />}
                    />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item
                    name="password"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập mật khẩu!",
                      },
                    ]}
                  >
                    <CInputLabelPass
                      label="MẬT KHẨU"
                      type="password"
                      prefix={<LockOutlined />}
                    />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "12px",
                    }}
                  >
                    <Form.Item name="remember" noStyle>
                      <Checkbox>Ghi nhớ</Checkbox>
                    </Form.Item>
                    <a style={{ color: "#0D5B79" }}>Quên mật khẩu?</a>
                  </div>
                </Col>

                {/* <Col span={24}>
                  <Form.Item
                    style={{ width: "100%" }}
                    className="recaptcha"
                    name="recaptcha"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng xác thực Captcha!",
                      },
                    ]}
                  >
                    <ReCAPTCHA
                      ref={recaptchaRef}
                      sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                      size="normal"
                      onChange={handleCaptchaChange}
                    />
                  </Form.Item>
                </Col> */}

                <Col span={24}>
                  <Form.Item>
                    <Button
                      icon={<RiLoginCircleLine size={20} />}
                      className="login-button"
                      htmlType="submit"
                      block
                    >
                      Đăng nhập
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
              <Col span={24}>
                <div className="social-login-group">
                  <button className="social-btn google">
                    <span className="icon">
                      <FcGoogle size={22} />
                    </span>
                    Sign in with Google
                  </button>
                </div>
              </Col>
              <p className="login-support">
                Cần trợ giúp?{" "}
                <a href="mailto:support@phygen.com">Liên hệ hỗ trợ</a>
              </p>
            </Form>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default Login;

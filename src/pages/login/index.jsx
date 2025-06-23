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
import { GoogleOAuthProvider } from "@react-oauth/google";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../firebase"; 
import toast from "react-hot-toast";
import { authService } from "../../services";

function Login() {
  const navigate = useNavigate();
  const onFinish = (values) => {
    handleLogin(values);
  };
  const [loading, setLoading] = useState(false);


  const handleGoogleLogin = async () => {
    try {
      // Force account selection by signing out first
      await auth.signOut();
      
      // Configure provider to force account selection
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();
      const data = await authService.googleLogin({
        idToken: idToken,
        email: user.email,
        fullName: user.displayName
      });
      
      if (data.isNewUser) {
        const registrationData = {
          email: data.email,
          fullName: data.name || user.displayName,
          phone: '',
          address: ''
        };
        
        const completeData = await authService.completeGoogleRegistration(registrationData);
        authService.setAuthData(completeData);
        toast.success(`Đăng ký thành công! Chào mừng ${data.name || user.displayName}`);
        
        // Redirect based on role
        const userRole = completeData.user?.role;
        if (userRole === 'admin') {
          navigate("/admin");
        } else {
          navigate("/home");
        }
      } else {
        // Existing user login
        authService.setAuthData(data);
        const userName = data.user?.fullName || data.user?.full_name || user.displayName;
        toast.success(`Đăng nhập Google thành công! Chào mừng ${userName}`);
        
        // Redirect based on role
        const userRole = data.user?.role;
        if (userRole === 'admin') {
          navigate("/admin");
        } else {
          navigate("/home");
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Đăng nhập Google thất bại!";
      toast.error(errorMessage);
      console.error("Google login error:", error);
    }
  };

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      console.time('Login API Call');
      const data = await authService.login(values.username, values.password);
      console.timeEnd('Login API Call');
      
      // Set auth data using service
      authService.setAuthData(data);
      
      toast.success(`Đăng nhập thành công! Chào mừng ${data.user.full_name}`);
      
      // Redirect based on role
      const userRole = data.user?.role;
      if (userRole === 'admin') {
        navigate("/admin");
      } else {
      navigate("/home");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Đăng nhập thất bại!";
      toast.error(errorMessage);
      console.error("Login error:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <div className="login-container">
        <Row className="login-layout">
          <Col xs={0} sm={0} md={16} className="left-section" />
          <Col xs={24} sm={24} md={8} className="right-section">
            <div className="login-card">
              <p className="title">Đăng Nhập</p>
              <img src="/images/22.png" alt="Logo 1" />

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

                  <Col span={24}>
                    <Form.Item>
                      <Button
                        icon={<RiLoginCircleLine size={20} />}
                        className="login-button"
                        htmlType="submit"
                        block
                        loading={loading}
                        disabled={loading}
                      >
                        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                      </Button>
                    </Form.Item>
                  </Col>
                </Row>
                <Col span={24}>
                  <div className="social-login-group">
                    <button
                      className="social-btn google"
                      type="button"
                      onClick={handleGoogleLogin}
                    >
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
    </GoogleOAuthProvider>
  );
}

export default Login;

/* eslint-disable no-unused-vars */
import { Form, Button, Row, Col, Checkbox } from "antd";
import { RiLoginCircleLine } from "react-icons/ri";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import CInputLabel from "../../components/uiBasic/CInputLabel";
import CInputLabelPass from "../../components/uiBasic/CInputLabelPass";
import "./index.scss";
import { useRef, useState, useEffect, useCallback } from "react";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../firebase"; 
import toast from "react-hot-toast";
import { authService } from "../../services";
import { motion } from "framer-motion";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.5, when: "beforeChildren", staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

function Login() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Đăng nhập thường: chỉ gọi API backend, không liên quan Google
  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const response = await authService.login(values.username, values.password);
      authService.setAuthData(response);
      const userData = response.data?.user || response.user;
      const userFullName = userData?.full_name || userData?.fullName;
      toast.success(`Đăng nhập thành công! Chào mừng ${userFullName}`);
      const userRole = userData?.role;
      if (userRole === 'admin') {
        navigate("/admin");
      } else {
        navigate("/home");
      }
    } catch (err) {
      toast.error("Tên đăng nhập hoặc mật khẩu không đúng!");
    } finally {
      setLoading(false);
    }
  };

  // Đăng nhập Google: chỉ dùng Firebase Auth, không liên quan login thường
  const handleGoogleLogin = async () => {
    try {
      await auth.signOut();
      provider.setCustomParameters({ prompt: 'select_account' });
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
        const userRole = completeData.user?.role;
        if (userRole === 'admin') {
          navigate("/admin");
        } else {
          navigate("/home");
        }
      } else {
        authService.setAuthData(data);
        const userName = data.user?.fullName || data.user?.full_name || user.displayName;
        toast.success(`Đăng nhập Google thành công! Chào mừng ${userName}`);
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
    }
  };

  // Xử lý submit form thường
  const onFinish = useCallback((values) => {
    handleLogin(values);
  }, []);

  // Xử lý click button đăng nhập thường
  const handleLoginClick = useCallback(async () => {
    try {
      const values = await form.validateFields();
      handleLogin(values);
    } catch (error) {
      toast.error('Vui lòng nhập đầy đủ thông tin đăng nhập!');
    }
  }, [form]);

  // Ngăn reload trang khi submit form
  useEffect(() => {
    const preventFormSubmit = (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };
    document.addEventListener('submit', preventFormSubmit, true);
    return () => {
      document.removeEventListener('submit', preventFormSubmit, true);
    };
  }, []);

  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <motion.div 
        className="login-container"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <Row className="login-layout">
          <Col xs={0} sm={0} md={16} className="left-section">
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {/* Add your left section content here */}
            </motion.div>
          </Col>
          <Col xs={24} sm={24} md={8} className="right-section">
            <motion.div 
              className="login-card"
              variants={itemVariants}
            >
              <motion.p 
                className="title"
                variants={itemVariants}
              >
                Đăng Nhập
              </motion.p>
              <motion.img 
                src="/images/22.png" 
                alt="Logo 1" 
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              />

              <Form
                key="login-form"
                name="login"
                form={form}
                initialValues={{ remember: true }}
                className="login-form"
                onFinish={onFinish}
                layout="vertical"
                onFinishFailed={(errorInfo) => {
                  toast.error('Vui lòng nhập đầy đủ thông tin đăng nhập!');
                }}
                preserve={false}
                noValidate
                autoComplete="off"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleLoginClick();
                  }
                }}
              >
                <Row gutter={[8, 8]}>
                  <Col span={24}>
                    <motion.div variants={itemVariants}>
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
                    </motion.div>
                  </Col>

                  <Col span={24}>
                    <motion.div variants={itemVariants}>
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
                    </motion.div>
                  </Col>

                  <Col span={24}>
                    <motion.div 
                      variants={itemVariants}
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
                      <motion.a 
                        style={{ color: "#0D5B79" }}
                        whileHover={{ scale: 1.05 }}
                      >
                        Quên mật khẩu?
                      </motion.a>
                    </motion.div>
                  </Col>

                  <Col span={24}>
                    <motion.div variants={itemVariants}>
                      <Form.Item>
                        <Button
                          icon={<RiLoginCircleLine size={20} />}
                          className="login-button"
                          type="button"
                          onClick={handleLoginClick}
                          block
                          loading={loading}
                          disabled={loading}
                        >
                          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                        </Button>
                      </Form.Item>
                    </motion.div>
                  </Col>
                </Row>
                <Col span={24}>
                  <motion.div 
                    className="social-login-group"
                    variants={itemVariants}
                  >
                    <motion.button
                      className="social-btn google"
                      type="button"
                      onClick={handleGoogleLogin}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FcGoogle size={20} /> Đăng nhập với Google
                    </motion.button>
                  </motion.div>
                </Col>
                <p className="login-support">
                  Cần trợ giúp?{" "}
                  <a href="mailto:support@phygen.com">Liên hệ hỗ trợ</a>
                </p>
              </Form>
            </motion.div>
          </Col>
        </Row>
      </motion.div>
    </GoogleOAuthProvider>
  );
}

export default Login;

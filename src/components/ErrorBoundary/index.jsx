import React from 'react';
import { Result, Button } from 'antd';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="error"
          title="Oops! Có lỗi xảy ra"
          subTitle="Đã xảy ra lỗi không mong muốn. Vui lòng thử lại hoặc liên hệ hỗ trợ."
          extra={[
            <Button type="primary" key="retry" onClick={this.handleReset}>
              Thử lại
            </Button>,
            <Button key="home" onClick={() => window.location.href = '/'}>
              Về trang chủ
            </Button>
          ]}
        >
          {import.meta.env.DEV && (
            <div style={{ textAlign: 'left', marginTop: 16 }}>
              <details style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
                <summary>Chi tiết lỗi (Development mode)</summary>
                <p><strong>Error:</strong> {this.state.error && this.state.error.toString()}</p>
                <p><strong>Stack trace:</strong></p>
                <code>{this.state.errorInfo.componentStack}</code>
              </details>
            </div>
          )}
        </Result>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 
import React, { useState, useEffect } from 'react';
import { Button, Card, Typography } from 'antd';

const { Text, Paragraph } = Typography;

const DebugInfo = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking...');
  const [authInfo, setAuthInfo] = useState({});

  useEffect(() => {
    checkAPIStatus();
    loadAuthInfo();
  }, []);

  const checkAPIStatus = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
        (window.location.hostname === 'localhost' ? 'http://localhost:5298' : 'https://be-phygens-production.up.railway.app');
      
      const response = await fetch(`${API_BASE_URL}/health`);
      if (response.ok) {
        const data = await response.json();
        setApiStatus(`✅ OK - ${data.status}`);
      } else {
        setApiStatus(`❌ HTTP ${response.status}`);
      }
    } catch (error) {
      setApiStatus(`❌ Error: ${error.message}`);
    }
  };

  const loadAuthInfo = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    let tokenInfo = 'No token';
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiry = new Date(payload.exp * 1000);
        const isExpired = expiry < new Date();
        tokenInfo = `${isExpired ? '❌ Expired' : '✅ Valid'} - Expires: ${expiry.toLocaleString()}`;
      } catch {
        tokenInfo = '❌ Invalid token format';
      }
    }

    setAuthInfo({
      hasToken: !!token,
      hasUser: !!user,
      tokenInfo,
      userInfo: user ? JSON.parse(user) : null
    });
  };

  const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthInfo({ hasToken: false, hasUser: false, tokenInfo: 'Cleared', userInfo: null });
  };

  const testAPI = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
        (window.location.hostname === 'localhost' ? 'http://localhost:5298' : 'https://be-phygens-production.up.railway.app');
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      alert(`API Test Result:\nStatus: ${response.status}\nResponse: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      alert(`API Test Failed:\n${error.message}`);
    }
  };

  if (!isVisible) {
    return (
      <Button 
        onClick={() => setIsVisible(true)}
        style={{ 
          position: 'fixed', 
          top: 10, 
          right: 10, 
          zIndex: 9999,
          opacity: 0.7
        }}
        size="small"
        type="dashed"
      >
        🐛 Debug
      </Button>
    );
  }

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
    (window.location.hostname === 'localhost' ? 'http://localhost:5298' : 'https://be-phygens-production.up.railway.app');

  return (
    <Card
      title="🐛 Debug Information"
      extra={<Button onClick={() => setIsVisible(false)} size="small">✕</Button>}
      style={{
        position: 'fixed',
        top: 10,
        right: 10,
        width: 400,
        maxHeight: '80vh',
        overflow: 'auto',
        zIndex: 9999,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
      }}
      size="small"
    >
      <div style={{ fontSize: '12px' }}>
        <Paragraph strong>Environment:</Paragraph>
        <Text code>Hostname: {window.location.hostname}</Text><br/>
        <Text code>API URL: {API_BASE_URL}</Text><br/>
        <Text code>Env Var: {import.meta.env.VITE_API_BASE_URL || 'Not Set'}</Text><br/>
        
        <Paragraph strong style={{ marginTop: 16 }}>API Status:</Paragraph>
        <Text>{apiStatus}</Text><br/>
        <Button onClick={checkAPIStatus} size="small" style={{ marginTop: 4 }}>
          🔄 Refresh
        </Button>
        
        <Paragraph strong style={{ marginTop: 16 }}>Authentication:</Paragraph>
        <Text>Token: {authInfo.hasToken ? '✅ Present' : '❌ Missing'}</Text><br/>
        <Text>User: {authInfo.hasUser ? '✅ Present' : '❌ Missing'}</Text><br/>
        <Text>{authInfo.tokenInfo}</Text><br/>
        
        {authInfo.userInfo && (
          <>
            <Text code>User: {authInfo.userInfo.username}</Text><br/>
            <Text code>Role: {authInfo.userInfo.role}</Text><br/>
          </>
        )}
        
        <div style={{ marginTop: 8, display: 'flex', gap: 4 }}>
          <Button onClick={loadAuthInfo} size="small">🔄</Button>
          <Button onClick={clearAuth} size="small" danger>🗑️ Clear</Button>
          <Button onClick={testAPI} size="small" type="primary">🧪 Test API</Button>
        </div>
        
        <Paragraph strong style={{ marginTop: 16 }}>Quick Fixes:</Paragraph>
        <ul style={{ margin: 0, paddingLeft: 16 }}>
          <li>Clear localStorage và login lại</li>
          <li>Check Network tab trong DevTools</li>
          <li>Verify backend is running</li>
          <li>Check CORS config on backend</li>
        </ul>
      </div>
    </Card>
  );
};

export default DebugInfo; 
import React, { useState } from "react";
import { Card, Button, Typography, Space, Alert, Spin, Divider } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, ApiOutlined } from "@ant-design/icons";
import { 
  authService, 
  userService, 
  examService, 
  questionBankService, 
  analyticsService 
} from "../../../services";
import toast from "react-hot-toast";

const { Title, Text } = Typography;

const TestAPIPage = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testAPIs = [
    {
      name: "Auth Service",
      key: "auth",
      tests: [
        { name: "Verify Auth", fn: () => authService.verifyAuth() },
        { name: "Get Role", fn: () => authService.getRole() }
      ]
    },
    {
      name: "User Service", 
      key: "user",
      tests: [
        { name: "Get Profile", fn: () => userService.getProfile() },
        { name: "Get All Users", fn: () => userService.getAllUsers({ page: 1, pageSize: 5 }) }
      ]
    },
    {
      name: "Exam Service",
      key: "exam", 
      tests: [
        { name: "Get All Exams", fn: () => examService.getAllExams() },
        { name: "Get Statistics", fn: () => examService.getExamStatistics() }
      ]
    },
    {
      name: "Question Bank Service",
      key: "question",
      tests: [
        { name: "Get Chapters", fn: () => questionBankService.getChapters() },
        { name: "Test AI Connection", fn: () => questionBankService.testAIConnection() }
      ]
    },
    {
      name: "Analytics Service",
      key: "analytics",
              tests: [
          { name: "Get Dashboard", fn: () => analyticsService.getDashboard() },
          { name: "Get Chapter Analytics", fn: () => analyticsService.getChapterAnalytics() }
        ]
    }
  ];

  const runTest = async (serviceKey, testName, testFn) => {
    const testKey = `${serviceKey}-${testName}`;
    setTestResults(prev => ({
      ...prev,
      [testKey]: { status: 'loading', message: 'Testing...' }
    }));

    try {
      const result = await testFn();
      setTestResults(prev => ({
        ...prev,
        [testKey]: { 
          status: 'success', 
          message: 'Success',
          data: result
        }
      }));
      toast.success(`${testName} - Success`);
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [testKey]: { 
          status: 'error', 
          message: error.message || 'Error',
          error
        }
      }));
      toast.error(`${testName} - Error: ${error.message}`);
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    setTestResults({});
    
    for (const service of testAPIs) {
      for (const test of service.tests) {
        await runTest(service.key, test.name, test.fn);
        // Add small delay between tests
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    setLoading(false);
    toast.success('All tests completed!');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircleOutlined style={{ color: 'green' }} />;
      case 'error':
        return <CloseCircleOutlined style={{ color: 'red' }} />;
      case 'loading':
        return <Spin size="small" />;
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <ApiOutlined /> API Connection Test
      </Title>
      
      <Space style={{ marginBottom: '24px' }}>
        <Button 
          type="primary" 
          onClick={runAllTests}
          loading={loading}
        >
          Run All Tests
        </Button>
        <Button onClick={() => setTestResults({})}>
          Clear Results
        </Button>
      </Space>

      {testAPIs.map((service) => (
        <Card 
          key={service.key}
          title={service.name}
          style={{ marginBottom: '16px' }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            {service.tests.map((test) => {
              const testKey = `${service.key}-${test.name}`;
              const result = testResults[testKey];
              
              return (
                <div key={testKey} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>{test.name}</Text>
                  <Space>
                    {result && (
                      <>
                        {getStatusIcon(result.status)}
                        <Text type={result.status === 'error' ? 'danger' : 'secondary'}>
                          {result.message}
                        </Text>
                      </>
                    )}
                    <Button 
                      size="small"
                      onClick={() => runTest(service.key, test.name, test.fn)}
                    >
                      Test
                    </Button>
                  </Space>
                </div>
              );
            })}
          </Space>
        </Card>
      ))}

      <Divider />
      
      <Card title="Test Results Summary">
        {Object.keys(testResults).length === 0 ? (
          <Text type="secondary">No tests run yet</Text>
        ) : (
          <Space direction="vertical" style={{ width: '100%' }}>
            {Object.entries(testResults).map(([testKey, result]) => (
              <Alert
                key={testKey}
                message={testKey}
                description={
                  <div>
                    <Text>Status: {result.status}</Text><br/>
                    <Text>Message: {result.message}</Text>
                    {result.data && (
                      <div>
                        <Text>Data: </Text>
                        <pre style={{ fontSize: '12px', marginTop: '8px' }}>
                          {JSON.stringify(result.data, null, 2).substring(0, 200)}...
                        </pre>
                      </div>
                    )}
                  </div>
                }
                type={result.status === 'success' ? 'success' : result.status === 'error' ? 'error' : 'info'}
                style={{ marginBottom: '8px' }}
              />
            ))}
          </Space>
        )}
      </Card>

      {/* AI Services Tests */}
      <div className="test-section">
        <h3>🤖 AI Services</h3>
        
        <div className="test-row">
          <button 
            onClick={async () => {
              setTestResults(prev => ({ ...prev, aiConnection: { loading: true } }));
              try {
                const result = await questionBankService.testAIConnection();
                setTestResults(prev => ({ 
                  ...prev, 
                  aiConnection: { 
                    success: true, 
                    data: result,
                    message: 'AI Connection thành công!'
                  } 
                }));
              } catch (error) {
                setTestResults(prev => ({ 
                  ...prev, 
                  aiConnection: { 
                    success: false, 
                    error: error.message,
                    message: 'AI Connection failed!'
                  } 
                }));
              }
            }}
          >
            Test AI Connection
          </button>
          
          <div className="test-result">
            {testResults.aiConnection?.loading && <span>⏳ Testing...</span>}
            {testResults.aiConnection?.success && (
              <div>
                ✅ {testResults.aiConnection.message}
                <pre>{JSON.stringify(testResults.aiConnection.data, null, 2)}</pre>
              </div>
            )}
            {testResults.aiConnection?.error && (
              <span>❌ {testResults.aiConnection.error}</span>
            )}
          </div>
        </div>

        <div className="test-row">
                     <button 
             onClick={async () => {
               setTestResults(prev => ({ ...prev, aiGenerate: { loading: true } }));
               try {
                 // First get chapters to use real chapterId
                 const chaptersData = await questionBankService.getChapters();
                 const firstChapter = chaptersData && chaptersData.length > 0 ? chaptersData[0] : null;
                 
                 if (!firstChapter) {
                   throw new Error('Không có chương học nào để test');
                 }
                 
                 const questionData = {
                   chapterId: firstChapter.chapterId,
                   difficultyLevel: "medium",
                   questionType: "multiple_choice",
                   specificTopic: firstChapter.chapterName,
                   saveToDatabase: false
                 };
                 const result = await questionBankService.generateQuestion(questionData);
                 setTestResults(prev => ({ 
                   ...prev, 
                   aiGenerate: { 
                     success: true, 
                     data: result,
                     message: `AI Generate Question thành công cho ${firstChapter.chapterName}!`
                   } 
                 }));
               } catch (error) {
                 setTestResults(prev => ({ 
                   ...prev, 
                   aiGenerate: { 
                     success: false, 
                     error: error.message,
                     message: 'AI Generate failed!'
                   } 
                 }));
               }
             }}
          >
            Generate AI Question
          </button>
          
          <div className="test-result">
            {testResults.aiGenerate?.loading && <span>⏳ Generating...</span>}
            {testResults.aiGenerate?.success && (
              <div>
                ✅ {testResults.aiGenerate.message}
                <pre>{JSON.stringify(testResults.aiGenerate.data, null, 2)}</pre>
              </div>
            )}
            {testResults.aiGenerate?.error && (
              <span>❌ {testResults.aiGenerate.error}</span>
            )}
          </div>
        </div>

        <div className="test-row">
          <button 
            onClick={async () => {
              setTestResults(prev => ({ ...prev, aiChapters: { loading: true } }));
              try {
                const result = await questionBankService.getChapters();
                setTestResults(prev => ({ 
                  ...prev, 
                  aiChapters: { 
                    success: true, 
                    data: result,
                    message: `Loaded ${result?.length || 0} chapters`
                  } 
                }));
              } catch (error) {
                setTestResults(prev => ({ 
                  ...prev, 
                  aiChapters: { 
                    success: false, 
                    error: error.message,
                    message: 'Get Chapters failed!'
                  } 
                }));
              }
            }}
          >
            Get Chapters
          </button>
          
          <div className="test-result">
            {testResults.aiChapters?.loading && <span>⏳ Loading...</span>}
            {testResults.aiChapters?.success && (
              <div>
                ✅ {testResults.aiChapters.message}
                <pre>{JSON.stringify(testResults.aiChapters.data, null, 2)}</pre>
              </div>
            )}
            {testResults.aiChapters?.error && (
              <span>❌ {testResults.aiChapters.error}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestAPIPage; 
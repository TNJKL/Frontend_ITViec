import { CloseCircleOutlined, ReloadOutlined, HomeOutlined, CustomerServiceOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { Button, Card, Space, Typography, Alert, Divider } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";

const { Title, Text, Paragraph } = Typography;

const PaymentFailedPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const message = searchParams.get('message') || 'Thanh toán thất bại. Vui lòng thử lại.';

    return (
        <div style={{ 
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            padding: '40px 24px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <Card
                style={{
                    maxWidth: '600px',
                    width: '100%',
                    borderRadius: '16px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    textAlign: 'center'
                }}
            >
                <div style={{ marginBottom: '24px' }}>
                    <CloseCircleOutlined 
                        style={{ 
                            fontSize: '80px', 
                            color: '#ff4d4f'
                        }} 
                    />
                </div>

                <Title level={2} style={{ color: '#ff4d4f', marginBottom: '16px' }}>
                    Thanh toán thất bại
                </Title>

                <Paragraph style={{ fontSize: '16px', color: '#666', marginBottom: '32px' }}>
                    {message}
                </Paragraph>

                <Divider />

                <Alert
                    message="Lưu ý"
                    description={
                        <div style={{ textAlign: 'left', marginTop: '8px' }}>
                            <Text style={{ fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                                • Vui lòng kiểm tra lại thông tin thanh toán
                            </Text>
                            <Text style={{ fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                                • Đảm bảo tài khoản có đủ số dư
                            </Text>
                            <Text style={{ fontSize: '14px', display: 'block' }}>
                                • Nếu vấn đề vẫn tiếp tục, vui lòng liên hệ hỗ trợ
                            </Text>
                        </div>
                    }
                    type="warning"
                    icon={<ExclamationCircleOutlined />}
                    showIcon
                    style={{ marginBottom: '32px', textAlign: 'left' }}
                />

                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Button 
                        type="primary" 
                        size="large"
                        icon={<ReloadOutlined />}
                        onClick={() => navigate('/service-package')}
                        style={{
                            width: '100%',
                            height: '48px',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none'
                        }}
                    >
                        Thử lại thanh toán
                    </Button>
                    <Button 
                        size="large"
                        icon={<HomeOutlined />}
                        onClick={() => navigate('/')}
                        style={{
                            width: '100%',
                            height: '48px',
                            borderRadius: '8px',
                            fontSize: '16px'
                        }}
                    >
                        Về trang chủ
                    </Button>
                    <Button 
                        type="link"
                        icon={<CustomerServiceOutlined />}
                        onClick={() => {
                            // Có thể mở form liên hệ hoặc email
                            window.open('mailto:support@example.com?subject=Hỗ trợ thanh toán', '_blank');
                        }}
                        style={{
                            fontSize: '14px',
                            color: '#1890ff'
                        }}
                    >
                        Liên hệ hỗ trợ
                    </Button>
                </Space>
            </Card>
        </div>
    );
};

export default PaymentFailedPage;




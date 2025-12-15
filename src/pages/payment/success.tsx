import { CheckCircleOutlined, GiftOutlined, HomeOutlined } from "@ant-design/icons";
import { Button, Card, Space, Typography, Divider } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { callGetCurrentPackage } from "@/config/api";
import { IUserPackage } from "@/types/backend";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;

const PaymentSuccessPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const message = searchParams.get('message') || 'Thanh toán thành công!';
    const [currentPackage, setCurrentPackage] = useState<IUserPackage | null>(null);

    useEffect(() => {
        fetchCurrentPackage();
    }, []);

    const fetchCurrentPackage = async () => {
        try {
            const res = await callGetCurrentPackage();
            if (res && res.data) {
                setCurrentPackage(res.data);
            }
        } catch (error: any) {
            console.error('Error fetching current package:', error);
        }
    };

    const getRemainingDays = () => {
        if (!currentPackage) return 0;
        const endDate = dayjs(currentPackage.endDate);
        const now = dayjs();
        const diff = endDate.diff(now, 'day');
        return diff > 0 ? diff : 0;
    };

    return (
        <div style={{ 
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                    <CheckCircleOutlined 
                        style={{ 
                            fontSize: '80px', 
                            color: '#52c41a',
                            animation: 'pulse 2s infinite'
                        }} 
                    />
                    <style>{`
                        @keyframes pulse {
                            0%, 100% { transform: scale(1); }
                            50% { transform: scale(1.1); }
                        }
                    `}</style>
                </div>

                <Title level={2} style={{ color: '#52c41a', marginBottom: '16px' }}>
                    Thanh toán thành công!
                </Title>

                <Paragraph style={{ fontSize: '16px', color: '#666', marginBottom: '32px' }}>
                    {message}
                </Paragraph>

                {currentPackage && (
                    <>
                        <Divider />
                        <Card
                            style={{
                                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                                border: 'none',
                                marginBottom: '24px'
                            }}
                        >
                            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                <div>
                                    <Text strong style={{ fontSize: '14px', color: '#666' }}>
                                        Gói dịch vụ đã được kích hoạt
                                    </Text>
                                    <div style={{ marginTop: '8px' }}>
                                        <Text style={{ fontSize: '20px', fontWeight: 'bold', color: '#1890ff' }}>
                                            {typeof currentPackage.packageId === 'object' && currentPackage.packageId 
                                                ? (currentPackage.packageId as any).name 
                                                : 'Gói dịch vụ'}
                                        </Text>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '24px', marginTop: '16px' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                                            Thời hạn còn lại
                                        </Text>
                                        <Text strong style={{ fontSize: '24px', color: '#52c41a', display: 'block' }}>
                                            {getRemainingDays()} ngày
                                        </Text>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                                            Hết hạn vào
                                        </Text>
                                        <Text strong style={{ fontSize: '16px', display: 'block' }}>
                                            {dayjs(currentPackage.endDate).format('DD/MM/YYYY')}
                                        </Text>
                                    </div>
                                    {typeof currentPackage.packageId === 'object' && currentPackage.packageId && (
                                        <div style={{ textAlign: 'center' }}>
                                            <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                                                Số job đã dùng
                                            </Text>
                                            <Text strong style={{ fontSize: '16px', display: 'block' }}>
                                                {currentPackage.usedJobs} / {(currentPackage.packageId as any).maxJobs || '∞'}
                                            </Text>
                                        </div>
                                    )}
                                </div>
                            </Space>
                        </Card>
                    </>
                )}

                <Space size="middle" style={{ width: '100%', justifyContent: 'center' }}>
                    <Button 
                        type="primary" 
                        size="large"
                        icon={<GiftOutlined />}
                        onClick={() => navigate('/service-package')}
                        style={{
                            height: '48px',
                            padding: '0 32px',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: 'bold'
                        }}
                    >
                        Xem gói dịch vụ
                    </Button>
                    <Button 
                        size="large"
                        icon={<HomeOutlined />}
                        onClick={() => navigate('/')}
                        style={{
                            height: '48px',
                            padding: '0 32px',
                            borderRadius: '8px',
                            fontSize: '16px'
                        }}
                    >
                        Về trang chủ
                    </Button>
                </Space>
            </Card>
        </div>
    );
};

export default PaymentSuccessPage;




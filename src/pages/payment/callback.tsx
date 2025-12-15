import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { callVerifyPayment } from "@/config/api";
import { Result, Spin } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined } from "@ant-design/icons";

const PaymentCallbackPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                console.log('=== Payment Callback Page Loaded ===');
                console.log('Search params:', Array.from(searchParams.entries()));
                
                // Lấy tất cả query params từ VNPay
                const params: Record<string, string> = {};
                searchParams.forEach((value, key) => {
                    params[key] = value;
                });

                console.log('Calling backend API with params:', params);

                // Gọi backend để verify payment
                const res = await callVerifyPayment(params);
                
                console.log('Backend response:', res);
                
                // Axios interceptor return res.data, nên res đã là { statusCode, message, data: { success, message, data } }
                // TransformInterceptor wrap: { statusCode, message, data: { success, message, data } }
                if (res && res.data) {
                    const responseData = res.data; // res.data là { success, message, data }
                    console.log('Payment result:', responseData);
                    
                    setResult({
                        success: responseData.success || false,
                        message: responseData.message || 'Đang xử lý...'
                    });
                } else {
                    console.error('Invalid response format:', res);
                    setResult({
                        success: false,
                        message: 'Không thể xác minh thanh toán'
                    });
                }
            } catch (error: any) {
                console.error('Error verifying payment:', error);
                console.error('Error details:', {
                    message: error?.message,
                    response: error?.response,
                    status: error?.response?.status,
                    data: error?.response?.data
                });
                setResult({
                    success: false,
                    message: error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi xác minh thanh toán'
                });
            } finally {
                setLoading(false);
            }
        };

        verifyPayment();
    }, [searchParams]);

    useEffect(() => {
        if (!loading && result) {
            console.log('Redirecting to:', result.success ? 'success' : 'failed', 'with message:', result.message);
            // Redirect ngay lập tức
            if (result.success) {
                navigate('/payment/success?message=' + encodeURIComponent(result.message), { replace: true });
            } else {
                navigate('/payment/failed?message=' + encodeURIComponent(result.message), { replace: true });
            }
        }
    }, [loading, result, navigate]);

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '100vh',
                flexDirection: 'column',
                gap: '16px'
            }}>
                <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
                <p>Đang xác minh thanh toán...</p>
            </div>
        );
    }

    if (result) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '100vh',
                padding: '24px'
            }}>
                <Result
                    icon={result.success ? 
                        <CheckCircleOutlined style={{ color: '#52c41a' }} /> : 
                        <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                    }
                    title={result.success ? "Đang xử lý..." : "Đang xử lý..."}
                    subTitle={result.message}
                />
            </div>
        );
    }

    return null;
};

export default PaymentCallbackPage;


import { Button, Divider, Form, Input, message, notification, Card, Typography, Space } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { callLogin } from 'config/api';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUserLoginInfo } from '@/redux/slice/accountSlide';
import styles from 'styles/auth.module.scss';
import { useAppSelector } from '@/redux/hooks';
import Header from '@/components/client/header.client';
import Footer from '@/components/client/footer.client';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const LoginPage = () => {
    const navigate = useNavigate();
    const [isSubmit, setIsSubmit] = useState(false);
    const dispatch = useDispatch();
    const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);

    let location = useLocation();
    let params = new URLSearchParams(location.search);
    const callback = params?.get("callback");

    useEffect(() => {
        //đã login => redirect to '/'
        if (isAuthenticated) {
            // navigate('/');
            window.location.href = '/';
        }
    }, [])

    const onFinish = async (values: any) => {
        const { username, password } = values;
        setIsSubmit(true);
        const res = await callLogin(username, password);
        setIsSubmit(false);
        if (res?.data) {
            localStorage.setItem('access_token', res.data.access_token);
            dispatch(setUserLoginInfo(res.data.user))
            message.success('Đăng nhập tài khoản thành công!');
            
            // Kiểm tra role để redirect
            const userRole = res.data.user?.role?.name;
            const adminRoles = ['ADMIN', 'HR', 'EMPLOYER', 'SUPER_ADMIN'];
            
            // Nếu có callback thì ưu tiên callback, nếu không thì check role
            if (callback) {
                window.location.href = callback;
            } else if (userRole && adminRoles.includes(userRole)) {
                window.location.href = '/admin';
            } else {
                window.location.href = '/';
            }
        } else {
            notification.error({
                message: "Có lỗi xảy ra",
                description:
                    res.message && Array.isArray(res.message) ? res.message[0] : res.message,
                duration: 5
            })
        }
    };


    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f5f7fa' }}>
            <Header />
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
                <Card
                    style={{
                        width: '100%',
                        maxWidth: 480,
                        borderRadius: 12,
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #e8e8e8',
                    }}
                    bodyStyle={{ padding: '40px' }}
                >
                    <div style={{ textAlign: 'center', marginBottom: 32 }}>
                        <div style={{
                            width: 64,
                            height: 64,
                            borderRadius: '50%',
                            background: '#f0f0f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px',
                        }}>
                            <UserOutlined style={{ fontSize: 32, color: '#595959' }} />
                        </div>
                        <Title level={2} style={{ margin: 0, color: '#1a1a1a', fontWeight: 600 }}>
                            Đăng Nhập
                        </Title>
                        <Text type="secondary" style={{ fontSize: 14, marginTop: 8, display: 'block' }}>
                            Chào mừng bạn trở lại!
                        </Text>
                    </div>

                    <Form
                        name="login"
                        onFinish={onFinish}
                        autoComplete="off"
                        layout="vertical"
                        size="large"
                    >
                        <Form.Item
                            label={<Text strong>Email</Text>}
                            name="username"
                            rules={[
                                { required: true, message: 'Email không được để trống!' },
                                { type: 'email', message: 'Email không hợp lệ!' }
                            ]}
                        >
                            <Input
                                prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
                                placeholder="Nhập email của bạn"
                                style={{ borderRadius: 8, padding: '10px 15px' }}
                            />
                        </Form.Item>

                        <Form.Item
                            label={<Text strong>Mật khẩu</Text>}
                            name="password"
                            rules={[{ required: true, message: 'Mật khẩu không được để trống!' }]}
                        >
                            <Input.Password
                                prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                                placeholder="Nhập mật khẩu"
                                style={{ borderRadius: 8, padding: '10px 15px' }}
                            />
                        </Form.Item>

                        <Form.Item style={{ marginBottom: 16 }}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={isSubmit}
                                block
                                style={{
                                    height: 48,
                                    borderRadius: 8,
                                    fontSize: 16,
                                    fontWeight: 500,
                                }}
                            >
                                Đăng nhập
                            </Button>
                        </Form.Item>

                        <Divider style={{ margin: '24px 0' }}>
                            <Text type="secondary" style={{ fontSize: 13 }}>Hoặc</Text>
                        </Divider>

                        <div style={{ textAlign: 'center' }}>
                            <Text type="secondary" style={{ fontSize: 14 }}>
                                Chưa có tài khoản?{' '}
                                <Link
                                    to="/register"
                                    style={{
                                        color: '#1890ff',
                                        fontWeight: 500,
                                        textDecoration: 'none'
                                    }}
                                >
                                    Đăng ký ngay
                                </Link>
                            </Text>
                        </div>
                    </Form>
                </Card>
            </div>
            <Footer />
        </div>
    )
}

export default LoginPage;
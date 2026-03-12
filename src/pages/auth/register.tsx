import { Button, Divider, Form, Input, Row, Select, message, notification, Card, Typography } from 'antd';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { callSendRegisterOtp } from 'config/api';
import styles from 'styles/auth.module.scss';
import { IUser } from '@/types/backend';
import Header from '@/components/client/header.client';
import Footer from '@/components/client/footer.client';
import { UserOutlined, MailOutlined, LockOutlined, UserAddOutlined, PhoneOutlined, HomeOutlined, CalendarOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Title, Text } = Typography;

const RegisterPage = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm<IUser>();
    const [isSubmit, setIsSubmit] = useState(false);

    const onFinish = async (values: IUser) => {
        const { name, email, password, age, gender, address, phone } = values as any;
        setIsSubmit(true);
        const res = await callSendRegisterOtp(email);
        setIsSubmit(false);
        if (res?.data) {
            message.success('Đã gửi OTP, vui lòng kiểm tra email');
            navigate('/verify-otp', { state: { formData: { name, email, password, age: +age, gender, address, phone } } });
        } else {
            notification.error({
                message: "Gửi OTP thất bại",
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
                        maxWidth: 600,
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
                            <UserAddOutlined style={{ fontSize: 32, color: '#595959' }} />
                        </div>
                        <Title level={2} style={{ margin: 0, color: '#1a1a1a', fontWeight: 600 }}>
                            Đăng Ký Tài Khoản
                        </Title>
                        <Text type="secondary" style={{ fontSize: 14, marginTop: 8, display: 'block' }}>
                            Tạo tài khoản mới để bắt đầu
                        </Text>
                    </div>

                    <Form<IUser>
                        name="register"
                        form={form}
                        onFinish={onFinish}
                        autoComplete="off"
                        layout="vertical"
                        size="large"
                    >
                        <Row gutter={16}>
                            <Form.Item
                                label={<Text strong>Họ tên</Text>}
                                name="name"
                                rules={[{ required: true, message: 'Họ tên không được để trống!' }]}
                                style={{ flex: 1, minWidth: '100%' }}
                            >
                                <Input
                                    prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                                    placeholder="Nhập họ tên của bạn"
                                    style={{ borderRadius: 8 }}
                                />
                            </Form.Item>
                        </Row>

                        <Row gutter={16}>
                            <Form.Item
                                label={<Text strong>Email</Text>}
                                name="email"
                                rules={[
                                    { required: true, message: 'Email không được để trống!' },
                                    { type: 'email', message: 'Email không hợp lệ' }
                                ]}
                                style={{ flex: 1, minWidth: '100%' }}
                            >
                                <Input
                                    type='email'
                                    prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
                                    placeholder="Nhập email của bạn"
                                    style={{ borderRadius: 8 }}
                                />
                            </Form.Item>
                        </Row>

                        <Row gutter={16}>
                            <Form.Item
                                label={<Text strong>Mật khẩu</Text>}
                                name="password"
                                rules={[{ required: true, message: 'Mật khẩu không được để trống!' }]}
                                style={{ flex: 1, minWidth: '100%' }}
                            >
                                <Input.Password
                                    prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                                    placeholder="Nhập mật khẩu"
                                    style={{ borderRadius: 8 }}
                                />
                            </Form.Item>
                        </Row>

                        <Row gutter={16}>
                            <Form.Item
                                label={<Text strong>Tuổi</Text>}
                                name="age"
                                rules={[{ required: true, message: 'Tuổi không được để trống!' }]}
                                style={{ flex: 1, minWidth: 'calc(50% - 8px)' }}
                            >
                                <Input
                                    type='number'
                                    prefix={<CalendarOutlined style={{ color: '#bfbfbf' }} />}
                                    placeholder="Nhập tuổi"
                                    style={{ borderRadius: 8 }}
                                />
                            </Form.Item>

                            <Form.Item
                                name="gender"
                                label={<Text strong>Giới tính</Text>}
                                rules={[{ required: true, message: 'Giới tính không được để trống!' }]}
                                style={{ flex: 1, minWidth: 'calc(50% - 8px)' }}
                            >
                                <Select
                                    placeholder="Chọn giới tính"
                                    allowClear
                                    style={{ borderRadius: 8 }}
                                >
                                    <Option value="male">Nam</Option>
                                    <Option value="female">Nữ</Option>
                                    <Option value="other">Khác</Option>
                                </Select>
                            </Form.Item>
                        </Row>

                        <Row gutter={16}>
                            <Form.Item
                                label={<Text strong>Địa chỉ</Text>}
                                name="address"
                                rules={[{ required: true, message: 'Địa chỉ không được để trống!' }]}
                                style={{ flex: 1, minWidth: '100%' }}
                            >
                                <Input
                                    prefix={<HomeOutlined style={{ color: '#bfbfbf' }} />}
                                    placeholder="Nhập địa chỉ của bạn"
                                    style={{ borderRadius: 8 }}
                                />
                            </Form.Item>
                        </Row>

                        <Row gutter={16}>
                            <Form.Item
                                label={<Text strong>Số điện thoại</Text>}
                                name="phone"
                                rules={[{ required: true, message: 'Số điện thoại không được để trống!' }]}
                                style={{ flex: 1, minWidth: '100%' }}
                            >
                                <Input
                                    prefix={<PhoneOutlined style={{ color: '#bfbfbf' }} />}
                                    placeholder="Nhập số điện thoại"
                                    style={{ borderRadius: 8 }}
                                />
                            </Form.Item>
                        </Row>

                        <Form.Item style={{ marginBottom: 16, marginTop: 8 }}>
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
                                Đăng ký
                            </Button>
                        </Form.Item>

                        <Divider style={{ margin: '24px 0' }}>
                            <Text type="secondary" style={{ fontSize: 13 }}>Hoặc</Text>
                        </Divider>

                        <div style={{ textAlign: 'center' }}>
                            <Text type="secondary" style={{ fontSize: 14 }}>
                                Đã có tài khoản?{' '}
                                <Link
                                    to="/login"
                                    style={{
                                        color: '#1890ff',
                                        fontWeight: 500,
                                        textDecoration: 'none'
                                    }}
                                >
                                    Đăng nhập ngay
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

export default RegisterPage;
import { Button, Form, Input, Typography, message, notification, Row, Col, Space, Card } from 'antd';
import styles from 'styles/auth.module.scss';
import { callCreateEmployerApplication } from 'config/api';
import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/client/header.client';
import Footer from '@/components/client/footer.client';

const EmployerRegisterPage = () => {
    const [form] = Form.useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const formRef = useRef<HTMLDivElement>(null);

    const onFinish = async (values: any) => {
        setIsSubmitting(true);
        const res = await callCreateEmployerApplication(values);
        setIsSubmitting(false);
        if (res?.data?._id) {
            message.success('Cảm ơn bạn đã đăng ký. Vui lòng chờ nhân viên liên hệ và duyệt.');
            form.resetFields();
            navigate('/login');
        } else {
            notification.error({
                message: 'Đăng ký thất bại',
                description: res?.message && Array.isArray(res.message) ? res.message[0] : res?.message,
                duration: 5,
            });
        }
    };

    const scrollToForm = () => {
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
            <Header />
            <main className={styles.main} style={{ paddingBottom: 80 }}>
                <div className={styles.container} style={{ maxWidth: 1180, margin: '0 auto' }}>
                    <section style={{ display: 'flex', alignItems: 'center', gap: 32, padding: '48px 0', justifyContent: 'center' }}>
                        <div style={{ flex: 1, maxWidth: 520 }}>
                            <Typography.Title level={2} style={{ marginBottom: 12, color: '#0f172a', fontWeight: 700 }}>
                                Tuyển dụng nhân tài IT cùng ITViec
                            </Typography.Title>
                            <Typography.Paragraph style={{ color: '#475569', fontSize: 16, marginBottom: 0 }}>
                                Gửi thông tin, chúng tôi sẽ liên hệ xác minh và duyệt tài khoản nhà tuyển dụng của bạn.
                            </Typography.Paragraph>
                            <Space size="middle" style={{ marginTop: 20 }}>
                                <Button type="primary" size="large" onClick={scrollToForm} style={{ borderRadius: 10, padding: '10px 18px', boxShadow: '0 8px 18px rgba(59,130,246,0.25)' }}>
                                    Liên hệ ngay
                                </Button>
                                <Link to="/login" style={{ color: '#0f172a', fontWeight: 600 }}>Đã có tài khoản? Đăng nhập</Link>
                            </Space>
                        </div>
                        <div style={{
                            flex: 1,
                            maxWidth: 520,
                            background: '#fff',
                            borderRadius: 18,
                            padding: 24,
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 16px 40px rgba(15,23,42,0.08)'
                        }}>
                            <Typography.Title level={4} style={{ color: '#0f172a', fontWeight: 700 }}>Bạn nhận được gì?</Typography.Title>
                            <ul style={{ color: '#475569', lineHeight: 1.7, paddingLeft: 18, marginBottom: 0, fontSize: 15 }}>
                                <li>Tiếp cận cộng đồng ứng viên IT chất lượng.</li>
                                <li>Đăng tin và quản lý ứng viên thuận tiện.</li>
                                <li>Được hỗ trợ bởi đội ngũ ITViec khi có nhu cầu.</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section minh họa stats/clients - placeholder đơn giản, dễ kéo dài trang */}
                    <section style={{ padding: '24px 0 8px' }}>
                        <Row gutter={[16, 16]}>
                            <Col xs={24} md={8}>
                                <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 10px 24px rgba(0,0,0,0.05)' }}>
                                    <Typography.Title level={3} style={{ margin: 0, color: '#e11d48' }}>10,000+</Typography.Title>
                                    <Typography.Text> Công ty và doanh nghiệp IT</Typography.Text>
                                </Card>
                            </Col>
                            <Col xs={24} md={8}>
                                <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 10px 24px rgba(0,0,0,0.05)' }}>
                                    <Typography.Title level={3} style={{ margin: 0, color: '#e11d48' }}>1,500,000+</Typography.Title>
                                    <Typography.Text> Hồ sơ đã gửi đến nhà tuyển dụng</Typography.Text>
                                </Card>
                            </Col>
                            <Col xs={24} md={8}>
                                <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 10px 24px rgba(0,0,0,0.05)' }}>
                                    <Typography.Title level={3} style={{ margin: 0, color: '#e11d48' }}>300,000+</Typography.Title>
                                    <Typography.Text> Ứng viên kinh nghiệm cao</Typography.Text>
                                </Card>
                            </Col>
                        </Row>
                    </section>

                    {/* Logos / đối tác */}
                    <section style={{ padding: '32px 0 8px' }}>
                        <Typography.Title level={3} style={{ textAlign: 'center', marginBottom: 24, color: '#0f172a' }}>
                            Top công ty tin tưởng ITViec
                        </Typography.Title>
                        <Row gutter={[16, 16]} justify="center" style={{ maxWidth: 1100, margin: '0 auto' }}>
                            {[
                                { name: 'MB', logo: 'https://rubicmarketing.com/wp-content/uploads/2022/11/y-nghia-logo-mb-bank-2.jpg' },
                                { name: 'Viettel', logo: 'https://irace-web.s3.ap-southeast-1.amazonaws.com/photos/organizers/2023/12/16/organizers-viettel-logo.png?v=161713' },
                                { name: 'NAB', logo: 'https://itviec.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6NDk4MDUwMCwicHVyIjoiYmxvYl9pZCJ9fQ==--c78186bcdc3fae39ab518a50cfe1a72106d977dc/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJwbmciLCJyZXNpemVfdG9fbGltaXQiOlszMDAsMzAwXX0sInB1ciI6InZhcmlhdGlvbiJ9fQ==--e1d036817a0840c585f202e70291f5cdd058753d/NAB_Logo_RGB_1x1.png' },
                                { name: 'Capgemini', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-1cHhOYwqxby785goiV_2eN1VdTw5tkY8lw&s' },
                                { name: 'VNG', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSALu_tTSdYer51Y0P6JG2xboAmKTFVEty8nQ&s' },
                                { name: 'OneMount', logo: 'https://careers.onemount.com/img/MyOneMount_CareerPortal.LOGOONEU.png?pZcyBkXIIT_AXwCRk2dQ0A' },
                                { name: 'Bosch', logo: 'https://logos-world.net/wp-content/uploads/2020/08/Bosch-Logo.png' },
                                { name: 'MoneyForward', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfLPgX8BX5JunDXzzIzJbrGZa769kAMETvCw&s' },
                                { name: 'GHTK', logo: 'https://static.ybox.vn/2024/6/6/1719053009916-1660704583032-Logo-2.png' },
                            ].map((c) => (
                                <Col key={c.name} xs={12} sm={8} md={6} lg={4}>
                                    <Card
                                        hoverable
                                        bordered
                                        style={{ textAlign: 'center', borderRadius: 12, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        bodyStyle={{ padding: 12 }}
                                    >
                                        <img src={c.logo} alt={c.name} style={{ maxWidth: '100%', maxHeight: 60, objectFit: 'contain' }} />
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </section>

                    {/* Testimonials */}
                    <section style={{ padding: '32px 0' }}>
                        <Typography.Title level={3} style={{ textAlign: 'center', marginBottom: 24, color: '#0f172a' }}>
                            Khách hàng nói gì về ITViec
                        </Typography.Title>
                        <Row gutter={[16, 16]}>
                            <Col xs={24} md={12}>
                                <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 10px 24px rgba(0,0,0,0.05)' }}>
                                    <Typography.Paragraph style={{ color: '#334155' }}>
                                        “Chúng tôi tuyển được nhiều ứng viên IT chất lượng cao trên ITViec. Đội ngũ hỗ trợ nhanh chóng và chuyên nghiệp.”
                                    </Typography.Paragraph>
                                    <Typography.Text strong>Ms. Đoàn Ái Nương</Typography.Text><br />
                                    <Typography.Text type="secondary">HR Manager | BBV Vietnam</Typography.Text>
                                </Card>
                            </Col>
                            <Col xs={24} md={12}>
                                <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 10px 24px rgba(0,0,0,0.05)' }}>
                                    <Typography.Paragraph style={{ color: '#334155' }}>
                                        “ITViec giúp chúng tôi tiếp cận nhanh nguồn ứng viên IT phù hợp, rút ngắn thời gian tuyển dụng.”
                                    </Typography.Paragraph>
                                    <Typography.Text strong>Ms. Ánh Trinh</Typography.Text><br />
                                    <Typography.Text type="secondary">Talent Acquisition Lead | DEK Technologies</Typography.Text>
                                </Card>
                            </Col>
                        </Row>
                    </section>

                    <section ref={formRef} className={styles.container} style={{ maxWidth: 800, padding: '32px 0', margin: '0 auto' }}>
                        <div className={styles.wrapper} style={{ maxWidth: '100%', padding: 32, borderRadius: 16, background: '#fff', boxShadow: '0 12px 30px rgba(15,23,42,0.08)', border: '1px solid #e2e8f0', margin: '0 auto' }}>
                            <div className={styles.heading} style={{ textAlign: 'center', marginBottom: 12 }}>
                                <h2 className={`${styles.text} ${styles["text-large"]}`} style={{ color: '#0f172a' }}>Đăng ký Nhà tuyển dụng</h2>
                                <Typography.Text type="secondary">
                                    Thông tin sẽ được kiểm duyệt trước khi kích hoạt tài khoản.
                                </Typography.Text>
                            </div>
                            <Form
                                form={form}
                                layout="vertical"
                                onFinish={onFinish}
                                autoComplete="off"
                            >
                                <Row gutter={16}>
                                    <Col xs={24} md={12}>
                                        <Form.Item label="Họ tên" name="name" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
                                            <Input placeholder="Họ tên người liên hệ" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item label="Số điện thoại" name="phone" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
                                            <Input placeholder="Số điện thoại" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={16}>
                                    <Col xs={24} md={12}>
                                        <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Vui lòng nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]}>
                                            <Input placeholder="Email" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item label="Tên công ty" name="companyName" rules={[{ required: true, message: 'Vui lòng nhập tên công ty' }]}>
                                            <Input placeholder="Tên công ty" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Form.Item label="Địa chỉ công ty" name="companyAddress" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ công ty' }]}>
                                    <Input placeholder="Địa chỉ công ty" />
                                </Form.Item>
                                <Form.Item label="Địa chỉ website" name="website" rules={[{ type: 'url', message: 'URL không hợp lệ (vd: https://example.com)' }]}>
                                    <Input placeholder="https://example.com" />
                                </Form.Item>
                                <Form.Item>
                                    <Button type="primary" htmlType="submit" loading={isSubmitting} block>
                                        Gửi đăng ký
                                    </Button>
                                </Form.Item>
                                <Typography.Paragraph type="secondary" style={{ fontSize: 12, textAlign: 'center', margin: 0 }}>
                                    Sau khi duyệt, bạn sẽ nhận email chứa mật khẩu tạm để đăng nhập và đổi mật khẩu.
                                </Typography.Paragraph>
                            </Form>
                        </div>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default EmployerRegisterPage;


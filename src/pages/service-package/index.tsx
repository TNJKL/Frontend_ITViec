import { callCreatePayment, callFetchActiveServicePackages, callGetActiveUserPackages, callGetCurrentPackage } from "@/config/api";
import { IServicePackage, IUserActivePackage, IUserPackage } from "@/types/backend";
import { getJobTagStyle } from "@/config/utils";
import { CheckCircleOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { Button, Card, Col, Row, Tag, notification, Spin, Alert, Statistic, Space, Divider } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const ServicePackagePage = () => {
    const [packages, setPackages] = useState<IServicePackage[]>([]);
    const [currentPackage, setCurrentPackage] = useState<IUserPackage | null>(null);
    const [activePackages, setActivePackages] = useState<IUserActivePackage[]>([]);
    const [historyPackages, setHistoryPackages] = useState<IUserActivePackage[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [purchasing, setPurchasing] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchPackages();
        fetchCurrentPackage();
        fetchActivePackages();
    }, []);

    const fetchPackages = async () => {
        setLoading(true);
        try {
            const res = await callFetchActiveServicePackages();
            if (res && res.data) {
                setPackages(res.data);
            }
        } catch (error: any) {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: error?.message || 'Không thể tải danh sách gói dịch vụ'
            });
        } finally {
            setLoading(false);
        }
    };

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

    const fetchActivePackages = async () => {
        try {
            const res = await callGetActiveUserPackages();
            if (res && res.data) {
                setActivePackages(res.data.active || []);
                setHistoryPackages(res.data.history || []);
            }
        } catch (error: any) {
            console.error('Error fetching active packages:', error);
        }
    };

    const handlePurchase = async (packageId: string) => {
        setPurchasing(packageId);
        try {
            const res = await callCreatePayment(packageId);
            if (res && res.data?.paymentUrl) {
                // Redirect đến VNPay
                window.location.href = res.data.paymentUrl;
            } else {
                throw new Error(res?.message || 'Không thể tạo URL thanh toán');
            }
        } catch (error: any) {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: error?.message || 'Không thể tạo thanh toán'
            });
            setPurchasing(null);
        }
    };

    const getPackageNameColor = (name: string) => {
        switch (name.toLowerCase()) {
            case 'basic':
                return 'default';
            case 'pro':
                return 'blue';
            case 'premium':
                return 'gold';
            default:
                return 'default';
        }
    };

    const getServicePackageInfo = (pkg?: IUserPackage | IUserActivePackage | null) => {
        if (!pkg) return undefined;
        if (typeof pkg.packageId === 'object' && pkg.packageId !== null) {
            return pkg.packageId as IServicePackage;
        }
        return packages.find(p => p._id === pkg.packageId);
    };

    const isPackageActive = (pkg: IServicePackage) => {
        const match = activePackages.find(activePkg => {
            const packageId = typeof activePkg.packageId === 'object'
                ? activePkg.packageId._id
                : activePkg.packageId;
            return packageId === pkg._id && activePkg.isActive && new Date(activePkg.endDate) > new Date();
        });
        return Boolean(match);
    };

    const getPriorityTag = (pkg: IServicePackage) => {
        const match = activePackages.find(activePkg => {
            const packageId = typeof activePkg.packageId === 'object'
                ? activePkg.packageId._id
                : activePkg.packageId;
            return packageId === pkg._id;
        });
        if (!match) return null;
        const isPrimary = match.priority === 1;
        return (
            <Tag color={isPrimary ? "success" : "geekblue"} style={{ marginLeft: '8px' }}>
                {isPrimary ? 'Đang sử dụng' : `Ưu tiên #${match.priority}`}
            </Tag>
        );
    };

    const getRemainingDays = () => {
        if (!currentPackage) return 0;
        const endDate = new Date(currentPackage.endDate);
        const now = new Date();
        const diff = endDate.getTime() - now.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    const getUsedJobsInfo = () => {
        if (!currentPackage) return { used: 0, max: 0 };
        const packageData = typeof currentPackage.packageId === 'object' 
            ? currentPackage.packageId 
            : packages.find(p => p._id === currentPackage.packageId);
        return {
            used: currentPackage.usedJobs,
            max: packageData?.maxJobs || 0
        };
    };

    const renderSupportedTags = (tags?: string[]) => {
        const displayTags = tags && tags.length ? tags : ['New'];
        return (
            <div style={{ 
                marginTop: 8, 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 8,
                alignItems: 'center'
            }}>
                {displayTags.map((tag) => {
                    const style = getJobTagStyle(tag);
                    return (
                        <Tag
                            key={tag}
                            style={{ 
                                background: style.background,
                                color: style.color,
                                border: `1px solid ${style.color}`,
                                fontWeight: 600,
                                fontSize: '13px',
                                padding: '4px 12px',
                                borderRadius: '12px',
                                margin: 0,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {tag}
                        </Tag>
                    );
                })}
            </div>
        );
    };

    return (
        <div style={{ 
            padding: '32px 24px', 
            maxWidth: '1400px', 
            margin: '0 auto',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            minHeight: '100vh'
        }}>
            <div style={{ 
                textAlign: 'center', 
                marginBottom: '40px',
                padding: '24px',
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
                <h1 style={{ 
                    fontSize: '32px', 
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                }}>
                    Gói Dịch Vụ Đăng Tin Tuyển Dụng
                </h1>
                <p style={{ color: '#666', fontSize: '16px', margin: 0 }}>
                    Chọn gói dịch vụ phù hợp để đăng tin tuyển dụng hiệu quả
                </p>
            </div>

            {currentPackage && (
                <Card
                    style={{ 
                        marginBottom: '32px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        borderRadius: '16px',
                        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)'
                    }}
                    bodyStyle={{ padding: '24px' }}
                >
                    <div style={{ color: 'white' }}>
                        <div style={{ 
                            fontSize: '20px', 
                            fontWeight: 'bold', 
                            marginBottom: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <CheckCircleOutlined style={{ fontSize: '24px' }} />
                            Gói dịch vụ hiện tại: <span style={{ textTransform: 'uppercase' }}>{getServicePackageInfo(currentPackage)?.name || 'N/A'}</span>
                        </div>
                        <Row gutter={24}>
                            <Col span={8}>
                                <Statistic 
                                    title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Thời hạn còn lại</span>}
                                    value={getRemainingDays()} 
                                    suffix={<span style={{ color: 'rgba(255,255,255,0.9)' }}>ngày</span>}
                                    valueStyle={{ color: '#fff', fontSize: '28px', fontWeight: 'bold' }}
                                />
                            </Col>
                            <Col span={8}>
                                <Statistic 
                                    title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Job đã đăng</span>}
                                    value={getUsedJobsInfo().used} 
                                    suffix={<span style={{ color: 'rgba(255,255,255,0.9)' }}>/ {getUsedJobsInfo().max}</span>}
                                    valueStyle={{ color: '#fff', fontSize: '28px', fontWeight: 'bold' }}
                                />
                            </Col>
                            <Col span={8}>
                                <Statistic 
                                    title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Ngày hết hạn</span>}
                                    value={dayjs(currentPackage.endDate).format('DD/MM/YYYY')}
                                    valueStyle={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}
                                />
                            </Col>
                        </Row>
                    </div>
                </Card>
            )}

            {activePackages.length > 0 && (
                <Card
                    title={
                        <span style={{ fontSize: '20px', fontWeight: 'bold' }}>
                            Các gói đang sở hữu
                        </span>
                    }
                    style={{ 
                        marginBottom: '32px',
                        borderRadius: '16px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    bordered={false}
                >
                    <div style={{
                        maxHeight: '500px',
                        overflowY: 'auto',
                        paddingRight: '8px'
                    }}>
                        <style>
                            {`
                                div::-webkit-scrollbar {
                                    width: 8px;
                                }
                                div::-webkit-scrollbar-track {
                                    background: #f1f1f1;
                                    border-radius: 10px;
                                }
                                div::-webkit-scrollbar-thumb {
                                    background: #888;
                                    border-radius: 10px;
                                }
                                div::-webkit-scrollbar-thumb:hover {
                                    background: #555;
                                }
                            `}
                        </style>
                        <Row gutter={[16, 16]}>
                            {activePackages.map((userPackage) => {
                                const serviceInfo = getServicePackageInfo(userPackage);
                                if (!serviceInfo) return null;
                                const stats = userPackage.stats;
                                const supportedTags = stats?.supportedTags?.length
                                    ? stats.supportedTags
                                    : serviceInfo.supportedTags;
                                return (
                                    <Col xs={24} md={12} lg={8} key={userPackage._id}>
                                        <Card
                                            size="small"
                                            bordered
                                            style={{
                                                height: '100%',
                                                borderColor: userPackage.priority === 1 ? '#1890ff' : '#d9d9d9',
                                                borderWidth: userPackage.priority === 1 ? '2px' : '1px',
                                                borderRadius: '12px',
                                                transition: 'all 0.3s',
                                                boxShadow: userPackage.priority === 1 ? '0 4px 12px rgba(24, 144, 255, 0.2)' : '0 2px 8px rgba(0,0,0,0.1)'
                                            }}
                                            hoverable
                                        >
                                            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                    <Tag 
                                                        color={getPackageNameColor(serviceInfo.name)}
                                                        style={{ fontSize: '14px', padding: '4px 12px', fontWeight: 600 }}
                                                    >
                                                        {serviceInfo.name}
                                                    </Tag>
                                                    <Tag 
                                                        color={userPackage.priority === 1 ? 'success' : 'geekblue'}
                                                        style={{ fontSize: '13px', padding: '4px 10px', fontWeight: 600 }}
                                                    >
                                                        Ưu tiên #{userPackage.priority}
                                                    </Tag>
                                                </div>
                                                <Divider style={{ margin: '12px 0' }} />
                                                <Row gutter={12}>
                                                    <Col span={12}>
                                                        <Statistic
                                                            title="Ngày còn lại"
                                                            value={stats?.remainingDays ?? Math.max(dayjs(userPackage.endDate).diff(dayjs(), 'day'), 0)}
                                                            suffix="ngày"
                                                            valueStyle={{ fontSize: '18px', fontWeight: 'bold' }}
                                                        />
                                                    </Col>
                                                    <Col span={12}>
                                                        <Statistic
                                                            title="Lượt còn lại"
                                                            value={stats?.remainingJobs ?? Math.max(
                                                                (serviceInfo.maxJobs || 0) - (userPackage.usedJobs || 0),
                                                                0
                                                            )}
                                                            suffix={`/ ${stats?.maxJobs ?? serviceInfo.maxJobs}`}
                                                            valueStyle={{ fontSize: '18px', fontWeight: 'bold' }}
                                                        />
                                                    </Col>
                                                </Row>
                                                <Divider style={{ margin: '12px 0' }} />
                                                <div>
                                                    <strong style={{ fontSize: '14px', color: '#333' }}>Tag hỗ trợ:</strong>
                                                    {renderSupportedTags(supportedTags)}
                                                </div>
                                                <Divider style={{ margin: '12px 0' }} />
                                                <div style={{ fontSize: '13px', color: '#666' }}>
                                                    <div style={{ marginBottom: '4px' }}>
                                                        <strong>Ngày bắt đầu:</strong> {dayjs(userPackage.startDate).format('DD/MM/YYYY')}
                                                    </div>
                                                    <div>
                                                        <strong>Ngày hết hạn:</strong> {dayjs(userPackage.endDate).format('DD/MM/YYYY')}
                                                    </div>
                                                </div>
                                            </Space>
                                        </Card>
                                    </Col>
                                );
                            })}
                        </Row>
                    </div>
                </Card>
            )}

            {historyPackages.length > 0 && (
                <Card
                    title={
                        <span style={{ fontSize: '20px', fontWeight: 'bold' }}>
                            Lịch sử gói đã mua
                        </span>
                    }
                    style={{ 
                        marginBottom: '32px',
                        borderRadius: '16px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    bordered={false}
                >
                    <div style={{
                        maxHeight: '500px',
                        overflowY: 'auto',
                        paddingRight: '8px'
                    }}>
                        <Row gutter={[16, 16]}>
                            {historyPackages.map((userPackage) => {
                                const serviceInfo = getServicePackageInfo(userPackage);
                                if (!serviceInfo) return null;
                                const stats = userPackage.stats;
                                const remainingDays = Math.max(stats?.remainingDays ?? 0, 0);
                                const remainingJobs = Math.max(stats?.remainingJobs ?? 0, 0);
                                const usedJobs = (stats?.maxJobs ?? serviceInfo.maxJobs ?? 0) - remainingJobs;
                                const supportedTags = stats?.supportedTags?.length
                                    ? stats.supportedTags
                                    : serviceInfo.supportedTags;
                                return (
                                    <Col xs={24} md={12} lg={8} key={`history-${userPackage._id}`}>
                                        <Card
                                            size="small"
                                            bordered
                                            style={{ 
                                                opacity: 0.85,
                                                borderRadius: '12px',
                                                borderColor: '#d9d9d9',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                                            }}
                                        >
                                            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                    <Tag 
                                                        color={getPackageNameColor(serviceInfo.name)}
                                                        style={{ fontSize: '14px', padding: '4px 12px', fontWeight: 600 }}
                                                    >
                                                        {serviceInfo.name}
                                                    </Tag>
                                                    <Tag 
                                                        color="default" 
                                                        style={{ fontSize: '13px', padding: '4px 10px', fontWeight: 600 }}
                                                    >
                                                        Đã dùng
                                                    </Tag>
                                                </div>
                                                <Divider style={{ margin: '12px 0' }} />
                                                <Row gutter={12}>
                                                    <Col span={12}>
                                                        <Statistic
                                                            title="Ngày còn lại"
                                                            value={remainingDays}
                                                            suffix="ngày"
                                                            valueStyle={{ fontSize: '18px', fontWeight: 'bold' }}
                                                        />
                                                    </Col>
                                                    <Col span={12}>
                                                        <Statistic
                                                            title={remainingJobs > 0 ? 'Lượt còn lại' : 'Lượt đã dùng'}
                                                            value={remainingJobs > 0 ? remainingJobs : usedJobs}
                                                            suffix={`/ ${stats?.maxJobs ?? serviceInfo.maxJobs}`}
                                                            valueStyle={{ fontSize: '18px', fontWeight: 'bold' }}
                                                        />
                                                    </Col>
                                                </Row>
                                                <Divider style={{ margin: '12px 0' }} />
                                                <div>
                                                    <strong style={{ fontSize: '14px', color: '#333' }}>Tag hỗ trợ:</strong>
                                                    {renderSupportedTags(supportedTags)}
                                                </div>
                                                <Divider style={{ margin: '12px 0' }} />
                                                <div style={{ fontSize: '13px', color: '#666' }}>
                                                    <div style={{ marginBottom: '4px' }}>
                                                        <strong>Ngày bắt đầu:</strong> {dayjs(userPackage.startDate).format('DD/MM/YYYY')}
                                                    </div>
                                                    <div>
                                                        <strong>Ngày kết thúc:</strong> {dayjs(userPackage.endDate).format('DD/MM/YYYY')}
                                                    </div>
                                                </div>
                                            </Space>
                                        </Card>
                                    </Col>
                                );
                            })}
                        </Row>
                    </div>
                </Card>
            )}

            <Card
                title={
                    <span style={{ fontSize: '20px', fontWeight: 'bold' }}>
                        Danh sách gói dịch vụ
                    </span>
                }
                style={{ 
                    borderRadius: '16px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
                bordered={false}
            >
                <Spin spinning={loading}>
                    <Row gutter={[24, 24]}>
                        {packages.map((pkg) => {
                            const isActive = isPackageActive(pkg);
                            return (
                                <Col xs={24} sm={24} md={12} lg={8} key={pkg._id}>
                                    <Card
                                        hoverable
                                        style={{
                                            height: '100%',
                                            border: isActive ? '2px solid #1890ff' : '1px solid #d9d9d9',
                                            borderRadius: '16px',
                                            position: 'relative',
                                            transition: 'all 0.3s',
                                            boxShadow: isActive ? '0 8px 24px rgba(24, 144, 255, 0.2)' : '0 4px 12px rgba(0,0,0,0.1)'
                                        }}
                                        bodyStyle={{ padding: '24px' }}
                                        title={
                                            <div style={{ textAlign: 'center' }}>
                                                <Tag 
                                                    color={getPackageNameColor(pkg.name)} 
                                                    style={{ 
                                                        fontSize: '18px', 
                                                        padding: '6px 16px',
                                                        fontWeight: 'bold',
                                                        borderRadius: '8px'
                                                    }}
                                                >
                                                    {pkg.name}
                                                </Tag>
                                                {getPriorityTag(pkg)}
                                            </div>
                                        }
                                    >
                                        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                                            <div style={{ 
                                                fontSize: '36px', 
                                                fontWeight: 'bold', 
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                                backgroundClip: 'text'
                                            }}>
                                                {pkg.price === 0 ? 'Miễn phí' : `${new Intl.NumberFormat('vi-VN').format(pkg.price)} đ`}
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '24px' }}>
                                            <div style={{ marginBottom: '14px', fontSize: '15px' }}>
                                                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '10px', fontSize: '16px' }} />
                                                Đăng tối đa <strong style={{ color: '#1890ff' }}>{pkg.maxJobs} job</strong>
                                            </div>
                                            <div style={{ marginBottom: '14px', fontSize: '15px' }}>
                                                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '10px', fontSize: '16px' }} />
                                                Thời hạn <strong style={{ color: '#1890ff' }}>{pkg.durationDays} ngày</strong>
                                            </div>
                                            {pkg.featuredJobs && pkg.featuredJobs > 0 && (
                                                <div style={{ marginBottom: '14px', fontSize: '15px' }}>
                                                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '10px', fontSize: '16px' }} />
                                                    <strong style={{ color: '#1890ff' }}>{pkg.featuredJobs} job</strong> được featured
                                                </div>
                                            )}
                                        </div>
                                        <Divider style={{ margin: '20px 0' }} />
                                        <div style={{ marginBottom: '24px' }}>
                                            <strong style={{ fontSize: '15px', color: '#333', display: 'block', marginBottom: '8px' }}>Tag hỗ trợ:</strong>
                                            {renderSupportedTags(pkg.supportedTags)}
                                        </div>

                                        <Button
                                            type={isActive ? "default" : "primary"}
                                            icon={<ShoppingCartOutlined />}
                                            block
                                            size="large"
                                            loading={purchasing === pkg._id}
                                            disabled={isActive}
                                            onClick={() => handlePurchase(pkg._id!)}
                                            style={{
                                                height: '48px',
                                                fontSize: '16px',
                                                fontWeight: 'bold',
                                                borderRadius: '8px',
                                                background: isActive ? undefined : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                border: isActive ? undefined : 'none',
                                                boxShadow: isActive ? undefined : '0 4px 12px rgba(102, 126, 234, 0.4)'
                                            }}
                                        >
                                            {isActive ? 'Đang sử dụng' : pkg.price === 0 ? 'Kích hoạt miễn phí' : 'Mua ngay'}
                                        </Button>
                                    </Card>
                                </Col>
                            );
                        })}
                    </Row>
                </Spin>
            </Card>
        </div>
    );
};

export default ServicePackagePage;




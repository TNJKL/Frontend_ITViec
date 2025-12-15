import React, { useState, useEffect } from 'react';
import { Card, List, Empty, Spin, Tag, Button, Space, Modal, Descriptions, message, Typography } from 'antd';
import {
    CalendarOutlined,
    EnvironmentOutlined,
    LinkOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    FileTextOutlined,
} from '@ant-design/icons';
import { callGetMyInterviews, callConfirmInterview, callGetInterviewById } from '@/config/api';
import { IInterview } from '@/types/backend';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const MyInterviews: React.FC = () => {
    const [interviews, setInterviews] = useState<IInterview[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedInterview, setSelectedInterview] = useState<IInterview | null>(null);
    const [detailModalOpen, setDetailModalOpen] = useState<boolean>(false);
    const [confirming, setConfirming] = useState<string | null>(null);

    useEffect(() => {
        fetchInterviews();
    }, []);

    const fetchInterviews = async () => {
        setLoading(true);
        try {
            const res = await callGetMyInterviews();
            if (res && res.data) {
                setInterviews(res.data);
            }
        } catch (error) {
            message.error('Không thể tải danh sách lịch phỏng vấn');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (interviewId: string) => {
        setConfirming(interviewId);
        try {
            const res = await callConfirmInterview(interviewId);
            if (res && res.data) {
                message.success('Đã xác nhận tham gia phỏng vấn thành công!');
                fetchInterviews();
            }
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Không thể xác nhận tham gia phỏng vấn');
        } finally {
            setConfirming(null);
        }
    };

    const handleViewDetail = async (interviewId: string) => {
        try {
            const res = await callGetInterviewById(interviewId);
            if (res && res.data) {
                setSelectedInterview(res.data);
                setDetailModalOpen(true);
            }
        } catch (error) {
            message.error('Không thể tải chi tiết lịch phỏng vấn');
        }
    };

    const getStatusTag = (status?: string) => {
        switch (status) {
            case 'SCHEDULED':
                return <Tag color="blue" icon={<ClockCircleOutlined />}>Đã hẹn</Tag>;
            case 'CONFIRMED':
                return <Tag color="green" icon={<CheckCircleOutlined />}>Đã xác nhận</Tag>;
            case 'RESCHEDULED':
                return <Tag color="orange" icon={<ClockCircleOutlined />}>Đã đổi lịch</Tag>;
            case 'COMPLETED':
                return <Tag color="purple" icon={<CheckCircleOutlined />}>Đã hoàn thành</Tag>;
            case 'CANCELLED':
                return <Tag color="red" icon={<CloseCircleOutlined />}>Đã hủy</Tag>;
            default:
                return <Tag>{status}</Tag>;
        }
    };

    const getResultTag = (result?: string) => {
        switch (result) {
            case 'PASSED':
                return <Tag color="success">Đạt</Tag>;
            case 'FAILED':
                return <Tag color="error">Không đạt</Tag>;
            case 'PENDING':
                return <Tag color="processing">Đang chờ</Tag>;
            default:
                return null;
        }
    };

    const upcomingInterviews = interviews.filter(
        (i) =>
            i.status === 'SCHEDULED' ||
            i.status === 'CONFIRMED' ||
            (i.status === 'RESCHEDULED' && dayjs(i.scheduledDate).isAfter(dayjs()))
    );

    const pastInterviews = interviews.filter(
        (i) =>
            i.status === 'COMPLETED' ||
            i.status === 'CANCELLED' ||
            dayjs(i.scheduledDate).isBefore(dayjs())
    );

    return (
        <div
            style={{
                padding: '32px 24px 80px',
                maxWidth: '1200px',
                margin: '0 auto',
                minHeight: 'calc(100vh - 200px)',
                display: 'flex',
                flexDirection: 'column',
                gap: 24,
            }}
        >
            <div style={{ textAlign: 'center', marginBottom: 8 }}>
                <Typography.Title
                    level={2}
                    style={{
                        marginBottom: 8,
                        fontWeight: 700,
                        color: '#0b1f3a',
                    }}
                >
                    Lịch phỏng vấn của tôi
                </Typography.Title>
                <Typography.Text type="secondary">
                    Theo dõi trạng thái từng lịch hẹn để không bỏ lỡ cơ hội phỏng vấn
                </Typography.Text>
            </div>

            <Spin spinning={loading}>
                {upcomingInterviews.length > 0 && (
                    <div style={{ marginBottom: '32px' }}>
                        <Typography.Title level={4} style={{ marginBottom: 16, color: '#102039' }}>
                            Lịch phỏng vấn sắp tới
                        </Typography.Title>
                        <List
                            grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3 }}
                            dataSource={upcomingInterviews}
                            renderItem={(interview) => {
                                const job = typeof interview.jobId === 'object' ? interview.jobId : null;
                                const scheduledDate = dayjs(interview.scheduledDate);
                                const isPast = scheduledDate.isBefore(dayjs());
                                const canConfirm = interview.status === 'SCHEDULED' || interview.status === 'RESCHEDULED';

                                return (
                                    <List.Item>
                                        <Card
                                            hoverable
                                            style={{
                                                height: '100%',
                                                border: canConfirm ? '2px solid #1890ff' : undefined,
                                            }}
                                            actions={[
                                                <Button
                                                    key="detail"
                                                    type="link"
                                                    onClick={() => handleViewDetail(interview._id!)}
                                                >
                                                    Chi tiết
                                                </Button>,
                                                canConfirm && (
                                                    <Button
                                                        key="confirm"
                                                        type="primary"
                                                        icon={<CheckCircleOutlined />}
                                                        loading={confirming === interview._id}
                                                        onClick={() => handleConfirm(interview._id!)}
                                                    >
                                                        Xác nhận
                                                    </Button>
                                                ),
                                            ].filter(Boolean)}
                                        >
                                            <Card.Meta
                                                title={
                                                    <Space>
                                                        {getStatusTag(interview.status)}
                                                        <span>{job?.name || 'N/A'}</span>
                                                    </Space>
                                                }
                                                description={
                                                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                                        <div>
                                                            <CalendarOutlined />{' '}
                                                            {scheduledDate.format('DD/MM/YYYY HH:mm')}
                                                        </div>
                                                        {interview.location && (
                                                            <div>
                                                                <EnvironmentOutlined /> {interview.location}
                                                            </div>
                                                        )}
                                                        {interview.interviewType === 'ONLINE' && interview.meetingLink && (
                                                            <div>
                                                                <LinkOutlined />{' '}
                                                                <a
                                                                    href={interview.meetingLink}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                >
                                                                    Link phỏng vấn
                                                                </a>
                                                            </div>
                                                        )}
                                                        {interview.interviewType && (
                                                            <Tag>
                                                                {interview.interviewType === 'ONLINE'
                                                                    ? 'Trực tuyến'
                                                                    : interview.interviewType === 'HYBRID'
                                                                    ? 'Kết hợp'
                                                                    : 'Trực tiếp'}
                                                            </Tag>
                                                        )}
                                                    </Space>
                                                }
                                            />
                                        </Card>
                                    </List.Item>
                                );
                            }}
                        />
                    </div>
                )}

                {pastInterviews.length > 0 && (
                    <div>
                        <Typography.Title level={4} style={{ marginBottom: 16, color: '#102039' }}>
                            Lịch phỏng vấn đã qua
                        </Typography.Title>
                        <List
                            grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3 }}
                            dataSource={pastInterviews}
                            renderItem={(interview) => {
                                const job = typeof interview.jobId === 'object' ? interview.jobId : null;
                                const scheduledDate = dayjs(interview.scheduledDate);

                                return (
                                    <List.Item>
                                        <Card
                                            hoverable
                                            style={{ height: '100%', opacity: 0.8 }}
                                            actions={[
                                                <Button
                                                    key="detail"
                                                    type="link"
                                                    onClick={() => handleViewDetail(interview._id!)}
                                                >
                                                    Chi tiết
                                                </Button>,
                                            ]}
                                        >
                                            <Card.Meta
                                                title={
                                                    <Space>
                                                        {getStatusTag(interview.status)}
                                                        {getResultTag(interview.result)}
                                                        <span>{job?.name || 'N/A'}</span>
                                                    </Space>
                                                }
                                                description={
                                                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                                        <div>
                                                            <CalendarOutlined />{' '}
                                                            {scheduledDate.format('DD/MM/YYYY HH:mm')}
                                                        </div>
                                                        {interview.status === 'CANCELLED' && interview.cancelReason && (
                                                            <Tag color="red" icon={<CloseCircleOutlined />}>
                                                                Lý do hủy: {interview.cancelReason}
                                                            </Tag>
                                                        )}
                                                        {interview.feedback && (
                                                            <div>
                                                                <FileTextOutlined /> {interview.feedback}
                                                            </div>
                                                        )}
                                                    </Space>
                                                }
                                            />
                                        </Card>
                                    </List.Item>
                                );
                            }}
                        />
                    </div>
                )}

                {interviews.length === 0 && !loading && (
                    <Empty
                        description="Bạn chưa có lịch phỏng vấn nào"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                )}
            </Spin>

            <Modal
                title="Chi tiết lịch phỏng vấn"
                open={detailModalOpen}
                onCancel={() => {
                    setDetailModalOpen(false);
                    setSelectedInterview(null);
                }}
                footer={[
                    selectedInterview &&
                        (selectedInterview.status === 'SCHEDULED' ||
                            selectedInterview.status === 'RESCHEDULED') && (
                            <Button
                                key="confirm"
                                type="primary"
                                icon={<CheckCircleOutlined />}
                                loading={confirming === selectedInterview._id}
                                onClick={() => {
                                    if (selectedInterview._id) {
                                        handleConfirm(selectedInterview._id);
                                    }
                                }}
                            >
                                Xác nhận tham gia
                            </Button>
                        ),
                    <Button key="close" onClick={() => setDetailModalOpen(false)}>
                        Đóng
                    </Button>,
                ].filter(Boolean)}
                width={600}
            >
                {selectedInterview && (
                    <Descriptions bordered column={1}>
                        <Descriptions.Item label="Vị trí ứng tuyển">
                            {typeof selectedInterview.jobId === 'object'
                                ? selectedInterview.jobId.name
                                : 'N/A'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Công ty">
                            {typeof selectedInterview.jobId === 'object' &&
                            selectedInterview.jobId.company
                                ? typeof selectedInterview.jobId.company === 'object'
                                    ? selectedInterview.jobId.company.name
                                    : selectedInterview.jobId.company
                                : 'N/A'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày giờ">
                            {dayjs(selectedInterview.scheduledDate).format('DD/MM/YYYY HH:mm')}
                        </Descriptions.Item>
                        <Descriptions.Item label="Hình thức">
                            {selectedInterview.interviewType === 'ONLINE'
                                ? 'Trực tuyến'
                                : selectedInterview.interviewType === 'HYBRID'
                                ? 'Kết hợp'
                                : 'Trực tiếp'}
                        </Descriptions.Item>
                        {selectedInterview.location && (
                            <Descriptions.Item label="Địa điểm">
                                {selectedInterview.location}
                            </Descriptions.Item>
                        )}
                        {selectedInterview.meetingLink && (
                            <Descriptions.Item label="Link phỏng vấn">
                                <a
                                    href={selectedInterview.meetingLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {selectedInterview.meetingLink}
                                </a>
                            </Descriptions.Item>
                        )}
                        <Descriptions.Item label="Trạng thái">
                            {getStatusTag(selectedInterview.status)}
                            {getResultTag(selectedInterview.result)}
                        </Descriptions.Item>
                        {selectedInterview.status === 'CANCELLED' && selectedInterview.cancelReason && (
                            <Descriptions.Item label="Lý do hủy">
                                {selectedInterview.cancelReason}
                            </Descriptions.Item>
                        )}
                        {selectedInterview.notes && (
                            <Descriptions.Item label="Ghi chú">
                                {selectedInterview.notes}
                            </Descriptions.Item>
                        )}
                        {selectedInterview.feedback && (
                            <Descriptions.Item label="Nhận xét">
                                {selectedInterview.feedback}
                            </Descriptions.Item>
                        )}
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
};

export default MyInterviews;




import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, Modal, Descriptions, message, Input, Select, DatePicker, Tabs } from 'antd';
import {
    EyeOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    EditOutlined,
    DeleteOutlined,
    CalendarOutlined,
    UnorderedListOutlined,
} from '@ant-design/icons';
import { callGetInterviews, callGetInterviewById, callUpdateInterviewResult, callCancelInterview } from '@/config/api';
import { IInterview } from '@/types/backend';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import type { ColumnsType } from 'antd/es/table';
import { IModelPaginate } from '@/types/backend';
import InterviewCalendar from '@/components/hr/InterviewCalendar';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const InterviewList: React.FC = () => {
    const [interviews, setInterviews] = useState<IInterview[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedInterview, setSelectedInterview] = useState<IInterview | null>(null);
    const [detailModalOpen, setDetailModalOpen] = useState<boolean>(false);
    const [resultModalOpen, setResultModalOpen] = useState<boolean>(false);
    const [cancelModalOpen, setCancelModalOpen] = useState<boolean>(false);
    const [cancelReason, setCancelReason] = useState<string>('');
    const [cancelInterviewId, setCancelInterviewId] = useState<string | null>(null);
    const [cancelling, setCancelling] = useState<boolean>(false);
    const [current, setCurrent] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    const [total, setTotal] = useState<number>(0);
    const [filters, setFilters] = useState<{ status?: string; dateRange?: [dayjs.Dayjs, dayjs.Dayjs] }>({});

    useEffect(() => {
        fetchInterviews();
    }, [current, pageSize, filters]);

    const fetchInterviews = async () => {
        setLoading(true);
        try {
            let query = `current=${current}&pageSize=${pageSize}`;
            if (filters.status) {
                query += `&status=${filters.status}`;
            }
            if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
                query += `&scheduledDate[$gte]=${filters.dateRange[0].toISOString()}&scheduledDate[$lte]=${filters.dateRange[1].toISOString()}`;
            }

            const res = await callGetInterviews(query);
            if (res && res.data) {
                const data = res.data as IModelPaginate<IInterview>;
                setInterviews(data.result || []);
                setTotal(data.meta?.total || 0);
            }
        } catch (error) {
            message.error('Không thể tải danh sách lịch phỏng vấn');
        } finally {
            setLoading(false);
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

    const handleUpdateResult = async (values: { result: string; feedback?: string }) => {
        if (!selectedInterview?._id) return;

        try {
            const res = await callUpdateInterviewResult(selectedInterview._id, values);
            if (res && res.data) {
                message.success('Đã cập nhật kết quả phỏng vấn thành công!');
                setResultModalOpen(false);
                setDetailModalOpen(false);
                setSelectedInterview(null);
                fetchInterviews();
            }
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Không thể cập nhật kết quả');
        }
    };

    const openCancelModal = (interviewId: string) => {
        setCancelInterviewId(interviewId);
        setCancelReason('');
        setCancelModalOpen(true);
    };

    const handleCancelInterview = async () => {
        if (!cancelInterviewId) return;
        if (!cancelReason.trim()) {
            message.warning('Vui lòng nhập lý do hủy');
            return;
        }
        setCancelling(true);
        try {
            const res = await callCancelInterview(cancelInterviewId, cancelReason.trim());
            if (res && res.data) {
                message.success(res.data.message || 'Đã hủy lịch phỏng vấn');
                setCancelModalOpen(false);
                setCancelInterviewId(null);
                setCancelReason('');
                if (selectedInterview?._id === cancelInterviewId) {
                    setSelectedInterview({ ...selectedInterview, status: 'CANCELLED', cancelReason: cancelReason.trim() });
                }
                fetchInterviews();
            }
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Không thể hủy lịch phỏng vấn');
        } finally {
            setCancelling(false);
        }
    };

    const getStatusTag = (status?: string) => {
        switch (status) {
            case 'SCHEDULED':
                return <Tag color="blue">Đã hẹn</Tag>;
            case 'CONFIRMED':
                return <Tag color="green">Đã xác nhận</Tag>;
            case 'RESCHEDULED':
                return <Tag color="orange">Đã đổi lịch</Tag>;
            case 'COMPLETED':
                return <Tag color="purple">Đã hoàn thành</Tag>;
            case 'CANCELLED':
                return <Tag color="red">Đã hủy</Tag>;
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

    const columns: ColumnsType<IInterview> = [
        {
            title: 'Vị trí',
            dataIndex: 'jobId',
            key: 'jobId',
            render: (jobId) => {
                if (typeof jobId === 'object' && jobId) {
                    return jobId.name;
                }
                return 'N/A';
            },
        },
        {
            title: 'Ứng viên',
            dataIndex: 'candidateId',
            key: 'candidateId',
            render: (candidateId) => {
                if (typeof candidateId === 'object' && candidateId) {
                    return candidateId.name || candidateId.email;
                }
                return 'N/A';
            },
        },
        {
            title: 'Ngày giờ',
            dataIndex: 'scheduledDate',
            key: 'scheduledDate',
            render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
            sorter: (a, b) => dayjs(a.scheduledDate).unix() - dayjs(b.scheduledDate).unix(),
        },
        {
            title: 'Hình thức',
            dataIndex: 'interviewType',
            key: 'interviewType',
            render: (type) => {
                switch (type) {
                    case 'ONLINE':
                        return <Tag>Trực tuyến</Tag>;
                    case 'HYBRID':
                        return <Tag>Kết hợp</Tag>;
                    default:
                        return <Tag>Trực tiếp</Tag>;
                }
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status, record) => (
                <Space>
                    {getStatusTag(status)}
                    {getResultTag(record.result)}
                </Space>
            ),
            filters: [
                { text: 'Đã hẹn', value: 'SCHEDULED' },
                { text: 'Đã xác nhận', value: 'CONFIRMED' },
                { text: 'Đã đổi lịch', value: 'RESCHEDULED' },
                { text: 'Đã hoàn thành', value: 'COMPLETED' },
                { text: 'Đã hủy', value: 'CANCELLED' },
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewDetail(record._id!)}
                    >
                        Chi tiết
                    </Button>
                    {record.status === 'COMPLETED' && !record.result && (
                        <Button
                            type="link"
                            icon={<CheckCircleOutlined />}
                            onClick={() => {
                                setSelectedInterview(record);
                                setResultModalOpen(true);
                            }}
                        >
                            Cập nhật kết quả
                        </Button>
                    )}
                    {(record.status === 'SCHEDULED' || record.status === 'CONFIRMED' || record.status === 'RESCHEDULED') && (
                        <Button
                            type="link"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => openCancelModal(record._id!)}
                        >
                            Hủy
                        </Button>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Quản lý lịch phỏng vấn</h1>
            </div>

            <Tabs defaultActiveKey="list">
                <TabPane
                    tab={
                        <span>
                            <UnorderedListOutlined />
                            Danh sách
                        </span>
                    }
                    key="list"
                >
                    <div style={{ marginBottom: '16px' }}>
                        <Space>
                            <Select
                                placeholder="Lọc theo trạng thái"
                                allowClear
                                style={{ width: 200 }}
                                onChange={(value) => setFilters({ ...filters, status: value })}
                            >
                                <Option value="SCHEDULED">Đã hẹn</Option>
                                <Option value="CONFIRMED">Đã xác nhận</Option>
                                <Option value="RESCHEDULED">Đã đổi lịch</Option>
                                <Option value="COMPLETED">Đã hoàn thành</Option>
                                <Option value="CANCELLED">Đã hủy</Option>
                            </Select>
                            <RangePicker
                                placeholder={['Từ ngày', 'Đến ngày']}
                                onChange={(dates) => {
                                    if (dates && dates[0] && dates[1]) {
                                        setFilters({ ...filters, dateRange: [dates[0], dates[1]] });
                                    } else {
                                        setFilters({ ...filters, dateRange: undefined });
                                    }
                                }}
                            />
                        </Space>
                    </div>

                    <Table
                columns={columns}
                dataSource={interviews}
                loading={loading}
                rowKey="_id"
                pagination={{
                    current,
                    pageSize,
                    total,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} lịch phỏng vấn`,
                    onChange: (page, size) => {
                        setCurrent(page);
                        setPageSize(size);
                    },
                }}
                    />
                </TabPane>
                <TabPane
                    tab={
                        <span>
                            <CalendarOutlined />
                            Lịch
                        </span>
                    }
                    key="calendar"
                >
                    <InterviewCalendar />
                </TabPane>
            </Tabs>

            <Modal
                title="Chi tiết lịch phỏng vấn"
                open={detailModalOpen}
                onCancel={() => {
                    setDetailModalOpen(false);
                    setSelectedInterview(null);
                }}
                footer={[
                    selectedInterview?.status === 'COMPLETED' && !selectedInterview?.result && (
                        <Button
                            key="result"
                            type="primary"
                            icon={<CheckCircleOutlined />}
                            onClick={() => {
                                setResultModalOpen(true);
                            }}
                        >
                            Cập nhật kết quả
                        </Button>
                    ),
                    <Button key="close" onClick={() => setDetailModalOpen(false)}>
                        Đóng
                    </Button>,
                ].filter(Boolean)}
                width={700}
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
                        <Descriptions.Item label="Ứng viên">
                            {typeof selectedInterview.candidateId === 'object'
                                ? selectedInterview.candidateId.name || selectedInterview.candidateId.email
                                : 'N/A'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Email ứng viên">
                            {typeof selectedInterview.candidateId === 'object'
                                ? selectedInterview.candidateId.email
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

            <Modal
                title="Hủy lịch phỏng vấn"
                open={cancelModalOpen}
                onOk={handleCancelInterview}
                onCancel={() => {
                    setCancelModalOpen(false);
                    setCancelReason('');
                    setCancelInterviewId(null);
                }}
                okText="Xác nhận hủy"
                cancelText="Đóng"
                confirmLoading={cancelling}
            >
                <Space direction="vertical" style={{ width: '100%' }}>
                    <p>Vui lòng nhập lý do hủy để thông báo cho ứng viên.</p>
                    <Input.TextArea
                        rows={4}
                        placeholder="Lý do hủy phỏng vấn"
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                    />
                </Space>
            </Modal>

            <Modal
                title="Cập nhật kết quả phỏng vấn"
                open={resultModalOpen}
                onCancel={() => setResultModalOpen(false)}
                onOk={() => {
                    const form = document.querySelector('form');
                    if (form) {
                        const formData = new FormData(form as HTMLFormElement);
                        const result = formData.get('result') as string;
                        const feedback = formData.get('feedback') as string;
                        handleUpdateResult({ result, feedback });
                    }
                }}
                okText="Cập nhật"
                cancelText="Hủy"
            >
                <form>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px' }}>Kết quả:</label>
                            <Select
                                name="result"
                                style={{ width: '100%' }}
                                placeholder="Chọn kết quả"
                            >
                                <Option value="PASSED">Đạt</Option>
                                <Option value="FAILED">Không đạt</Option>
                                <Option value="PENDING">Đang chờ</Option>
                            </Select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px' }}>Nhận xét:</label>
                            <Input.TextArea
                                name="feedback"
                                rows={4}
                                placeholder="Nhập nhận xét về ứng viên (tùy chọn)"
                            />
                        </div>
                    </Space>
                </form>
            </Modal>
        </div>
    );
};

export default InterviewList;


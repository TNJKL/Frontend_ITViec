import React, { useState, useEffect } from 'react';
import { Calendar, Badge, Modal, Descriptions, Tag, Space, message, Select, Button } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { callGetInterviews } from '@/config/api';
import { IInterview } from '@/types/backend';
import { useNavigate } from 'react-router-dom';

interface InterviewCalendarProps {
    onEventClick?: (interview: IInterview) => void;
}

const InterviewCalendar: React.FC<InterviewCalendarProps> = ({ onEventClick }) => {
    const [interviews, setInterviews] = useState<IInterview[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
    const [selectedInterview, setSelectedInterview] = useState<IInterview | null>(null);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchInterviews();
    }, []);

    const fetchInterviews = async () => {
        setLoading(true);
        try {
            // Lấy tất cả interviews (có thể cần pagination nếu quá nhiều)
            const res = await callGetInterviews('current=1&pageSize=1000');
            if (res && res.data) {
                const data = res.data as any;
                setInterviews(data.result || []);
            }
        } catch (error) {
            message.error('Không thể tải lịch phỏng vấn');
        } finally {
            setLoading(false);
        }
    };

    const getListData = (value: Dayjs) => {
        const dateStr = value.format('YYYY-MM-DD');
        return interviews.filter((interview) => {
            const interviewDate = dayjs(interview.scheduledDate).format('YYYY-MM-DD');
            return interviewDate === dateStr;
        });
    };

    const dateCellRender = (value: Dayjs) => {
        const listData = getListData(value);
        return (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {listData.map((interview) => {
                    const status = interview.status;
                    let color = 'blue';
                    if (status === 'CONFIRMED') color = 'green';
                    if (status === 'CANCELLED') color = 'red';
                    if (status === 'COMPLETED') color = 'purple';

                    const jobName =
                        typeof interview.jobId === 'object' && interview.jobId
                            ? interview.jobId.name
                            : 'N/A';

                    return (
                        <li
                            key={interview._id}
                            style={{
                                marginBottom: '4px',
                                cursor: 'pointer',
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedInterview(interview);
                                setModalOpen(true);
                                if (onEventClick) {
                                    onEventClick(interview);
                                }
                            }}
                        >
                            <Badge
                                status={color as any}
                                text={
                                    <span style={{ fontSize: '12px' }}>
                                        {dayjs(interview.scheduledDate).format('HH:mm')} - {jobName}
                                    </span>
                                }
                            />
                        </li>
                    );
                })}
            </ul>
        );
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

    return (
        <div style={{ padding: '24px', background: '#fff', borderRadius: '8px' }}>
            <Calendar
                dateCellRender={dateCellRender}
                onSelect={(date) => setSelectedDate(date)}
                style={{ background: '#fff' }}
            />

            <Modal
                title="Chi tiết lịch phỏng vấn"
                open={modalOpen}
                onCancel={() => {
                    setModalOpen(false);
                    setSelectedInterview(null);
                }}
                footer={[
                    <Button
                        key="view"
                        type="primary"
                        onClick={() => {
                            if (selectedInterview?._id) {
                                navigate(`/admin/interviews`);
                                setModalOpen(false);
                            }
                        }}
                    >
                        Xem chi tiết
                    </Button>,
                    <Button key="close" onClick={() => setModalOpen(false)}>
                        Đóng
                    </Button>,
                ]}
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
                        <Descriptions.Item label="Ứng viên">
                            {typeof selectedInterview.candidateId === 'object'
                                ? selectedInterview.candidateId.name ||
                                  selectedInterview.candidateId.email
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
                            <Space>
                                {getStatusTag(selectedInterview.status)}
                                {getResultTag(selectedInterview.result)}
                            </Space>
                        </Descriptions.Item>
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

export default InterviewCalendar;


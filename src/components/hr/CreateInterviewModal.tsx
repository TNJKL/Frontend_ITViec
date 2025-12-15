import React, { useState, useEffect } from 'react';
import { Modal, Form, DatePicker, Input, Select, Space, Button, message, TimePicker } from 'antd';
import { CalendarOutlined, EnvironmentOutlined, LinkOutlined, FileTextOutlined } from '@ant-design/icons';
import { callCreateInterview } from '@/config/api';
import { IResume, IJob } from '@/types/backend';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/vi';

dayjs.locale('vi');

const { TextArea } = Input;
const { Option } = Select;

interface CreateInterviewModalProps {
    open: boolean;
    onClose: () => void;
    resume: IResume | null;
    job: IJob | null;
    onSuccess?: () => void;
}

const CreateInterviewModal: React.FC<CreateInterviewModalProps> = ({
    open,
    onClose,
    resume,
    job,
    onSuccess,
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (open && resume && job) {
            form.resetFields();
            // Set default values
            form.setFieldsValue({
                interviewType: 'OFFLINE',
            });
        }
    }, [open, resume, job, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (!resume?._id) {
                message.error('Không tìm thấy thông tin hồ sơ, vui lòng thử lại.');
                return;
            }
            const resolvedJobId =
                typeof job === 'string'
                    ? job
                    : (job as any)?._id || (job as any)?.jobId || (resume?.jobId as any)?._id || resume?.jobId;
            if (!resolvedJobId) {
                message.error('Không tìm thấy thông tin công việc, vui lòng thử lại.');
                return;
            }
            setLoading(true);

            // Combine date and time
            const scheduledDate = values.date
                .hour(values.time?.hour() || 9)
                .minute(values.time?.minute() || 0)
                .second(0)
                .millisecond(0);

            const interviewData = {
                resumeId: resume._id,
                jobId: resolvedJobId,
                scheduledDate: scheduledDate.toISOString(),
                location: values.location,
                interviewType: values.interviewType,
                meetingLink: values.meetingLink,
                notes: values.notes,
            };

            const res = await callCreateInterview(interviewData);

            if (res && res.data) {
                message.success('Đã tạo lịch phỏng vấn thành công!');
                form.resetFields();
                onClose();
                if (onSuccess) {
                    onSuccess();
                }
            }
        } catch (error: any) {
            if (error?.response?.data?.message) {
                message.error(error.response.data.message);
            } else {
                message.error('Không thể tạo lịch phỏng vấn');
            }
        } finally {
            setLoading(false);
        }
    };

    const interviewType = Form.useWatch('interviewType', form);

    return (
        <Modal
            title={
                <Space>
                    <CalendarOutlined />
                    <span>Tạo lịch phỏng vấn</span>
                </Space>
            }
            open={open}
            onCancel={onClose}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    Hủy
                </Button>,
                <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
                    Tạo lịch phỏng vấn
                </Button>,
            ]}
            width={600}
        >
            {resume && job && (
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        interviewType: 'OFFLINE',
                    }}
                >
                    <Form.Item label="Vị trí ứng tuyển">
                        <Input value={typeof job === 'object' ? job.name : ''} disabled />
                    </Form.Item>

                    <Form.Item label="Ứng viên">
                        <Input
                            value={
                                typeof resume.userId === 'object'
                                    ? (resume.userId as any)?.name || resume.email
                                    : resume.email
                            }
                            disabled
                        />
                    </Form.Item>

                    <Space.Compact style={{ width: '100%' }}>
                        <Form.Item
                            label="Ngày phỏng vấn"
                            name="date"
                            rules={[{ required: true, message: 'Vui lòng chọn ngày phỏng vấn' }]}
                            style={{ width: '60%', marginRight: 8 }}
                        >
                            <DatePicker
                                style={{ width: '100%' }}
                                format="DD/MM/YYYY"
                                placeholder="Chọn ngày"
                                disabledDate={(current) => current && current < dayjs().startOf('day')}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Giờ phỏng vấn"
                            name="time"
                            rules={[{ required: true, message: 'Vui lòng chọn giờ phỏng vấn' }]}
                            style={{ width: '40%' }}
                        >
                            <TimePicker
                                style={{ width: '100%' }}
                                format="HH:mm"
                                placeholder="Chọn giờ"
                                minuteStep={15}
                            />
                        </Form.Item>
                    </Space.Compact>

                    <Form.Item
                        label="Hình thức phỏng vấn"
                        name="interviewType"
                        rules={[{ required: true, message: 'Vui lòng chọn hình thức phỏng vấn' }]}
                    >
                        <Select>
                            <Option value="OFFLINE">
                                <Space>
                                    <EnvironmentOutlined />
                                    Trực tiếp
                                </Space>
                            </Option>
                            <Option value="ONLINE">
                                <Space>
                                    <LinkOutlined />
                                    Trực tuyến
                                </Space>
                            </Option>
                            <Option value="HYBRID">
                                <Space>
                                    <EnvironmentOutlined />
                                    <LinkOutlined />
                                    Kết hợp
                                </Space>
                            </Option>
                        </Select>
                    </Form.Item>

                    {interviewType === 'OFFLINE' || interviewType === 'HYBRID' ? (
                        <Form.Item
                            label="Địa điểm"
                            name="location"
                            rules={[{ required: true, message: 'Vui lòng nhập địa điểm phỏng vấn' }]}
                        >
                            <Input
                                prefix={<EnvironmentOutlined />}
                                placeholder="Nhập địa điểm phỏng vấn"
                            />
                        </Form.Item>
                    ) : null}

                    {interviewType === 'ONLINE' || interviewType === 'HYBRID' ? (
                        <Form.Item
                            label="Link phỏng vấn (Zoom/Meet)"
                            name="meetingLink"
                            rules={[
                                { required: true, message: 'Vui lòng nhập link phỏng vấn' },
                                { type: 'url', message: 'Link không hợp lệ' },
                            ]}
                        >
                            <Input
                                prefix={<LinkOutlined />}
                                placeholder="https://zoom.us/j/..."
                            />
                        </Form.Item>
                    ) : null}

                    <Form.Item label="Ghi chú" name="notes">
                        <TextArea
                            rows={4}
                            placeholder="Ghi chú cho ứng viên (tùy chọn)"
                        />
                    </Form.Item>
                </Form>
            )}
        </Modal>
    );
};

export default CreateInterviewModal;



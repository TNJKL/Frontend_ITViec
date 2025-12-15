import { callUpdateResumeStatus } from "@/config/api";
import { IResume, IJob } from "@/types/backend";
import { Button, Descriptions, Drawer, Form, Modal, Select, Space, message, notification } from "antd";
import { EyeOutlined, CalendarOutlined } from "@ant-design/icons";
import dayjs from 'dayjs';
import { useState, useEffect, useMemo } from 'react';
import CreateInterviewModal from '../../hr/CreateInterviewModal';
import { RESUME_STATUS_OPTIONS, RESUME_STATUS_TRANSITIONS, ResumeStatus } from "@/config/constants/resume";
const { Option } = Select;

interface IProps {
    onClose: (v: boolean) => void;
    open: boolean;
    dataInit: IResume | null | any;
    setDataInit: (v: any) => void;
    reloadTable: () => void;
}
const ViewDetailResume = (props: IProps) => {
    const [isSubmit, setIsSubmit] = useState<boolean>(false);
    const { onClose, open, dataInit, setDataInit, reloadTable } = props;
    const [form] = Form.useForm();
    const [previewOpen, setPreviewOpen] = useState<boolean>(false);
    const [interviewModalOpen, setInterviewModalOpen] = useState<boolean>(false);
    const [selectedInterviewResume, setSelectedInterviewResume] = useState<IResume | null>(null);
    const [selectedInterviewJob, setSelectedInterviewJob] = useState<IJob | null>(null);
    const resumeUrl = dataInit?.url ? `${import.meta.env.VITE_BACKEND_URL}/images/resume/${dataInit.url}` : "";
    
    const canCreateInterview = dataInit?.status === 'APPROVED' || dataInit?.status === 'REVIEWING';

    const availableStatusOptions = useMemo(() => {
        const currentStatus = dataInit?.status as ResumeStatus | undefined;
        if (!currentStatus) return RESUME_STATUS_OPTIONS;

        const isKnownStatus = RESUME_STATUS_OPTIONS.some(option => option.value === currentStatus);
        const allowedValues = new Set<string>();
        allowedValues.add(currentStatus);

        if (isKnownStatus) {
            const transitions = RESUME_STATUS_TRANSITIONS[currentStatus] || [];
            transitions.forEach(status => allowedValues.add(status));
        } else {
            // Nếu backend trả status lạ, vẫn return option hiện tại + tất cả option chuẩn
            return [{ value: currentStatus, label: currentStatus }, ...RESUME_STATUS_OPTIONS];
        }

        return RESUME_STATUS_OPTIONS.filter(option => allowedValues.has(option.value));
    }, [dataInit?.status]);

    const handlePreviewResume = () => {
        if (!resumeUrl) {
            message.warning("Không tìm thấy file CV để xem trước");
            return;
        }
        setPreviewOpen(true);
    };

    const handleOpenResume = () => {
        if (!resumeUrl) {
            message.warning("Không tìm thấy file CV để mở");
            return;
        }
        window.open(resumeUrl, '_blank', 'noopener');
    };

    const handleChangeStatus = async () => {
        setIsSubmit(true);

        const status = form.getFieldValue('status');
        const res = await callUpdateResumeStatus(dataInit?._id, status)
        if (res.data) {
            message.success("Update Resume status thành công!");
            setDataInit(null);
            onClose(false);
            reloadTable();
        } else {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: res.message
            });
        }

        setIsSubmit(false);
    }

    useEffect(() => {
        if (dataInit) {
            form.setFieldValue("status", dataInit.status)
        }
        return () => form.resetFields();
    }, [dataInit])

    useEffect(() => {
        if (!open) {
            setPreviewOpen(false);
        }
    }, [open]);

    return (
        <>
            <Drawer
                title="Thông Tin Resume"
                placement="right"
                onClose={() => { onClose(false); setDataInit(null) }}
                open={open}
                width={"40vw"}
                maskClosable={false}
                destroyOnClose
                extra={
                    <Space>
                        {canCreateInterview && (
                            <Button
                                type="default"
                                icon={<CalendarOutlined />}
                                onClick={() => {
                                    setSelectedInterviewResume(dataInit);
                                    setSelectedInterviewJob(dataInit?.jobId as IJob);
                                    setInterviewModalOpen(true);
                                }}
                            >
                                Tạo lịch phỏng vấn
                            </Button>
                        )}
                        <Button loading={isSubmit} type="primary" onClick={handleChangeStatus}>
                            Change Status
                        </Button>
                    </Space>
                }
            >
                <Descriptions title="" bordered column={2} layout="vertical">
                    <Descriptions.Item label="Email">{dataInit?.email}</Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                        <Form
                            form={form}
                        >
                            <Form.Item name={"status"}>
                                <Select
                                    style={{ width: "100%" }}
                                    defaultValue={dataInit?.status}
                                >
                                    {availableStatusOptions.map(option => (
                                        <Option key={option.value} value={option.value}>
                                            {option.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Form>

                    </Descriptions.Item>
                    <Descriptions.Item label="Tên Job">
                        {dataInit?.jobId?.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Tên Công Ty">
                        {dataInit?.companyId?.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày tạo">{dataInit && dataInit.createdAt ? dayjs(dataInit.createdAt).format('DD-MM-YYYY HH:mm:ss') : ""}</Descriptions.Item>
                    <Descriptions.Item label="Ngày sửa">{dataInit && dataInit.updatedAt ? dayjs(dataInit.updatedAt).format('DD-MM-YYYY HH:mm:ss') : ""}</Descriptions.Item>
                    <Descriptions.Item label="Tệp CV" span={2}>
                        <Space>
                            <Button
                                type="primary"
                                size="small"
                                icon={<EyeOutlined />}
                                onClick={handlePreviewResume}
                                disabled={!resumeUrl}
                            >
                                Xem trước
                            </Button>
                            <Button
                                type="link"
                                onClick={handleOpenResume}
                                disabled={!resumeUrl}
                                style={{ paddingLeft: 0 }}
                            >
                                Chi tiết
                            </Button>
                        </Space>
                    </Descriptions.Item>

                </Descriptions>
            </Drawer>
            <Modal
                title="Xem trước CV"
                open={previewOpen}
                onCancel={() => setPreviewOpen(false)}
                footer={null}
                width={900}
                bodyStyle={{ height: 600, padding: 0 }}
                destroyOnClose
            >
                {resumeUrl ? (
                    <iframe src={resumeUrl} style={{ width: '100%', height: '100%', border: 0 }} />
                ) : (
                    <div>Không có CV để hiển thị</div>
                )}
            </Modal>
            <CreateInterviewModal
                open={interviewModalOpen}
                onClose={() => {
                    setInterviewModalOpen(false);
                    setSelectedInterviewResume(null);
                    setSelectedInterviewJob(null);
                }}
                resume={selectedInterviewResume}
                job={selectedInterviewJob}
                onSuccess={() => {
                    reloadTable();
                    setInterviewModalOpen(false);
                    setSelectedInterviewResume(null);
                    setSelectedInterviewJob(null);
                }}
            />
        </>
    )
}

export default ViewDetailResume;
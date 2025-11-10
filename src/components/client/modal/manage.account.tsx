import { Button, Col, Form, Input, Modal, Row, Select, Table, Tabs, Tag, Upload, message, notification } from "antd";
import { isMobile } from "react-device-detect";
import type { TabsProps } from 'antd';
import { IResume, IUser } from "@/types/backend";
import { useState, useEffect } from 'react';
import { callFetchResumeByUser, callGetSubscriberSkills, callUpdateSubscriber, callFetchUserById, callUpdateSelfUser, callChangeSelfPassword, callUploadSingleFile, callUpdateResumeFile } from "@/config/api";
import type { ColumnsType } from 'antd/es/table';
import type { UploadProps } from "antd";
import dayjs from 'dayjs';
import { MonitorOutlined, EyeOutlined, UploadOutlined } from "@ant-design/icons";
import { SKILLS_LIST } from "@/config/utils";
import { useAppSelector } from "@/redux/hooks";
// company hiển thị read-only, không dùng DebounceSelect

interface IProps {
    open: boolean;
    onClose: (v: boolean) => void;
}

const UserResume = () => {
    const [listCV, setListCV] = useState<IResume[]>([]);
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const [updatingResume, setUpdatingResume] = useState<IResume | null>(null);
    const [uploading, setUploading] = useState<boolean>(false);

    const fetchResumes = async () => {
        setIsFetching(true);
        try {
            const res = await callFetchResumeByUser();
            if (res && res.data) {
                setListCV(res.data as IResume[]);
            }
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        fetchResumes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleOpenUpdate = (resume: IResume) => {
        setUpdatingResume(resume);
    };

    const handleCloseUpdate = () => {
        setUpdatingResume(null);
    };

    const getJobName = (resume: IResume | null) => {
        if (!resume) return "";
        const job = resume.jobId as any;
        if (typeof job === "string") return job;
        return job?.name ?? "";
    };

    const getCompanyName = (resume: IResume | null) => {
        if (!resume) return "";
        const company = resume.companyId as any;
        if (typeof company === "string") return company;
        return company?.name ?? "";
    };

    const updateUploadProps: UploadProps = {
        maxCount: 1,
        multiple: false,
        accept: "application/pdf,application/msword, .doc, .docx, .pdf",
        showUploadList: false,
        disabled: uploading,
        async customRequest({ file, onSuccess, onError }: any) {
            if (!updatingResume?._id) {
                if (onError) onError({ event: new Error("Không tìm thấy hồ sơ cần cập nhật") });
                return;
            }
            setUploading(true);
            try {
                const uploadRes = await callUploadSingleFile(file, "resume");
                if (uploadRes?.data?.fileName) {
                    const updateRes = await callUpdateResumeFile(updatingResume._id, uploadRes.data.fileName);
                    if (updateRes?.data) {
                        message.success("Cập nhật CV thành công");
                        await fetchResumes();
                        handleCloseUpdate();
                        if (onSuccess) onSuccess('ok');
                    } else {
                        throw new Error(updateRes?.message ?? "Không thể cập nhật CV");
                    }
                } else {
                    throw new Error(uploadRes?.message ?? "Không thể upload file");
                }
            } catch (error: any) {
                message.error(error?.message ?? "Đã có lỗi xảy ra khi cập nhật CV");
                if (onError) onError({ event: error });
            } finally {
                setUploading(false);
            }
        }
    };

    const renderStatus = (status?: string) => {
        const map: Record<string, { color: string; text: string }> = {
            PENDING: { color: 'gold', text: 'Pending' },
            REVIEWING: { color: 'blue', text: 'Reviewing' },
            APPROVED: { color: 'green', text: 'Approved' },
            REJECTED: { color: 'red', text: 'Rejected' },
        };
        const key = (status || '').toUpperCase();
        const cfg = map[key] || { color: 'default', text: status || '-' };
        return <Tag color={cfg.color}>{cfg.text}</Tag>
    }

    const [previewUrl, setPreviewUrl] = useState<string>("");
    const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

    const columns: ColumnsType<IResume> = [
        {
            title: 'STT',
            key: 'index',
            width: 60,
            align: "center",
            fixed: 'left' as const,
            render: (text, record, index) => {
                return (
                    <>
                        {(index + 1)}
                    </>)
            }
        },
        {
            title: 'Công Ty',
            dataIndex: ["companyId", "name"],
            ellipsis: true,
        },
        {
            title: 'Vị trí',
            dataIndex: ["jobId", "name"],
            ellipsis: true,
        },
        {
            title: 'Trạng thái',
            dataIndex: "status",
            width: 100,
            align: 'center',
            render: (value) => renderStatus(value as any)
        },
        {
            title: 'Ngày rải CV',
            dataIndex: "createdAt",
            width: 140,
            render(value, record, index) {
                return (
                    <span style={{ fontSize: '12px' }}>{dayjs(record.createdAt).format('DD-MM-YYYY HH:mm')}</span>
                )
            },
        },
        {
            title: 'Xem',
            dataIndex: "preview",
            width: 50,
            align: 'center',
            render: (_, record) => {
                const url = `${import.meta.env.VITE_BACKEND_URL}/images/resume/${record?.url}`;
                return (
                    <Button
                        type="text"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => { setPreviewUrl(url); setIsPreviewOpen(true); }}
                    />
                )
            }
        },
        {
            title: 'Chi tiết',
            dataIndex: "detail",
            width: 70,
            align: 'center',
            render: (_, record) => (
                <a
                    href={`${import.meta.env.VITE_BACKEND_URL}/images/resume/${record?.url}`}
                    target="_blank"
                    style={{ fontSize: '12px' }}
                >Chi tiết</a>
            )
        },
        {
            title: 'Cập nhật CV',
            key: 'updateCV',
            align: 'center',
            width: 120,
            render: (_: any, record: IResume) => {
                return (
                    <Button
                        type="primary"
                        size="small"
                        icon={<UploadOutlined />}
                        onClick={() => handleOpenUpdate(record)}
                    >
                        Cập nhật 
                    </Button>
                );
            }
        },
    ];

    return (
        <>
            <style>{`
                .user-resume-table-modal .ant-table-container {
                    overflow-x: hidden !important;
                }
                .user-resume-table-modal .ant-table-body {
                    overflow-x: hidden !important;
                }
                .user-resume-table-modal .ant-table-body::-webkit-scrollbar {
                    width: 6px;
                    height: 0;
                }
                .user-resume-table-modal .ant-table-body::-webkit-scrollbar-track {
                    background: transparent;
                }
                .user-resume-table-modal .ant-table-body::-webkit-scrollbar-thumb {
                    background: rgba(0, 0, 0, 0.2);
                    border-radius: 3px;
                }
                .user-resume-table-modal .ant-table-body::-webkit-scrollbar-thumb:hover {
                    background: rgba(0, 0, 0, 0.3);
                }
            `}</style>
            <div className="user-resume-table-modal" style={{ width: '100%' }}>
                <Table<IResume>
                    columns={columns}
                    dataSource={listCV}
                    loading={isFetching}
                    pagination={false}
                    scroll={{ y: 400 }}
                    rowKey={(record) => record._id || `row-${Math.random()}`}
                    size="small"
                    bordered
                />
            </div>
            <Modal
                title="Preview CV"
                open={isPreviewOpen}
                onCancel={() => setIsPreviewOpen(false)}
                footer={null}
                width={900}
                bodyStyle={{ height: 600, padding: 0 }}
                destroyOnClose
            >
                <iframe src={previewUrl} style={{ width: '100%', height: '100%', border: 0 }} />
            </Modal>
            <Modal
                title="Cập nhật CV đã gửi"
                open={!!updatingResume}
                onCancel={handleCloseUpdate}
                footer={null}
                maskClosable={false}
                destroyOnClose
            >
                <p>
                    Bạn đang cập nhật CV cho công việc <b>{getJobName(updatingResume)}</b> tại <b>{getCompanyName(updatingResume)}</b>.
                </p>
                <Upload {...updateUploadProps}>
                    <Button icon={<UploadOutlined />} loading={uploading}>
                        {uploading ? "Đang cập nhật..." : "Tải CV mới"}
                    </Button>
                </Upload>
                <p style={{ marginTop: 12, color: '#888' }}>
                    Hỗ trợ định dạng *.doc, *.docx, *.pdf (dưới 5MB).
                </p>
            </Modal>
        </>
    )
}

const UserUpdateInfo = (props: any) => {
    const [form] = Form.useForm();
    const accountUser = useAppSelector(state => state.account.user);
    // company chỉ đọc

    useEffect(() => {
        const init = async () => {
            if (!accountUser?._id) return;
            const res = await callFetchUserById(accountUser._id);
            if (res && res.data) {
                const u = res.data as IUser;
                form.setFieldsValue({
                    email: u.email,
                    name: u.name,
                    age: u.age,
                    gender: u.gender,
                    address: u.address,
                    phone: (u as any)?.phone ?? '',
                    companyName: (u as any)?.company?.name ?? ''
                });
            }
        };
        init();
    }, [accountUser?._id]);

    const onFinish = async (values: any) => {
        const { name, email, age, gender, address, phone } = values;
        const body: Partial<IUser> = {
            name,
            email,
            age: Number(age),
            gender,
            address,
            phone
        };
        const res = await callUpdateSelfUser(body);
        if (res && res.data) {
            message.success("Cập nhật thông tin thành công");
        } else {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: (res as any)?.message
            });
        }
    };

    return (
        <>
            <Form form={form} layout={"vertical"} onFinish={onFinish}>
                <Row gutter={[16, 0]}>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }, { type: 'email', message: 'Vui lòng nhập email hợp lệ' }]}
                        >
                            <Input placeholder="Nhập email" />
                        </Form.Item>
                    </Col>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <Form.Item
                            label="Tên hiển thị"
                            name="name"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                        >
                            <Input placeholder="Nhập tên hiển thị" />
                        </Form.Item>
                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <Form.Item
                            label="Số điện thoại"
                            name="phone"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                        >
                            <Input placeholder="Nhập số điện thoại" />
                        </Form.Item>
                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <Form.Item
                            label="Tuổi"
                            name="age"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                        >
                            <Input type="number" placeholder="Nhập tuổi" />
                        </Form.Item>
                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <Form.Item
                            name="gender"
                            label="Giới Tính"
                            rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
                        >
                            <Select
                                options={[
                                    { label: 'Nam', value: 'MALE' },
                                    { label: 'Nữ', value: 'FEMALE' },
                                    { label: 'Khác', value: 'OTHER' },
                                ]}
                                placeholder="Vui lòng chọn giới tính"
                            />
                        </Form.Item>
                    </Col>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <Form.Item
                            name="companyName"
                            label="Thuộc Công Ty"
                        >
                            <Input disabled placeholder="Thuộc công ty" />
                        </Form.Item>
                    </Col>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <Form.Item
                            label="Địa chỉ"
                            name="address"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                        >
                            <Input placeholder="Nhập địa chỉ" />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Button type="primary" onClick={() => form.submit()}>Cập nhật</Button>
                    </Col>
                </Row>
            </Form>
        </>
    )
}

const JobByEmail = (props: any) => {
    const [form] = Form.useForm();
    const user = useAppSelector(state => state.account.user);

    useEffect(() => {
        const init = async () => {
            const res = await callGetSubscriberSkills();
            if (res && res.data) {
                form.setFieldValue("skills", res.data.skills);
            }
        }
        init();
    }, [])

    const onFinish = async (values: any) => {
        const { skills } = values;
        const res = await callUpdateSubscriber({
            email: user.email,
            name: user.name,
            skills: skills ? skills : []
        });
        if (res.data) {
            message.success("Cập nhật thông tin thành công");
        } else {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: res.message
            });
        }

    }

    return (
        <>
            <Form
                onFinish={onFinish}
                form={form}
            >
                <Row gutter={[20, 20]}>
                    <Col span={24}>
                        <Form.Item
                            label={"Kỹ năng"}
                            name={"skills"}
                            rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 skill!' }]}

                        >
                            <Select
                                mode="multiple"
                                allowClear
                                showArrow={false}
                                style={{ width: '100%' }}
                                placeholder={
                                    <>
                                        <MonitorOutlined /> Tìm theo kỹ năng...
                                    </>
                                }
                                optionLabelProp="label"
                                options={SKILLS_LIST}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Button onClick={() => form.submit()}>Cập nhật</Button>
                    </Col>
                </Row>
            </Form>
        </>
    )
}

const ChangePassword = () => {
    const [form] = Form.useForm();

    const onFinish = async (values: any) => {
        const { currentPassword, newPassword, confirmPassword } = values;
        if (newPassword !== confirmPassword) {
            notification.error({ message: 'Có lỗi xảy ra', description: 'Xác nhận mật khẩu không khớp' });
            return;
        }
        const res = await callChangeSelfPassword(currentPassword, newPassword);
        if ((res as any)?.data) {
            message.success('Đổi mật khẩu thành công');
            form.resetFields();
        } else {
            notification.error({ message: 'Có lỗi xảy ra', description: (res as any)?.message });
        }
    }

    return (
        <>
            <Form form={form} layout={"vertical"} onFinish={onFinish}>
                <Row gutter={[16, 0]}>
                    <Col lg={8} md={12} sm={24} xs={24}>
                        <Form.Item
                            label="Mật khẩu hiện tại"
                            name="currentPassword"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                        >
                            <Input.Password placeholder="Nhập mật khẩu hiện tại" />
                        </Form.Item>
                    </Col>
                    <Col lg={8} md={12} sm={24} xs={24}>
                        <Form.Item
                            label="Mật khẩu mới"
                            name="newPassword"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }, { min: 6, message: 'Tối thiểu 6 ký tự' }]}
                        >
                            <Input.Password placeholder="Nhập mật khẩu mới" />
                        </Form.Item>
                    </Col>
                    <Col lg={8} md={12} sm={24} xs={24}>
                        <Form.Item
                            label="Xác nhận mật khẩu mới"
                            name="confirmPassword"
                            dependencies={["newPassword"]}
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                        >
                            <Input.Password placeholder="Nhập lại mật khẩu mới" />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Button type="primary" onClick={() => form.submit()}>Cập nhật</Button>
                    </Col>
                </Row>
            </Form>
        </>
    )
}

const ManageAccount = (props: IProps) => {
    const { open, onClose } = props;

    const onChange = (key: string) => {
        // console.log(key);
    };

    const items: TabsProps['items'] = [
        {
            key: 'user-resume',
            label: `Rải CV`,
            children: <UserResume />,
        },
        {
            key: 'email-by-skills',
            label: `Nhận Jobs qua Email`,
            children: <JobByEmail />,
        },
        {
            key: 'user-update-info',
            label: `Cập nhật thông tin`,
            children: <UserUpdateInfo />,
        },
        {
            key: 'user-password',
            label: `Thay đổi mật khẩu`,
            children: <ChangePassword />,
        },
    ];


    return (
        <>
            <Modal
                title="Quản lý tài khoản"
                open={open}
                onCancel={() => onClose(false)}
                maskClosable={false}
                footer={null}
                destroyOnClose={true}
                width={isMobile ? "100%" : "1200px"}
            >

                <div style={{ minHeight: 400, width: '100%' }}>
                    <Tabs
                        defaultActiveKey="user-resume"
                        items={items}
                        onChange={onChange}
                        style={{ width: '100%' }}
                    />
                </div>

            </Modal>
        </>
    )
}

export default ManageAccount;
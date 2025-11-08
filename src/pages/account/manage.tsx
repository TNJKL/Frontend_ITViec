import { Button, Col, Form, Input, Modal, Row, Select, Table, Tabs, Tag, message, notification, Menu, Space, Card, Popconfirm, DatePicker, Switch, Spin, Upload } from "antd";
import type { TabsProps, UploadProps } from 'antd';
import { IResume, IUser } from "@/types/backend";
import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { EyeOutlined, MonitorOutlined, PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, UploadOutlined } from "@ant-design/icons";
import { useAppSelector } from "@/redux/hooks";
import { callChangeSelfPassword, callFetchResumeByUser, callFetchUserById, callGetSubscriberSkills, callUpdateSelfUser, callUpdateSubscriber, callUploadSingleFile } from "@/config/api";
import type { RcFile } from 'antd/es/upload';
import { SKILLS_LIST } from "@/config/utils";

type ProfileModalType = 'aboutMe' | 'education' | 'experience' | 'skills' | 'languages' | 'projects' | 'certificates' | 'awards';

const dateDisplay = (from?: string | Date, to?: string | Date, currently?: boolean) => {
    if (!from && !to) return '';
    const start = from ? dayjs(from).format('MM/YYYY') : '';
    const end = currently ? 'HIỆN TẠI' : to ? dayjs(to).format('MM/YYYY') : '';
    if (start && end) return `${start} - ${end}`;
    return start || end;
}

const ProfileSectionHeader = ({ title, onAdd }: { title: string; onAdd?: () => void }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        {onAdd && (
            <Button type="text" icon={<PlusOutlined />} onClick={onAdd} />
        )}
    </div>
);

const EmptyState = ({ text }: { text: string }) => (
    <div style={{ color: '#999', fontStyle: 'italic' }}>{text}</div>
);

const SectionCard = ({ children }: { children: React.ReactNode }) => (
    <Card
        bordered={false}
        style={{ marginBottom: 16, borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
        bodyStyle={{ padding: 20 }}
    >
        {children}
    </Card>
);

const UserResume = () => {
    const [listCV, setListCV] = useState<IResume[]>([]);
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const [previewUrl, setPreviewUrl] = useState<string>("");
    const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

    useEffect(() => {
        const init = async () => {
            setIsFetching(true);
            const res = await callFetchResumeByUser();
            if (res && res.data) {
                setListCV(res.data as IResume[])
            }
            setIsFetching(false);
        }
        init();
    }, [])

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

    const columns: any = [
        { title: 'STT', key: 'index', width: 70, align: 'center', render: (_: any, __: any, index: number) => <>{index + 1}</> },
        { title: 'Công Ty', dataIndex: ["companyId", "name"], ellipsis: true },
        { title: 'Vị trí', dataIndex: ["jobId", "name"], ellipsis: true },
        { title: 'Trạng thái', dataIndex: 'status', align: 'center', render: (v: string) => renderStatus(v as any) },
        { title: 'Ngày rải CV', dataIndex: 'createdAt', ellipsis: true, render: (_: any, r: IResume) => <>{dayjs(r.createdAt).format('DD-MM-YYYY HH:mm:ss')}</> },
        {
            title: 'Xem', dataIndex: 'preview', align: 'center', render: (_: any, record: IResume) => {
                const url = `${import.meta.env.VITE_BACKEND_URL}/images/resume/${record?.url}`;
                return <Button type="text" icon={<EyeOutlined />} onClick={() => { setPreviewUrl(url); setIsPreviewOpen(true); }} />
            }
        },
        { title: 'Chi tiết', dataIndex: 'detail', align: 'center', render: (_: any, record: IResume) => <a href={`${import.meta.env.VITE_BACKEND_URL}/images/resume/${record?.url}`} target="_blank">Chi tiết</a> }
    ];

    return (
        <div style={{ background: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', width: '100%', margin: 0, overflowX: 'hidden' }}>
            <Table<IResume>
                columns={columns}
                dataSource={listCV}
                loading={isFetching}
                pagination={false}
                tableLayout="fixed"
                scroll={{ y: 360 }}
                style={{ width: '100%' }}
            />
            <Modal title="Preview CV" open={isPreviewOpen} onCancel={() => setIsPreviewOpen(false)} footer={null} width={900} bodyStyle={{ height: 600, padding: 0 }} destroyOnClose>
                <iframe src={previewUrl} style={{ width: '100%', height: '100%', border: 0 }} />
            </Modal>
        </div>
    )
}

const UserUpdateInfo = () => {
    const [form] = Form.useForm();
    const accountUser = useAppSelector(state => state.account.user);

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
        const body: Partial<IUser> = { name, email, age: Number(age), gender, address, phone };
        const res = await callUpdateSelfUser(body);
        if (res && res.data) {
            message.success("Cập nhật thông tin thành công");
        } else {
            notification.error({ message: 'Có lỗi xảy ra', description: (res as any)?.message });
        }
    };

    return (
        <div style={{ background: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', width: '100%', margin: 0 }}>
            <Form form={form} layout={"vertical"} onFinish={onFinish}>
                <Row gutter={[16, 0]}>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Vui lòng không bỏ trống' }, { type: 'email', message: 'Vui lòng nhập email hợp lệ' }]}>
                            <Input placeholder="Nhập email" />
                        </Form.Item>
                    </Col>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <Form.Item label="Tên hiển thị" name="name" rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}>
                            <Input placeholder="Nhập tên hiển thị" />
                        </Form.Item>
                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <Form.Item label="Số điện thoại" name="phone" rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}>
                            <Input placeholder="Nhập số điện thoại" />
                        </Form.Item>
                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <Form.Item label="Tuổi" name="age" rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}>
                            <Input type="number" placeholder="Nhập tuổi" />
                        </Form.Item>
                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <Form.Item name="gender" label="Giới Tính" rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}>
                            <Select options={[{ label: 'Nam', value: 'MALE' }, { label: 'Nữ', value: 'FEMALE' }, { label: 'Khác', value: 'OTHER' }]} placeholder="Vui lòng chọn giới tính" />
                        </Form.Item>
                    </Col>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <Form.Item name="companyName" label="Thuộc Công Ty">
                            <Input disabled placeholder="Thuộc công ty" />
                        </Form.Item>
                    </Col>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <Form.Item label="Địa chỉ" name="address" rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}>
                            <Input placeholder="Nhập địa chỉ" />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Button type="primary" onClick={() => form.submit()}>Cập nhật</Button>
                    </Col>
                </Row>
            </Form>
        </div>
    )
}

const JobByEmail = () => {
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
        const res = await callUpdateSubscriber({ email: user.email, name: user.name, skills: skills ? skills : [] });
        if (res.data) {
            message.success("Cập nhật thông tin thành công");
        } else {
            notification.error({ message: 'Có lỗi xảy ra', description: res.message });
        }
    }

    return (
        <div style={{ background: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', width: '100%', margin: 0 }}>
            <Form onFinish={onFinish} form={form}>
                <Row gutter={[20, 20]}>
                    <Col span={24}>
                        <Form.Item label={"Kỹ năng"} name={"skills"} rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 skill!' }]}>
                            <Select
                                mode="multiple"
                                allowClear
                                showArrow={false}
                                style={{ width: '100%' }}
                                placeholder={<><MonitorOutlined /> Tìm theo kỹ năng...</>}
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
        </div>
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
        <div style={{ background: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', width: '100%', margin: 0 }}>
            <Form form={form} layout={"vertical"} onFinish={onFinish}>
                <Row gutter={[16, 0]}>
                    <Col lg={8} md={12} sm={24} xs={24}>
                        <Form.Item label="Mật khẩu hiện tại" name="currentPassword" rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}>
                            <Input.Password placeholder="Nhập mật khẩu hiện tại" />
                        </Form.Item>
                    </Col>
                    <Col lg={8} md={12} sm={24} xs={24}>
                        <Form.Item label="Mật khẩu mới" name="newPassword" rules={[{ required: true, message: 'Vui lòng không bỏ trống' }, { min: 6, message: 'Tối thiểu 6 ký tự' }]}>
                            <Input.Password placeholder="Nhập mật khẩu mới" />
                        </Form.Item>
                    </Col>
                    <Col lg={8} md={12} sm={24} xs={24}>
                        <Form.Item label="Xác nhận mật khẩu mới" name="confirmPassword" dependencies={["newPassword"]} rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}>
                            <Input.Password placeholder="Nhập lại mật khẩu mới" />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Button type="primary" onClick={() => form.submit()}>Cập nhật</Button>
                    </Col>
                </Row>
            </Form>
        </div>
    )
}

const UserProfile = () => {
    const accountUser = useAppSelector(state => state.account.user);
    const [profile, setProfile] = useState<IUser | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [uploadingAvatar, setUploadingAvatar] = useState<boolean>(false);
    const [modalState, setModalState] = useState<{ open: boolean; type: ProfileModalType; index?: number | null }>({ open: false, type: 'aboutMe', index: null });
    const [form] = Form.useForm();

    const fetchProfile = async () => {
        if (!accountUser?._id) return;
        setLoading(true);
        const res = await callFetchUserById(accountUser._id);
        if (res?.data) {
            setProfile(res.data as IUser);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchProfile();
    }, [accountUser?._id]);

    const openModal = (type: ProfileModalType, index: number | null = null) => {
        setModalState({ open: true, type, index });
        form.resetFields();
        if (!profile) return;
        if (type === 'aboutMe') {
            form.setFieldsValue({ aboutMe: profile.aboutMe });
            return;
        }
        if (type === 'skills') {
            form.setFieldsValue({
                core: profile.skills?.core || [],
                soft: profile.skills?.soft || [],
            });
            return;
        }
        const list = (profile as any)[type] || [];
        if (index !== null && list[index]) {
            const item = list[index];
            const values: any = { ...item };
            if ('from' in item) {
                values.duration = [item.from ? dayjs(item.from) : null, item.to ? dayjs(item.to) : null];
            }
            if (item.date) values.date = dayjs(item.date);
            if (item && 'currentlyStudying' in item) values.currentlyStudying = item.currentlyStudying;
            form.setFieldsValue(values);
        }
    };

    const closeModal = () => {
        setModalState(prev => ({ ...prev, open: false }));
        form.resetFields();
    };

    const updateProfile = async (payload: Partial<IUser>) => {
        const res = await callUpdateSelfUser(payload);
        if (res?.data) {
            message.success('Đã cập nhật hồ sơ');
            setProfile(prev => prev ? ({ ...prev, ...payload }) as IUser : prev);
            fetchProfile();
            return true;
        }
        notification.error({ message: 'Có lỗi xảy ra', description: (res as any)?.message });
        return false;
    };

    const handleUploadAvatar: UploadProps['customRequest'] = async ({ file, onSuccess, onError }) => {
        setUploadingAvatar(true);
        try {
            const res = await callUploadSingleFile(file as RcFile, 'avatar');
            if (res?.data?.fileName) {
                const avatarUrl = `${import.meta.env.VITE_BACKEND_URL}/images/avatar/${res.data.fileName}`;
                await updateProfile({ avatar: avatarUrl });
                message.success('Đã cập nhật ảnh đại diện');
                if (onSuccess) onSuccess(res.data);
            } else {
                throw new Error('Upload failed');
            }
        } catch (error: any) {
            message.error('Không thể upload ảnh đại diện');
            if (onError) onError(error);
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleDeleteItem = async (type: ProfileModalType, index: number) => {
        if (!profile) return;
        const currentList = (profile as any)[type] || [];
        const newList = currentList.filter((_: any, idx: number) => idx !== index);
        await updateProfile({ [type]: newList } as any);
    };

    const modalTitleMap: Record<ProfileModalType, string> = {
        aboutMe: 'Giới thiệu bản thân',
        education: 'Học vấn',
        experience: 'Kinh nghiệm làm việc',
        skills: 'Kỹ năng',
        languages: 'Ngoại ngữ',
        projects: 'Dự án',
        certificates: 'Chứng chỉ',
        awards: 'Giải thưởng',
    };

    const handleSubmit = async () => {
        if (!profile) return;
        const { type, index } = modalState;
        const values = await form.validateFields();
        const payload: any = {};

        if (type === 'aboutMe') {
            payload.aboutMe = values.aboutMe;
        } else if (type === 'skills') {
            payload.skills = { core: values.core || [], soft: values.soft || [] };
        } else if (['education', 'experience', 'projects', 'certificates'].includes(type)) {
            const list = (profile as any)[type] ? [...(profile as any)[type]] : [];
            const range = Array.isArray(values.duration) ? values.duration : [];
            const fromValue = range[0];
            const toValue = range[1];
            const normalized = {
                ...values,
                from: fromValue ? dayjs(fromValue).toISOString() : undefined,
                to: toValue ? dayjs(toValue).toISOString() : undefined,
            };
            delete normalized.duration;
            if (type === 'education' && values.currentlyStudying) {
                normalized.to = undefined;
            }
            if (index !== null && index !== undefined && index > -1) {
                list[index] = normalized;
            } else {
                list.push(normalized);
            }
            payload[type] = list;
        } else if (type === 'languages') {
            const list = (profile as any).languages ? [...(profile as any).languages] : [];
            if (index !== null && index !== undefined && index > -1) {
                list[index] = values;
            } else {
                list.push(values);
            }
            payload.languages = list;
        } else if (type === 'awards') {
            const list = profile.awards ? [...profile.awards] : [];
            const normalized = {
                ...values,
                date: values.date ? dayjs(values.date).toISOString() : undefined,
            };
            if (index !== null && index !== undefined && index > -1) {
                list[index] = normalized;
            } else {
                list.push(normalized);
            }
            payload.awards = list;
        }

        const ok = await updateProfile(payload);
        if (ok) closeModal();
    };

    const renderList = (type: ProfileModalType) => {
        if (!profile) return null;
        const list = (profile as any)[type] || [];
        if (!list.length) return <EmptyState text="Chưa có dữ liệu" />;
        return (
            <Space direction="vertical" style={{ width: '100%' }}>
                {list.map((item: any, idx: number) => (
                    <div key={idx} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 12, marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                {type === 'education' && (
                                    <>
                                        <div style={{ fontWeight: 600 }}>{item.school}</div>
                                        <div>{[item.degree, item.major].filter(Boolean).join(' - ')}</div>
                                    </>
                                )}
                                {type === 'experience' && (
                                    <>
                                        <div style={{ fontWeight: 600 }}>{item.position}</div>
                                        <div>{item.companyName}</div>
                                    </>
                                )}
                                {type === 'languages' && (
                                    <>
                                        <div style={{ fontWeight: 600 }}>{item.name}</div>
                                        <div>{item.level}</div>
                                    </>
                                )}
                                {type === 'projects' && (
                                    <>
                                        <div style={{ fontWeight: 600 }}>{item.name}</div>
                                        {item.website && <a href={item.website} target="_blank" rel="noreferrer">{item.website}</a>}
                                    </>
                                )}
                                {type === 'certificates' && (
                                    <>
                                        <div style={{ fontWeight: 600 }}>{item.name}</div>
                                        <div>{item.organization}</div>
                                        {item.link && <a href={item.link} target="_blank" rel="noreferrer">Link chứng chỉ</a>}
                                    </>
                                )}
                                {type === 'awards' && (
                                    <>
                                        <div style={{ fontWeight: 600 }}>{item.name}</div>
                                        <div>{item.organization}</div>
                                    </>
                                )}
                                {item.description && <div>{item.description}</div>}
                                {item.details && <div>{item.details}</div>}
                                {item.projects && type === 'experience' && <div>{item.projects}</div>}
                                <div style={{ color: '#555', fontSize: 12 }}>
                                    {type === 'awards'
                                        ? item.date ? dayjs(item.date).format('MM/YYYY') : ''
                                        : dateDisplay(item.from, item.to, item.currentlyStudying)}
                                </div>
                            </div>
                            <Space>
                                <Button type="text" icon={<EditOutlined />} onClick={() => openModal(type, idx)} />
                                <Popconfirm title="Xoá mục này?" onConfirm={() => handleDeleteItem(type, idx)}>
                                    <Button type="text" danger icon={<DeleteOutlined />} />
                                </Popconfirm>
                            </Space>
                        </div>
                    </div>
                ))}
            </Space>
        );
    };

    const skillsContent = useMemo(() => {
        if (!profile?.skills) return null;
        return (
            <div>
                <div><strong>Kỹ năng chuyên môn:</strong> {(profile.skills.core || []).join(', ') || 'Chưa cập nhật'}</div>
                <div style={{ marginTop: 8 }}><strong>Kỹ năng mềm:</strong> {(profile.skills.soft || []).join(', ') || 'Chưa cập nhật'}</div>
            </div>
        );
    }, [profile]);

    return (
        <div style={{ background: '#fff', padding: 24, borderRadius: 10, boxShadow: '0 8px 20px rgba(15,23,42,0.08)', width: '100%' }}>
            <Spin spinning={loading}>
                <div style={{ maxHeight: 640, overflowY: 'auto', paddingRight: 12 }}>
                    <SectionCard>
                        <ProfileSectionHeader title="Ảnh đại diện" />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                            <div style={{ position: 'relative' }}>
                                {profile?.avatar ? (
                                    <img 
                                        src={profile.avatar} 
                                        alt="Avatar" 
                                        style={{ 
                                            width: 120, 
                                            height: 120, 
                                            borderRadius: '50%', 
                                            objectFit: 'cover',
                                            border: '3px solid #f0f0f0',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                        }} 
                                    />
                                ) : (
                                    <div style={{ 
                                        width: 120, 
                                        height: 120, 
                                        borderRadius: '50%', 
                                        background: '#f0f0f0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '3px solid #e0e0e0'
                                    }}>
                                        <UserOutlined style={{ fontSize: 48, color: '#999' }} />
                                    </div>
                                )}
                                <Upload
                                    customRequest={handleUploadAvatar}
                                    showUploadList={false}
                                    accept="image/*"
                                    maxCount={1}
                                >
                                    <Button
                                        type="primary"
                                        icon={<UploadOutlined />}
                                        loading={uploadingAvatar}
                                        style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            right: 0,
                                            borderRadius: '50%',
                                            width: 36,
                                            height: 36,
                                            padding: 0,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                        }}
                                    />
                                </Upload>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ color: '#666', fontSize: 14, marginBottom: 8 }}>
                                    {profile?.avatar ? 'Ảnh đại diện hiện tại' : 'Chưa có ảnh đại diện'}
                                </div>
                                <div style={{ color: '#999', fontSize: 12 }}>
                                    Nhấn vào nút upload để thay đổi ảnh đại diện. Kích thước khuyến nghị: 400x400px
                                </div>
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard>
                        <ProfileSectionHeader title="Giới thiệu bản thân" onAdd={() => openModal('aboutMe')} />
                        <div>{profile?.aboutMe || <EmptyState text="Chưa có mô tả" />}</div>
                    </SectionCard>

                    <SectionCard>
                        <ProfileSectionHeader title="Học vấn" onAdd={() => openModal('education')} />
                        {renderList('education')}
                    </SectionCard>

                    <SectionCard>
                        <ProfileSectionHeader title="Kinh nghiệm làm việc" onAdd={() => openModal('experience')} />
                        {renderList('experience')}
                    </SectionCard>

                    <SectionCard>
                        <ProfileSectionHeader title="Kỹ năng" onAdd={() => openModal('skills')} />
                        {skillsContent || <EmptyState text="Chưa cập nhật kỹ năng" />}
                    </SectionCard>

                    <SectionCard>
                        <ProfileSectionHeader title="Ngoại ngữ" onAdd={() => openModal('languages')} />
                        {renderList('languages')}
                    </SectionCard>

                    <SectionCard>
                        <ProfileSectionHeader title="Dự án" onAdd={() => openModal('projects')} />
                        {renderList('projects')}
                    </SectionCard>

                    <SectionCard>
                        <ProfileSectionHeader title="Chứng chỉ" onAdd={() => openModal('certificates')} />
                        {renderList('certificates')}
                    </SectionCard>

                    <SectionCard>
                        <ProfileSectionHeader title="Giải thưởng" onAdd={() => openModal('awards')} />
                        {renderList('awards')}
                    </SectionCard>
                </div>

                <Modal
                    title={modalTitleMap[modalState.type]}
                    open={modalState.open}
                    onCancel={closeModal}
                    onOk={handleSubmit}
                    destroyOnClose
                    okText="Lưu"
                >
                    <Form layout="vertical" form={form}>
                        {modalState.type === 'aboutMe' && (
                            <Form.Item name="aboutMe" label="Giới thiệu" rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}>
                                <Input.TextArea rows={4} placeholder="Giới thiệu ngắn gọn về bản thân" />
                            </Form.Item>
                        )}

                        {modalState.type === 'skills' && (
                            <>
                                <Form.Item name="core" label="Kỹ năng chuyên môn">
                                    <Select mode="tags" placeholder="Nhập kỹ năng" />
                                </Form.Item>
                                <Form.Item name="soft" label="Kỹ năng mềm">
                                    <Select mode="tags" placeholder="Nhập kỹ năng" />
                                </Form.Item>
                            </>
                        )}

                        {['education', 'experience', 'projects', 'certificates'].includes(modalState.type) && (
                            <>
                                {modalState.type === 'education' && (
                                    <>
                                        <Form.Item name="school" label="Trường" rules={[{ required: true, message: 'Vui lòng nhập trường' }]}>
                                            <Input />
                                        </Form.Item>
                                        <Form.Item name="degree" label="Trình độ">
                                            <Input />
                                        </Form.Item>
                                        <Form.Item name="major" label="Ngành học">
                                            <Input />
                                        </Form.Item>
                                        <Form.Item name="currentlyStudying" label="Đang học" valuePropName="checked">
                                            <Switch />
                                        </Form.Item>
                                    </>
                                )}
                                {modalState.type === 'experience' && (
                                    <>
                                        <Form.Item name="position" label="Chức danh" rules={[{ required: true, message: 'Vui lòng nhập chức danh' }]}>
                                            <Input />
                                        </Form.Item>
                                        <Form.Item name="companyName" label="Tên công ty" rules={[{ required: true, message: 'Vui lòng nhập tên công ty' }]}>
                                            <Input />
                                        </Form.Item>
                                        <Form.Item name="description" label="Mô tả">
                                            <Input.TextArea rows={3} />
                                        </Form.Item>
                                        <Form.Item name="projects" label="Dự án">
                                            <Input.TextArea rows={2} />
                                        </Form.Item>
                                    </>
                                )}
                                {modalState.type === 'projects' && (
                                    <>
                                        <Form.Item name="name" label="Tên dự án" rules={[{ required: true, message: 'Vui lòng nhập tên dự án' }]}>
                                            <Input />
                                        </Form.Item>
                                        <Form.Item name="description" label="Mô tả">
                                            <Input.TextArea rows={3} />
                                        </Form.Item>
                                        <Form.Item name="website" label="Website">
                                            <Input />
                                        </Form.Item>
                                    </>
                                )}
                                {modalState.type === 'certificates' && (
                                    <>
                                        <Form.Item name="name" label="Tên chứng chỉ" rules={[{ required: true, message: 'Vui lòng nhập tên chứng chỉ' }]}>
                                            <Input />
                                        </Form.Item>
                                        <Form.Item name="organization" label="Tổ chức" rules={[{ required: true, message: 'Vui lòng nhập tổ chức cấp' }]}>
                                            <Input />
                                        </Form.Item>
                                        <Form.Item name="link" label="Liên kết">
                                            <Input />
                                        </Form.Item>
                                        <Form.Item name="description" label="Mô tả">
                                            <Input.TextArea rows={2} />
                                        </Form.Item>
                                    </>
                                )}
                                <Form.Item name="duration" label="Thời gian">
                                    <DatePicker.RangePicker style={{ width: '100%' }} picker="month" format="MM/YYYY" />
                                </Form.Item>
                            </>
                        )}

                        {modalState.type === 'languages' && (
                            <>
                                <Form.Item name="name" label="Ngôn ngữ" rules={[{ required: true, message: 'Vui lòng nhập ngôn ngữ' }]}>
                                    <Input />
                                </Form.Item>
                                <Form.Item name="level" label="Trình độ" rules={[{ required: true, message: 'Vui lòng nhập trình độ' }]}>
                                    <Input />
                                </Form.Item>
                            </>
                        )}

                        {modalState.type === 'awards' && (
                            <>
                                <Form.Item name="name" label="Tên giải thưởng" rules={[{ required: true, message: 'Vui lòng nhập tên giải thưởng' }]}>
                                    <Input />
                                </Form.Item>
                                <Form.Item name="organization" label="Tổ chức" rules={[{ required: true, message: 'Vui lòng nhập tổ chức' }]}>
                                    <Input />
                                </Form.Item>
                                <Form.Item name="date" label="Thời gian">
                                    <DatePicker style={{ width: '100%' }} picker="month" format="MM/YYYY" />
                                </Form.Item>
                                <Form.Item name="description" label="Mô tả">
                                    <Input.TextArea rows={3} />
                                </Form.Item>
                            </>
                        )}
                    </Form>
                </Modal>
            </Spin>
        </div>
    );
};

const ManageAccountPage = () => {
    const items: TabsProps['items'] = [
        { key: 'user-resume', label: `Rải CV`, children: <UserResume /> },
        { key: 'email-by-skills', label: `Nhận Jobs qua Email`, children: <JobByEmail /> },
        { key: 'user-update-info', label: `Cập nhật thông tin`, children: <UserUpdateInfo /> },
        { key: 'user-profile', label: `Hồ sơ nghề nghiệp`, children: <UserProfile /> },
        { key: 'user-password', label: `Thay đổi mật khẩu`, children: <ChangePassword /> },
    ];

    const [activeKey, setActiveKey] = useState<string>('user-resume');

    const renderContent = () => {
        switch (activeKey) {
            case 'user-resume':
                return <UserResume />;
            case 'email-by-skills':
                return <JobByEmail />;
            case 'user-update-info':
                return <UserUpdateInfo />;
            case 'user-profile':
                return <UserProfile />;
            case 'user-password':
                return <ChangePassword />;
            default:
                return <UserResume />;
        }
    }

    const menuItems = [
        { key: 'user-resume', label: 'Rải CV' },
        { key: 'email-by-skills', label: 'Nhận Jobs qua Email' },
        { key: 'user-update-info', label: 'Cập nhật thông tin' },
        { key: 'user-profile', label: 'Hồ sơ nghề nghiệp' },
        { key: 'user-password', label: 'Thay đổi mật khẩu' },
    ];

    return (
        <div style={{
            background: '#f5f5f5',
            minHeight: 'calc(100vh - 200px)',
            padding: 32
        }}>
            <div style={{
                background: '#fff',
                borderRadius: 16,
                boxShadow: '0 20px 45px rgba(15,23,42,0.12)',
                maxWidth: 1280,
                margin: '0 auto',
                padding: 32,
                display: 'flex',
                gap: 32,
                alignItems: 'flex-start'
            }}>
                <div style={{
                    width: 240,
                    background: '#f8f9fb',
                    borderRadius: 12,
                    boxShadow: '0 10px 24px rgba(15,23,42,0.1)',
                    padding: 16,
                    flexShrink: 0
                }}>
                    <Menu
                        mode="inline"
                        selectedKeys={[activeKey]}
                        onClick={(e) => setActiveKey(e.key)}
                        style={{ borderRight: 0, background: 'transparent' }}
                        items={menuItems}
                    />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ maxWidth: 960, margin: '0 auto' }}>
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ManageAccountPage;

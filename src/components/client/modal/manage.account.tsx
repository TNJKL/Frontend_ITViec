import { Button, Col, Form, Input, Modal, Row, Select, Table, Tabs, message, notification } from "antd";
import { isMobile } from "react-device-detect";
import type { TabsProps } from 'antd';
import { IResume, IUser } from "@/types/backend";
import { useState, useEffect } from 'react';
import { callFetchResumeByUser, callGetSubscriberSkills, callUpdateSubscriber, callFetchUserById, callUpdateSelfUser, callChangeSelfPassword } from "@/config/api";
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { MonitorOutlined } from "@ant-design/icons";
import { SKILLS_LIST } from "@/config/utils";
import { useAppSelector } from "@/redux/hooks";
// company hiển thị read-only, không dùng DebounceSelect

interface IProps {
    open: boolean;
    onClose: (v: boolean) => void;
}

const UserResume = (props: any) => {
    const [listCV, setListCV] = useState<IResume[]>([]);
    const [isFetching, setIsFetching] = useState<boolean>(false);

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

    const columns: ColumnsType<IResume> = [
        {
            title: 'STT',
            key: 'index',
            width: 50,
            align: "center",
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

        },
        {
            title: 'Vị trí',
            dataIndex: ["jobId", "name"],

        },
        {
            title: 'Trạng thái',
            dataIndex: "status",
        },
        {
            title: 'Ngày rải CV',
            dataIndex: "createdAt",
            render(value, record, index) {
                return (
                    <>{dayjs(record.createdAt).format('DD-MM-YYYY HH:mm:ss')}</>
                )
            },
        },
        {
            title: '',
            dataIndex: "",
            render(value, record, index) {
                return (
                    <a
                        href={`${import.meta.env.VITE_BACKEND_URL}/images/resume/${record?.url}`}
                        target="_blank"
                    >Chi tiết</a>
                )
            },
        },
    ];

    return (
        <div>
            <Table<IResume>
                columns={columns}
                dataSource={listCV}
                loading={isFetching}
                pagination={false}
            />
        </div>
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
                width={isMobile ? "100%" : "1000px"}
            >

                <div style={{ minHeight: 400 }}>
                    <Tabs
                        defaultActiveKey="user-resume"
                        items={items}
                        onChange={onChange}
                    />
                </div>

            </Modal>
        </>
    )
}

export default ManageAccount;
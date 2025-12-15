import { Button, Card, Space, Table, Tag, message, Modal, Form, Input } from 'antd';
import { useEffect, useState } from 'react';
import { callApproveEmployerApplication, callGetEmployerApplications, callRejectEmployerApplication } from 'config/api';
import dayjs from 'dayjs';

const EmployerApplicationsPage = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [form] = Form.useForm();

    const fetchData = async () => {
        setLoading(true);
        const res = await callGetEmployerApplications();
        setLoading(false);
        if (res?.data?.data) {
            setData(res.data.data);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApprove = async (id: string) => {
        setLoading(true);
        const res = await callApproveEmployerApplication(id);
        setLoading(false);
        if (res?.data) {
            message.success('Đã duyệt và tạo tài khoản EMPLOYER');
            fetchData();
        } else {
            message.error(res?.message || 'Duyệt thất bại');
        }
    };

    const handleReject = (id: string) => {
        setRejectingId(id);
    };

    const submitReject = async () => {
        const note = form.getFieldValue('note');
        if (!rejectingId) return;
        setLoading(true);
        const res = await callRejectEmployerApplication(rejectingId, note);
        setLoading(false);
        if (res?.data) {
            message.success('Đã từ chối hồ sơ');
            setRejectingId(null);
            form.resetFields();
            fetchData();
        } else {
            message.error(res?.message || 'Từ chối thất bại');
        }
    };

    const columns = [
        { title: 'Tên', dataIndex: 'name', key: 'name' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'SĐT', dataIndex: 'phone', key: 'phone' },
        { title: 'Công ty', dataIndex: 'companyName', key: 'companyName' },
        { title: 'Địa chỉ', dataIndex: 'companyAddress', key: 'companyAddress' },
        { title: 'Website', dataIndex: 'website', key: 'website', render: (v: string) => v ? <a href={v} target="_blank" rel="noreferrer">{v}</a> : '-' },
        { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (v: string) => <Tag color={v === 'approved' ? 'green' : v === 'rejected' ? 'red' : 'gold'}>{v}</Tag> },
        { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt', render: (v: string) => dayjs(v).format('HH:mm DD/MM/YYYY') },
        {
            title: 'Hành động', key: 'action', render: (_: any, record: any) => (
                <Space>
                    <Button type="primary" size="small" disabled={record.status !== 'pending'} onClick={() => handleApprove(record._id)}>Duyệt</Button>
                    <Button danger size="small" disabled={record.status !== 'pending'} onClick={() => handleReject(record._id)}>Từ chối</Button>
                </Space>
            )
        },
    ];

    return (
        <Card title="Đăng ký nhà tuyển dụng" bordered={false}>
            <Table
                rowKey="_id"
                columns={columns}
                dataSource={data}
                loading={loading}
                pagination={{ pageSize: 10 }}
            />

            <Modal
                open={!!rejectingId}
                title="Lý do từ chối"
                onCancel={() => { setRejectingId(null); form.resetFields(); }}
                onOk={submitReject}
                confirmLoading={loading}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="note" label="Ghi chú">
                        <Input.TextArea rows={3} placeholder="Nhập lý do từ chối (tuỳ chọn)" />
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default EmployerApplicationsPage;


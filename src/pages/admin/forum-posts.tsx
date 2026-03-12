import { Button, Card, Space, Table, Tag, message, Modal, Typography, Image, Avatar, Divider } from 'antd';
import { useEffect, useState } from 'react';
import { callApproveForumPost, callFetchForumPosts, callRejectForumPost } from 'config/api';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import type { TablePaginationConfig } from 'antd/es/table';
import { EyeOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const AdminForumPostsPage = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [total, setTotal] = useState(0);
    const [previewPost, setPreviewPost] = useState<any | null>(null);
    const [previewVisible, setPreviewVisible] = useState(false);

    const fetchData = async (page: number = currentPage, size: number = pageSize, status: string = 'all') => {
        setLoading(true);
        const res = await callFetchForumPosts(`current=${page}&pageSize=${size}&status=${status}`);
        setLoading(false);
        if (res?.data) {
            setData(res.data.result || []);
            if (res.data.meta) {
                setCurrentPage(res.data.meta.current || page);
                setPageSize(res.data.meta.pageSize || size);
                setTotal(res.data.meta.total || 0);
            }
        }
    };

    useEffect(() => {
        fetchData(1, pageSize, 'all');
    }, []);

    const handleApprove = async (id: string) => {
        setLoading(true);
        const res = await callApproveForumPost(id);
        setLoading(false);
        if (res?.data) {
            message.success('Đã duyệt bài viết');
            fetchData(currentPage, pageSize, 'all');
        } else {
            message.error(res?.message || 'Duyệt thất bại');
        }
    };

    const handleReject = async (id: string) => {
        setLoading(true);
        const res = await callRejectForumPost(id);
        setLoading(false);
        if (res?.data) {
            message.success('Đã từ chối bài viết');
            fetchData(currentPage, pageSize, 'all');
        } else {
            message.error(res?.message || 'Từ chối thất bại');
        }
    };

    const handleTableChange = (pagination: TablePaginationConfig) => {
        if (pagination.current && pagination.pageSize) {
            setCurrentPage(pagination.current);
            setPageSize(pagination.pageSize);
            fetchData(pagination.current, pagination.pageSize, 'all');
        }
    };

    const openPreview = (record: any) => {
        setPreviewPost(record);
        setPreviewVisible(true);
    };

    const handleApproveFromPreview = async () => {
        if (!previewPost) return;
        await handleApprove(previewPost._id);
        setPreviewVisible(false);
    };

    const handleRejectFromPreview = async () => {
        if (!previewPost) return;
        await handleReject(previewPost._id);
        setPreviewVisible(false);
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'approved': return 'Đã duyệt';
            case 'rejected': return 'Đã từ chối';
            case 'pending': return 'Chờ duyệt';
            default: return status;
        }
    };

    const columns = [
        { 
            title: 'Tiêu đề', 
            dataIndex: 'title', 
            key: 'title', 
            width: 300,
            render: (v: string, r: any) => (
                <div>
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>
                        {v}
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {r.content?.substring(0, 80)}{r.content?.length > 80 ? '...' : ''}
                    </Text>
                </div>
            )
        },
        { 
            title: 'Tác giả', 
            dataIndex: ['author', 'name'], 
            key: 'author',
            width: 150,
            render: (name: string, record: any) => (
                <Space>
                    {record.author?.avatar ? (
                        <Avatar src={record.author.avatar} size="small" />
                    ) : (
                        <Avatar size="small" style={{ backgroundColor: '#87d068' }}>
                            {name?.[0]?.toUpperCase()}
                        </Avatar>
                    )}
                    <span>{name}</span>
                </Space>
            )
        },
        { 
            title: 'Trạng thái', 
            dataIndex: 'status', 
            key: 'status', 
            width: 120,
            render: (v: string) => {
                const colorMap: Record<string, string> = {
                    'approved': 'green',
                    'rejected': 'red',
                    'pending': 'gold'
                };
                return <Tag color={colorMap[v]}>{getStatusText(v)}</Tag>;
            }
        },
        { 
            title: 'Ngày tạo', 
            dataIndex: 'createdAt', 
            key: 'createdAt',
            width: 150,
            render: (v: string) => dayjs(v).format('HH:mm DD/MM/YYYY') 
        },
        {
            title: 'Hành động', 
            key: 'action',
            width: 250,
            fixed: 'right' as const,
            render: (_: any, record: any) => (
                <Space>
                    <Button
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => openPreview(record)}
                    >
                        Xem trước
                    </Button>
                    <Button
                        size="small"
                        type="primary"
                        disabled={record.status !== 'pending'}
                        onClick={() => handleApprove(record._id)}
                    >
                        Duyệt
                    </Button>
                    <Button
                        size="small"
                        danger
                        disabled={record.status !== 'pending'}
                        onClick={() => handleReject(record._id)}
                    >
                        Từ chối
                    </Button>
                </Space>
            )
        },
    ];

    return (
        <div>
            <Card 
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>Quản lý bài viết diễn đàn</span>
                        <Tag color="blue">{total} bài viết</Tag>
                    </div>
                } 
                bordered={false}
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            >
                <Table
                    rowKey="_id"
                    columns={columns}
                    dataSource={data}
                    loading={loading}
                    scroll={{ x: 1200 }}
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: total,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bài viết`,
                        pageSizeOptions: ['10', '20', '50', '100'],
                    }}
                    onChange={handleTableChange}
                />
            </Card>

            <Modal
                title="Xem trước bài viết"
                open={previewVisible}
                onCancel={() => setPreviewVisible(false)}
                width={800}
                footer={[
                    <Button key="cancel" onClick={() => setPreviewVisible(false)}>
                        Đóng
                    </Button>,
                    previewPost?.status === 'pending' && (
                        <Button
                            key="reject"
                            danger
                            onClick={handleRejectFromPreview}
                            loading={loading}
                        >
                            Từ chối
                        </Button>
                    ),
                    previewPost?.status === 'pending' && (
                        <Button
                            key="approve"
                            type="primary"
                            onClick={handleApproveFromPreview}
                            loading={loading}
                        >
                            Duyệt bài viết
                        </Button>
                    ),
                ].filter(Boolean)}
            >
                {previewPost && (
                    <div>
                        {/* Header: Tác giả và thời gian */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                            {previewPost.author?.avatar ? (
                                <Avatar src={previewPost.author.avatar} size={48} />
                            ) : (
                                <Avatar size={48} style={{ backgroundColor: '#87d068', fontSize: 20 }}>
                                    {previewPost.author?.name?.[0]?.toUpperCase()}
                                </Avatar>
                            )}
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>
                                    {previewPost.author?.name}
                                </div>
                                <div style={{ color: '#8c8c8c', fontSize: 13 }}>
                                    {dayjs(previewPost.createdAt).format('HH:mm - DD/MM/YYYY')}
                                </div>
                            </div>
                            <Tag color={previewPost.status === 'approved' ? 'green' : previewPost.status === 'rejected' ? 'red' : 'gold'}>
                                {getStatusText(previewPost.status)}
                            </Tag>
                        </div>

                        <Divider />

                        {/* Tiêu đề */}
                        <Title level={4} style={{ marginBottom: 12 }}>
                            {previewPost.title}
                        </Title>

                        {/* Nội dung */}
                        <Paragraph style={{ 
                            fontSize: 15, 
                            lineHeight: 1.6, 
                            whiteSpace: 'pre-wrap',
                            marginBottom: 16,
                            color: '#262626'
                        }}>
                            {previewPost.content}
                        </Paragraph>

                        {/* Ảnh */}
                        {previewPost.images && previewPost.images.length > 0 && (
                            <div style={{ marginTop: 16 }}>
                                <Text strong style={{ display: 'block', marginBottom: 8 }}>
                                    Hình ảnh ({previewPost.images.length})
                                </Text>
                                <Image.PreviewGroup>
                                    <div
                                        style={{
                                            display: 'grid',
                                            gap: 8,
                                            gridTemplateColumns:
                                                previewPost.images.length === 1
                                                    ? '1fr'
                                                    : previewPost.images.length === 2
                                                        ? '1fr 1fr'
                                                        : 'repeat(3, 1fr)',
                                        }}
                                    >
                                        {previewPost.images.map((url: string, index: number) => (
                                            <Image
                                                key={index}
                                                src={url}
                                                alt={`Ảnh ${index + 1}`}
                                                style={{
                                                    width: '100%',
                                                    maxHeight: 200,
                                                    objectFit: 'cover',
                                                    borderRadius: 8,
                                                    border: '1px solid #f0f0f0'
                                                }}
                                            />
                                        ))}
                                    </div>
                                </Image.PreviewGroup>
                            </div>
                        )}

                        {/* Thống kê */}
                        <Divider />
                        <div style={{ display: 'flex', gap: 24, color: '#8c8c8c', fontSize: 14 }}>
                            <span>
                                <Text strong>{previewPost.likedBy?.length || 0}</Text> lượt thích
                            </span>
                            <span>
                                ID: <Text code>{previewPost._id}</Text>
                            </span>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdminForumPostsPage;



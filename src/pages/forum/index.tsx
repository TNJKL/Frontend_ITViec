import { Button, Card, List, Typography, Tag, Modal, Form, Input, message, Image, Popconfirm, Space, Dropdown, MenuProps, Pagination } from 'antd';
import { useEffect, useState } from 'react';
import {
    callCreateForumComment,
    callFetchForumComments,
    callFetchForumPosts,
    callToggleLikeForumComment,
    callToggleLikeForumPost,
    callDeleteForumPost,
    callUpdateForumPost
} from 'config/api';
import { Link } from 'react-router-dom';
import { LikeOutlined, LikeFilled, MoreOutlined } from '@ant-design/icons';
import { useAppSelector } from '@/redux/hooks';

const { TextArea } = Input;

const ForumListPage = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedPost, setSelectedPost] = useState<any | null>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [openModal, setOpenModal] = useState(false);
    const [loadingComments, setLoadingComments] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();
    const [editForm] = Form.useForm();
    const [editVisible, setEditVisible] = useState(false);
    const [savingEdit, setSavingEdit] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const user = useAppSelector(state => state.account.user);

    const fetchData = async (page: number = currentPage, size: number = pageSize) => {
        setLoading(true);
        const res = await callFetchForumPosts(`current=${page}&pageSize=${size}&status=approved`);
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
        fetchData(1, pageSize);
    }, []);

    const openPostModal = async (post: any) => {
        setSelectedPost(post);
        setOpenModal(true);
        setLoadingComments(true);
        const res = await callFetchForumComments(post._id);
        setLoadingComments(false);
        if (res?.data) setComments(res.data);
    };

    const handleLikePost = async () => {
        if (!selectedPost || !user?._id) return;
        const res = await callToggleLikeForumPost(selectedPost._id);
        if (res?.data) {
            const likedArray = selectedPost.likedBy || [];
            const alreadyLiked = likedArray.some((u: string) => u === user._id);
            const newLikedBy = alreadyLiked
                ? likedArray.filter((u: string) => u !== user._id)
                : [...likedArray, user._id];
            const updatedPost = { ...selectedPost, likedBy: newLikedBy };
            setSelectedPost(updatedPost);
            setData(prev =>
                prev.map(p => (p._id === updatedPost._id ? { ...p, likedBy: newLikedBy } : p))
            );
            message.success('Đã cập nhật lượt thích');
        }
    };

    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState<Record<string, string>>({});
    const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});

    const handleSubmitComment = async (values: any, parentId?: string) => {
        if (!selectedPost) return;
        setSubmitting(true);
        await callCreateForumComment(selectedPost._id, { content: values.content, parentId });
        setSubmitting(false);
        if (parentId) {
            setReplyContent(prev => ({ ...prev, [parentId]: '' }));
            setReplyingTo(null);
        } else {
            form.resetFields();
        }
        const res = await callFetchForumComments(selectedPost._id);
        if (res?.data) setComments(res.data);
    };

    const handleReplySubmit = async (parentId: string) => {
        const content = replyContent[parentId]?.trim();
        if (!content) return;
        await handleSubmitComment({ content }, parentId);
    };

    const handleLikeComment = async (id: string) => {
        if (!user?._id) return;
        const res = await callToggleLikeForumComment(id);
        if (res?.data && selectedPost) {
            const resCmt = await callFetchForumComments(selectedPost._id);
            if (resCmt?.data) setComments(resCmt.data);
        }
    };

    const isOwnerOrAdmin = selectedPost && user?._id && (
        selectedPost.author?._id === user._id ||
        ['ADMIN', 'SUPER_ADMIN'].includes((user as any)?.role?.name)
    );

    const handleDeletePost = async () => {
        if (!selectedPost) return;
        const res = await callDeleteForumPost(selectedPost._id);
        if (res?.data?._id) {
            message.success('Đã xoá bài viết');
            setOpenModal(false);
            setSelectedPost(null);
            // Reload data để cập nhật phân trang
            fetchData(currentPage, pageSize);
        } else {
            message.error('Xoá bài viết thất bại');
        }
    };

    const openEditModal = () => {
        if (!selectedPost) return;
        editForm.setFieldsValue({
            title: selectedPost.title,
            content: selectedPost.content,
        });
        setEditVisible(true);
    };

    const handleSaveEdit = async () => {
        try {
            const values = await editForm.validateFields();
            if (!selectedPost) return;
            setSavingEdit(true);
            const res = await callUpdateForumPost(selectedPost._id, {
                title: values.title,
                content: values.content,
            });
            setSavingEdit(false);
            if (res?.data?._id) {
                message.success('Cập nhật bài viết thành công');
                const updated = { ...selectedPost, title: values.title, content: values.content };
                setSelectedPost(updated);
                setData(prev => prev.map(p => p._id === updated._id ? updated : p));
                setEditVisible(false);
            } else {
                message.error('Cập nhật bài viết thất bại');
            }
        } catch {
            // validate fail
        }
    };

    const renderComment = (comment: any, level: number = 0) => {
        const isLiked = comment.likedBy?.some((u: string) => u === user?._id);
        const hasReplies = comment.replies && comment.replies.length > 0;
        const maxInitialReplies = 2;
        const isExpanded = expandedReplies[comment._id] || false;
        const visibleReplies = hasReplies 
            ? (isExpanded ? comment.replies : comment.replies.slice(0, maxInitialReplies))
            : [];
        const hiddenRepliesCount = hasReplies && !isExpanded && comment.replies.length > maxInitialReplies
            ? comment.replies.length - maxInitialReplies
            : 0;

        return (
            <div key={comment._id} style={{ marginBottom: 12, position: 'relative' }}>
                <div style={{ display: 'flex', gap: 8 }}>
                    {/* Avatar với đường kẻ dọc cho replies */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                        {comment.author?.avatar ? (
                            <img
                                src={comment.author.avatar}
                                style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                            />
                        ) : (
                            <div
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    background: '#e5e7eb',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 600,
                                    fontSize: 14
                                }}
                            >
                                {comment.author?.name?.[0]?.toUpperCase()}
                            </div>
                        )}
                        {/* Đường kẻ dọc từ avatar xuống (giống Facebook) */}
                        {hasReplies && (
                            <div
                                style={{
                                    position: 'absolute',
                                    left: 15,
                                    top: 32,
                                    width: 2,
                                    height: '100%',
                                    background: '#e2e8f0',
                                    zIndex: 0
                                }}
                            />
                        )}
                    </div>

                    {/* Nội dung comment */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ 
                            background: '#f0f2f5', 
                            padding: '8px 12px', 
                            borderRadius: 18,
                            display: 'inline-block',
                            maxWidth: '100%',
                            wordBreak: 'break-word'
                        }}>
                            <div style={{ marginBottom: 4 }}>
                                <strong style={{ fontSize: 13, color: '#050505', fontWeight: 600, marginRight: 8 }}>
                                    {comment.author?.name}
                                </strong>
                            </div>
                            <div style={{ fontSize: 15, color: '#050505', whiteSpace: 'pre-wrap', lineHeight: 1.33, wordBreak: 'break-word' }}>
                                {comment.content}
                            </div>
                        </div>

                        {/* Actions: Thời gian, Thích, Phản hồi */}
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 4, marginLeft: 4 }}>
                            <span style={{ fontSize: 12, color: '#65676b', cursor: 'pointer' }}>
                                {new Date(comment.createdAt).toLocaleString('vi-VN', { 
                                    hour: '2-digit', 
                                    minute: '2-digit',
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                })}
                            </span>
                            <Button
                                type="text"
                                size="small"
                                onClick={() => handleLikeComment(comment._id)}
                                style={{ 
                                    padding: 0, 
                                    height: 'auto', 
                                    fontSize: 12, 
                                    color: isLiked ? '#1877f2' : '#65676b',
                                    fontWeight: 600
                                }}
                            >
                                {isLiked ? 'Đã thích' : 'Thích'}
                            </Button>
                            <Button
                                type="text"
                                size="small"
                                onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                                style={{ 
                                    padding: 0, 
                                    height: 'auto', 
                                    fontSize: 12, 
                                    color: '#65676b',
                                    fontWeight: 600
                                }}
                            >
                                Phản hồi
                            </Button>
                        </div>

                        {/* Số lượt thích */}
                        {comment.likedBy?.length > 0 && (
                            <div style={{ marginTop: 4, marginLeft: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span style={{ fontSize: 12, color: '#65676b', fontWeight: 600 }}>
                                    {comment.likedBy.length}
                                </span>
                            </div>
                        )}

                        {/* Form reply */}
                        {replyingTo === comment._id && (
                            <div style={{ marginTop: 8 }}>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                                    {user?.avatar ? (
                                        <img
                                            src={user.avatar}
                                            style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                                        />
                                    ) : (
                                        <div
                                            style={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: '50%',
                                                background: '#e5e7eb',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 600,
                                                flexShrink: 0
                                            }}
                                        >
                                            {user?.name?.[0]?.toUpperCase()}
                                        </div>
                                    )}
                                    <div style={{ flex: 1 }}>
                                        <TextArea
                                            rows={2}
                                            placeholder="Viết phản hồi..."
                                            value={replyContent[comment._id] || ''}
                                            onChange={(e) => setReplyContent(prev => ({ ...prev, [comment._id]: e.target.value }))}
                                            style={{ fontSize: 15, borderRadius: 20, padding: '8px 12px' }}
                                            autoFocus
                                        />
                                        <Space style={{ marginTop: 8 }}>
                                            <Button type="primary" size="small" loading={submitting} onClick={() => handleReplySubmit(comment._id)}>
                                                Gửi
                                            </Button>
                                            <Button size="small" onClick={() => {
                                                setReplyingTo(null);
                                                setReplyContent(prev => ({ ...prev, [comment._id]: '' }));
                                            }}>
                                                Huỷ
                                            </Button>
                                        </Space>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Replies */}
                        {hasReplies && (
                            <div style={{ marginTop: 8, position: 'relative' }}>
                                {/* Nút "Xem tất cả X phản hồi" giống Facebook */}
                                {hiddenRepliesCount > 0 && (
                                    <Button
                                        type="text"
                                        size="small"
                                        onClick={() => setExpandedReplies(prev => ({ ...prev, [comment._id]: true }))}
                                        style={{ 
                                            padding: '4px 8px', 
                                            height: 'auto', 
                                            fontSize: 13, 
                                            color: '#65676b',
                                            fontWeight: 600,
                                            marginBottom: 8,
                                            marginLeft: -8
                                        }}
                                    >
                                        Xem tất cả {comment.replies.length} phản hồi
                                    </Button>
                                )}
                                {isExpanded && hiddenRepliesCount > 0 && (
                                    <Button
                                        type="text"
                                        size="small"
                                        onClick={() => setExpandedReplies(prev => ({ ...prev, [comment._id]: false }))}
                                        style={{ 
                                            padding: '4px 8px', 
                                            height: 'auto', 
                                            fontSize: 13, 
                                            color: '#65676b',
                                            fontWeight: 600,
                                            marginBottom: 8,
                                            marginLeft: -8
                                        }}
                                    >
                                        Ẩn phản hồi
                                    </Button>
                                )}
                                {visibleReplies.map((reply: any) => renderComment(reply, level + 1))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div style={{ maxWidth: 900, margin: '24px auto', padding: '0 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Typography.Title level={3}>Diễn đàn IT</Typography.Title>
                <Link to="/forum/new">
                    <Button type="primary">Đăng bài</Button>
                </Link>
            </div>
            <List
                loading={loading}
                dataSource={data}
                renderItem={(item: any) => (
                    <Card
                        key={item._id}
                        style={{ marginBottom: 16, borderRadius: 12, cursor: 'pointer' }}
                        hoverable
                        onClick={() => openPostModal(item)}
                    >
                        {/* Header: avatar + tên + thời gian */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                marginBottom: 8,
                                fontSize: 13,
                                color: '#64748b'
                            }}
                        >
                            {item.author?.avatar ? (
                                <img
                                    src={item.author.avatar}
                                    style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                                />
                            ) : (
                                <div
                                    style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: '50%',
                                        background: '#e5e7eb',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 600
                                    }}
                                >
                                    {item.author?.name?.[0]?.toUpperCase()}
                                </div>
                            )}
                            <div>
                                <div><strong>{item.author?.name}</strong></div>
                                <div>{new Date(item.createdAt).toLocaleString('vi-VN')}</div>
                            </div>
                            <div style={{ marginLeft: 'auto' }}>
                                <Tag color="green">Đã duyệt</Tag>
                            </div>
                        </div>

                        {/* Tiêu đề + nội dung */}
                        <Typography.Title level={5} style={{ marginBottom: 4 }}>
                            {item.title}
                        </Typography.Title>
                        <Typography.Paragraph style={{ marginBottom: 8, whiteSpace: 'pre-line' }}>
                            {item.content}
                        </Typography.Paragraph>

                        {/* Ảnh bài viết hiển thị dạng grid giống Facebook */}
                        {item.images?.length > 0 && (
                            <div
                                style={{
                                    marginTop: 8,
                                    display: 'grid',
                                    gap: 8,
                                    gridTemplateColumns:
                                        item.images.length === 1
                                            ? '1fr'
                                            : item.images.length === 2
                                                ? '1fr 1fr'
                                                : 'repeat(3, 1fr)',
                                }}
                            >
                                {item.images.map((url: string) => (
                                    <img
                                        key={url}
                                        src={url}
                                        style={{ width: '100%', maxHeight: 260, objectFit: 'cover', borderRadius: 8 }}
                                    />
                                ))}
                            </div>
                        )}
                        {/* Lượt thích */}
                        <div style={{ marginTop: 8, fontSize: 13, color: '#64748b' }}>
                            {item.likedBy?.length || 0} lượt thích
                        </div>
                    </Card>
                )}
            />
            {total > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24, marginBottom: 24 }}>
                    <Pagination
                        current={currentPage}
                        pageSize={pageSize}
                        total={total}
                        showSizeChanger
                        showQuickJumper
                        showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} bài viết`}
                        onChange={(page, size) => {
                            setCurrentPage(page);
                            setPageSize(size);
                            fetchData(page, size);
                        }}
                        onShowSizeChange={(current, size) => {
                            setCurrentPage(1);
                            setPageSize(size);
                            fetchData(1, size);
                        }}
                        pageSizeOptions={['5', '10', '20', '50']}
                    />
                </div>
            )}

            <Modal
                open={openModal}
                onCancel={() => setOpenModal(false)}
                footer={null}
                width={800}
                destroyOnClose
            >
                {selectedPost && (
                    <div>
                        <Typography.Title level={4} style={{ marginBottom: 8 }}>
                            {selectedPost.title}
                        </Typography.Title>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                marginBottom: 12,
                                fontSize: 13,
                                color: '#64748b'
                            }}
                        >
                            {selectedPost.author?.avatar ? (
                                <img
                                    src={selectedPost.author.avatar}
                                    style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                                />
                            ) : (
                                <div
                                    style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: '50%',
                                        background: '#e5e7eb',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 600
                                    }}
                                >
                                    {selectedPost.author?.name?.[0]?.toUpperCase()}
                                </div>
                            )}
                            <div>
                                <div><strong>{selectedPost.author?.name}</strong></div>
                                <div>{new Date(selectedPost.createdAt).toLocaleString('vi-VN')}</div>
                            </div>
                        </div>
                        <Typography.Paragraph style={{ fontSize: 15, marginBottom: 12 }}>
                            {selectedPost.content}
                        </Typography.Paragraph>
                        {selectedPost.images?.length > 0 && (
                            <Image.PreviewGroup>
                                <div
                                    style={{
                                        marginBottom: 12,
                                        display: 'grid',
                                        gap: 8,
                                        gridTemplateColumns:
                                            selectedPost.images.length === 1
                                                ? '1fr'
                                                : selectedPost.images.length === 2
                                                    ? '1fr 1fr'
                                                    : 'repeat(3, 1fr)',
                                    }}
                                >
                                    {selectedPost.images.map((url: string) => (
                                        <Image
                                            key={url}
                                            src={url}
                                            style={{ width: '100%', maxHeight: 260, objectFit: 'cover', borderRadius: 8 }}
                                        />
                                    ))}
                                </div>
                            </Image.PreviewGroup>
                        )}
                        <div
                            style={{
                                borderTop: '1px solid #e2e8f0',
                                paddingTop: 8,
                                marginTop: 8,
                                marginBottom: 12,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}
                        >
                            <Space>
                                <Button
                                    type="text"
                                    icon={
                                        selectedPost.likedBy?.some((u: string) => u === user?._id)
                                            ? <LikeFilled style={{ color: '#2563eb' }} />
                                            : <LikeOutlined />
                                    }
                                    onClick={handleLikePost}
                                >
                                    {selectedPost.likedBy?.some((u: string) => u === user?._id) ? 'Đã thích' : 'Thích'}
                                </Button>
                                <span style={{ fontSize: 13, color: '#64748b' }}>
                                    {selectedPost.likedBy?.length || 0} lượt thích
                                </span>
                            </Space>

                            {isOwnerOrAdmin && (
                                <Dropdown
                                    trigger={['click']}
                                    menu={{
                                        items: [
                                            {
                                                key: 'edit',
                                                label: 'Sửa bài viết',
                                                onClick: openEditModal,
                                            },
                                            {
                                                key: 'delete',
                                                label: (
                                                    <Popconfirm
                                                        title="Bạn chắc chắn muốn xoá bài viết này?"
                                                        okText="Xoá"
                                                        cancelText="Huỷ"
                                                        onConfirm={handleDeletePost}
                                                        onClick={e => e?.stopPropagation?.()}
                                                    >
                                                        <span style={{ color: '#ef4444' }}>Xoá bài viết</span>
                                                    </Popconfirm>
                                                ),
                                            },
                                        ] as MenuProps['items'],
                                    }}
                                >
                                    <Button type="text" icon={<MoreOutlined />} />
                                </Dropdown>
                            )}
                        </div>

                        <Form form={form} layout="vertical" onFinish={(values) => handleSubmitComment(values)}>
                            <Form.Item
                                name="content"
                                rules={[{ required: true, message: 'Vui lòng nhập nội dung bình luận' }]}
                            >
                                <TextArea rows={3} placeholder="Viết bình luận của bạn..." />
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" loading={submitting}>
                                    Gửi bình luận
                                </Button>
                            </Form.Item>
                        </Form>

                        <div style={{ marginTop: 16 }}>
                            {loadingComments ? (
                                <div style={{ textAlign: 'center', padding: 24 }}>Đang tải...</div>
                            ) : comments.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: 24, color: '#94a3b8' }}>
                                    Chưa có bình luận nào
                                </div>
                            ) : (
                                comments.map((comment: any) => renderComment(comment, 0))
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                open={editVisible}
                onCancel={() => setEditVisible(false)}
                onOk={handleSaveEdit}
                confirmLoading={savingEdit}
                title="Chỉnh sửa bài viết"
            >
                <Form form={editForm} layout="vertical">
                    <Form.Item
                        name="title"
                        label="Tiêu đề"
                        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="content"
                        label="Nội dung"
                        rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
                    >
                        <TextArea rows={5} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ForumListPage;


import { Button, Card, Form, Input, List, Typography, Image, Space } from 'antd';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { callCreateForumComment, callFetchForumComments, callFetchForumPostById, callToggleLikeForumComment, callToggleLikeForumPost } from 'config/api';
import { LikeOutlined, LikeFilled } from '@ant-design/icons';
import { useAppSelector } from '@/redux/hooks';

const { TextArea } = Input;

const ForumPostDetailPage = () => {
    const { id } = useParams();
    const [post, setPost] = useState<any>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [loadingPost, setLoadingPost] = useState(false);
    const [loadingComments, setLoadingComments] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState<Record<string, string>>({});
    const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
    const user = useAppSelector(state => state.account.user);

    const fetchPost = async () => {
        if (!id) return;
        setLoadingPost(true);
        const res = await callFetchForumPostById(id);
        setLoadingPost(false);
        if (res?.data) setPost(res.data);
    };

    const fetchComments = async () => {
        if (!id) return;
        setLoadingComments(true);
        const res = await callFetchForumComments(id);
        setLoadingComments(false);
        if (res?.data) setComments(res.data);
    };

    useEffect(() => {
        fetchPost();
        fetchComments();
    }, [id]);

    const handleLikePost = async () => {
        if (!id || !post || !user?._id) return;
        await callToggleLikeForumPost(id);
        const likedArray = post.likedBy || [];
        const alreadyLiked = likedArray.some((u: string) => u === user._id);
        const newLikedBy = alreadyLiked
            ? likedArray.filter((u: string) => u !== user._id)
            : [...likedArray, user._id];
        setPost({ ...post, likedBy: newLikedBy });
    };

    const handleSubmitComment = async (values: any, parentId?: string) => {
        if (!id) return;
        setSubmitting(true);
        await callCreateForumComment(id, { content: values.content, parentId });
        setSubmitting(false);
        if (parentId) {
            setReplyContent(prev => ({ ...prev, [parentId]: '' }));
            setReplyingTo(null);
        } else {
            form.resetFields();
        }
        fetchComments();
    };

    const handleReplySubmit = async (parentId: string) => {
        const content = replyContent[parentId]?.trim();
        if (!content) return;
        await handleSubmitComment({ content }, parentId);
    };

    const handleLikeComment = async (commentId: string) => {
        if (!user?._id) return;
        const res = await callToggleLikeForumComment(commentId);
        if (res?.data) {
            fetchComments();
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
            <Card loading={loadingPost} style={{ borderRadius: 12 }}>
                {post && (
                    <>
                        <Typography.Title level={3} style={{ marginBottom: 8 }}>{post.title}</Typography.Title>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontSize: 13, color: '#64748b' }}>
                            {post.author?.avatar ? (
                                <img
                                    src={post.author.avatar}
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
                                    {post.author?.name?.[0]?.toUpperCase()}
                                </div>
                            )}
                            <div>
                                <div><strong>{post.author?.name}</strong></div>
                                <div>{new Date(post.createdAt).toLocaleString('vi-VN')}</div>
                            </div>
                        </div>
                        <Typography.Paragraph style={{ fontSize: 15 }}>{post.content}</Typography.Paragraph>
                        {post.images?.length > 0 && (
                            <Image.PreviewGroup>
                                <div
                                    style={{
                                        marginTop: 12,
                                        display: 'grid',
                                        gap: 8,
                                        gridTemplateColumns:
                                            post.images.length === 1
                                                ? '1fr'
                                                : post.images.length === 2
                                                ? '1fr 1fr'
                                                : 'repeat(3, 1fr)',
                                    }}
                                >
                                    {post.images.map((url: string) => (
                                        <Image
                                            key={url}
                                            src={url}
                                            style={{ width: '100%', maxHeight: 260, objectFit: 'cover', borderRadius: 8 }}
                                        />
                                    ))}
                                </div>
                            </Image.PreviewGroup>
                        )}
                        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Button
                                type="text"
                                icon={
                                    post.likedBy?.some((u: string) => u === user?._id)
                                        ? <LikeFilled style={{ color: '#2563eb' }} />
                                        : <LikeOutlined />
                                }
                                onClick={handleLikePost}
                            >
                                {post.likedBy?.some((u: string) => u === user?._id) ? 'Đã thích' : 'Thích'}
                            </Button>
                            <span style={{ fontSize: 13, color: '#64748b' }}>
                                {post.likedBy?.length || 0} lượt thích
                            </span>
                        </div>
                    </>
                )}
            </Card>

            <Card style={{ marginTop: 24 }} title="Bình luận">
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
            </Card>
        </div>
    );
};

export default ForumPostDetailPage;



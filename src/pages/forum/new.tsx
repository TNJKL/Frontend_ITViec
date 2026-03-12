import { Button, Card, Form, Input, Upload, message, notification, Typography } from 'antd';
import { useState } from 'react';
import { callCreateForumPost, callUploadSingleFile } from 'config/api';
import { useNavigate } from 'react-router-dom';
import { UploadOutlined } from '@ant-design/icons';

const { TextArea } = Input;

const ForumNewPostPage = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [images, setImages] = useState<string[]>([]);
    const navigate = useNavigate();

    const onFinish = async (values: any) => {
        setLoading(true);
        const res = await callCreateForumPost({
            title: values.title,
            content: values.content,
            images,
        });
        setLoading(false);
        if (res?.data?._id) {
            message.success('Đã gửi bài viết, vui lòng chờ admin duyệt');
            navigate('/forum');
        } else {
            notification.error({
                message: 'Đăng bài thất bại',
                description: res?.message || 'Có lỗi xảy ra',
            });
        }
    };

    const handleUploadImage = async ({ file, onSuccess, onError }: any) => {
        try {
            setUploading(true);
            const res = await callUploadSingleFile(file, 'forum');
            setUploading(false);
            if (res && (res as any).data?.fileName) {
                const url = `${import.meta.env.VITE_BACKEND_URL}/images/forum/${(res as any).data.fileName}`;
                setImages(prev => [...prev, url]);
                onSuccess && onSuccess('ok');
            } else {
                const error = new Error(res?.message || 'Upload thất bại');
                onError && onError({ event: error });
            }
        } catch (e: any) {
            setUploading(false);
            onError && onError({ event: e });
        }
    };

    return (
        <div
            style={{
                minHeight: 'calc(100vh - 120px)',
                background: 'linear-gradient(to bottom,#f8fafc,#e5e7eb)',
                padding: '32px 16px',
            }}
        >
            <div style={{ maxWidth: 960, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Typography.Title level={2} style={{ marginBottom: 8 }}>
                        Đăng bài chia sẻ cùng cộng đồng
                    </Typography.Title>
                    <Typography.Text type="secondary">
                        Chia sẻ câu hỏi, kinh nghiệm làm việc, phỏng vấn, công ty... để mọi người cùng thảo luận.
                    </Typography.Text>
                </div>

                <Card
                    style={{
                        borderRadius: 16,
                        boxShadow: '0 18px 45px rgba(15,23,42,0.07)',
                        background: '#ffffff',
                    }}
                >
                    <Form form={form} layout="vertical" onFinish={onFinish}>
                        <Form.Item
                            name="title"
                            label={<span style={{ fontWeight: 600 }}>Tiêu đề</span>}
                            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                        >
                            <Input
                                placeholder="Ví dụ: Chia sẻ kinh nghiệm phỏng vấn Frontend Junior tại công ty X"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item
                            name="content"
                            label={<span style={{ fontWeight: 600 }}>Nội dung</span>}
                            rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
                        >
                            <TextArea
                                rows={8}
                                placeholder="Hãy kể câu chuyện, đặt câu hỏi hoặc chia sẻ kinh nghiệm chi tiết của bạn..."
                            />
                        </Form.Item>

                        <Form.Item label={<span style={{ fontWeight: 600 }}>Ảnh minh hoạ (tuỳ chọn)</span>}>
                            <Upload
                                listType="picture-card"
                                customRequest={handleUploadImage}
                                showUploadList={false}
                            >
                                <div>
                                    <UploadOutlined /> <span style={{ marginLeft: 4 }}>Tải ảnh lên</span>
                                </div>
                            </Upload>

                            {images.length > 0 && (
                                <div
                                    style={{
                                        marginTop: 12,
                                        display: 'grid',
                                        gap: 8,
                                        gridTemplateColumns:
                                            images.length === 1
                                                ? '1fr'
                                                : images.length === 2
                                                    ? '1fr 1fr'
                                                    : 'repeat(3, 1fr)',
                                    }}
                                >
                                    {images.map((url) => (
                                        <img
                                            key={url}
                                            src={url}
                                            style={{
                                                width: '100%',
                                                maxHeight: 180,
                                                objectFit: 'cover',
                                                borderRadius: 12,
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </Form.Item>

                        <Form.Item style={{ marginTop: 16, textAlign: 'right' }}>
                            <Button onClick={() => navigate('/forum')} style={{ marginRight: 8 }}>
                                Huỷ
                            </Button>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Gửi bài viết
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </div>
        </div>
    );
};

export default ForumNewPostPage;



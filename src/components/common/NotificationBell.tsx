import React, { useState, useEffect, useRef } from 'react';
import { BellOutlined, CheckOutlined, DeleteOutlined } from '@ant-design/icons';
import { Badge, Dropdown, List, Button, Space, Typography, Empty, Spin, message } from 'antd';
import { callGetNotifications, callGetUnreadNotificationCount, callMarkNotificationAsRead, callMarkAllNotificationsAsRead, callDeleteNotification } from '@/config/api';
import { INotification } from '@/types/backend';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { useNavigate } from 'react-router-dom';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Text, Paragraph } = Typography;

interface NotificationBellProps {
    style?: React.CSSProperties;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ style }) => {
    const [notifications, setNotifications] = useState<INotification[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [open, setOpen] = useState<boolean>(false);
    const navigate = useNavigate();
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const [notificationsRes, countRes] = await Promise.all([
                callGetNotifications('limit=10'),
                callGetUnreadNotificationCount(),
            ]);

            if (notificationsRes && notificationsRes.data) {
                setNotifications(notificationsRes.data);
            }
            if (countRes && countRes.data !== undefined) {
                setUnreadCount(countRes.data);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    // Polling để cập nhật real-time (mỗi 30 giây)
    useEffect(() => {
        fetchNotifications();

        pollingIntervalRef.current = setInterval(() => {
            fetchNotifications();
        }, 30000); // 30 giây

        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, []);

    // Mark as read
    const handleMarkAsRead = async (notificationId: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        try {
            await callMarkNotificationAsRead(notificationId);
            setNotifications(prev =>
                prev.map(n =>
                    n._id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            message.error('Không thể đánh dấu đã đọc');
        }
    };

    // Mark all as read
    const handleMarkAllAsRead = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await callMarkAllNotificationsAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
            setUnreadCount(0);
            message.success('Đã đánh dấu tất cả đã đọc');
        } catch (error) {
            message.error('Không thể đánh dấu tất cả đã đọc');
        }
    };

    // Delete notification
    const handleDelete = async (notificationId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await callDeleteNotification(notificationId);
            setNotifications(prev => {
                const filtered = prev.filter(n => n._id !== notificationId);
                if (prev.find(n => n._id === notificationId)?.isRead === false) {
                    setUnreadCount(count => Math.max(0, count - 1));
                }
                return filtered;
            });
            message.success('Đã xóa thông báo');
        } catch (error) {
            message.error('Không thể xóa thông báo');
        }
    };

    // Handle notification click
    const handleNotificationClick = (notification: INotification) => {
        if (!notification.isRead) {
            handleMarkAsRead(notification._id!);
        }

        // Navigate based on type
        if (notification.interviewId && typeof notification.interviewId === 'object') {
            navigate(`/account/interviews/${notification.interviewId._id}`);
        } else if (notification.jobId && typeof notification.jobId === 'object') {
            navigate(`/job/${notification.jobId._id}`);
        } else if (notification.resumeId && typeof notification.resumeId === 'object') {
            navigate(`/account/manage`);
        }
        setOpen(false);
    };

    // Get notification icon based on type
    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'INTERVIEW_SCHEDULED':
                return '📅';
            case 'INTERVIEW_CONFIRMED':
                return '✅';
            case 'INTERVIEW_CANCELLED':
                return '❌';
            case 'RESUME_APPROVED':
                return '👍';
            case 'RESUME_REJECTED':
                return '👎';
            case 'OFFER_SENT':
                return '🎉';
            default:
                return '🔔';
        }
    };

    // Get notification color based on type
    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'INTERVIEW_SCHEDULED':
            case 'INTERVIEW_CONFIRMED':
                return '#1890ff';
            case 'OFFER_SENT':
            case 'RESUME_APPROVED':
                return '#52c41a';
            case 'INTERVIEW_CANCELLED':
            case 'RESUME_REJECTED':
                return '#ff4d4f';
            default:
                return '#666';
        }
    };

    const notificationList = (
        <div style={{ width: 360, maxHeight: 500, overflowY: 'auto' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong>Thông báo</Text>
                {unreadCount > 0 && (
                    <Button type="link" size="small" onClick={handleMarkAllAsRead}>
                        Đánh dấu tất cả đã đọc
                    </Button>
                )}
            </div>

            <Spin spinning={loading}>
                {notifications.length === 0 ? (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Không có thông báo nào"
                        style={{ padding: '40px 20px' }}
                    />
                ) : (
                    <List
                        dataSource={notifications}
                        renderItem={(notification) => (
                            <List.Item
                                style={{
                                    padding: '12px 16px',
                                    cursor: 'pointer',
                                    backgroundColor: notification.isRead ? '#fff' : '#f0f7ff',
                                    borderLeft: notification.isRead ? 'none' : `3px solid ${getNotificationColor(notification.type)}`,
                                }}
                                onClick={() => handleNotificationClick(notification)}
                                actions={[
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<DeleteOutlined />}
                                        onClick={(e) => handleDelete(notification._id!, e)}
                                    />,
                                ]}
                            >
                                <List.Item.Meta
                                    avatar={
                                        <span style={{ fontSize: '24px' }}>
                                            {getNotificationIcon(notification.type)}
                                        </span>
                                    }
                                    title={
                                        <Space>
                                            <Text strong={!notification.isRead} style={{ fontSize: '14px' }}>
                                                {notification.title}
                                            </Text>
                                            {!notification.isRead && (
                                                <Badge status="processing" />
                                            )}
                                        </Space>
                                    }
                                    description={
                                        <div>
                                            <Paragraph
                                                ellipsis={{ rows: 2 }}
                                                style={{ margin: 0, fontSize: '13px', color: '#666' }}
                                            >
                                                {notification.message}
                                            </Paragraph>
                                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                                {dayjs(notification.createdAt).fromNow()}
                                            </Text>
                                        </div>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                )}
            </Spin>

            {notifications.length > 0 && (
                <div style={{ padding: '12px', textAlign: 'center', borderTop: '1px solid #f0f0f0' }}>
                    <Button type="link" onClick={() => navigate('/account/notifications')}>
                        Xem tất cả thông báo
                    </Button>
                </div>
            )}
        </div>
    );

    return (
        <Dropdown
            dropdownRender={() => notificationList}
            trigger={['click']}
            open={open}
            onOpenChange={setOpen}
            placement="bottomRight"
            overlayStyle={{ padding: 0 }}
        >
            <Badge count={unreadCount} size="small" style={style}>
                <BellOutlined
                    style={{
                        fontSize: '20px',
                        cursor: 'pointer',
                        color: unreadCount > 0 ? '#1890ff' : '#666',
                    }}
                />
            </Badge>
        </Dropdown>
    );
};

export default NotificationBell;



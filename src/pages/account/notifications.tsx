import { useEffect, useState, useMemo } from "react";
import { Card, List, Tag, Button, Space, Typography, Empty, Skeleton, message } from "antd";
import { BellOutlined, CheckCircleOutlined, DeleteOutlined, MailOutlined } from "@ant-design/icons";
import {
  callGetNotifications,
  callMarkNotificationAsRead,
  callMarkAllNotificationsAsRead,
  callDeleteNotification,
} from "@/config/api";
import { INotification } from "@/types/backend";

const { Title, Paragraph, Text } = Typography;

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState<boolean>(false);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications]
  );

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await callGetNotifications("limit=50");
      setNotifications(res.data || []);
    } catch (error: any) {
      message.error(error?.message || "Không thể tải thông báo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    setMarkingId(id);
    try {
      await callMarkNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((item) => (item._id === id ? { ...item, isRead: true, readAt: new Date().toISOString() } : item))
      );
    } catch (error: any) {
      message.error(error?.message || "Không thể đánh dấu đã đọc");
    } finally {
      setMarkingId(null);
    }
  };

  const handleMarkAll = async () => {
    setMarkingAll(true);
    try {
      await callMarkAllNotificationsAsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true, readAt: new Date().toISOString() })));
    } catch (error: any) {
      message.error(error?.message || "Không thể đánh dấu tất cả đã đọc");
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await callDeleteNotification(id);
      setNotifications((prev) => prev.filter((item) => item._id !== id));
      message.success("Đã xóa thông báo");
    } catch (error: any) {
      message.error(error?.message || "Không thể xóa thông báo");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={{ padding: "32px 16px" }}>
      <Card
        style={{ maxWidth: 900, margin: "0 auto", borderRadius: 16 }}
        title={
          <Space size="middle">
            <BellOutlined style={{ color: "#fa8c16" }} />
            <span style={{ fontSize: 18, fontWeight: 600 }}>Thông báo của tôi</span>
          </Space>
        }
        extra={
          <Space>
            <Tag color={unreadCount > 0 ? "red" : "green"}>{unreadCount} chưa đọc</Tag>
            <Button onClick={fetchNotifications}>Làm mới</Button>
            <Button
              type="primary"
              ghost
              onClick={handleMarkAll}
              loading={markingAll}
              disabled={unreadCount === 0}
            >
              Đánh dấu tất cả đã đọc
            </Button>
          </Space>
        }
        bodyStyle={{ padding: 0 }}
      >
        {loading ? (
          <div style={{ padding: 24 }}>
            <Skeleton active paragraph={{ rows: 4 }} />
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center" }}>
            <Empty
              description={
                <Space direction="vertical">
                  <Title level={5}>Chưa có thông báo nào</Title>
                  <Paragraph>Thông báo mới sẽ xuất hiện tại đây.</Paragraph>
                </Space>
              }
            />
          </div>
        ) : (
          <List
            itemLayout="vertical"
            dataSource={notifications}
            renderItem={(item) => (
              <List.Item
                style={{
                  background: item.isRead ? "#fff" : "#fff7e6",
                  borderBottom: "1px solid #f0f0f0",
                  padding: "16px 24px",
                }}
                actions={[
                  <Button
                    key="read"
                    type="link"
                    icon={<CheckCircleOutlined />}
                    onClick={() => handleMarkAsRead(item._id!)}
                    disabled={item.isRead}
                    loading={markingId === item._id}
                  >
                    Đánh dấu đã đọc
                  </Button>,
                  <Button
                    key="delete"
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(item._id!)}
                    loading={deletingId === item._id}
                  >
                    Xóa
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={<MailOutlined style={{ fontSize: 24, color: item.isRead ? "#ccc" : "#fa8c16" }} />}
                  title={
                    <Space>
                      <Text strong>{item.title}</Text>
                      <Tag color={item.isRead ? "default" : "orange"}>{item.isRead ? "Đã đọc" : "Mới"}</Tag>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={0}>
                      <Text>{item.message}</Text>
                      <Text type="secondary">
                        {item.createdAt ? new Date(item.createdAt).toLocaleString("vi-VN") : ""}
                      </Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default NotificationsPage;




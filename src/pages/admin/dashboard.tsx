import { useEffect, useMemo, useState } from "react";
import {
    Avatar,
    Button,
    Card,
    Col,
    message,
    Progress,
    Row,
    Skeleton,
    Space,
    Statistic,
    Table,
    Tag,
    Typography
} from "antd";
import {
    ApartmentOutlined,
    FileTextOutlined,
    ReloadOutlined,
    SolutionOutlined,
    TeamOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import { callFetchDashboardOverview } from "@/config/api";
import { IDashboardOverview } from "@/types/backend";

const { Title, Text } = Typography;

const colors = {
    candidate: "#5B3A2B",
    hr: "#7A6542",
    admin: "#2C3E50"
};

const getInitials = (name?: string) => {
    if (!name) return "NA";
    const parts = name.trim().split(" ").filter(Boolean);
    if (!parts.length) return name.slice(0, 2).toUpperCase();
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const formatNumber = (value: number) => value.toLocaleString("vi-VN");

const DashboardPage = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [data, setData] = useState<IDashboardOverview | null>(null);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const res = await callFetchDashboardOverview() as any;
            // Hỗ trợ cả 2 dạng: {message,statusCode,data:{...}} hoặc đã unwrap payload
            const envelope = res?.data ?? res;
            const candidate =
                (envelope?.data && (envelope.data.totals || envelope.data.trends || envelope.data.leaderboards))
                    ? envelope.data
                    : (envelope?.totals || envelope?.trends || envelope?.leaderboards)
                        ? envelope
                        : null;
            if (candidate) {
                setData(candidate as IDashboardOverview);
            } else {
                const msg = envelope?.message || "Không có dữ liệu";
                throw new Error(msg);
            }
        } catch (error) {
            const msg = (error as any)?.message || "Không thể tải dữ liệu thống kê. Vui lòng thử lại.";
            console.error("Dashboard overview error:", error);
            message.error(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const totals = data?.totals;
    const userTotals = totals?.users;
    const roleStats = userTotals?.byRole;
    const jobTotals = totals?.jobs;
    const applicationTotals = totals?.applications;

    const roleDistribution = useMemo(() => {
        if (!roleStats || !userTotals) return [];
        const total = userTotals.total || 1;
        return [
            {
                key: "candidate",
                label: "Ứng viên",
                value: roleStats.candidate,
                percent: (roleStats.candidate / total) * 100,
                color: colors.candidate
            },
            {
                key: "hr",
                label: "HR / Nhà tuyển dụng",
                value: roleStats.hr,
                percent: (roleStats.hr / total) * 100,
                color: colors.hr
            },
            {
                key: "admin",
                label: "Admin",
                value: roleStats.admin,
                percent: (roleStats.admin / total) * 100,
                color: colors.admin
            }
        ];
    }, [roleStats, userTotals]);

    const applicationsTrend = data?.trends.applicationsLast7Days ?? [];
    const jobsTrend = data?.trends.jobsLast6Months ?? [];
    const jobsThisMonth = useMemo(() => {
        if (!jobsTrend || jobsTrend.length === 0) return 0;
        return jobsTrend[jobsTrend.length - 1]?.count ?? 0;
    }, [jobsTrend]);
    const jobsExpired = useMemo(() => {
        const total = jobTotals?.total ?? 0;
        const active = jobTotals?.active ?? 0;
        return Math.max(total - active, 0);
    }, [jobTotals?.total, jobTotals?.active]);

    const topCandidates = data?.leaderboards.topCandidates ?? [];
    const topHRs = data?.leaderboards.topHRs ?? [];

    const renderTrendBars = (
        items: { count: number; date?: string; month?: string }[],
        type: "day" | "month"
    ) => {
        if (!items.length) {
            return (
                <div style={{ padding: 16, textAlign: "center", color: "#999" }}>
                    Chưa có dữ liệu để hiển thị.
                </div>
            );
        }

        const max = Math.max(...items.map((item) => item.count), 1);

        return (
            <div
                style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: 16,
                    minHeight: 180
                }}
            >
                {items.map((item) => {
                    const height = Math.max((item.count / max) * 140, 8);
                    const label =
                        type === "day"
                            ? dayjs(item.date).format("DD/MM")
                            : dayjs(item.month).format("MM/YYYY");
                    return (
                        <div
                            key={type === "day" ? item.date : item.month}
                            style={{
                                flex: 1,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 8
                            }}
                        >
                            <div
                                style={{
                                    width: "100%",
                                    background: "linear-gradient(180deg,#5B3A2B 0%,#7A6542 100%)",
                                    borderRadius: 10,
                                    height,
                                    transition: "height 0.3s ease"
                                }}
                            />
                            <Text style={{ fontSize: 12, color: "#666" }}>{label}</Text>
                            <Text strong style={{ fontSize: 13 }}>
                                {item.count}
                            </Text>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div
            style={{
                padding: 24,
                background: "#f5f7fb",
                minHeight: "100%"
            }}
        >
            <Space
                style={{ width: "100%", marginBottom: 24, justifyContent: "space-between" }}
                align="center"
            >
                <div>
                    <Title level={3} style={{ marginBottom: 4 }}>
                        Bảng điều khiển tuyển dụng
                    </Title>
                    <Text type="secondary">
                        Theo dõi hiệu suất tuyển dụng, ứng viên và nhà tuyển dụng nổi bật trong hệ thống.
                    </Text>
                </div>
                <Button
                    icon={<ReloadOutlined />}
                    onClick={fetchDashboard}
                    loading={loading}
                >
                    Làm mới
                </Button>
            </Space>

            <Skeleton active loading={loading && !data}>
                {data && (
                    <Space direction="vertical" size={24} style={{ width: "100%" }}>
                        <Row gutter={[24, 24]} style={{ alignItems: 'stretch' }}>
                            <Col xs={24} lg={12} xl={8} style={{ display: 'flex' }}>
                                <Card
                                    bordered={false}
                                    style={{ borderRadius: 16, boxShadow: "0 16px 40px rgba(15,23,42,0.08)", height: '100%', width: '100%', display: 'flex', flexDirection: 'column', minHeight: 420 }}
                                    title={
                                        <Space align="center">
                                            <TeamOutlined style={{ color: colors.candidate }} />
                                            <span>Tổng số người dùng</span>
                                        </Space>
                                    }
                                    bodyStyle={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 16, paddingBottom: 16 }}
                                >
                    <Statistic
                                        value={userTotals?.total ?? 0}
                                        valueStyle={{ fontSize: 36, fontWeight: 700 }}
                                        suffix={<span style={{ fontSize: 16 }}>người</span>}
                                    />
                                    <Space direction="vertical" style={{ width: "100%", marginTop: 24 }}>
                                        {roleDistribution.map((role) => (
                                            <div key={role.key}>
                                                <Space
                                                    style={{ width: "100%", justifyContent: "space-between" }}
                                                >
                                                    <Text strong>{role.label}</Text>
                                                    <Text type="secondary">
                                                        {formatNumber(role.value)} (
                                                        {Math.round(role.percent * 10) / 10}
                                                        %)
                                                    </Text>
                                                </Space>
                                                <Progress
                                                    percent={Math.round(role.percent * 10) / 10}
                                                    showInfo={false}
                                                    strokeColor={role.color}
                                                    trailColor="#f0f0f0"
                                                />
                                            </div>
                                        ))}
                                        {roleStats?.others?.length ? (
                                            <Space wrap size={4}>
                                                {roleStats.others.map((item) => (
                                                    <Tag key={item.roleId || item.roleName} color="default">
                                                        {(item.roleName ?? "Khác")}:{" "}
                                                        {formatNumber(item.count)}
                                                    </Tag>
                                                ))}
                                            </Space>
                                        ) : null}
                                    </Space>
                </Card>
            </Col>

                            <Col xs={24} lg={12} xl={8} style={{ display: 'flex' }}>
                                <Card
                                    bordered={false}
                                    style={{ borderRadius: 16, boxShadow: "0 16px 40px rgba(15,23,42,0.08)", height: '100%', width: '100%', display: 'flex', flexDirection: 'column', minHeight: 420 }}
                                    title={
                                        <Space align="center">
                                            <SolutionOutlined style={{ color: colors.admin }} />
                                            <span>Tổng quan việc làm</span>
                                        </Space>
                                    }
                                    bodyStyle={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 16, paddingBottom: 16 }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                                        <Statistic
                                            title="Tổng số job"
                                            value={jobTotals?.total ?? 0}
                                            prefix={<FileTextOutlined style={{ color: colors.admin }} />}
                                            valueStyle={{ fontWeight: 700 }}
                                        />
                    <Statistic
                                            title="Đang hiển thị"
                                            value={jobTotals?.active ?? 0}
                                            valueStyle={{ color: colors.hr, fontWeight: 600 }}
                                        />
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginTop: 8 }}>
                                        <Statistic
                                            title="Trong tháng"
                                            value={jobsThisMonth}
                                            valueStyle={{ color: colors.candidate, fontWeight: 600 }}
                                        />
                                        <Statistic
                                            title="Đã hết hạn"
                                            value={jobsExpired}
                                            valueStyle={{ color: '#a1a1aa', fontWeight: 500 }}
                                        />
                                    </div>
                                    <Card
                                        size="small"
                                        bordered={false}
                                        style={{
                                            background: "#f8f9fb",
                                            borderRadius: 12,
                                            marginTop: 0,
                                            minHeight: 240,
                                            height: '100%',
                                            flex: 1,
                                            display: "flex",
                                            flexDirection: "column"
                                        }}
                                        bodyStyle={{ padding: 12, paddingTop: 8, paddingBottom: 8 }}
                                    >
                                        <Text type="secondary">
                                            Xu hướng 6 tháng gần nhất
                                        </Text>
                                        {renderTrendBars(
                                            jobsTrend.map((item) => ({
                                                ...item,
                                                month: item.month
                                            })),
                                            "month"
                                        )}
                                    </Card>
                </Card>
            </Col>

                            <Col xs={24} xl={8} style={{ display: 'flex' }}>
                                <Card
                                    bordered={false}
                                    style={{ borderRadius: 16, boxShadow: "0 16px 40px rgba(15,23,42,0.08)", height: '100%', width: '100%', display: 'flex', flexDirection: 'column', minHeight: 420 }}
                                    title={
                                        <Space align="center">
                                            <FileTextOutlined style={{ color: colors.hr }} />
                                            <span>Hoạt động ứng tuyển</span>
                                        </Space>
                                    }
                                    bodyStyle={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 16, paddingBottom: 16 }}
                                >
                                    <Row gutter={[16, 16]}>
                                        <Col span={12}>
                                            <Statistic
                                                title="Tổng hồ sơ"
                                                value={applicationTotals?.total ?? 0}
                                                valueStyle={{ fontWeight: 700 }}
                                            />
                                        </Col>
                                        <Col span={12}>
                                            <Statistic
                                                title="Trong tháng"
                                                value={applicationTotals?.thisMonth ?? 0}
                                                valueStyle={{ color: colors.candidate, fontWeight: 600 }}
                                            />
                                        </Col>
                                        <Col span={12}>
                    <Statistic
                                                title="Trong ngày"
                                                value={applicationTotals?.today ?? 0}
                                                valueStyle={{ color: colors.admin, fontWeight: 600 }}
                                            />
                                        </Col>
                                        <Col span={12}>
                                            <Card
                                                size="small"
                                                bordered={false}
                                                style={{
                                                    background: "#fff7e6",
                                                    borderRadius: 10
                                                }}
                                            >
                                                <Text strong>Ứng viên duy nhất tháng này</Text>
                                                <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>
                                                    {formatNumber(applicationTotals?.uniqueApplicantsThisMonth ?? 0)}
                                                </div>
                                            </Card>
                                        </Col>
                                    </Row>
                                    <Card
                                        size="small"
                                        bordered={false}
                                        style={{
                                            background: "#f8f9fb",
                                            borderRadius: 12,
                                            marginTop: 0,
                                            minHeight: 240,
                                            height: '100%',
                                            flex: 1,
                                            display: "flex",
                                            flexDirection: "column"
                                        }}
                                        bodyStyle={{ padding: 12, paddingTop: 8, paddingBottom: 8 }}
                                    >
                                        <Text type="secondary">
                                            Ứng tuyển 7 ngày gần nhất
                                        </Text>
                                        {renderTrendBars(
                                            applicationsTrend.map((item) => ({
                                                ...item,
                                                date: item.date
                                            })),
                                            "day"
                                        )}
                                    </Card>
                                </Card>
                            </Col>
                        </Row>

                        <Row gutter={[24, 24]}>
                            <Col xs={24} lg={12}>
                                <Card
                                    bordered={false}
                                    style={{ borderRadius: 16, boxShadow: "0 16px 40px rgba(15,23,42,0.05)" }}
                                    title="Top 10 ứng viên hoạt động mạnh"
                                    extra={
                                        <Tag color="processing">
                                            Số lần nộp CV / cập nhật gần nhất
                                        </Tag>
                                    }
                                >
                                    <Table
                                        rowKey={(record) => record.userId || record.email || Math.random().toString()}
                                        dataSource={topCandidates}
                                        pagination={false}
                                        size="small"
                                        scroll={{ y: 360 }}
                                    >
                                        <Table.Column
                                            title="#"
                                            render={(_, __, index) => index + 1}
                                            width={50}
                                            align="center"
                                        />
                                        <Table.Column
                                            title="Ứng viên"
                                            dataIndex="name"
                                            render={(_, record: any) => (
                                                <Space>
                                                    <Avatar src={record.avatar}>
                                                        {getInitials(record.name)}
                                                    </Avatar>
                                                    <div>
                                                        <div style={{ fontWeight: 600 }}>{record.name || "Chưa cập nhật"}</div>
                                                        <div style={{ fontSize: 12, color: "#888" }}>{record.email}</div>
                                                    </div>
                                                </Space>
                                            )}
                                        />
                                        <Table.Column
                                            title="Hồ sơ"
                                            dataIndex="totalApplications"
                                            align="center"
                                            width={90}
                                            render={(value: number) => formatNumber(value ?? 0)}
                                        />
                                        <Table.Column
                                            title="Số công ty"
                                            dataIndex="companiesCount"
                                            align="center"
                                            width={110}
                                        />
                                        <Table.Column
                                            title="Công việc"
                                            dataIndex="jobsCount"
                                            align="center"
                                            width={100}
                                        />
                                        <Table.Column
                                            title="Hoạt động gần nhất"
                                            dataIndex="lastAppliedAt"
                                            width={160}
                                            render={(value: string) =>
                                                value ? dayjs(value).format("DD/MM/YYYY HH:mm") : "-"
                                            }
                                        />
                                    </Table>
                </Card>
            </Col>

                            <Col xs={24} lg={12}>
                                <Card
                                    bordered={false}
                                    style={{ borderRadius: 16, boxShadow: "0 16px 40px rgba(15,23,42,0.05)" }}
                                    title="Top 10 nhà tuyển dụng đăng job"
                                    extra={<Tag color="warning">Dựa trên số job đã đăng</Tag>}
                                >
                                    <Table
                                        rowKey={(record) => record.userId || record.email || Math.random().toString()}
                                        dataSource={topHRs}
                                        pagination={false}
                                        size="small"
                                        scroll={{ y: 360 }}
                                    >
                                        <Table.Column
                                            title="#"
                                            render={(_, __, index) => index + 1}
                                            width={50}
                                            align="center"
                                        />
                                        <Table.Column
                                            title="Nhà tuyển dụng"
                                            dataIndex="name"
                                            render={(_, record: any) => (
                                                <Space>
                                                    <Avatar src={record.avatar}>
                                                        {getInitials(record.name || record.email)}
                                                    </Avatar>
                                                    <div>
                                                        <div style={{ fontWeight: 600 }}>{record.name || "Chưa cập nhật"}</div>
                                                        <div style={{ fontSize: 12, color: "#888" }}>{record.email}</div>
                                                    </div>
                                                </Space>
                                            )}
                                        />
                                        <Table.Column
                                            title="Job đã đăng"
                                            dataIndex="totalJobs"
                                            align="center"
                                            width={110}
                                            render={(value: number) => formatNumber(value ?? 0)}
                                        />
                                        <Table.Column
                                            title="Công ty"
                                            dataIndex="company"
                                            width={160}
                                            render={(_, record: any) =>
                                                record.company || (record.companyNames?.[0] ?? "-")
                                            }
                                        />
                                        <Table.Column
                                            title="Hoạt động gần nhất"
                                            dataIndex="lastPostedAt"
                                            width={160}
                                            render={(value: string) =>
                                                value ? dayjs(value).format("DD/MM/YYYY HH:mm") : "-"
                                            }
                                        />
                                    </Table>
                                </Card>
                            </Col>
                        </Row>

                        <Row>
                            <Col span={24}>
                                <Card
                                    bordered={false}
                                    style={{ borderRadius: 16, boxShadow: "0 16px 40px rgba(15,23,42,0.05)" }}
                                >
                                    <Space align="center">
                                        <ApartmentOutlined style={{ color: colors.hr }} />
                                        <Text strong>
                                            Tổng số công ty đang hoạt động:{" "}
                                            {formatNumber(totals?.companies ?? 0)}
                                        </Text>
                                    </Space>
                                </Card>
                            </Col>
        </Row>
                    </Space>
                )}
            </Skeleton>
        </div>
    );
};

export default DashboardPage;
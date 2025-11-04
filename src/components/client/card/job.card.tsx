import { callFetchJob } from '@/config/api';
import { LOCATION_LIST, convertSlug, getLocationName } from '@/config/utils';
import { IJob } from '@/types/backend';
import { EnvironmentOutlined, DollarOutlined, HistoryOutlined, UserOutlined } from '@ant-design/icons';
import { Card, Col, Empty, Pagination, Row, Spin, Tag } from 'antd';
import { useState, useEffect } from 'react';
import { isMobile } from 'react-device-detect';
import { Link, useNavigate } from 'react-router-dom';
import styles from 'styles/client.module.scss';
import dayjs from '@/config/dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime)

interface IProps {
    showPagination?: boolean;
}

const JobCard = (props: IProps) => {
    const { showPagination = false } = props;

    const [displayJob, setDisplayJob] = useState<IJob[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(6);
    const [total, setTotal] = useState(0);
    const [filter, setFilter] = useState("");
    const [sortQuery, setSortQuery] = useState("sort=-updatedAt");
    const navigate = useNavigate();

    useEffect(() => {
        fetchJob();
    }, [current, pageSize, filter, sortQuery]);

    const fetchJob = async () => {
        setIsLoading(true)
        let query = `current=${current}&pageSize=${pageSize}&sort=-updatedAt`;
        if (filter) {
            query += `&${filter}`;
        }
        if (sortQuery) {
            query += `&${sortQuery}`;
        }

        const res = await callFetchJob(query);
        if (res && res.data) {
            setDisplayJob(res.data.result);
            setTotal(res.data.meta.total)
        }
        setIsLoading(false)
    }



    const handleOnchangePage = (pagination: { current: number, pageSize: number }) => {
        if (pagination && pagination.current !== current) {
            setCurrent(pagination.current)
        }
        if (pagination && pagination.pageSize !== pageSize) {
            setPageSize(pagination.pageSize)
            setCurrent(1);
        }
    }

    const handleViewDetailJob = (item: IJob) => {
        const slug = convertSlug(item.name);
        navigate(`/job/${slug}?id=${item._id}`)
    }

    const getRandomBadge = () => {
        const badges = [
            { text: 'SUPER HOT', color: '#ff4d4f', bg: '#fff1f0' },
            { text: 'HOT', color: '#fa8c16', bg: '#fff7e6' },
            { text: 'NEW', color: '#52c41a', bg: '#f6ffed' },
        ];
        return badges[Math.floor(Math.random() * badges.length)];
    }

    return (
        <div className={`${styles["card-job-section"]}`}>
            <div className={`${styles["job-content"]}`}>
                <Spin spinning={isLoading} tip="Loading...">
                    <Row gutter={[20, 40]}>
                        <Col span={24}>
                            <div className={isMobile ? styles["dflex-mobile"] : styles["dflex-pc"]}>
                                <span className={styles["title"]}>Công Việc Mới Nhất</span>
                                {!showPagination &&
                                    <Link to="job">Xem tất cả</Link>
                                }
                            </div>
                        </Col>

                        {displayJob?.map(item => {
                            const badge = getRandomBadge();
                            return (
                                <Col span={24} md={8} key={item._id}>
                                    <div
                                        onClick={() => handleViewDetailJob(item)}
                                        style={{
                                            cursor: 'pointer',
                                            border: '1px solid #eee',
                                            padding: 12,
                                            borderRadius: 8,
                                            background: '#fff',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                            position: 'relative',
                                            height: '100%'
                                        }}
                                    >
                                        <span style={{ position: 'absolute', right: 12, top: 12, fontSize: 12, fontWeight: 700, color: badge.color, background: badge.bg, padding: '2px 8px', borderRadius: 12 }}>
                                            {badge.text}
                                        </span>
                                        <div style={{ display: 'flex', gap: 10 }}>
                                            <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', flexShrink: 0, border: '1px solid #f0f0f0' }}>
                                                <img
                                                    alt="company"
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    src={`${import.meta.env.VITE_BACKEND_URL}/images/company/${item?.company?.logo}`}
                                                />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 600 }}>{item.name}</div>
                                                <div style={{ marginTop: 6, background: '#fafafa', padding: '6px 8px', borderRadius: 6 }}>
                                                    <div style={{ marginBottom: 4 }}><EnvironmentOutlined style={{ color: '#58aaab' }} /> {getLocationName(item.location)}</div>
                                                    <div style={{ marginBottom: 4 }}><DollarOutlined /> {(item.salary + "")?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} đ</div>
                                                    <div style={{ color: '#888' }}><HistoryOutlined /> {dayjs(item.updatedAt).fromNow()}</div>
                                                </div>
                                                {item.workingModel && (
                                                    <div style={{ marginTop: 6 }}>
                                                        <Tag color="blue" icon={<UserOutlined />}>{item.workingModel === 'AT_OFFICE' ? 'At office' : item.workingModel === 'REMOTE' ? 'Remote' : item.workingModel === 'HYBRID' ? 'Hybrid' : item.workingModel}</Tag>
                                                    </div>
                                                )}
                                                {item.level && (
                                                    <div style={{ marginTop: 8 }}>
                                                        <Tag color="orange" style={{ fontWeight: 600 }}>{item.level}</Tag>
                                                    </div>
                                                )}
                                                <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                                    {item.skills?.slice(0, 4).map((s, idx) => (
                                                        <Tag key={idx} color="gold">{s}</Tag>
                                                    ))}
                                                    {item.skills && item.skills.length > 4 && (
                                                        <Tag>+{item.skills.length - 4}</Tag>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                            )
                        })}


                        {(!displayJob || displayJob && displayJob.length === 0)
                            && !isLoading &&
                            <div className={styles["empty"]}>
                                <Empty description="Không có dữ liệu" />
                            </div>
                        }
                    </Row>
                    {showPagination && <>
                        <div style={{ marginTop: 30 }}></div>
                        <Row style={{ display: "flex", justifyContent: "center" }}>
                            <Pagination
                                current={current}
                                total={total}
                                pageSize={pageSize}
                                responsive
                                onChange={(p: number, s: number) => handleOnchangePage({ current: p, pageSize: s })}
                            />
                            
                        </Row>
                    </>}
                </Spin>
            </div>
        </div>
    )
}

export default JobCard;
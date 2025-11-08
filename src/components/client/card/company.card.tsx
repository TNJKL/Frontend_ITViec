import { callFetchCompany } from '@/config/api';
import { convertSlug } from '@/config/utils';
import { ICompany } from '@/types/backend';
import { Badge, Card, Col, Divider, Empty, Pagination, Row, Spin, Tag, Carousel, Button } from 'antd';
import type { CarouselRef } from 'antd/es/carousel';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useState, useEffect, useRef } from 'react';
import { isMobile } from 'react-device-detect';
import { Link, useNavigate } from 'react-router-dom';
import styles from 'styles/client.module.scss';

interface IProps {
    showPagination?: boolean;
}

const CompanyCard = (props: IProps) => {
    const { showPagination = false } = props;

    const [displayCompany, setDisplayCompany] = useState<ICompany[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [companyMeta, setCompanyMeta] = useState<Record<string, { skills: string[]; jobs: number }>>({});

    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(showPagination ? 4 : 16);
    const [total, setTotal] = useState(0);
    const [filter, setFilter] = useState("");
    const [sortQuery, setSortQuery] = useState("sort=-updatedAt");
    const navigate = useNavigate();
    const [carouselKey, setCarouselKey] = useState<number>(0);
    const carouselRef = useRef<CarouselRef | null>(null);

    useEffect(() => {
        fetchCompany();
    }, [current, pageSize, filter, sortQuery]);

    const fetchCompany = async () => {
        setIsLoading(true)
        let query = `current=${current}&pageSize=${pageSize}`;
        if (filter) {
            query += `&${filter}`;
        }
        if (sortQuery) {
            query += `&${sortQuery}`;
        }

        const res = await callFetchCompany(query);
        if (res && res.data) {
            setDisplayCompany(res.data.result);
            setTotal(res.data.meta.total)
            // fetch jobs meta for visible companies (top 8 to reduce calls when on homepage)
            if (!showPagination) {
                const slice = res.data.result.slice(0, 20);
                await fetchCompaniesMeta(slice as ICompany[]);
                setCarouselKey(prev => prev + 1);
            } else {
                await fetchCompaniesMeta(res.data.result as ICompany[]);
            }
        }
        setIsLoading(false)
    }

    const fetchCompaniesMeta = async (companies: ICompany[]) => {
        const meta: Record<string, { skills: string[]; jobs: number }> = { ...companyMeta };
        for (const c of companies) {
            if (!c?._id) continue;
            if (meta[c._id]) continue;
            try {
                const query = `current=1&pageSize=100&company._id=${c._id}`;
                const res = await (await import('@/config/api')).callFetchJob(query);
                if (res && res.data) {
                    const jobs = res.data.result || [];
                    const skillsFreq: Record<string, number> = {};
                    jobs.forEach((j: any) => (j.skills || []).forEach((s: string) => { skillsFreq[s] = (skillsFreq[s] || 0) + 1; }));
                    const skills = Object.entries(skillsFreq)
                        .sort((a, b) => b[1] - a[1])
                        .map(([k]) => k)
                        .slice(0, 6);
                    meta[c._id] = { skills, jobs: res.data.meta?.total || jobs.length };
                }
            } catch (e) { /* ignore */ }
        }
        setCompanyMeta(meta);
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

    const handleViewDetailJob = (item: ICompany) => {
        if (item.name) {
            const slug = convertSlug(item.name);
            navigate(`/company/${slug}?id=${item._id}`)
        }
    }

    return (
        <div className={`${styles["company-section"]}`}>
            <div className={styles["company-content"]}>
                <Spin spinning={isLoading} tip="Loading...">
                    <Row gutter={[20, 20]}>
                        <Col span={24}>
                            <div className={isMobile ? styles["dflex-mobile"] : styles["dflex-pc"]}>
                                <span className={styles["title"]}>Nhà Tuyển Dụng Hàng Đầu1</span>
                                {!showPagination &&
                                    <Link to="company">Xem tất cả</Link>
                                }
                            </div>
                        </Col>

                        {!showPagination && displayCompany && displayCompany.length > 0 && (
                            <Col span={24} style={{ position: 'relative' }}>
                                <Carousel
                                    dots
                                    autoplay
                                    autoplaySpeed={7200}
                                    speed={900}
                                    infinite
                                    swipeToSlide
                                    draggable
                                    cssEase="ease-in-out"
                                    key={carouselKey}
                                    ref={carouselRef}
                                >
                                    {chunkArray(displayCompany, 4).map((chunk, idx) => (
                                        <div key={idx}>
                                            <Row gutter={[20, 20]}>
                                                {chunk.map((item: ICompany) => (
                                                    <Col span={24} md={6} key={item._id}>
                                                        <Card
                                                            onClick={() => handleViewDetailJob(item)}
                                                            style={{ height: 340, borderRadius: 12 }}
                                                            hoverable
                                                            cover={
                                                                <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 18 }}>
                                                                    <div style={{ width: 126, height: 126, borderRadius: 10, background: '#fff', boxShadow: '0 6px 18px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                        <img
                                                                            alt="company"
                                                                            style={{ maxWidth: '76%', maxHeight: '76%', objectFit: 'contain' }}
                                                                            src={`${import.meta.env.VITE_BACKEND_URL}/images/company/${item?.logo}`}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            }
                                                        >
                                                            <div style={{ display: 'flex', flexDirection: 'column', height: 180 }}>
                                                                <h3 style={{
                                                                    textAlign: "center",
                                                                    minHeight: 44,
                                                                    margin: '10px 0 8px 0',
                                                                    lineHeight: '22px',
                                                                    display: '-webkit-box',
                                                                    WebkitLineClamp: 2 as any,
                                                                    WebkitBoxOrient: 'vertical' as any,
                                                                    overflow: 'hidden',
                                                                    wordBreak: 'break-word'
                                                                }}>{item.name}</h3>
                                                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', height: 36, overflow: 'hidden', padding: '0 8px' }}>
                                                                    {(companyMeta[item._id || '']?.skills || []).slice(0, 3).map((s) => (
                                                                        <Tag key={s} style={{ background: '#f5f5f5', border: 0, margin: 2, fontSize: 12, padding: '2px 8px', borderRadius: 16, color: '#555' }}>{s}</Tag>
                                                                    ))}
                                                                </div>
                                                                <div style={{ marginTop: 'auto', background: '#fafafa', borderRadius: 10, padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 44 }}>
                                                                    <span style={{ color: '#666', fontSize: 12, maxWidth: '70%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '16px' }}>{item.address}</span>
                                                                    <span style={{ fontWeight: 600, fontSize: 13, lineHeight: '16px' }}><Badge status="success" /> {companyMeta[item._id || '']?.jobs || 0} Jobs</span>
                                                                </div>
                                                            </div>
                                                        </Card>
                                                    </Col>
                                                ))}
                                            </Row>
                                        </div>
                                    ))}
                                </Carousel>
                                <Button
                                    type="text"
                                    icon={<LeftOutlined />}
                                    onClick={() => carouselRef.current?.prev?.()}
                                    style={{ position: 'absolute', top: '45%', left: 4, zIndex: 2, background: '#fff', borderRadius: 20, boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}
                                />
                                <Button
                                    type="text"
                                    icon={<RightOutlined />}
                                    onClick={() => carouselRef.current?.next?.()}
                                    style={{ position: 'absolute', top: '45%', right: 4, zIndex: 2, background: '#fff', borderRadius: 20, boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}
                                />
                            </Col>
                        )}

                        {showPagination && displayCompany?.map(item => {
                            return (
                                <Col span={24} md={6} key={item._id}>
                                    <Card
                                        onClick={() => handleViewDetailJob(item)}
                                        style={{ height: 340, borderRadius: 12 }}
                                        hoverable
                                        cover={
                                            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 18 }}>
                                                <div style={{ width: 126, height: 126, borderRadius: 10, background: '#fff', boxShadow: '0 6px 18px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <img
                                                        alt="company"
                                                        style={{ maxWidth: '76%', maxHeight: '76%', objectFit: 'contain' }}
                                                        src={`${import.meta.env.VITE_BACKEND_URL}/images/company/${item?.logo}`}
                                                    />
                                                </div>
                                            </div>
                                        }
                                    >
                                        <div style={{ display: 'flex', flexDirection: 'column', height: 180 }}>
                                            <h3 style={{
                                                textAlign: "center",
                                                minHeight: 44,
                                                margin: '10px 0 8px 0',
                                                lineHeight: '22px',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2 as any,
                                                WebkitBoxOrient: 'vertical' as any,
                                                overflow: 'hidden',
                                                wordBreak: 'break-word'
                                            }}>{item.name}</h3>
                                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', height: 36, overflow: 'hidden', padding: '0 8px' }}>
                                                {(companyMeta[item._id || '']?.skills || []).slice(0, 3).map((s) => (
                                                    <Tag key={s} style={{ background: '#f5f5f5', border: 0, margin: 2, fontSize: 12, padding: '2px 8px', borderRadius: 16, color: '#555' }}>{s}</Tag>
                                                ))}
                                            </div>
                                            <div style={{ marginTop: 'auto', background: '#fafafa', borderRadius: 10, padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 44 }}>
                                                <span style={{ color: '#666', fontSize: 12, maxWidth: '70%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '16px' }}>{item.address}</span>
                                                <span style={{ fontWeight: 600, fontSize: 13, lineHeight: '16px' }}><Badge status="success" /> {companyMeta[item._id || '']?.jobs || 0} Jobs</span>
                                            </div>
                                        </div>
                                    </Card>
                                </Col>
                            )
                        })}

                        {(!displayCompany || displayCompany && displayCompany.length === 0)
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

export default CompanyCard;

function chunkArray<T>(arr: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
    }
    return result;
}
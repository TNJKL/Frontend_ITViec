import { useLocation, useNavigate } from "react-router-dom";
import { useAppSelector } from '@/redux/hooks';
import { useState, useEffect, useRef } from 'react';
import { ICompany, IJob } from "@/types/backend";
import { callFetchCompanyById, callFetchJob, callFetchReviewsByCompany, callCreateReview, callFetchReviewSummary } from "@/config/api";
import styles from 'styles/client.module.scss';
import parse from 'html-react-parser';
import { Col, Divider, Row, Skeleton, Tag, Tabs, Rate, Form, Input, Button, message, Radio, Modal, Carousel } from "antd";
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import type { CarouselRef } from 'antd/es/carousel';
import { DollarOutlined, EnvironmentOutlined, HistoryOutlined, UserOutlined } from "@ant-design/icons";
import dayjs from '@/config/dayjs';
import 'dayjs/locale/vi';
import { getLocationName, convertSlug } from "@/config/utils";


const ClientCompanyDetailPage = (props: any) => {
    const [companyDetail, setCompanyDetail] = useState<ICompany | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [jobs, setJobs] = useState<IJob[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [form] = Form.useForm();
    const [summary, setSummary] = useState<any | null>(null);
    const [isWriteOpen, setIsWriteOpen] = useState(false);
    const [formWrite] = Form.useForm();
    const accountUser = useAppSelector((state) => state.account.user);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [galleryIndex, setGalleryIndex] = useState(0);
    const carouselRef = useRef<CarouselRef>(null);
    const navigate = useNavigate();

    let location = useLocation();
    let params = new URLSearchParams(location.search);
    const id = params?.get("id"); // job id

    useEffect(() => {
        const init = async () => {
            if (id) {
                setIsLoading(true)
                try {
                const res = await callFetchCompanyById(id);
                if (res?.data) {
                    setCompanyDetail(res.data)
                }
                    // fetch jobs of this company
                    const q = `current=1&pageSize=100&company._id=${id}&sort=-updatedAt`;
                    const resJobs = await callFetchJob(q);
                    if (resJobs?.data) setJobs(resJobs.data.result as IJob[]);
                    setLoadingReviews(true);
                    const r = await callFetchReviewsByCompany(id);
                    if (r?.data) setReviews(r.data as any[]);
                    const s = await callFetchReviewSummary(id);
                    if (s?.data) setSummary(s.data);
                    setLoadingReviews(false);
                } catch (e) {
                    // noop
                } finally {
                setIsLoading(false)
                }
            }
        }
        init();
    }, [id]);

    dayjs.locale('vi');

    const getRandomBadge = () => {
        const badges = [
            { text: 'SUPER HOT', color: '#ff4d4f', bg: '#fff1f0' },
            { text: 'HOT', color: '#fa8c16', bg: '#fff7e6' },
            { text: 'NEW', color: '#52c41a', bg: '#f6ffed' },
        ];
        return badges[Math.floor(Math.random() * badges.length)];
    }

    return (
        <div className={`${styles["container"]} ${styles["detail-job-section"]}`}>
            {isLoading ?
                <Skeleton />
                :
                <Row gutter={[20, 20]}>
                    {companyDetail && companyDetail._id &&
                        <>
                            <Col span={24} md={16}>
                                <Tabs
                                    items={[
                                        {
                                            key: 'overview',
                                            label: 'Overview',
                                            children: (
                                                <>
                                                    <div className={styles["header"]}>{companyDetail.name}</div>
                                                    <div className={styles["location"]}><EnvironmentOutlined style={{ color: '#58aaab' }} />&nbsp;{(companyDetail?.address)}</div>
                                                    <Divider />
                                                    <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: 12, maxHeight: 720, overflowY: 'auto' }}>
                                                        {parse(companyDetail?.description ?? "")}
                                                    </div>
                                                    {companyDetail?.images && companyDetail.images.length > 0 && (
                                                        <div style={{ marginTop: 16 }}>
                                                            <Divider style={{ margin: '12px 0', borderTop: '1px dashed #e8e8e8' }} />
                                                            <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: 12 }}>
                                                                <div style={{ fontWeight: 600, marginBottom: 8 }}>Hình ảnh</div>
                                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                                                                    {(companyDetail.images || []).slice(0, 3).map((img, idx) => (
                                                                        <div
                                                                            key={idx}
                                                                            onClick={() => { setGalleryIndex(idx); setIsGalleryOpen(true); }}
                                                                            style={{ width: '100%', height: 150, overflow: 'hidden', borderRadius: 8, border: '1px solid #eee', position: 'relative', cursor: 'pointer' }}
                                                                        >
                                                                            <img alt="company" style={{ width: '100%', height: '100%', objectFit: 'cover' }} src={`${import.meta.env.VITE_BACKEND_URL}/images/company/${img}`} />
                                                                            {idx === 2 && ((companyDetail.images || []).length > 3) && (
                                                                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18 }}>
                                                                                    +{(companyDetail.images || []).length - 3}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <Modal open={isGalleryOpen} footer={null} onCancel={() => setIsGalleryOpen(false)} width={900} destroyOnClose>
                                                                <div style={{ position: 'relative' }}>
                                                                <Carousel dots initialSlide={galleryIndex} ref={carouselRef}>
                                                                    {(companyDetail.images || []).map((img, idx) => (
                                                                        <div key={idx}>
                                                                            <div style={{ width: '100%', height: 480, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                                <img alt="company" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} src={`${import.meta.env.VITE_BACKEND_URL}/images/company/${img}`} />
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </Carousel>
                                                                <Button type="text" shape="circle" onClick={() => carouselRef.current?.prev()} style={{ position: 'absolute', top: '50%', left: 8, transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.45)', color: '#fff' }} icon={<LeftOutlined />} />
                                                                <Button type="text" shape="circle" onClick={() => carouselRef.current?.next()} style={{ position: 'absolute', top: '50%', right: 8, transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.45)', color: '#fff' }} icon={<RightOutlined />} />
                                                                </div>
                                                            </Modal>
                                </div>
                                                    )}

                                                    {/* Location section with tabs for company maps */}
                                                    {Array.isArray((companyDetail as any)?.maps) && (
                                                        <div style={{ marginTop: 16 }}>
                                                            <Divider style={{ margin: '12px 0', borderTop: '1px dashed #e8e8e8' }} />
                                                            <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: 12 }}>
                                                                <div style={{ fontWeight: 600, marginBottom: 8 }}>Location</div>
                                                                {(() => {
                                                                    const maps = ((companyDetail as any)?.maps || []) as string[];
                                                                    const labels = ['Ha Noi', 'Ho Chi Minh', 'Da Nang'];
                                                                    const items = maps.slice(0, 3).map((html, idx) => ({
                                                                        key: `${idx}`,
                                                                        label: labels[idx] || `Location ${idx + 1}`,
                                                                        children: (
                                                                            <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, overflow: 'hidden' }}>
                                                                                {html ? parse(html) : <div style={{ padding: 12, color: '#888' }}>Chưa có bản đồ cho mục này</div>}
                                                                            </div>
                                                                        )
                                                                    }));
                                                                    return items.length > 0 ? <Tabs items={items} /> : <div style={{ padding: 12, color: '#888' }}>Chưa có bản đồ</div>;
                                                                })()}
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )
                                        },
                                        {
                                            key: 'reviews',
                                            label: `Reviews`,
                                            children: (
                                                <>
                                                    {summary && (
                                                        <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 12 }}>
                                                            <div>
                                                                <div style={{ fontSize: 28, fontWeight: 700 }}>{summary.average?.toFixed(1)}</div>
                                                                <div style={{ color: '#888' }}>{summary.total} reviews</div>
                                                            </div>
                                                            <div style={{ flex: 1 }}>
                                                                {[5,4,3,2,1].map(star => (
                                                                    <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                                        <span style={{ width: 12 }}>{star}</span>
                                                                        <div style={{ background: '#f0f0f0', height: 8, borderRadius: 4, flex: 1 }}>
                                                                            <div style={{ background: '#ff4d4f', width: `${summary.total ? Math.round((summary.distribution?.[star]||0)/summary.total*100) : 0}%`, height: 8, borderRadius: 4 }} />
                                                                        </div>
                                                                        <span style={{ width: 30, textAlign: 'right', color: '#888' }}>{summary.total ? Math.round((summary.distribution?.[star]||0)/summary.total*100) : 0}%</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <div style={{ textAlign: 'center' }}>
                                                                <div style={{ fontSize: 28, color: '#52c41a', fontWeight: 700 }}>{summary.recommendPercent}%</div>
                                                                <div style={{ color: '#888', maxWidth: 120 }}>Recommend working here to a friend</div>
                                                            </div>
                                </div>
                                                    )}
                                                    <Button style={{ marginBottom: 12 }} type="primary" onClick={() => { setIsWriteOpen(true); formWrite.resetFields(); }}>Write Review</Button>
                                                    <Modal title="Write a review" open={isWriteOpen} onCancel={() => setIsWriteOpen(false)} onOk={() => formWrite.submit()} okText="Gửi đánh giá" destroyOnClose>
                                                        <Form form={formWrite} layout="vertical" onFinish={async (values) => {
                                                            try {
                                                                const res = await callCreateReview({ company: companyDetail._id as any, user: (accountUser?._id as any) || '' as any, rating: values.rating, comment: values.comment, summary: values.summary, pros: values.pros, cons: values.cons, recommend: values.recommend });
                                                                if (res?.data) message.success('Gửi đánh giá thành công'); else message.error('Gửi đánh giá thất bại');
                                                                setIsWriteOpen(false);
                                                                const r = await callFetchReviewsByCompany(companyDetail._id as any);
                                                                if (r?.data) setReviews(r.data as any[]);
                                                                const s = await callFetchReviewSummary(companyDetail._id as any);
                                                                if (s?.data) setSummary(s.data);
                                                            } catch (e) {
                                                                message.error('Gửi đánh giá thất bại');
                                                            }
                                                        }}>
                                                            <Form.Item name="summary" label="Summary" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}>
                                                                <Input />
                                                            </Form.Item>
                                                            <Form.Item name="rating" label="Đánh giá" rules={[{ required: true, message: 'Vui lòng chọn sao' }]}>
                                                                <Rate />
                                                            </Form.Item>
                                                            <Form.Item name="comment" label="Nhận xét">
                                                                <Input.TextArea rows={3} placeholder="Chia sẻ trải nghiệm của bạn" />
                                                            </Form.Item>
                                                            <Form.Item name="pros" label="What makes you love working here?">
                                                                <Input.TextArea rows={3} />
                                                            </Form.Item>
                                                            <Form.Item name="cons" label="Suggestion for improvement">
                                                                <Input.TextArea rows={3} />
                                                            </Form.Item>
                                                            <Form.Item name="recommend" label="Recommend to friends?" initialValue={true}>
                                                                <Radio.Group>
                                                                    <Radio value={true}>Yes</Radio>
                                                                    <Radio value={false}>No</Radio>
                                                                </Radio.Group>
                                                            </Form.Item>
                                                        </Form>
                                                    </Modal>
                                <Divider />
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '60vh', overflowY: 'auto', paddingRight: 8 }}>
                                                        {loadingReviews ? <Skeleton /> : reviews.map((rv, idx) => (
                                                            <div key={idx} style={{ border: '1px solid #eee', padding: 12, borderRadius: 8 }}>
                                                                <div style={{ color: '#999', fontSize: 12 }}>{dayjs(rv.createdAt).format('DD/MM/YYYY HH:mm')}</div>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                                                    <Rate disabled value={Number(rv.rating)} />
                                                                    <b>{rv.summary}</b>
                                                                    {rv.recommend === true && <Tag color="green">Recommend</Tag>}
                                                                    {rv.recommend === false && <Tag color="red">Not Recommend</Tag>}
                                                                </div>
                                                                {rv.comment && <div style={{ marginTop: 8 }}>{rv.comment}</div>}
                                                                {(rv.pros || rv.overtimePolicy) && (
                                                                    <div style={{ marginTop: 8 }}>
                                                                        <b>What I liked:</b>
                                                                        <div style={{ marginTop: 4 }}>{rv.pros}</div>
                                                                        {rv.overtimePolicy && <div style={{ marginTop: 4 }}>{rv.overtimePolicy === 'SATISFIED' ? 'Satisfied' : 'Unsatisfied'} – The overtime policy</div>}
                                                                    </div>
                                                                )}
                                                                {rv.cons && (
                                                                    <div style={{ marginTop: 8 }}>
                                                                        <b>Suggestions for improvement:</b>
                                                                        <div style={{ marginTop: 4 }}>{rv.cons}</div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </>
                                            )
                                        }
                                    ]}
                                />
                            </Col>

                            <Col span={24} md={8}>
                                <div className={styles["company"]}>
                                    <div>
                                        <img
                                            alt="example"
                                            src={`${import.meta.env.VITE_BACKEND_URL}/images/company/${companyDetail?.logo}`}
                                        />
                                    </div>
                                    <div>
                                        {companyDetail?.name}
                                    </div>
                                </div>
                                <Divider />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '60vh', overflowY: 'auto', paddingRight: 8 }}>
                                    {jobs?.map((j) => (
                                        <div
                                            key={j._id}
                                            className={styles['job-list-item']}
                                            onClick={() => navigate(`/job/${convertSlug(j.name)}?id=${j._id}`)}
                                            style={{
                                                cursor: 'pointer',
                                                border: '1px solid #eee',
                                                padding: 16,
                                                borderRadius: 8,
                                                background: '#fff',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                                position: 'relative'
                                            }}
                                        >
                                            {(() => { const b = getRandomBadge(); return (
                                                <span style={{ position: 'absolute', right: 12, top: 12, fontSize: 12, fontWeight: 700, color: b.color, background: b.bg, padding: '2px 8px', borderRadius: 12 }}>
                                                    {b.text}
                                                </span>
                                            )})()}
                                            <div style={{ display: 'flex', gap: 12 }}>
                                                <div style={{ width: 52, height: 52, borderRadius: 8, overflow: 'hidden', flexShrink: 0, border: '1px solid #f0f0f0' }}>
                                                    <img
                                                        alt="company"
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        src={`${import.meta.env.VITE_BACKEND_URL}/images/company/${companyDetail?.logo}`}
                                                    />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 600 }}>{j.name}</div>
                                                    <div style={{ marginTop: 8, background: '#fafafa', padding: '8px 10px', borderRadius: 6 }}>
                                                        <div style={{ marginBottom: 6 }}><EnvironmentOutlined style={{ color: '#58aaab' }} /> {getLocationName(j.location)}</div>
                                                        <div style={{ marginBottom: 6 }}><DollarOutlined /> {(j.salary + "")?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} đ</div>
                                                        <div style={{ color: '#888' }}><HistoryOutlined /> {dayjs(j.updatedAt).fromNow()}</div>
                                                    </div>
                                                    {j.workingModel && (
                                                        <div style={{ marginTop: 6 }}>
                                                            <Tag color="blue" icon={<UserOutlined />}> 
                                                                {j.workingModel === 'AT_OFFICE' ? 'At office' : j.workingModel === 'REMOTE' ? 'Remote' : j.workingModel === 'HYBRID' ? 'Hybrid' : j.workingModel}
                                                            </Tag>
                                                        </div>
                                                    )}
                                                    {j.level && (
                                                        <div style={{ marginTop: 8 }}>
                                                            <Tag color="orange" style={{ fontWeight: 600 }}>{j.level}</Tag>
                                                        </div>
                                                    )}
                                                    <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                                        {j.skills?.slice(0, 5).map((s, idx) => (
                                                            <Tag key={idx} color="gold">{s}</Tag>
                                                        ))}
                                                        {j.skills && j.skills.length > 5 && (
                                                            <Tag>+{j.skills.length - 5}</Tag>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Col>
                        </>
                    }
                </Row>
            }
        </div>
    )
}
export default ClientCompanyDetailPage;
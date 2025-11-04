import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { callFetchJob, callFetchJobById } from '@/config/api';
import SearchClient from '@/components/client/search.client';
import { IJob } from '@/types/backend';
import styles from 'styles/client.module.scss';
import { Button, Col, Empty, Row, Select, Skeleton, Tag } from 'antd';
import { EnvironmentOutlined, DollarOutlined, HistoryOutlined, MonitorOutlined, UserOutlined } from '@ant-design/icons';
import { getLocationName, SKILLS_LIST, LOCATION_LIST } from '@/config/utils';
import parse from 'html-react-parser';
import dayjs from '@/config/dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime)
import ApplyModal from '@/components/client/modal/apply.modal';

const JobSearchPage = () => {
  const locationRouter = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(locationRouter.search);
  const initialSkills = params.get('skills')?.split(',').filter(Boolean) ?? [];
  const initialLocations = params.get('location')?.split(',').filter(Boolean) ?? [];
  const initialLevels = params.get('level')?.split(',').filter(Boolean) ?? [];
  const initialWorkingModels = params.get('workingModel')?.split(',').filter(Boolean) ?? [];
  const initialSalaryMin = params.get('salaryMin');
  const initialSalaryMax = params.get('salaryMax');

  const [jobs, setJobs] = useState<IJob[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState<IJob | null>(null);
  const [skills, setSkills] = useState<string[]>(initialSkills);
  const [locations, setLocations] = useState<string[]>(initialLocations);
  const [levels, setLevels] = useState<string[]>(initialLevels);
  const [workingModels, setWorkingModels] = useState<string[]>(initialWorkingModels);
  const [salaryRange, setSalaryRange] = useState<string | null>(
    initialSalaryMin && initialSalaryMax ? `${initialSalaryMin}-${initialSalaryMax}` : null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const buildFilterQueryFromUrl = (searchStr?: string) => {
    const filters: string[] = [];
    const p = new URLSearchParams(searchStr ?? locationRouter.search);
    const s = p.get('skills');
    const l = p.get('location');
    const lv = p.get('level');
    const wm = p.get('workingModel');
    const sMin = p.get('salaryMin');
    const sMax = p.get('salaryMax');
    if (s) filters.push(`skills=/${s.split(',').join('|')}/i`);
    if (l) filters.push(`location=/${l.split(',').join('|')}/i`);
    if (lv) filters.push(`level=/${lv.split(',').join('|')}/i`);
    if (wm) filters.push(`workingModel=/${wm.split(',').join('|')}/i`);
    // Dùng cú pháp operator trực tiếp để tương thích aqp tốt hơn
    if (sMin) filters.push(`salary>=${Number(sMin)}`);
    if (sMax) filters.push(`salary<=${Number(sMax)}`);
    return filters.join('&');
  }

  const fetchList = async (searchStr?: string) => {
    setIsLoading(true);
    try {
      let query = `current=1&pageSize=100&${buildFilterQueryFromUrl(searchStr)}&sort=-updatedAt`;
      const res = await callFetchJob(query);
      if (res?.data) {
        const result = res.data.result as IJob[];
        setJobs(result);
        if (result && result.length > 0) {
          // nếu selectedJob không còn trong danh sách, chọn job đầu tiên
          const stillExists = selectedJob && result.some(j => j._id === selectedJob._id);
          if (!stillExists) setSelectedJob(result[0]);
        } else {
          // không có job phù hợp thì ẩn panel chi tiết
          setSelectedJob(null);
        }
      }
    } catch (e) {
      // noop
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    // đồng bộ state hiển thị theo URL khi url thay đổi
    const p = new URLSearchParams(locationRouter.search);
    setSkills(p.get('skills')?.split(',').filter(Boolean) ?? []);
    setLocations(p.get('location')?.split(',').filter(Boolean) ?? []);
    setLevels(p.get('level')?.split(',').filter(Boolean) ?? []);
    setWorkingModels(p.get('workingModel')?.split(',').filter(Boolean) ?? []);
    const sMin = p.get('salaryMin');
    const sMax = p.get('salaryMax');
    setSalaryRange(sMin && sMax ? `${sMin}-${sMax}` : null);
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationRouter.search]);

  const handleApply = () => {
    setIsModalOpen(true);
  }

  // bỏ phần mô tả tóm tắt theo yêu cầu

  const getRandomBadge = () => {
    const badges = [
      { text: 'SUPER HOT', color: '#ff4d4f', bg: '#fff1f0' },
      { text: 'HOT', color: '#fa8c16', bg: '#fff7e6' },
      { text: 'NEW', color: '#52c41a', bg: '#f6ffed' },
    ];
    return badges[Math.floor(Math.random() * badges.length)];
  }

  return (
    <div className={styles['container']} style={{ marginTop: 20 }}>
      <Row gutter={[20, 20]}>
        <Col span={24}>
          <SearchClient initialSkills={initialSkills} initialLocations={initialLocations} />
        </Col>
        <Col span={24}>
          <Row gutter={[12, 12]} style={{ background: '#fff', border: '1px solid #eee', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: 12 }}>
            <Col span={24} md={12}>
              <Select
                mode="multiple"
                allowClear
                style={{ width: '100%' }}
                placeholder={<>Level</>}
                value={levels}
                options={[
                  { label: 'INTERN', value: 'INTERN' },
                  { label: 'FRESHER', value: 'FRESHER' },
                  { label: 'JUNIOR', value: 'JUNIOR' },
                  { label: 'MIDDLE', value: 'MIDDLE' },
                  { label: 'SENIOR', value: 'SENIOR' },
                ]}
                onChange={(v) => {
                  setLevels(v as string[]);
                  const p = new URLSearchParams(locationRouter.search);
                  if ((v as string[]).length) p.set('level', (v as string[]).join(',')); else p.delete('level');
                  navigate(`/job/search?${p.toString()}`);
                  fetchList(`?${p.toString()}`);
                }}
              />
            </Col>
            <Col span={24} md={6}>
              <Select
                mode="multiple"
                allowClear
                style={{ width: '100%' }}
                placeholder={<>Working Model</>}
                value={workingModels}
                options={[
                  { label: 'At office', value: 'AT_OFFICE' },
                  { label: 'Remote', value: 'REMOTE' },
                  { label: 'Hybrid', value: 'HYBRID' },
                ]}
                onChange={(v) => {
                  setWorkingModels(v as string[]);
                  const p = new URLSearchParams(locationRouter.search);
                  if ((v as string[]).length) p.set('workingModel', (v as string[]).join(',')); else p.delete('workingModel');
                  navigate(`/job/search?${p.toString()}`);
                  fetchList(`?${p.toString()}`);
                }}
              />
            </Col>
            <Col span={24} md={6}>
              <Select
                allowClear
                style={{ width: '100%' }}
                placeholder={<>Salary</>}
                value={salaryRange ?? undefined}
                options={[
                  { label: '0 - 10,000,000 đ', value: '0-10000000' },
                  { label: '10,000,000 - 20,000,000 đ', value: '10000000-20000000' },
                  { label: '20,000,000 - 40,000,000 đ', value: '20000000-40000000' },
                  { label: '40,000,000+ đ', value: '40000000-1000000000' },
                ]}
                onChange={(v) => {
                  setSalaryRange(v as string);
                  const p = new URLSearchParams(locationRouter.search);
                  if (v) {
                    const [min, max] = (v as string).split('-');
                    p.set('salaryMin', min);
                    p.set('salaryMax', max);
                  } else {
                    p.delete('salaryMin');
                    p.delete('salaryMax');
                  }
                  navigate(`/job/search?${p.toString()}`);
                  fetchList(`?${p.toString()}`);
                }}
              />
            </Col>
            <Col span={24} md={6} />
          </Row>
        </Col>

        <Col span={24} md={10}>
          {isLoading ? <Skeleton /> : (
            jobs.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {jobs.map(j => (
                  <div
                    key={j._id}
                    className={styles['job-list-item']}
                    onClick={() => setSelectedJob(j)}
                    style={{
                      cursor: 'pointer',
                      border: selectedJob?._id === j._id ? '1px solid #ff4d4f' : '1px solid #eee',
                      padding: 12,
                      borderRadius: 8,
                      background: selectedJob?._id === j._id ? '#fffafa' : '#fff',
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
                          src={`${import.meta.env.VITE_BACKEND_URL}/images/company/${j?.company?.logo}`}
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
            ) : <Empty description="Không có dữ liệu" />
          )}
        </Col>

        <Col span={24} md={14}>
          {isLoading ? <Skeleton /> : (
            selectedJob ? (
              <div className={styles['detail-job-section']} style={{ background: '#fff', border: '1px solid #eee', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: 16 }}>
                <div className={styles['header']}>{selectedJob.name}</div>
                <div>
                  <button onClick={handleApply} className={styles['btn-apply']}>Apply Now</button>
                </div>
                <div className={styles['skills']} style={{ marginTop: 12 }}>
                  {selectedJob?.skills?.map((s, idx) => (
                    <Tag key={idx} color="gold">{s}</Tag>
                  ))}
                </div>
                <div style={{ marginTop: 8 }}><DollarOutlined /> {(selectedJob.salary + "")?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} đ</div>
                <div style={{ marginTop: 8 }}><EnvironmentOutlined style={{ color: '#58aaab' }} /> {getLocationName(selectedJob.location)}</div>
                {selectedJob.workingModel && (
                  <div style={{ marginTop: 8 }}>
                    <UserOutlined style={{ color: '#1890ff' }} /> {selectedJob.workingModel === 'AT_OFFICE' ? 'At office' : selectedJob.workingModel === 'REMOTE' ? 'Remote' : selectedJob.workingModel === 'HYBRID' ? 'Hybrid' : selectedJob.workingModel}
                  </div>
                )}
                <div style={{ marginTop: 8 }}><HistoryOutlined /> {dayjs(selectedJob.updatedAt).fromNow()}</div>
                <div style={{ marginTop: 12, maxHeight: 420, overflowY: 'auto', paddingRight: 8 }}>{parse(selectedJob.description)}</div>
              </div>
            ) : <Empty description="Chọn một công việc để xem chi tiết" />
          )}
        </Col>
      </Row>
      <ApplyModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} jobDetail={selectedJob} />
    </div>
  )
}

export default JobSearchPage;



import { Divider, Card, Button } from 'antd';
import { FileTextOutlined, DownloadOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import styles from 'styles/client.module.scss';
import SearchClient from '@/components/client/search.client';
import JobCard from '@/components/client/card/job.card';
import CompanyCard from '@/components/client/card/company.card';

const HomePage = () => {
    return (
        <div className={`${styles["container"]} ${styles["home-section"]}`}>
            <div className="search-content" style={{ marginTop: 20 }}>
                <SearchClient />
            </div>
            <Divider />
            <Card
                style={{
                    borderRadius: 12,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    marginBottom: 40
                }}
                bodyStyle={{ padding: 30 }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{
                        width: 80,
                        height: 80,
                        background: '#f0f0f0',
                        borderRadius: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                    }}>
                        <FileTextOutlined style={{ fontSize: 40, color: '#1677ff' }} />
                        <div style={{
                            position: 'absolute',
                            bottom: -5,
                            right: -5,
                            background: '#52c41a',
                            color: '#fff',
                            borderRadius: 12,
                            padding: '2px 8px',
                            fontSize: 11,
                            fontWeight: 'bold'
                        }}>
                            MỚI
                        </div>
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ margin: 0, marginBottom: 8, fontSize: 20, fontWeight: 600 }}>
                            Mẫu CV
                        </h3>
                        <p style={{ margin: 0, color: '#666', fontSize: 14 }}>
                            Nâng cấp CV với các mẫu CV IT chuyên nghiệp - được nhà tuyển dụng đề xuất
                        </p>
                    </div>
                    <Link to="/cv/templates">
                        <Button
                            type="primary"
                            danger
                            icon={<DownloadOutlined />}
                            size="large"
                            style={{ borderRadius: 8 }}
                        >
                            Xem mẫu CV
                        </Button>
                    </Link>
                </div>
            </Card>
            <Divider />
            <CompanyCard />
            <div style={{ margin: 50 }}></div>
            <Divider />
            <JobCard />
            <div style={{ margin: 50 }}></div>
        </div>
    )
}

export default HomePage;
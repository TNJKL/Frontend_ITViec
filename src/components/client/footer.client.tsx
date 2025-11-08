import { Row, Col } from 'antd';
import { LinkedinOutlined, FacebookOutlined, YoutubeOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import './footer.client.scss';

const Footer = () => {
    return (
        <footer className="footer-container">
            <div className="footer-content">
                <Row gutter={[32, 16]}>
                    {/* Column 1: Logo & Social */}
                    <Col xs={24} sm={12} md={6} lg={6}>
                        <div className="footer-logo-section">
                            <div className="footer-logo">
                                <span className="logo-text">ITviec</span>
                            </div>
                            <p className="logo-tagline">Ít nhưng mà chất</p>
                            <div className="social-icons">
                                <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                                    <LinkedinOutlined />
                                </a>
                                <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                                    <FacebookOutlined />
                                </a>
                                <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                                    <YoutubeOutlined />
                                </a>
                            </div>
                        </div>
                    </Col>

                    {/* Column 2: Về ITviec */}
                    <Col xs={12} sm={6} md={4} lg={4}>
                        <h4 className="nav-title">Về ITviec</h4>
                        <ul className="nav-list">
                            <li><Link to="/">Trang Chủ</Link></li>
                            <li><Link to="/job">Việc Làm IT</Link></li>
                            <li><Link to="/company">Top Công ty</Link></li>
                            <li><a href="#contact">Liên Hệ</a></li>
                        </ul>
                    </Col>

                    {/* Column 3: Chương trình */}
                    <Col xs={12} sm={6} md={4} lg={4}>
                        <h4 className="nav-title">Chương trình</h4>
                        <ul className="nav-list">
                            <li><a href="#it-stories">Chuyện IT</a></li>
                            <li><a href="#featured-jobs">Việc làm nổi bật</a></li>
                            <li><a href="#annual-survey">Khảo sát</a></li>
                        </ul>
                    </Col>

                    {/* Column 4: Liên hệ */}
                    <Col xs={24} sm={24} md={10} lg={10}>
                        <h4 className="nav-title">Liên hệ</h4>
                        <div className="contact-info">
                            <div className="contact-item">
                                <PhoneOutlined className="contact-icon" />
                                <span>HCM: <strong>(+84) 977 460 519</strong></span>
                            </div>
                            <div className="contact-item">
                                <PhoneOutlined className="contact-icon" />
                                <span>HN: <strong>(+84) 983 131 351</strong></span>
                            </div>
                            <div className="contact-item">
                                <MailOutlined className="contact-icon" />
                                <span>Email: <strong>love@itviec.com</strong></span>
                            </div>
                        </div>
                    </Col>
                </Row>
                <div className="footer-bottom">
                    <p>&copy; 2024 ITviec. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}

export default Footer;

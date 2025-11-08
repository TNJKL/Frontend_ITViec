import { Card, Row, Col, Button } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CVTemplateType } from '@/types/cv';
import CVTemplateClassic from '@/components/client/cv-templates/CVTemplateClassic';
import CVTemplateVintage from '@/components/client/cv-templates/CVTemplateVintage';
import CVTemplateModern from '@/components/client/cv-templates/CVTemplateModern';
import CVTemplateMinimalist from '@/components/client/cv-templates/CVTemplateMinimalist';
import CVTemplateSidebar from '@/components/client/cv-templates/CVTemplateSidebar';
import CVTemplateRed from '@/components/client/cv-templates/CVTemplateRed';
import '@/pages/cv/cv-templates-page.scss';

const CVTemplatesPage = () => {
    const navigate = useNavigate();
    const [selectedTemplate, setSelectedTemplate] = useState<CVTemplateType | null>(null);

    const sampleData = {
        name: 'Nguyen Thanh Trung Minh',
        email: 'example@email.com',
        phone: '0123456789',
        address: 'Ho Chi Minh City',
        aboutMe: 'Experienced software developer with 5+ years in web development.',
        education: [{
            school: 'University of Technology',
            degree: 'Bachelor',
            major: 'Computer Science',
            from: '2015-09-01',
            to: '2019-06-30'
        }],
        experience: [{
            position: 'Senior Developer',
            companyName: 'Tech Company',
            from: '2020-01-01',
            to: '2024-12-31',
            description: 'Led development team and delivered multiple projects.'
        }],
        skills: {
            core: ['React', 'Node.js', 'TypeScript'],
            soft: ['Communication', 'Leadership']
        },
        languages: [{
            name: 'English',
            level: 'Advanced'
        }],
        projects: [{
            name: 'E-commerce Platform',
            from: '2023-01-01',
            to: '2023-12-31',
            description: 'Built a full-stack e-commerce solution.'
        }],
        certificates: [{
            name: 'AWS Certified',
            organization: 'Amazon',
            from: '2022-01-01',
            description: 'Cloud computing certification'
        }],
        awards: [{
            name: 'Best Developer',
            organization: 'Tech Awards',
            date: '2023-12-01',
            description: 'Recognition for outstanding work'
        }]
    };

    const templates = [
        {
            id: 'classic' as CVTemplateType,
            name: 'Classic',
            component: <CVTemplateClassic data={sampleData} color="#5B3A2B" />,
            description: 'Layout cổ điển, chuyên nghiệp với 2 cột'
        },
        {
            id: 'vintage' as CVTemplateType,
            name: 'Vintage',
            component: <CVTemplateVintage data={sampleData} color="#2c3e50" />,
            description: 'Phong cách hiện đại, nổi bật với header đẹp'
        },
        {
            id: 'modern' as CVTemplateType,
            name: 'Modern',
            component: <CVTemplateModern data={sampleData} color="#7A6542" />,
            description: 'Thiết kế tươi mới, gradient đẹp mắt'
        },
        {
            id: 'minimalist' as CVTemplateType,
            name: 'Minimalist',
            component: <CVTemplateMinimalist data={sampleData} color="#34495e" />,
            description: 'Phong cách tối giản, thanh lịch và chuyên nghiệp'
        },
        {
            id: 'sidebar' as CVTemplateType,
            name: 'Sidebar',
            component: <CVTemplateSidebar data={sampleData} color="#2C3E50" />,
            description: 'Layout 2 cột với sidebar tối bên trái, chuyên nghiệp'
        },
        {
            id: 'red' as CVTemplateType,
            name: 'Red Header',
            component: <CVTemplateRed data={sampleData} color="#E74C3C" />,
            description: 'Thiết kế với tiêu đề màu đỏ nổi bật, hiện đại'
        }
    ];

    const handleSelectTemplate = (templateId: CVTemplateType) => {
        setSelectedTemplate(templateId);
        navigate(`/cv/preview?template=${templateId}`);
    };

    return (
        <div className="cv-templates-page">
            <div className="cv-templates-header">
                <h1>Mẫu CV</h1>
                <p>Chọn mẫu CV phù hợp với bạn</p>
            </div>

            <div className="cv-templates-container">
                <Row gutter={[24, 24]}>
                    {templates.map((template) => (
                        <Col xs={24} sm={12} md={12} lg={8} xl={8} key={template.id}>
                            <Card
                                hoverable
                                className={`cv-template-card ${selectedTemplate === template.id ? 'selected' : ''}`}
                                cover={
                                    <div className="cv-template-preview">
                                        <div className="cv-template-preview-wrapper">
                                            {template.component}
                                        </div>
                                    </div>
                                }
                                actions={[
                                    <Button
                                        type="primary"
                                        icon={selectedTemplate === template.id ? <CheckOutlined /> : null}
                                        onClick={() => handleSelectTemplate(template.id)}
                                        block
                                    >
                                        {selectedTemplate === template.id ? 'Đã chọn' : 'Chọn mẫu này'}
                                    </Button>
                                ]}
                            >
                                <Card.Meta
                                    title={template.name}
                                    description={template.description}
                                />
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        </div>
    );
};

export default CVTemplatesPage;


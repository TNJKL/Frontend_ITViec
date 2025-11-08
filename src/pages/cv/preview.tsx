import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Space, Select, ColorPicker, message } from 'antd';
import { ArrowLeftOutlined, DownloadOutlined, HeartOutlined } from '@ant-design/icons';
import { useAppSelector } from '@/redux/hooks';
import { callFetchUserById } from '@/config/api';
import { IUser } from '@/types/backend';
import { ICVData, CVTemplateType } from '@/types/cv';
import CVTemplateClassic from '@/components/client/cv-templates/CVTemplateClassic';
import CVTemplateVintage from '@/components/client/cv-templates/CVTemplateVintage';
import CVTemplateModern from '@/components/client/cv-templates/CVTemplateModern';
import CVTemplateMinimalist from '@/components/client/cv-templates/CVTemplateMinimalist';
import CVTemplateSidebar from '@/components/client/cv-templates/CVTemplateSidebar';
import CVTemplateRed from '@/components/client/cv-templates/CVTemplateRed';
import '@/pages/cv/cv-preview.scss';

const CVPreviewPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const accountUser = useAppSelector(state => state.account.user);
    const [cvData, setCvData] = useState<ICVData>({});
    const [selectedTemplate, setSelectedTemplate] = useState<CVTemplateType>('classic');
    const [selectedColor, setSelectedColor] = useState<string>('#5B3A2B');
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const template = searchParams.get('template') as CVTemplateType;
        if (template && ['classic', 'vintage', 'modern', 'minimalist', 'sidebar', 'red'].includes(template)) {
            setSelectedTemplate(template);
            // Set default color based on template
            if (template === 'classic') setSelectedColor('#5B3A2B');
            if (template === 'vintage') setSelectedColor('#2c3e50');
            if (template === 'modern') setSelectedColor('#7A6542');
            if (template === 'minimalist') setSelectedColor('#34495e');
            if (template === 'sidebar') setSelectedColor('#2C3E50');
            if (template === 'red') setSelectedColor('#E74C3C');
        }
    }, [searchParams]);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!accountUser?._id) return;
            setLoading(true);
            try {
                const res = await callFetchUserById(accountUser._id);
                if (res?.data) {
                    const user = res.data as IUser;
                    const data: ICVData = {
                        name: user.name,
                        email: user.email,
                        phone: user.phone,
                        address: user.address,
                        avatar: user.avatar,
                        aboutMe: user.aboutMe,
                        education: user.education,
                        experience: user.experience,
                        skills: user.skills,
                        languages: user.languages,
                        projects: user.projects,
                        certificates: user.certificates,
                        awards: user.awards
                    };
                    setCvData(data);
                }
            } catch (error) {
                message.error('Không thể tải thông tin người dùng');
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, [accountUser?._id]);

    const renderCVTemplate = () => {
        switch (selectedTemplate) {
            case 'classic':
                return <CVTemplateClassic data={cvData} color={selectedColor} />;
            case 'vintage':
                return <CVTemplateVintage data={cvData} color={selectedColor} />;
            case 'modern':
                return <CVTemplateModern data={cvData} color={selectedColor} />;
            case 'minimalist':
                return <CVTemplateMinimalist data={cvData} color={selectedColor} />;
            case 'sidebar':
                return <CVTemplateSidebar data={cvData} color={selectedColor} />;
            case 'red':
                return <CVTemplateRed data={cvData} color={selectedColor} />;
            default:
                return <CVTemplateClassic data={cvData} color={selectedColor} />;
        }
    };

    const handleDownload = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            const cvElement = document.querySelector('.cv-template');
            if (cvElement) {
                // Get the computed color from CSS variable
                const computedStyle = window.getComputedStyle(cvElement);
                const cvColor = computedStyle.getPropertyValue('--cv-color').trim() || selectedColor;
                
                // Collect all styles from the document
                const styles: string[] = [];
                const styleSheets = Array.from(document.styleSheets);
                
                try {
                    for (let i = 0; i < styleSheets.length; i++) {
                        const sheet = styleSheets[i];
                        try {
                            if (sheet.cssRules) {
                                for (let j = 0; j < sheet.cssRules.length; j++) {
                                    const rule = sheet.cssRules[j];
                                    if (rule.cssText) {
                                        styles.push(rule.cssText);
                                    }
                                }
                            }
                        } catch (e) {
                            // Cross-origin stylesheet, skip
                            continue;
                        }
                    }
                } catch (e) {
                    console.error('Error collecting styles:', e);
                }

                // Get inline styles from style tags
                const styleTags = Array.from(document.querySelectorAll('style'));
                styleTags.forEach(tag => {
                    if (tag.innerHTML) {
                        styles.push(tag.innerHTML);
                    }
                });

                const allStyles = styles.join('\n');

                // Check if it's sidebar template and add specific handling
                const isSidebar = cvElement.classList.contains('sidebar');
                
                printWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <title>CV - ${cvData.name || 'My CV'}</title>
                        <style>
                            * {
                                margin: 0;
                                padding: 0;
                                box-sizing: border-box;
                                -webkit-print-color-adjust: exact !important;
                                print-color-adjust: exact !important;
                                color-adjust: exact !important;
                            }
                            
                            @page { 
                                size: A4; 
                                margin: 0 !important; 
                                padding: 0 !important;
                            }
                            
                            html, body {
                                margin: 0 !important;
                                padding: 0 !important;
                                width: 100% !important;
                                overflow: visible !important;
                            }
                            
                            body { 
                                margin: 0; 
                                padding: 0;
                                background: #fff;
                                font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
                                -webkit-print-color-adjust: exact !important;
                                print-color-adjust: exact !important;
                                color-adjust: exact !important;
                            }
                            
                            ${allStyles}
                            
                            /* Ensure CSS variables are set */
                            .cv-template {
                                --cv-color: ${cvColor};
                            }
                            
                            /* Force background colors to print */
                            .cv-header,
                            .cv-header-modern,
                            .cv-header-vintage,
                            .cv-header-minimalist,
                            .cv-left-sidebar {
                                -webkit-print-color-adjust: exact !important;
                                print-color-adjust: exact !important;
                                color-adjust: exact !important;
                                background-color: var(--cv-color, ${cvColor}) !important;
                            }
                            
                            /* Sidebar template styles - ensure full width */
                            .cv-template.sidebar .cv-container {
                                width: 100% !important;
                                max-width: 100% !important;
                                margin: 0 !important;
                                padding: 0 !important;
                            }
                            
                            .cv-template.sidebar .cv-body-sidebar {
                                display: flex !important;
                                width: 100% !important;
                                margin: 0 !important;
                                padding: 0 !important;
                            }
                            
                            .cv-template.sidebar .cv-left-sidebar {
                                width: 35% !important;
                                min-width: 35% !important;
                                max-width: 35% !important;
                                flex-shrink: 0 !important;
                                background: var(--cv-color, ${cvColor}) !important;
                                -webkit-print-color-adjust: exact !important;
                                print-color-adjust: exact !important;
                                color-adjust: exact !important;
                                box-sizing: border-box !important;
                                margin: 0 !important;
                            }
                            
                            .cv-template.sidebar .cv-right-sidebar {
                                width: 65% !important;
                                flex: 1 1 65% !important;
                                box-sizing: border-box !important;
                                margin: 0 !important;
                            }
                            
                            @media print {
                                * {
                                    -webkit-print-color-adjust: exact !important;
                                    print-color-adjust: exact !important;
                                    color-adjust: exact !important;
                                }
                                
                                .cv-template .cv-container {
                                    box-shadow: none !important;
                                    margin: 0 !important;
                                    padding: 0 !important;
                                    width: 100% !important;
                                    max-width: 100% !important;
                                    page-break-inside: avoid;
                                }
                                
                                .cv-header,
                                .cv-header-modern,
                                .cv-header-vintage,
                                .cv-header-minimalist,
                                .cv-left-sidebar {
                                    -webkit-print-color-adjust: exact !important;
                                    print-color-adjust: exact !important;
                                    color-adjust: exact !important;
                                    background-color: var(--cv-color, ${cvColor}) !important;
                                }
                                
                                .cv-section-title-red {
                                    color: var(--cv-color, ${cvColor}) !important;
                                }
                                
                                /* Sidebar template specific print styles - use table layout for better print compatibility */
                                .cv-template.sidebar .cv-container {
                                    width: 100% !important;
                                    max-width: 100% !important;
                                    min-height: 100vh !important;
                                    margin: 0 !important;
                                    padding: 0 !important;
                                    overflow: visible !important;
                                }
                                
                                .cv-template.sidebar .cv-body-sidebar {
                                    display: table !important;
                                    table-layout: fixed !important;
                                    width: 100% !important;
                                    min-height: 100vh !important;
                                    margin: 0 !important;
                                    padding: 0 !important;
                                    border-collapse: collapse !important;
                                }
                                
                                .cv-template.sidebar .cv-left-sidebar {
                                    display: table-cell !important;
                                    width: 35% !important;
                                    min-width: 35% !important;
                                    max-width: 35% !important;
                                    background: var(--cv-color, ${cvColor}) !important;
                                    -webkit-print-color-adjust: exact !important;
                                    print-color-adjust: exact !important;
                                    color-adjust: exact !important;
                                    padding: 40px 30px !important;
                                    box-sizing: border-box !important;
                                    margin: 0 !important;
                                    overflow: visible !important;
                                    vertical-align: top !important;
                                }
                                
                                .cv-template.sidebar .cv-right-sidebar {
                                    display: table-cell !important;
                                    width: 65% !important;
                                    min-width: 65% !important;
                                    padding: 40px 30px !important;
                                    box-sizing: border-box !important;
                                    margin: 0 !important;
                                    overflow: visible !important;
                                    vertical-align: top !important;
                                }
                                
                                body {
                                    background: #fff !important;
                                }
                            }
                        </style>
                    </head>
                    <body>
                        ${cvElement.outerHTML}
                    </body>
                    </html>
                `);
                printWindow.document.close();
                
                // Wait for styles to load, especially for sidebar template
                if (isSidebar) {
                    setTimeout(() => {
                        printWindow.focus();
                        // Force reflow to ensure sidebar is rendered
                        const sidebar = printWindow.document.querySelector('.cv-left-sidebar') as HTMLElement;
                        if (sidebar) {
                            sidebar.style.display = 'block';
                            // Force layout recalculation
                            void sidebar.offsetHeight;
                        }
                        setTimeout(() => {
                            printWindow.print();
                        }, 300);
                    }, 800);
                } else {
                    printWindow.focus();
                    setTimeout(() => {
                        printWindow.print();
                    }, 500);
                }
            }
        }
    };

    return (
        <div className="cv-preview-page">
            <div className="cv-preview-header">
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/cv/templates')}
                >
                    Trở lại cập nhật hồ sơ
                </Button>
                <h2>it viec Mẫu CV</h2>
                <div></div>
            </div>

            <div className="cv-preview-content">
                <div className="cv-preview-left">
                    <div className="cv-template-selector">
                        <h3>Chọn mẫu CV</h3>
                        <Select
                            value={selectedTemplate}
                            onChange={(value) => {
                                setSelectedTemplate(value);
                                if (value === 'classic') setSelectedColor('#5B3A2B');
                                if (value === 'vintage') setSelectedColor('#2c3e50');
                                if (value === 'modern') setSelectedColor('#7A6542');
                                if (value === 'minimalist') setSelectedColor('#34495e');
                                if (value === 'sidebar') setSelectedColor('#2C3E50');
                                if (value === 'red') setSelectedColor('#E74C3C');
                            }}
                            style={{ width: '100%', marginBottom: 20 }}
                            options={[
                                { label: 'Classic', value: 'classic' },
                                { label: 'Vintage', value: 'vintage' },
                                { label: 'Modern', value: 'modern' },
                                { label: 'Minimalist', value: 'minimalist' },
                                { label: 'Sidebar', value: 'sidebar' },
                                { label: 'Red Header', value: 'red' }
                            ]}
                        />
                    </div>

                    <div className="cv-color-selector">
                        <h3>Màu sắc:</h3>
                        <Space>
                            <div
                                className="color-swatch"
                                style={{ backgroundColor: '#5B3A2B' }}
                                onClick={() => setSelectedColor('#5B3A2B')}
                            />
                            <div
                                className="color-swatch"
                                style={{ backgroundColor: '#2c3e50' }}
                                onClick={() => setSelectedColor('#2c3e50')}
                            />
                            <div
                                className="color-swatch"
                                style={{ backgroundColor: '#7A6542' }}
                                onClick={() => setSelectedColor('#7A6542')}
                            />
                            <ColorPicker
                                value={selectedColor}
                                onChange={(color) => setSelectedColor(color.toHexString())}
                                showText
                            />
                        </Space>
                    </div>

                    <div className="cv-language-selector">
                        <h3>Ngôn ngữ:</h3>
                        <Space>
                            <Button>EN</Button>
                            <Button type="primary">VI</Button>
                        </Space>
                    </div>
                </div>

                <div className="cv-preview-right">
                    <div className="cv-preview-wrapper">
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: 100 }}>Đang tải...</div>
                        ) : (
                            renderCVTemplate()
                        )}
                    </div>
                </div>
            </div>

            <div className="cv-preview-footer">
                <Space>
                    <span>Màu sắc:</span>
                    <div
                        className="color-swatch-small"
                        style={{ backgroundColor: '#fff' }}
                        onClick={() => setSelectedColor('#ffffff')}
                    />
                    <div
                        className="color-swatch-small"
                        style={{ backgroundColor: '#5B3A2B' }}
                        onClick={() => setSelectedColor('#5B3A2B')}
                    />
                </Space>
                <Space>
                    <span>Ngôn ngữ:</span>
                    <Button size="small">EN</Button>
                    <Button type="primary" size="small">VI</Button>
                </Space>
                <Button
                    type="primary"
                    danger
                    icon={<DownloadOutlined />}
                    onClick={handleDownload}
                    size="large"
                >
                    Tải CV
                </Button>
                <Button
                    type="text"
                    danger
                    icon={<HeartOutlined />}
                    size="small"
                >
                    Góp ý
                </Button>
            </div>
        </div>
    );
};

export default CVPreviewPage;


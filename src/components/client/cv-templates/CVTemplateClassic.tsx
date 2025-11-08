import { ICVData } from '@/types/cv';
import dayjs from 'dayjs';
import '@/components/client/cv-templates/cv-templates.scss';

interface IProps {
    data: ICVData;
    color?: string;
}

const CVTemplateClassic = ({ data, color = '#5B3A2B' }: IProps) => {
    const dateDisplay = (from?: string | Date, to?: string | Date, currently?: boolean) => {
        if (!from && !to) return '';
        const start = from ? dayjs(from).format('MM/YYYY') : '';
        const end = currently ? 'HIỆN TẠI' : to ? dayjs(to).format('MM/YYYY') : '';
        if (start && end) return `${start} - ${end}`;
        return start || end;
    };

    return (
        <div className="cv-template classic" style={{ '--cv-color': color } as any}>
            <div className="cv-container">
                <div className="cv-header" style={{ backgroundColor: color }}>
                    <div className="cv-header-content">
                        <div className="cv-name">{data.name || 'Your Name'}</div>
                        <div className="cv-title">NHÀ PHÁT TRIỂN PHẦN MỀM</div>
                        <div className="cv-contact">
                            {data.phone && <span>📞 {data.phone}</span>}
                            {data.email && <span>✉️ {data.email}</span>}
                            {data.address && <span>📍 {data.address}</span>}
                        </div>
                    </div>
                </div>

                <div className="cv-body">
                    <div className="cv-left-column">
                        {data.avatar && (
                            <div className="cv-section" style={{ textAlign: 'center', marginBottom: 20 }}>
                                <img 
                                    src={data.avatar} 
                                    alt={data.name} 
                                    style={{ 
                                        width: 150, 
                                        height: 150, 
                                        borderRadius: '50%', 
                                        objectFit: 'cover',
                                        border: '4px solid #fff',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                    }} 
                                />
                            </div>
                        )}
                        <div className="cv-section">
                            <h3 className="cv-section-title">Kỹ năng</h3>
                            {data.skills?.core && data.skills.core.length > 0 && (
                                <>
                                    <div style={{ marginBottom: 12, fontWeight: 600, fontSize: 13 }}>Kỹ năng chuyên môn:</div>
                                    <div className="cv-skills">
                                        {data.skills.core.map((skill, idx) => (
                                            <div key={idx} className="cv-skill-tag">{skill}</div>
                                        ))}
                                    </div>
                                </>
                            )}
                            {data.skills?.soft && data.skills.soft.length > 0 && (
                                <>
                                    <div style={{ marginTop: 16, marginBottom: 12, fontWeight: 600, fontSize: 13 }}>Kỹ năng mềm:</div>
                                    <div className="cv-skills">
                                        {data.skills.soft.map((skill, idx) => (
                                            <div key={idx} className="cv-skill-tag">{skill}</div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                        {data.languages && data.languages.length > 0 && (
                            <div className="cv-section">
                                <h3 className="cv-section-title">Ngoại ngữ</h3>
                                {data.languages.map((lang, idx) => (
                                    <div key={idx} className="cv-item">
                                        <span className="cv-item-title">{lang.name}: {lang.level}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="cv-right-column">
                        {data.aboutMe && (
                            <div className="cv-section">
                                <h3 className="cv-section-title">Giới thiệu</h3>
                                <p className="cv-text">{data.aboutMe}</p>
                            </div>
                        )}

                        {data.experience && data.experience.length > 0 && (
                            <div className="cv-section">
                                <h3 className="cv-section-title">Kinh nghiệm làm việc</h3>
                                {data.experience.map((exp, idx) => (
                                    <div key={idx} className="cv-item">
                                        <div className="cv-item-header">
                                            <span className="cv-item-title">{exp.position}</span>
                                            <span className="cv-item-date">{dateDisplay(exp.from, exp.to)}</span>
                                        </div>
                                        <div className="cv-item-company">{exp.companyName}</div>
                                        {exp.description && <p className="cv-text">{exp.description}</p>}
                                        {exp.projects && <p className="cv-text"><strong>Dự án:</strong> {exp.projects}</p>}
                                    </div>
                                ))}
                            </div>
                        )}

                        {data.education && data.education.length > 0 && (
                            <div className="cv-section">
                                <h3 className="cv-section-title">Học vấn</h3>
                                {data.education.map((edu, idx) => (
                                    <div key={idx} className="cv-item">
                                        <div className="cv-item-header">
                                            <span className="cv-item-title">{edu.school}</span>
                                            <span className="cv-item-date">{dateDisplay(edu.from, edu.to, edu.currentlyStudying)}</span>
                                        </div>
                                        <div className="cv-item-company">{[edu.degree, edu.major].filter(Boolean).join(' - ')}</div>
                                        {edu.details && <p className="cv-text">{edu.details}</p>}
                                    </div>
                                ))}
                            </div>
                        )}

                        {data.projects && data.projects.length > 0 && (
                            <div className="cv-section">
                                <h3 className="cv-section-title">Dự án nổi bật</h3>
                                {data.projects.map((proj, idx) => (
                                    <div key={idx} className="cv-item">
                                        <div className="cv-item-header">
                                            <span className="cv-item-title">{proj.name}</span>
                                            <span className="cv-item-date">{dateDisplay(proj.from, proj.to)}</span>
                                        </div>
                                        {proj.description && <p className="cv-text">{proj.description}</p>}
                                        {proj.website && <p className="cv-text"><a href={proj.website} target="_blank" rel="noreferrer" style={{ color: 'var(--cv-color, #5B3A2B)' }}>{proj.website}</a></p>}
                                    </div>
                                ))}
                            </div>
                        )}

                        {data.certificates && data.certificates.length > 0 && (
                            <div className="cv-section">
                                <h3 className="cv-section-title">Chứng chỉ</h3>
                                {data.certificates.map((cert, idx) => (
                                    <div key={idx} className="cv-item">
                                        <div className="cv-item-title">{cert.name}</div>
                                        <div className="cv-item-company">{cert.organization}</div>
                                        {cert.description && <p className="cv-text">{cert.description}</p>}
                                        {cert.link && <p className="cv-text"><a href={cert.link} target="_blank" rel="noreferrer" style={{ color: 'var(--cv-color, #5B3A2B)' }}>Xem chứng chỉ</a></p>}
                                    </div>
                                ))}
                            </div>
                        )}

                        {data.awards && data.awards.length > 0 && (
                            <div className="cv-section">
                                <h3 className="cv-section-title">Giải thưởng</h3>
                                {data.awards.map((award, idx) => (
                                    <div key={idx} className="cv-item">
                                        <div className="cv-item-title">{award.name}</div>
                                        <div className="cv-item-company">{award.organization}</div>
                                        {award.date && <div className="cv-text" style={{ fontSize: 13, color: '#666' }}>{dayjs(award.date).format('MM/YYYY')}</div>}
                                        {award.description && <p className="cv-text">{award.description}</p>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CVTemplateClassic;


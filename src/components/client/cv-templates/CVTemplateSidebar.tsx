import { ICVData } from '@/types/cv';
import dayjs from 'dayjs';
import '@/components/client/cv-templates/cv-templates.scss';

interface IProps {
    data: ICVData;
    color?: string;
}

const CVTemplateSidebar = ({ data, color = '#2C3E50' }: IProps) => {
    const dateDisplay = (from?: string | Date, to?: string | Date, currently?: boolean) => {
        if (!from && !to) return '';
        const start = from ? dayjs(from).format('MM/YYYY') : '';
        const end = currently ? 'HIỆN TẠI' : to ? dayjs(to).format('MM/YYYY') : '';
        if (start && end) return `${start} - ${end}`;
        return start || end;
    };

    return (
        <div className="cv-template sidebar" style={{ '--cv-color': color } as any}>
            <div className="cv-container">
                <div className="cv-body-sidebar">
                    <div className="cv-left-sidebar">
                        {data.avatar && (
                            <div className="cv-avatar-sidebar">
                                <img 
                                    src={data.avatar} 
                                    alt={data.name} 
                                    style={{ 
                                        width: '100%', 
                                        height: '100%', 
                                        borderRadius: '50%', 
                                        objectFit: 'cover'
                                    }} 
                                />
                            </div>
                        )}
                        <div className="cv-name-sidebar">{data.name || 'Your Name'}</div>
                        <div className="cv-title-sidebar">NHÀ PHÁT TRIỂN PHẦN MỀM</div>
                        {data.aboutMe && (
                            <div style={{ fontSize: 13, textAlign: 'center', marginTop: 8, opacity: 0.9 }}>
                                {data.aboutMe}
                            </div>
                        )}
                        
                        <div className="cv-contact-sidebar">
                            {data.phone && (
                                <div className="cv-contact-item-sidebar">
                                    <span className="cv-contact-icon-sidebar">📞</span>
                                    <span>{data.phone}</span>
                                </div>
                            )}
                            {data.email && (
                                <div className="cv-contact-item-sidebar">
                                    <span className="cv-contact-icon-sidebar">✉️</span>
                                    <span>{data.email}</span>
                                </div>
                            )}
                            {data.address && (
                                <div className="cv-contact-item-sidebar">
                                    <span className="cv-contact-icon-sidebar">📍</span>
                                    <span>{data.address}</span>
                                </div>
                            )}
                        </div>

                        {data.skills && ((data.skills.core && data.skills.core.length > 0) || (data.skills.soft && data.skills.soft.length > 0)) && (
                            <div className="cv-section-sidebar">
                                <h3 className="cv-section-title-sidebar">KỸ NĂNG</h3>
                                {data.skills.core && data.skills.core.length > 0 && (
                                    <div className="cv-skills-sidebar">
                                        {data.skills.core.map((skill, idx) => (
                                            <div key={idx} className="cv-skill-tag-sidebar">{skill}</div>
                                        ))}
                                    </div>
                                )}
                                {data.skills.soft && data.skills.soft.length > 0 && (
                                    <>
                                        <div style={{ marginTop: 12, marginBottom: 8, fontSize: 13, fontWeight: 500 }}>Kỹ năng mềm:</div>
                                        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13 }}>
                                            {data.skills.soft.map((skill, idx) => (
                                                <li key={idx}>{skill}</li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                            </div>
                        )}

                        {data.education && data.education.length > 0 && (
                            <div className="cv-section-sidebar">
                                <h3 className="cv-section-title-sidebar">HỌC VẤN</h3>
                                {data.education.map((edu, idx) => (
                                    <div key={idx} className="cv-item-sidebar">
                                        <div className="cv-item-title-sidebar">{edu.school}</div>
                                        <div className="cv-item-company-sidebar">{[edu.degree, edu.major].filter(Boolean).join(' - ')}</div>
                                        <div className="cv-item-date-sidebar">{dateDisplay(edu.from, edu.to, edu.currentlyStudying)}</div>
                                        {edu.details && <div className="cv-text-sidebar">{edu.details}</div>}
                                    </div>
                                ))}
                            </div>
                        )}

                        {data.certificates && data.certificates.length > 0 && (
                            <div className="cv-section-sidebar">
                                <h3 className="cv-section-title-sidebar">CHỨNG CHỈ</h3>
                                {data.certificates.map((cert, idx) => (
                                    <div key={idx} className="cv-item-sidebar">
                                        <div className="cv-item-title-sidebar">{cert.name}</div>
                                        {cert.description && <div className="cv-text-sidebar">{cert.description}</div>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="cv-right-sidebar">
                        {data.experience && data.experience.length > 0 && (
                            <div className="cv-section-right-sidebar">
                                <h3 className="cv-section-title-right-sidebar">KINH NGHIỆM LÀM VIỆC</h3>
                                {data.experience.map((exp, idx) => (
                                    <div key={idx} className="cv-item-right-sidebar">
                                        <div className="cv-item-header-right-sidebar">
                                            <div>
                                                <div className="cv-item-title-right-sidebar">{exp.position}</div>
                                                <div className="cv-item-company-right-sidebar">{exp.companyName}</div>
                                            </div>
                                            <span className="cv-item-date-right-sidebar">{dateDisplay(exp.from, exp.to)}</span>
                                        </div>
                                        {exp.description && <p className="cv-text-right-sidebar">{exp.description}</p>}
                                    </div>
                                ))}
                            </div>
                        )}

                        {data.projects && data.projects.length > 0 && (
                            <div className="cv-section-right-sidebar">
                                <h3 className="cv-section-title-right-sidebar">DỰ ÁN NỔI BẬT</h3>
                                {data.projects.map((proj, idx) => (
                                    <div key={idx} className="cv-item-right-sidebar">
                                        <div className="cv-item-header-right-sidebar">
                                            <div>
                                                <div className="cv-item-title-right-sidebar">{proj.name}</div>
                                                {proj.description && <p className="cv-text-right-sidebar">{proj.description}</p>}
                                            </div>
                                            <span className="cv-item-date-right-sidebar">{dateDisplay(proj.from, proj.to)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {data.awards && data.awards.length > 0 && (
                            <div className="cv-section-right-sidebar">
                                <h3 className="cv-section-title-right-sidebar">GIẢI THƯỞNG</h3>
                                {data.awards.map((award, idx) => (
                                    <div key={idx} className="cv-item-right-sidebar">
                                        <div className="cv-item-header-right-sidebar">
                                            <div>
                                                <div className="cv-item-title-right-sidebar">{award.name}</div>
                                                {award.organization && <div className="cv-item-company-right-sidebar">{award.organization}</div>}
                                                {award.description && <p className="cv-text-right-sidebar">{award.description}</p>}
                                            </div>
                                            {award.date && <span className="cv-item-date-right-sidebar">{dayjs(award.date).format('YYYY')}</span>}
                                        </div>
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

export default CVTemplateSidebar;


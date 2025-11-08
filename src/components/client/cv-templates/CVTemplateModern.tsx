import { ICVData } from '@/types/cv';
import dayjs from 'dayjs';
import '@/components/client/cv-templates/cv-templates.scss';

interface IProps {
    data: ICVData;
    color?: string;
}

const CVTemplateModern = ({ data, color = '#7A6542' }: IProps) => {
    const dateDisplay = (from?: string | Date, to?: string | Date, currently?: boolean) => {
        if (!from && !to) return '';
        const start = from ? dayjs(from).format('MM/YYYY') : '';
        const end = currently ? 'HIỆN TẠI' : to ? dayjs(to).format('MM/YYYY') : '';
        if (start && end) return `${start} - ${end}`;
        return start || end;
    };

    return (
        <div className="cv-template modern" style={{ '--cv-color': color } as any}>
            <div className="cv-container">
                <div className="cv-header-modern">
                    <div className="cv-header-modern-content">
                        <div className="cv-avatar-modern">
                            {data.avatar ? (
                                <img src={data.avatar} alt={data.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                                <div className="cv-avatar-initial-modern">{(data.name || 'U')[0].toUpperCase()}</div>
                            )}
                        </div>
                        <div className="cv-info-modern">
                            <div className="cv-name-modern">{data.name || 'Your Name'}</div>
                            <div className="cv-title-modern">NHÀ PHÁT TRIỂN PHẦN MỀM</div>
                            <div className="cv-contact-modern">
                                {data.phone && <span>📞 {data.phone}</span>}
                                {data.email && <span>✉️ {data.email}</span>}
                                {data.address && <span>📍 {data.address}</span>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="cv-body-modern">
                    {data.aboutMe && (
                        <div className="cv-section-modern">
                            <h3 className="cv-section-title-modern">Giới thiệu</h3>
                            <p className="cv-text-modern">{data.aboutMe}</p>
                        </div>
                    )}

                    {data.experience && data.experience.length > 0 && (
                        <div className="cv-section-modern">
                            <h3 className="cv-section-title-modern">Kinh nghiệm làm việc</h3>
                            {data.experience.map((exp, idx) => (
                                <div key={idx} className="cv-item-modern">
                                    <div className="cv-item-header-modern">
                                        <div>
                                            <div className="cv-item-title-modern">{exp.position}</div>
                                            <div className="cv-item-company-modern">{exp.companyName}</div>
                                        </div>
                                        <span className="cv-item-date-modern">{dateDisplay(exp.from, exp.to)}</span>
                                    </div>
                                    {exp.description && <p className="cv-text-modern">{exp.description}</p>}
                                    {exp.projects && <p className="cv-text-modern"><strong>Dự án:</strong> {exp.projects}</p>}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="cv-section-modern">
                        <h3 className="cv-section-title-modern">Kỹ năng</h3>
                        {data.skills?.core && data.skills.core.length > 0 && (
                            <div style={{ marginBottom: 12 }}>
                                <strong>Kỹ năng chuyên môn:</strong>
                                <div className="cv-skills-modern">
                                    {data.skills.core.map((skill, idx) => (
                                        <span key={idx} className="cv-skill-tag-modern">{skill}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {data.skills?.soft && data.skills.soft.length > 0 && (
                            <div>
                                <strong>Kỹ năng mềm:</strong>
                                <div className="cv-skills-modern">
                                    {data.skills.soft.map((skill, idx) => (
                                        <span key={idx} className="cv-skill-tag-modern">{skill}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {data.education && data.education.length > 0 && (
                        <div className="cv-section-modern">
                            <h3 className="cv-section-title-modern">Học vấn</h3>
                            {data.education.map((edu, idx) => (
                                <div key={idx} className="cv-item-modern">
                                    <div className="cv-item-header-modern">
                                        <div>
                                            <div className="cv-item-title-modern">{edu.school}</div>
                                            <div className="cv-item-company-modern">{[edu.degree, edu.major].filter(Boolean).join(' - ')}</div>
                                        </div>
                                        <span className="cv-item-date-modern">{dateDisplay(edu.from, edu.to, edu.currentlyStudying)}</span>
                                    </div>
                                    {edu.details && <p className="cv-text-modern">{edu.details}</p>}
                                </div>
                            ))}
                        </div>
                    )}

                    {data.projects && data.projects.length > 0 && (
                        <div className="cv-section-modern">
                            <h3 className="cv-section-title-modern">Dự án nổi bật</h3>
                            {data.projects.map((proj, idx) => (
                                <div key={idx} className="cv-item-modern">
                                    <div className="cv-item-header-modern">
                                        <div>
                                            <div className="cv-item-title-modern">{proj.name}</div>
                                            {proj.website && <a href={proj.website} target="_blank" rel="noreferrer" className="cv-link-modern">{proj.website}</a>}
                                        </div>
                                        <span className="cv-item-date-modern">{dateDisplay(proj.from, proj.to)}</span>
                                    </div>
                                    {proj.description && <p className="cv-text-modern">{proj.description}</p>}
                                </div>
                            ))}
                        </div>
                    )}

                    {data.certificates && data.certificates.length > 0 && (
                        <div className="cv-section-modern">
                            <h3 className="cv-section-title-modern">Chứng chỉ</h3>
                            {data.certificates.map((cert, idx) => (
                                <div key={idx} className="cv-item-modern">
                                    <div className="cv-item-title-modern">{cert.name}</div>
                                    <div className="cv-item-company-modern">{cert.organization}</div>
                                    {cert.description && <p className="cv-text-modern">{cert.description}</p>}
                                </div>
                            ))}
                        </div>
                    )}

                    {data.languages && data.languages.length > 0 && (
                        <div className="cv-section-modern">
                            <h3 className="cv-section-title-modern">Ngoại ngữ</h3>
                            {data.languages.map((lang, idx) => (
                                <div key={idx} className="cv-item-modern">
                                    <span className="cv-item-title-modern">{lang.name}: {lang.level}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {data.awards && data.awards.length > 0 && (
                        <div className="cv-section-modern">
                            <h3 className="cv-section-title-modern">Giải thưởng</h3>
                            {data.awards.map((award, idx) => (
                                <div key={idx} className="cv-item-modern">
                                    <div className="cv-item-title-modern">{award.name}</div>
                                    <div className="cv-item-company-modern">{award.organization}</div>
                                    {award.date && <div className="cv-text-modern">{dayjs(award.date).format('MM/YYYY')}</div>}
                                    {award.description && <p className="cv-text-modern">{award.description}</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CVTemplateModern;


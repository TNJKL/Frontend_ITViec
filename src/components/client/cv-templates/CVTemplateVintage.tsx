import { ICVData } from '@/types/cv';
import dayjs from 'dayjs';
import '@/components/client/cv-templates/cv-templates.scss';

interface IProps {
    data: ICVData;
    color?: string;
}

const CVTemplateVintage = ({ data, color = '#2c3e50' }: IProps) => {
    const dateDisplay = (from?: string | Date, to?: string | Date, currently?: boolean) => {
        if (!from && !to) return '';
        const start = from ? dayjs(from).format('MM/YYYY') : '';
        const end = currently ? 'HIỆN TẠI' : to ? dayjs(to).format('MM/YYYY') : '';
        if (start && end) return `${start} - ${end}`;
        return start || end;
    };

    return (
        <div className="cv-template vintage" style={{ '--cv-color': color } as any}>
            <div className="cv-container">
                <div className="cv-header-vintage">
                    <div className="cv-profile-section">
                        <div className="cv-avatar-placeholder">
                            {data.avatar ? (
                                <img src={data.avatar} alt={data.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                                <div className="cv-avatar-initial">{(data.name || 'U')[0].toUpperCase()}</div>
                            )}
                        </div>
                        <div className="cv-name-vintage">{data.name || 'Your Name'}</div>
                        <div className="cv-title-vintage">NHÀ PHÁT TRIỂN PHẦN MỀM CẤP CAO</div>
                        <div className="cv-contact-vintage">
                            {data.phone && <span>📞 {data.phone}</span>}
                            {data.email && <span>✉️ {data.email}</span>}
                            {data.address && <span>📍 {data.address}</span>}
                        </div>
                    </div>
                </div>

                <div className="cv-body-vintage">
                    {data.aboutMe && (
                        <div className="cv-section-vintage">
                            <h3 className="cv-section-title-vintage">Giới thiệu</h3>
                            <p className="cv-text-vintage">{data.aboutMe}</p>
                        </div>
                    )}

                    {data.experience && data.experience.length > 0 && (
                        <div className="cv-section-vintage">
                            <h3 className="cv-section-title-vintage">Kinh nghiệm làm việc</h3>
                            {data.experience.map((exp, idx) => (
                                <div key={idx} className="cv-item-vintage">
                                    <div className="cv-item-header-vintage">
                                        <span className="cv-item-title-vintage">{exp.position} | {exp.companyName}</span>
                                        <span className="cv-item-date-vintage">{dateDisplay(exp.from, exp.to)}</span>
                                    </div>
                                    {exp.description && <p className="cv-text-vintage">{exp.description}</p>}
                                    {exp.projects && <p className="cv-text-vintage"><strong>Dự án:</strong> {exp.projects}</p>}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="cv-section-vintage">
                        <h3 className="cv-section-title-vintage">Kỹ năng</h3>
                        <div className="cv-skills-vintage">
                            {data.skills?.core?.map((skill, idx) => (
                                <span key={idx} className="cv-skill-tag-vintage">{skill}</span>
                            ))}
                        </div>
                        {data.skills?.soft && data.skills.soft.length > 0 && (
                            <div style={{ marginTop: 12 }}>
                                <strong>Kỹ năng mềm:</strong>
                                <div className="cv-skills-vintage" style={{ marginTop: 8 }}>
                                    {data.skills.soft.map((skill, idx) => (
                                        <span key={idx} className="cv-skill-tag-vintage">{skill}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {data.education && data.education.length > 0 && (
                        <div className="cv-section-vintage">
                            <h3 className="cv-section-title-vintage">Học vấn</h3>
                            {data.education.map((edu, idx) => (
                                <div key={idx} className="cv-item-vintage">
                                    <div className="cv-item-header-vintage">
                                        <span className="cv-item-title-vintage">{edu.school}</span>
                                        <span className="cv-item-date-vintage">{dateDisplay(edu.from, edu.to, edu.currentlyStudying)}</span>
                                    </div>
                                    <div className="cv-text-vintage">{[edu.degree, edu.major].filter(Boolean).join(' - ')}</div>
                                    {edu.details && <p className="cv-text-vintage">{edu.details}</p>}
                                </div>
                            ))}
                        </div>
                    )}

                    {data.certificates && data.certificates.length > 0 && (
                        <div className="cv-section-vintage">
                            <h3 className="cv-section-title-vintage">Chứng chỉ</h3>
                            {data.certificates.map((cert, idx) => (
                                <div key={idx} className="cv-item-vintage">
                                    <div className="cv-item-header-vintage">
                                        <div className="cv-item-title-vintage">{cert.name}</div>
                                        {(cert.from || cert.to) && (
                                            <span className="cv-item-date-vintage">
                                                {dateDisplay(cert.from, cert.to)}
                                            </span>
                                        )}
                                    </div>
                                    {cert.organization && <div className="cv-text-vintage"><strong>Tổ chức:</strong> {cert.organization}</div>}
                                    {cert.description && <p className="cv-text-vintage">{cert.description}</p>}
                                    {cert.link && (
                                        <p className="cv-text-vintage">
                                            <a href={cert.link} target="_blank" rel="noreferrer" className="cv-link" style={{ color: 'var(--cv-color, #2c3e50)' }}>
                                                Xem chứng chỉ
                                            </a>
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {data.languages && data.languages.length > 0 && (
                        <div className="cv-section-vintage">
                            <h3 className="cv-section-title-vintage">Ngoại ngữ</h3>
                            {data.languages.map((lang, idx) => (
                                <div key={idx} className="cv-item-vintage">
                                    <span className="cv-item-title-vintage">{lang.name}: {lang.level}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {data.projects && data.projects.length > 0 && (
                        <div className="cv-section-vintage">
                            <h3 className="cv-section-title-vintage">Dự án nổi bật</h3>
                            {data.projects.map((proj, idx) => (
                                <div key={idx} className="cv-item-vintage">
                                    <div className="cv-item-header-vintage">
                                        <span className="cv-item-title-vintage">{proj.name}</span>
                                        <span className="cv-item-date-vintage">{dateDisplay(proj.from, proj.to)}</span>
                                    </div>
                                    {proj.description && <p className="cv-text-vintage">{proj.description}</p>}
                                    {proj.website && <a href={proj.website} target="_blank" rel="noreferrer" className="cv-link">{proj.website}</a>}
                                </div>
                            ))}
                        </div>
                    )}

                    {data.awards && data.awards.length > 0 && (
                        <div className="cv-section-vintage">
                            <h3 className="cv-section-title-vintage">Giải thưởng</h3>
                            {data.awards.map((award, idx) => (
                                <div key={idx} className="cv-item-vintage">
                                    <div className="cv-item-title-vintage">{award.name}</div>
                                    <div className="cv-text-vintage">{award.organization}</div>
                                    {award.date && <div className="cv-text-vintage">{dayjs(award.date).format('MM/YYYY')}</div>}
                                    {award.description && <p className="cv-text-vintage">{award.description}</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CVTemplateVintage;


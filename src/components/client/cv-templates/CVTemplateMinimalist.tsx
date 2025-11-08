import { ICVData } from '@/types/cv';
import dayjs from 'dayjs';
import '@/components/client/cv-templates/cv-templates.scss';

interface IProps {
    data: ICVData;
    color?: string;
}

const CVTemplateMinimalist = ({ data, color = '#34495e' }: IProps) => {
    const dateDisplay = (from?: string | Date, to?: string | Date, currently?: boolean) => {
        if (!from && !to) return '';
        const start = from ? dayjs(from).format('MM/YYYY') : '';
        const end = currently ? 'HIỆN TẠI' : to ? dayjs(to).format('MM/YYYY') : '';
        if (start && end) return `${start} - ${end}`;
        return start || end;
    };

    return (
        <div className="cv-template minimalist" style={{ '--cv-color': color } as any}>
            <div className="cv-container">
                <div className="cv-header-minimalist">
                    <div className="cv-header-minimalist-content">
                        {data.avatar && (
                            <div className="cv-avatar-minimalist">
                                <img src={data.avatar} alt={data.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            </div>
                        )}
                        <div className="cv-info-minimalist">
                            <div className="cv-name-minimalist">{data.name || 'Your Name'}</div>
                            <div className="cv-title-minimalist">NHÀ PHÁT TRIỂN PHẦN MỀM</div>
                            <div className="cv-contact-minimalist">
                                {data.phone && <span>📞 {data.phone}</span>}
                                {data.email && <span>✉️ {data.email}</span>}
                                {data.address && <span>📍 {data.address}</span>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="cv-body-minimalist">
                    {data.aboutMe && (
                        <div className="cv-section-minimalist">
                            <h3 className="cv-section-title-minimalist">Giới thiệu</h3>
                            <p className="cv-text-minimalist">{data.aboutMe}</p>
                        </div>
                    )}

                    {data.experience && data.experience.length > 0 && (
                        <div className="cv-section-minimalist">
                            <h3 className="cv-section-title-minimalist">Kinh nghiệm làm việc</h3>
                            {data.experience.map((exp, idx) => (
                                <div key={idx} className="cv-item-minimalist">
                                    <div className="cv-item-header-minimalist">
                                        <div>
                                            <div className="cv-item-title-minimalist">{exp.position}</div>
                                            <div className="cv-item-company-minimalist">{exp.companyName}</div>
                                        </div>
                                        <span className="cv-item-date-minimalist">{dateDisplay(exp.from, exp.to)}</span>
                                    </div>
                                    {exp.description && <p className="cv-text-minimalist">{exp.description}</p>}
                                    {exp.projects && <p className="cv-text-minimalist"><strong>Dự án:</strong> {exp.projects}</p>}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="cv-section-minimalist">
                        <h3 className="cv-section-title-minimalist">Kỹ năng</h3>
                        {data.skills?.core && data.skills.core.length > 0 && (
                            <div style={{ marginBottom: 12 }}>
                                <strong>Kỹ năng chuyên môn:</strong>
                                <div className="cv-skills-minimalist">
                                    {data.skills.core.map((skill, idx) => (
                                        <span key={idx} className="cv-skill-tag-minimalist">{skill}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {data.skills?.soft && data.skills.soft.length > 0 && (
                            <div>
                                <strong>Kỹ năng mềm:</strong>
                                <div className="cv-skills-minimalist">
                                    {data.skills.soft.map((skill, idx) => (
                                        <span key={idx} className="cv-skill-tag-minimalist">{skill}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {data.education && data.education.length > 0 && (
                        <div className="cv-section-minimalist">
                            <h3 className="cv-section-title-minimalist">Học vấn</h3>
                            {data.education.map((edu, idx) => (
                                <div key={idx} className="cv-item-minimalist">
                                    <div className="cv-item-header-minimalist">
                                        <div>
                                            <div className="cv-item-title-minimalist">{edu.school}</div>
                                            <div className="cv-item-company-minimalist">{[edu.degree, edu.major].filter(Boolean).join(' - ')}</div>
                                        </div>
                                        <span className="cv-item-date-minimalist">{dateDisplay(edu.from, edu.to, edu.currentlyStudying)}</span>
                                    </div>
                                    {edu.details && <p className="cv-text-minimalist">{edu.details}</p>}
                                </div>
                            ))}
                        </div>
                    )}

                    {data.projects && data.projects.length > 0 && (
                        <div className="cv-section-minimalist">
                            <h3 className="cv-section-title-minimalist">Dự án nổi bật</h3>
                            {data.projects.map((proj, idx) => (
                                <div key={idx} className="cv-item-minimalist">
                                    <div className="cv-item-header-minimalist">
                                        <div>
                                            <div className="cv-item-title-minimalist">{proj.name}</div>
                                            {proj.website && <a href={proj.website} target="_blank" rel="noreferrer" className="cv-link-minimalist">{proj.website}</a>}
                                        </div>
                                        <span className="cv-item-date-minimalist">{dateDisplay(proj.from, proj.to)}</span>
                                    </div>
                                    {proj.description && <p className="cv-text-minimalist">{proj.description}</p>}
                                </div>
                            ))}
                        </div>
                    )}

                    {data.certificates && data.certificates.length > 0 && (
                        <div className="cv-section-minimalist">
                            <h3 className="cv-section-title-minimalist">Chứng chỉ</h3>
                            {data.certificates.map((cert, idx) => (
                                <div key={idx} className="cv-item-minimalist">
                                    <div className="cv-item-title-minimalist">{cert.name}</div>
                                    <div className="cv-item-company-minimalist">{cert.organization}</div>
                                    {cert.description && <p className="cv-text-minimalist">{cert.description}</p>}
                                </div>
                            ))}
                        </div>
                    )}

                    {data.languages && data.languages.length > 0 && (
                        <div className="cv-section-minimalist">
                            <h3 className="cv-section-title-minimalist">Ngoại ngữ</h3>
                            {data.languages.map((lang, idx) => (
                                <div key={idx} className="cv-item-minimalist">
                                    <span className="cv-item-title-minimalist">{lang.name}: {lang.level}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {data.awards && data.awards.length > 0 && (
                        <div className="cv-section-minimalist">
                            <h3 className="cv-section-title-minimalist">Giải thưởng</h3>
                            {data.awards.map((award, idx) => (
                                <div key={idx} className="cv-item-minimalist">
                                    <div className="cv-item-title-minimalist">{award.name}</div>
                                    <div className="cv-item-company-minimalist">{award.organization}</div>
                                    {award.date && <div className="cv-text-minimalist">{dayjs(award.date).format('MM/YYYY')}</div>}
                                    {award.description && <p className="cv-text-minimalist">{award.description}</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CVTemplateMinimalist;


import { ICVData } from '@/types/cv';
import dayjs from 'dayjs';
import '@/components/client/cv-templates/cv-templates.scss';

interface IProps {
    data: ICVData;
    color?: string;
}

const CVTemplateRed = ({ data, color = '#E74C3C' }: IProps) => {
    const dateDisplay = (from?: string | Date, to?: string | Date, currently?: boolean) => {
        if (!from && !to) return '';
        const start = from ? dayjs(from).format('MM/YYYY') : '';
        const end = currently ? 'HIỆN TẠI' : to ? dayjs(to).format('MM/YYYY') : '';
        if (start && end) return `${start} - ${end}`;
        return start || end;
    };

    return (
        <div className="cv-template red" style={{ '--cv-color': color } as any}>
            <div className="cv-container">
                <div className="cv-header-red">
                    <div className="cv-header-red-content">
                        <div className="cv-info-red">
                            <div className="cv-name-red">{data.name || 'Your Name'}</div>
                            <div className="cv-title-red">NHÀ PHÁT TRIỂN PHẦN MỀM</div>
                        </div>
                        {data.avatar && (
                            <div className="cv-avatar-red">
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
                    </div>
                </div>

                <div className="cv-body-red">
                    <div className="cv-left-red">
                        <div className="cv-section-red">
                            <h3 className="cv-section-title-red">THÔNG TIN CÁ NHÂN</h3>
                            <div className="cv-contact-red">
                                {data.phone && (
                                    <div className="cv-contact-item-red">
                                        <span className="cv-contact-icon-red">📞</span>
                                        <span>{data.phone}</span>
                                    </div>
                                )}
                                {data.email && (
                                    <div className="cv-contact-item-red">
                                        <span className="cv-contact-icon-red">✉️</span>
                                        <span>{data.email}</span>
                                    </div>
                                )}
                                {data.address && (
                                    <div className="cv-contact-item-red">
                                        <span className="cv-contact-icon-red">📍</span>
                                        <span>{data.address}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {data.aboutMe && (
                            <div className="cv-section-red">
                                <h3 className="cv-section-title-red">GIỚI THIỆU</h3>
                                <p className="cv-text-red">{data.aboutMe}</p>
                            </div>
                        )}

                        {data.education && data.education.length > 0 && (
                            <div className="cv-section-red">
                                <h3 className="cv-section-title-red">HỌC VẤN</h3>
                                {data.education.map((edu, idx) => (
                                    <div key={idx} className="cv-item-red">
                                        <div className="cv-item-title-red">{edu.school}</div>
                                        <div className="cv-item-company-red">{[edu.degree, edu.major].filter(Boolean).join(' - ')}</div>
                                        <div className="cv-item-date-red">{dateDisplay(edu.from, edu.to, edu.currentlyStudying)}</div>
                                        {edu.details && <p className="cv-text-red">{edu.details}</p>}
                                    </div>
                                ))}
                            </div>
                        )}

                        {data.skills && ((data.skills.core && data.skills.core.length > 0) || (data.skills.soft && data.skills.soft.length > 0)) && (
                            <div className="cv-section-red">
                                <h3 className="cv-section-title-red">KỸ NĂNG</h3>
                                {data.skills.core && data.skills.core.length > 0 && (
                                    <div className="cv-skills-red">
                                        {data.skills.core.map((skill, idx) => (
                                            <div key={idx} className="cv-skill-tag-red">{skill}</div>
                                        ))}
                                    </div>
                                )}
                                {data.skills.soft && data.skills.soft.length > 0 && (
                                    <>
                                        <div style={{ marginTop: 12, marginBottom: 8, fontSize: 13 }}>Kỹ năng mềm:</div>
                                        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13 }}>
                                            {data.skills.soft.map((skill, idx) => (
                                                <li key={idx}>{skill}</li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="cv-right-red">
                        {data.experience && data.experience.length > 0 && (
                            <div className="cv-section-red">
                                <h3 className="cv-section-title-red">KINH NGHIỆM LÀM VIỆC</h3>
                                {data.experience.map((exp, idx) => (
                                    <div key={idx} className="cv-item-red">
                                        <div className="cv-item-header-red">
                                            <div>
                                                <div className="cv-item-title-red">{exp.position}</div>
                                                <div className="cv-item-company-red">{exp.companyName}</div>
                                            </div>
                                            <span className="cv-item-date-red">{dateDisplay(exp.from, exp.to)}</span>
                                        </div>
                                        {exp.description && <p className="cv-text-red">{exp.description}</p>}
                                    </div>
                                ))}
                            </div>
                        )}

                        {data.projects && data.projects.length > 0 && (
                            <div className="cv-section-red">
                                <h3 className="cv-section-title-red">DỰ ÁN NỔI BẬT</h3>
                                {data.projects.map((proj, idx) => (
                                    <div key={idx} className="cv-item-red">
                                        <div className="cv-item-header-red">
                                            <div>
                                                <div className="cv-item-title-red">{proj.name}</div>
                                                {proj.description && <p className="cv-text-red">{proj.description}</p>}
                                            </div>
                                            <span className="cv-item-date-red">{dateDisplay(proj.from, proj.to)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {data.certificates && data.certificates.length > 0 && (
                            <div className="cv-section-red">
                                <h3 className="cv-section-title-red">CHỨNG CHỈ</h3>
                                {data.certificates.map((cert, idx) => (
                                    <div key={idx} className="cv-item-red">
                                        <div className="cv-item-header-red">
                                            <div>
                                                <div className="cv-item-title-red">{cert.name}</div>
                                                {cert.organization && <div className="cv-item-company-red">{cert.organization}</div>}
                                                {cert.description && <p className="cv-text-red">{cert.description}</p>}
                                            </div>
                                            {cert.from && <span className="cv-item-date-red">{dayjs(cert.from).format('MM/YYYY')}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {data.awards && data.awards.length > 0 && (
                            <div className="cv-section-red">
                                <h3 className="cv-section-title-red">GIẢI THƯỞNG</h3>
                                {data.awards.map((award, idx) => (
                                    <div key={idx} className="cv-item-red">
                                        <div className="cv-item-header-red">
                                            <div>
                                                <div className="cv-item-title-red">{award.name}</div>
                                                {award.organization && <div className="cv-item-company-red">{award.organization}</div>}
                                                {award.description && <p className="cv-text-red">{award.description}</p>}
                                            </div>
                                            {award.date && <span className="cv-item-date-red">{dayjs(award.date).format('MM/YYYY')}</span>}
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

export default CVTemplateRed;


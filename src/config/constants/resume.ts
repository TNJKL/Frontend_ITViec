export const RESUME_STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Chờ duyệt' },
  { value: 'REVIEWING', label: 'Đang xem xét' },
  { value: 'APPROVED', label: 'Đã duyệt' },
  { value: 'INTERVIEW_SCHEDULED', label: 'Đã đặt lịch phỏng vấn' },
  { value: 'INTERVIEW_CONFIRMED', label: 'Ứng viên xác nhận' },
  { value: 'INTERVIEW_COMPLETED', label: 'Đã hoàn thành phỏng vấn' },
  { value: 'INTERVIEW_CANCELLED', label: 'Lịch phỏng vấn bị hủy' },
  { value: 'OFFERED', label: 'Đã gửi offer' },
  { value: 'REJECTED', label: 'Từ chối' },
  { value: 'ACCEPTED', label: 'Ứng viên nhận offer' },
  { value: 'DECLINED', label: 'Ứng viên từ chối' },
];

export type ResumeStatus = (typeof RESUME_STATUS_OPTIONS)[number]['value'];

export const RESUME_STATUS_TRANSITIONS: Record<ResumeStatus, ResumeStatus[]> = {
  PENDING: ['REVIEWING', 'REJECTED'],
  REVIEWING: ['APPROVED', 'REJECTED', 'PENDING'],
  APPROVED: ['INTERVIEW_SCHEDULED', 'REJECTED'],
  INTERVIEW_SCHEDULED: ['INTERVIEW_CONFIRMED', 'INTERVIEW_CANCELLED'],
  INTERVIEW_CONFIRMED: ['INTERVIEW_COMPLETED', 'INTERVIEW_CANCELLED'],
  INTERVIEW_COMPLETED: ['OFFERED', 'REJECTED'],
  INTERVIEW_CANCELLED: ['REVIEWING', 'APPROVED'],
  OFFERED: ['ACCEPTED', 'DECLINED', 'REJECTED'],
  REJECTED: [],
  ACCEPTED: [],
  DECLINED: [],
};




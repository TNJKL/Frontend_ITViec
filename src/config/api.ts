import { IBackendRes, ICompany, IAccount, IUser, IModelPaginate, IGetAccount, IJob, IResume, IPermission, IRole, ISubscribers, IDashboardOverview, IResumeCheck, IServicePackage, IUserPackage, IPaymentResponse, IUserActivePackage, IUserPackagesOverview, IInterview, INotification } from '@/types/backend';
import axios from 'config/axios-customize';

/**
 * 
Module Auth
 */
export const callRegister = (name: string, email: string, password: string, age: number, gender: string, address: string, phone: string) => {
    return axios.post<IBackendRes<IUser>>('/api/v1/auth/register', { name, email, password, age, gender, address, phone })
}

export const callSendRegisterOtp = (email: string) => {
    return axios.post<IBackendRes<any>>('/api/v1/auth/register/otp', { email })
}

export const callVerifyRegisterOtp = (payload: {
    name: string;
    email: string;
    password: string;
    age: number;
    gender: string;
    address: string;
    phone: string;
    otp: string;
}) => {
    return axios.post<IBackendRes<IUser>>('/api/v1/auth/register/verify', payload)
}

export const callLogin = (username: string, password: string) => {
    return axios.post<IBackendRes<IAccount>>('/api/v1/auth/login', { username, password })
}

export const callFetchAccount = () => {
    return axios.get<IBackendRes<IGetAccount>>('/api/v1/auth/account')
}

export const callRefreshToken = () => {
    return axios.get<IBackendRes<IAccount>>('/api/v1/auth/refresh')
}

export const callLogout = () => {
    return axios.post<IBackendRes<string>>('/api/v1/auth/logout')
}

/**
 * Employer Applications
 */
export const callCreateEmployerApplication = (payload: {
    name: string;
    email: string;
    phone: string;
    companyName: string;
    companyAddress: string;
    website?: string;
}) => {
    return axios.post<IBackendRes<any>>('/api/v1/employer-applications', payload);
}

export const callGetEmployerApplications = (query = '') => {
    return axios.get<IBackendRes<any>>(`/api/v1/employer-applications?${query}`);
}

export const callApproveEmployerApplication = (id: string) => {
    return axios.post<IBackendRes<any>>(`/api/v1/employer-applications/${id}/approve`, {});
}

export const callRejectEmployerApplication = (id: string, note?: string) => {
    return axios.post<IBackendRes<any>>(`/api/v1/employer-applications/${id}/reject`, { note });
}

/**
 * Upload single file
 */
export const callUploadSingleFile = (file: any, folderType: string) => {
    const bodyFormData = new FormData();
    bodyFormData.append('fileUpload', file);
    return axios<IBackendRes<{ fileName: string }>>({
        method: 'post',
        url: '/api/v1/files/upload',
        data: bodyFormData,
        headers: {
            "Content-Type": "multipart/form-data",
            "folder_type": folderType
        },
    });
}




/**
 * 
Module Company
 */
export const callCreateCompany = (name: string, address: string, description: string, logo: string, images?: string[], maps?: string[]) => {
    return axios.post<IBackendRes<ICompany>>('/api/v1/companies', { name, address, description, logo, images, maps })
}

export const callUpdateCompany = (id: string, name: string, address: string, description: string, logo: string, images?: string[], maps?: string[]) => {
    return axios.patch<IBackendRes<ICompany>>(`/api/v1/companies/${id}`, { name, address, description, logo, images, maps })
}

export const callDeleteCompany = (id: string) => {
    return axios.delete<IBackendRes<ICompany>>(`/api/v1/companies/${id}`);
}

export const callFetchCompany = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<ICompany>>>(`/api/v1/companies?${query}`);
}

export const callFetchCompanyManaged = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<ICompany>>>(`/api/v1/companies/manage?${query}`);
}

export const callFetchCompanyById = (id: string) => {
    return axios.get<IBackendRes<ICompany>>(`/api/v1/companies/${id}`);
}

// Reviews
export const callFetchReviewsByCompany = (companyId: string) => {
    return axios.get<IBackendRes<any>>(`/api/v1/reviews?companyId=${companyId}`);
}

export const callCreateReview = (payload: { company: string; user: string; rating: number; comment?: string; summary?: string; pros?: string; cons?: string; recommend?: boolean }) => {
    return axios.post<IBackendRes<any>>(`/api/v1/reviews`, payload);
}

export const callFetchReviewSummary = (companyId: string) => {
    return axios.get<IBackendRes<any>>(`/api/v1/reviews/summary?companyId=${companyId}`);
}


/**
 * 
Module User
 */
export const callCreateUser = (user: IUser) => {
    return axios.post<IBackendRes<IUser>>('/api/v1/users', { ...user })
}

export const callUpdateUser = (user: IUser, id: string) => {
    return axios.patch<IBackendRes<IUser>>(`/api/v1/users/${id}`, { ...user })
}

export const callDeleteUser = (id: string) => {
    return axios.delete<IBackendRes<IUser>>(`/api/v1/users/${id}`);
}

export const callFetchUser = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IUser>>>(`/api/v1/users?${query}`);
}

export const callFetchUserById = (id: string) => {
    return axios.get<IBackendRes<IUser>>(`/api/v1/users/${id}`);
}

export const callUpdateSelfUser = (user: Partial<IUser>) => {
    return axios.patch<IBackendRes<IUser>>(`/api/v1/users/me`, { ...user })
}

export const callChangeSelfPassword = (currentPassword: string, newPassword: string) => {
    return axios.patch<IBackendRes<any>>(`/api/v1/users/me/password`, { currentPassword, newPassword })
}

/**
 * 
Module Job
 */
export const callCreateJob = (job: IJob) => {
    return axios.post<IBackendRes<IJob>>('/api/v1/jobs', { ...job })
}

export const callUpdateJob = (job: IJob, id: string) => {
    return axios.patch<IBackendRes<IJob>>(`/api/v1/jobs/${id}`, { ...job })
}

export const callDeleteJob = (id: string) => {
    return axios.delete<IBackendRes<IJob>>(`/api/v1/jobs/${id}`);
}

export const callFetchJob = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IJob>>>(`/api/v1/jobs?${query}`);
}

export const callFetchJobManaged = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IJob>>>(`/api/v1/jobs/manage?${query}`);
}

export const callFetchJobById = (id: string) => {
    return axios.get<IBackendRes<IJob>>(`/api/v1/jobs/${id}`);
}

/**
 * 
Module Resume
 */
export const callCreateResume = (url: string, companyId: any, jobId: any) => {
    return axios.post<IBackendRes<IResume>>('/api/v1/resumes', { url, companyId, jobId })
}

export const callCheckResumeApplied = (jobId: string) => {
    return axios.get<IBackendRes<IResumeCheck>>(`/api/v1/resumes/job/${jobId}/check`);
}

export const callUpdateResumeStatus = (id: any, status: string) => {
    return axios.patch<IBackendRes<IResume>>(`/api/v1/resumes/${id}`, { status })
}

export const callUpdateResumeFile = (id: string, url: string) => {
    return axios.patch<IBackendRes<IResume>>(`/api/v1/resumes/${id}/file`, { url });
}

export const callDeleteResume = (id: string) => {
    return axios.delete<IBackendRes<IResume>>(`/api/v1/resumes/${id}`);
}

export const callFetchResume = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IResume>>>(`/api/v1/resumes?${query}`);
}

export const callFetchResumeManaged = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IResume>>>(`/api/v1/resumes/manage?${query}`);
}

export const callFetchResumeById = (id: string) => {
    return axios.get<IBackendRes<IResume>>(`/api/v1/resumes/${id}`);
}

export const callFetchResumeByUser = () => {
    return axios.post<IBackendRes<IResume[]>>(`/api/v1/resumes/by-user`);
}

/**
 * 
Module Permission
 */
export const callCreatePermission = (permission: IPermission) => {
    return axios.post<IBackendRes<IPermission>>('/api/v1/permissions', { ...permission })
}

export const callUpdatePermission = (permission: IPermission, id: string) => {
    return axios.patch<IBackendRes<IPermission>>(`/api/v1/permissions/${id}`, { ...permission })
}

export const callDeletePermission = (id: string) => {
    return axios.delete<IBackendRes<IPermission>>(`/api/v1/permissions/${id}`);
}

export const callFetchPermission = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IPermission>>>(`/api/v1/permissions?${query}`);
}

export const callFetchPermissionById = (id: string) => {
    return axios.get<IBackendRes<IPermission>>(`/api/v1/permissions/${id}`);
}

/**
 * 
Module Role
 */
export const callCreateRole = (role: IRole) => {
    return axios.post<IBackendRes<IRole>>('/api/v1/roles', { ...role })
}

export const callUpdateRole = (role: IRole, id: string) => {
    return axios.patch<IBackendRes<IRole>>(`/api/v1/roles/${id}`, { ...role })
}

export const callDeleteRole = (id: string) => {
    return axios.delete<IBackendRes<IRole>>(`/api/v1/roles/${id}`);
}

export const callFetchRole = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IRole>>>(`/api/v1/roles?${query}`);
}

export const callFetchRoleById = (id: string) => {
    return axios.get<IBackendRes<IRole>>(`/api/v1/roles/${id}`);
}

/**
 * 
Module Subscribers
 */
export const callCreateSubscriber = (subs: ISubscribers) => {
    return axios.post<IBackendRes<ISubscribers>>('/api/v1/subscribers', { ...subs })
}

export const callGetSubscriberSkills = () => {
    return axios.post<IBackendRes<ISubscribers>>('/api/v1/subscribers/skills')
}

export const callUpdateSubscriber = (subs: ISubscribers) => {
    return axios.patch<IBackendRes<ISubscribers>>(`/api/v1/subscribers`, { ...subs })
}

export const callDeleteSubscriber = (id: string) => {
    return axios.delete<IBackendRes<ISubscribers>>(`/api/v1/subscribers/${id}`);
}

export const callFetchSubscriber = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<ISubscribers>>>(`/api/v1/subscribers?${query}`);
}

export const callFetchSubscriberById = (id: string) => {
    return axios.get<IBackendRes<ISubscribers>>(`/api/v1/subscribers/${id}`);
}

/**
 * 
 * Module Dashboard
 */
export const callFetchDashboardOverview = () => {
    return axios.get<IBackendRes<IDashboardOverview>>('/api/v1/dashboard/overview');
}

/**
 * 
 * Module Service Packages
 */
export const callCreateServicePackage = (servicePackage: IServicePackage) => {
    return axios.post<IBackendRes<IServicePackage>>('/api/v1/service-packages', { ...servicePackage });
}

export const callUpdateServicePackage = (servicePackage: IServicePackage, id: string) => {
    return axios.patch<IBackendRes<IServicePackage>>(`/api/v1/service-packages/${id}`, { ...servicePackage });
}

export const callDeleteServicePackage = (id: string) => {
    return axios.delete<IBackendRes<IServicePackage>>(`/api/v1/service-packages/${id}`);
}

export const callFetchServicePackageById = (id: string) => {
    return axios.get<IBackendRes<IServicePackage>>(`/api/v1/service-packages/${id}`);
}

export const callFetchServicePackages = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IServicePackage>>>(`/api/v1/service-packages?${query}`);
}

export const callFetchActiveServicePackages = () => {
    return axios.get<IBackendRes<IServicePackage[]>>('/api/v1/service-packages/active');
}

/**
 * 
 * Module Payments
 */
export const callCreatePayment = (packageId: string) => {
    return axios.post<IBackendRes<IPaymentResponse>>('/api/v1/payments/create', { packageId });
}

export const callGetCurrentPackage = () => {
    return axios.get<IBackendRes<IUserPackage>>('/api/v1/payments/current-package');
}

export const callGetActiveUserPackages = () => {
    return axios.get<IBackendRes<IUserPackagesOverview>>('/api/v1/payments/active-packages');
}

export const callVerifyPayment = (queryParams: Record<string, string>) => {
    return axios.get<IBackendRes<{ success: boolean; message: string; data?: any }>>('/api/v1/payments/callback', { params: queryParams });
}

/**
 * 
 * Module Interviews
 */
export const callCreateInterview = (interview: Partial<IInterview>) => {
    return axios.post<IBackendRes<IInterview>>('/api/v1/interviews', interview);
}

export const callGetInterviews = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IInterview>>>(`/api/v1/interviews?${query}`);
}

export const callGetMyInterviews = () => {
    return axios.get<IBackendRes<IInterview[]>>('/api/v1/interviews/my-interviews');
}

export const callGetInterviewById = (id: string) => {
    return axios.get<IBackendRes<IInterview>>(`/api/v1/interviews/${id}`);
}

export const callUpdateInterview = (id: string, interview: Partial<IInterview>) => {
    return axios.patch<IBackendRes<IInterview>>(`/api/v1/interviews/${id}`, interview);
}

export const callConfirmInterview = (id: string) => {
    return axios.patch<IBackendRes<{ message: string }>>(`/api/v1/interviews/${id}/confirm`);
}

export const callUpdateInterviewResult = (id: string, result: { result?: string; feedback?: string }) => {
    return axios.patch<IBackendRes<{ message: string }>>(`/api/v1/interviews/${id}/result`, result);
}

export const callCancelInterview = (id: string, cancelReason: string) => {
    return axios.delete<IBackendRes<{ message: string }>>(`/api/v1/interviews/${id}`, {
        data: { cancelReason }
    });
}

/**
 * 
 * Module Notifications
 */
export const callGetNotifications = (query?: string) => {
    return axios.get<IBackendRes<INotification[]>>(`/api/v1/notifications${query ? `?${query}` : ''}`);
}

export const callGetUnreadNotificationCount = () => {
    return axios.get<IBackendRes<number>>('/api/v1/notifications/unread-count');
}

export const callMarkNotificationAsRead = (id: string) => {
    return axios.patch<IBackendRes<INotification>>(`/api/v1/notifications/${id}/read`);
}

export const callMarkAllNotificationsAsRead = () => {
    return axios.patch<IBackendRes<{ modifiedCount: number }>>('/api/v1/notifications/read-all');
}

export const callDeleteNotification = (id: string) => {
    return axios.delete<IBackendRes<INotification>>(`/api/v1/notifications/${id}`);
}

export const callDeleteAllReadNotifications = () => {
    return axios.delete<IBackendRes<{ deletedCount: number }>>('/api/v1/notifications/read-all');
}


export interface IBackendRes<T> {
    error?: string | string[];
    message: string;
    statusCode: number | string;
    data?: T;
}

export interface IModelPaginate<T> {
    meta: {
        current: number;
        pageSize: number;
        pages: number;
        total: number;
    },
    result: T[]
}

export interface IAccount {
    access_token: string;
    user: {
        _id: string;
        email: string;
        name: string;
        role: {
            _id: string;
            name: string;
        }
        permissions: {
            _id: string;
            name: string;
            apiPath: string;
            method: string;
            module: string;
        }[]
    }
}

export interface IGetAccount extends Omit<IAccount, "access_token"> { }

export interface ICompany {
    _id?: string;
    name?: string;
    address?: string;
    logo: string;
    images?: string[];
    maps?: string[];
    description?: string;
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}



export interface IUser {
    _id?: string;
    name: string;
    email: string;
    password?: string;
    age: number;
    gender: string;
    address: string;
    phone?: string;
    avatar?: string;
    aboutMe?: string;
    education?: Array<{
        school?: string;
        degree?: string;
        major?: string;
        currentlyStudying?: boolean;
        from?: string | Date;
        to?: string | Date;
        details?: string;
    }>;
    experience?: Array<{
        position?: string;
        companyName?: string;
        from?: string | Date;
        to?: string | Date;
        description?: string;
        projects?: string;
    }>;
    skills?: {
        core?: string[];
        soft?: string[];
    };
    languages?: Array<{
        name?: string;
        level?: string;
    }>;
    projects?: Array<{
        name?: string;
        from?: string | Date;
        to?: string | Date;
        description?: string;
        website?: string;
    }>;
    certificates?: Array<{
        name?: string;
        organization?: string;
        from?: string | Date;
        to?: string | Date;
        link?: string;
        description?: string;
    }>;
    awards?: Array<{
        name?: string;
        organization?: string;
        date?: string | Date;
        description?: string;
    }>;
    role?: {
        _id: string;
        name: string;
    }

    company?: {
        _id: string;
        name: string;
    }
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface IJob {
    _id?: string;
    name: string;
    skills: string[];
    company?: {
        _id: string;
        name: string;
  logo?: string;
  images?: string[];
    }
    location: string;
    workingModel?: string;
    salary: number;
    quantity: number;
    level: string;
    description: string;
    startDate: Date;
    endDate: Date;
    isActive: boolean;

    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface IResume {
    _id?: string;
    email: string;
    userId: string;
    url: string;
    status: string;
    companyId: string | {
        _id: string;
        name: string;
        logo: string;
    };
    jobId: string | {
        _id: string;
        name: string;
    };
    history?: {
        status: string;
        updatedAt: Date;
        updatedBy: { _id: string; email: string }
    }[]
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface IResumeCheck {
    applied: boolean;
    resumeId?: string;
    appliedAt?: string;
    status?: string;
    url?: string;
}

export interface IPermission {
    _id?: string;
    name?: string;
    apiPath?: string;
    method?: string;
    module?: string;

    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;

}

export interface IRole {
    _id?: string;
    name: string;
    description: string;
    isActive: boolean;
    permissions: IPermission[] | string[];

    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface ISubscribers {
    _id?: string;
    name?: string;
    email?: string;
    skills: string[];
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface IDashboardOverview {
    totals: {
        users: {
            total: number;
            byRole: {
                total: number;
                candidate: number;
                hr: number;
                admin: number;
                others: Array<{
                    roleId?: string;
                    roleName?: string;
                    count: number;
                }>;
            };
        };
        jobs: {
            total: number;
            active: number;
        };
        applications: {
            total: number;
            today: number;
            thisMonth: number;
            uniqueApplicantsThisMonth: number;
        };
        companies: number;
    };
    trends: {
        applicationsLast7Days: Array<{
            date: string;
            count: number;
        }>;
        jobsLast6Months: Array<{
            month: string;
            count: number;
        }>;
    };
    leaderboards: {
        topCandidates: Array<{
            userId?: string;
            name?: string;
            email?: string;
            phone?: string;
            avatar?: string;
            company?: string;
            totalApplications: number;
            jobsCount: number;
            companiesCount: number;
            lastAppliedAt?: string;
        }>;
        topHRs: Array<{
            userId?: string;
            name?: string;
            email?: string;
            phone?: string;
            avatar?: string;
            company?: string;
            companyNames?: string[];
            totalJobs: number;
            lastPostedAt?: string;
        }>;
    };
}
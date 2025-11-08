export interface ICVData {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
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
}

export type CVTemplateType = 'classic' | 'vintage' | 'modern' | 'minimalist' | 'sidebar' | 'red';


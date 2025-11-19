export interface DashboardUserSection{
    title: string;
    icon: string;
    route: string;
    roles: string[];
    component?: any;
}

export const DASHBOARD_SECTIONS: DashboardUserSection[] = [
    
    { title: 'Services', icon: 'account_circle', route: '/user/dashboard/', roles: ['user'] },
    { title: 'Profile', icon: 'account_circle', route: '/user/dashboard/profile', roles: ['user'] },
]
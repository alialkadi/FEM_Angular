export interface DashboardSection{
    title: string;
    icon: string;
    route: string;
    roles: string[];
    component?: any;
}

export const DASHBOARD_SECTIONS: DashboardSection[] = [
    { title: 'Categories', icon: 'group', route: '/admin/dashboard/Categories', roles: ['Admin'] },
    { title: 'Category Types', icon: 'group', route: '/admin/dashboard/CategoryTypes', roles: ['Admin'] },
    { title: 'Structures', icon: 'group', route: '/admin/dashboard/Structures', roles: ['Admin'] },
    { title: 'Parts', icon: 'group', route: '/admin/dashboard/Parts', roles: ['Admin'] },
    { title: 'PartOptions', icon: 'group', route: '/admin/dashboard/PartOptions', roles: ['Admin'] },
    { title: 'Services', icon: 'group', route: '/admin/dashboard/Services', roles: ['Admin'] },
    { title: 'Fee', icon: 'group', route: '/admin/dashboard/Fee', roles: ['Admin'] },
    { title: 'Create Fee', icon: 'add_circle', route: '/admin/dashboard/createFee', roles: ['Admin'] },
    { title: 'Requsts', icon: 'add_circle', route: '/admin/dashboard/ServiceRequests', roles: ['Admin'] },
    { title: 'create worker', icon: 'add_circle', route: '/admin/dashboard/create-worker', roles: ['Admin'] },
    { title: 'workers', icon: 'add_circle', route: '/admin/dashboard/workers', roles: ['Admin'] },
    { title: 'Requsts', icon: 'group', route: '/technician/dashboard/requests', roles: ['Worker'] },
]
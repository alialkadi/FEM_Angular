export interface DashboardSection{
    title: string;
    icon: string;
    route: string;
    roles: string[];
    component?: any;
}

export const DASHBOARD_SECTIONS: DashboardSection[] = [
    { title: 'User Management', icon: 'group', route: '/admin/dashboard/manage-users', roles: ['Admin'] },
    { title: 'Categories', icon: 'group', route: '/admin/dashboard/Categories', roles: ['Admin'] },
    { title: 'Category Types', icon: 'group', route: '/admin/dashboard/CategoryTypes', roles: ['Admin'] },
    { title: 'Structures', icon: 'group', route: '/admin/dashboard/Structures', roles: ['Admin'] },
    { title: 'Parts', icon: 'group', route: '/admin/dashboard/Parts', roles: ['Admin'] },
    { title: 'PartOptions', icon: 'group', route: '/admin/dashboard/PartOptions', roles: ['Admin'] },
    { title: 'Services', icon: 'group', route: '/admin/dashboard/Services', roles: ['Admin'] },
    { title: 'Fee', icon: 'group', route: '/admin/dashboard/Fee', roles: ['Admin'] },
    { title: 'Create Fee', icon: 'add_circle', route: '/admin/dashboard/createFee', roles: ['Admin'] },
    { title: 'Requsts', icon: 'add_circle', route: '/admin/dashboard/ServiceRequests', roles: ['Admin'] },
    { title: 'Work Orders', icon: 'build', route: '/Worker/orders', roles: ['Worker','Admin'] },
    { title: 'Profile', icon: 'person', route: '/profile', roles: ['user','Worker','Admin'] },
    { title: 'Support Tickets', icon: 'support', route: '/support/tickets', roles: ['CustomerSupport','Admin'] }]
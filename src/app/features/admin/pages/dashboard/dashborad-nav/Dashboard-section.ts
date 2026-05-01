export interface DashboardSection {
  title: string;
  icon: string;
  route: string;
  roles: string[];
  component?: any;
}

export const DASHBOARD_SECTIONS: DashboardSection[] = [
  {
    title: 'Categories',
    icon: 'category',
    route: '/admin/dashboard/Categories',
    roles: ['Admin'],
  },
  {
    title: 'Category Types',
    icon: 'inventory_2',
    route: '/admin/dashboard/CategoryTypes',
    roles: ['Admin'],
  },
  {
    title: 'Components',
    icon: 'apartment',
    route: '/admin/dashboard/Structures',
    roles: ['Admin'],
  },
  {
    title: 'Parts',
    icon: 'build',
    route: '/admin/dashboard/Parts',
    roles: ['Admin'],
  },
  {
    title: 'PartOptions',
    icon: 'tune',
    route: '/admin/dashboard/PartOptions',
    roles: ['Admin'],
  },
  {
    title: 'Services',
    icon: 'miscellaneous_services',
    route: '/admin/dashboard/Services',
    roles: ['Admin'],
  },
  {
    title: 'Fee',
    icon: 'payments',
    route: '/admin/dashboard/Fee',
    roles: ['Admin'],
  },
  {
    title: 'Metadata',
    icon: 'dataset',
    route: '/admin/dashboard/metadata',
    roles: ['Admin'],
  },
  {
    title: 'Inputs',
    icon: 'input',
    route: '/admin/dashboard/input',
    roles: ['Admin'],
  },
  {
    title: 'Consultations',
    icon: 'support_agent',
    route: '/admin/dashboard/consultations',
    roles: ['Admin'],
  },
  {
    title: 'Create Fee',
    icon: 'add_card',
    route: '/admin/dashboard/createFee',
    roles: ['Admin'],
  },
  {
    title: 'Requests',
    icon: 'assignment',
    route: '/admin/dashboard/ServiceRequests',
    roles: ['Admin'],
  },
  {
    title: 'Create technician',
    icon: 'person_add',
    route: '/admin/dashboard/create-worker',
    roles: ['Admin'],
  },
  {
    title: 'Technicians',
    icon: 'engineering',
    route: '/admin/dashboard/workers',
    roles: ['Admin'],
  },
  {
    title: 'Requests',
    icon: 'assignment_turned_in',
    route: '/technician/dashboard/requests',
    roles: ['Worker'],
  },
];

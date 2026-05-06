export interface DashboardUserSection {
  title: string;
  icon: string;
  route: string;
  roles: string[];
  component?: any;
}

export const DASHBOARD_SECTIONS: DashboardUserSection[] = [
  {
    title: 'Quotes',
    icon: 'request_quote',
    route: '/user/dashboard/',
    roles: ['user'],
  },
  {
    title: 'Orders',
    icon: 'shopping_bag',
    route: '/user/dashboard/orders',
    roles: ['user'],
  },
  {
    title: 'Profile',
    icon: 'person',
    route: '/user/dashboard/profile',
    roles: ['user'],
  },
];

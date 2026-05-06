export interface LandingPageNavbarSection {
  title: string;
  icon: string;
  route: string;
  roles?: string[];
  component?: any;
}

export const LandingPageNavbar_SECTIONS: LandingPageNavbarSection[] = [
  {
    title: 'About Us',
    icon: 'group',
    route: '/public/FenestrationMaintainence/AboutUs',
  },
  { title: 'Inspection Tiers', icon: 'group', route: '#' },
  {
    title: 'Basic Inspections',
    icon: 'group',
    route: '/public/FenestrationMaintainence/contact',
  },
];

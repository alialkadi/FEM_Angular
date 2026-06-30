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
    route: '/FenetrationMaintainence/Home/about-us',
  },
  
];

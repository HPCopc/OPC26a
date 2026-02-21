export type NavItem = {
  label: string;
  href?: string;
  external?: boolean;
  children?: NavItem[];  // Add this line for nested navigation items
};
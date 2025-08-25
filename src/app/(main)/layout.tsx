import { SidebarLayout } from '@/components/sidebar';

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <SidebarLayout>{children}</SidebarLayout>;
}

'use client';
import { NavBar } from '@/components/navbar-base';
import { FileQuestionMark, LayoutDashboard } from 'lucide-react';

export function Nav() {
  return (
    <NavBar
      items={[
        {
          name: 'Questions',
          url: '/',
          icon: FileQuestionMark,
        },
        {
          name: 'Dashboard',
          url: '/dashboard',
          icon: LayoutDashboard,
        },
      ]}
    />
  );
}

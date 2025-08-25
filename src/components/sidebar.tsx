'use client';
import { motion } from 'framer-motion';
import { FileQuestionIcon, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import type React from 'react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Sidebar, SidebarBody, SidebarLink } from './fancy-sidebar';

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const links = [
    {
      label: 'Questions',
      href: '/',
      icon: (
        <FileQuestionIcon className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: (
        <LayoutDashboard className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
  ];
  const [open, setOpen] = useState(false);
  return (
    <div
      className={cn(
        'flex w-full flex-col overflow-hidden rounded-md bg-gray-100 md:flex-row dark:bg-neutral-800',
        'h-screen' // for your use case, use `h-screen` instead of `h-[60vh]`
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div />
        </SidebarBody>
      </Sidebar>
      <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden bg-background">
        {children}
      </div>
    </div>
  );
}

export const Logo = () => {
  return (
    <Link
      className="relative z-20 flex items-center space-x-2 py-1 font-normal text-black text-sm"
      href="#"
    >
      <div className="h-5 w-6 flex-shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
      <motion.span
        animate={{ opacity: 1 }}
        className="whitespace-pre font-medium text-black dark:text-white"
        initial={{ opacity: 0 }}
      >
        OCW SAT
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      className="relative z-20 flex items-center space-x-2 py-1 font-normal text-black text-sm"
      href="#"
    >
      <div className="h-5 w-6 flex-shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
    </Link>
  );
};

// Dummy dashboard component with content
const _Dashboard = () => {
  return (
    <div className="flex flex-1">
      <div className="flex h-full w-full flex-1 flex-col gap-2 rounded-tl-2xl border border-neutral-200 bg-white p-2 md:p-10 dark:border-neutral-700 dark:bg-neutral-900">
        <div className="flex gap-2">
          {[...new Array(4)].map((i) => (
            <div
              className="h-20 w-full animate-pulse rounded-lg bg-gray-100 dark:bg-neutral-800"
              key={`first-array${i}`}
            />
          ))}
        </div>
        <div className="flex flex-1 gap-2">
          {[...new Array(2)].map((i) => (
            <div
              className="h-full w-full animate-pulse rounded-lg bg-gray-100 dark:bg-neutral-800"
              key={`second-array${i}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

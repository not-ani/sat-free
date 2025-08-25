'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type NavItem = {
  name: string;
  url: string;
  icon: LucideIcon;
};

type NavBarProps = {
  items: NavItem[];
  className?: string;
};

export function NavBar({ items, className }: NavBarProps) {
  const [activeTab, setActiveTab] = useState(items[0].name);
  const [_isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      className={cn(
        '-translate-x-1/2 fixed bottom-0 left-1/2 z-50 mb-6 sm:top-0 sm:pt-6',
        className
      )}
    >
      <div className="flex items-center gap-3 rounded-full border border-border bg-background/5 px-1 py-1 shadow-lg backdrop-blur-lg">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.name;

          return (
            <Link
              className={cn(
                'relative cursor-pointer rounded-full px-6 py-2 font-semibold text-sm transition-colors',
                'text-foreground/80 hover:text-primary',
                isActive && 'bg-muted text-primary'
              )}
              href={item.url}
              key={item.name}
              onClick={() => setActiveTab(item.name)}
            >
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden">
                <Icon size={18} strokeWidth={2.5} />
              </span>
              {isActive && (
                <motion.div
                  className="-z-10 absolute inset-0 w-full rounded-full bg-primary/5"
                  initial={false}
                  layoutId="lamp"
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <div className="-top-2 -translate-x-1/2 absolute left-1/2 h-1 w-8 rounded-t-full bg-primary">
                    <div className="-top-2 -left-2 absolute h-6 w-12 rounded-full bg-primary/20 blur-md" />
                    <div className="-top-1 absolute h-6 w-8 rounded-full bg-primary/20 blur-md" />
                    <div className="absolute top-0 left-2 h-4 w-4 rounded-full bg-primary/20 blur-sm" />
                  </div>
                </motion.div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

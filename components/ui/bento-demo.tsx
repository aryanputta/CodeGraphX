'use client';

import {
  BellIcon,
  CalendarIcon,
  FileTextIcon,
  GlobeIcon,
  InputIcon
} from '@radix-ui/react-icons';

import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';

const features = [
  {
    Icon: FileTextIcon,
    name: 'Save your files',
    description: 'We automatically save your files as you type.',
    href: '/',
    cta: 'Learn more',
    background: (
      <img
        className="absolute -right-20 -top-20 h-72 w-72 object-cover opacity-60"
        src="https://images.unsplash.com/photo-1484417894907-623942c8ee29?auto=format&fit=crop&w=800&q=80"
        alt="Workspace"
      />
    ),
    className: 'lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3'
  },
  {
    Icon: InputIcon,
    name: 'Full text search',
    description: 'Search through all your files in one place.',
    href: '/',
    cta: 'Learn more',
    background: (
      <img
        className="absolute -right-20 -top-20 h-72 w-72 object-cover opacity-60"
        src="https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80"
        alt="Keyboard"
      />
    ),
    className: 'lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3'
  },
  {
    Icon: GlobeIcon,
    name: 'Multilingual',
    description: 'Supports 100+ languages and counting.',
    href: '/',
    cta: 'Learn more',
    background: (
      <img
        className="absolute -right-20 -top-20 h-72 w-72 object-cover opacity-60"
        src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80"
        alt="Landscape"
      />
    ),
    className: 'lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4'
  },
  {
    Icon: CalendarIcon,
    name: 'Calendar',
    description: 'Use the calendar to filter your files by date.',
    href: '/',
    cta: 'Learn more',
    background: (
      <img
        className="absolute -right-20 -top-20 h-72 w-72 object-cover opacity-60"
        src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80"
        alt="Coding setup"
      />
    ),
    className: 'lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2'
  },
  {
    Icon: BellIcon,
    name: 'Notifications',
    description: 'Get notified when someone shares a file or mentions you in a comment.',
    href: '/',
    cta: 'Learn more',
    background: (
      <img
        className="absolute -right-20 -top-20 h-72 w-72 object-cover opacity-60"
        src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80"
        alt="Chip"
      />
    ),
    className: 'lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4'
  }
];

export function BentoDemo() {
  return (
    <BentoGrid className="lg:grid-rows-3">
      {features.map((feature) => (
        <BentoCard key={feature.name} {...feature} />
      ))}
    </BentoGrid>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Users, MessageSquare, Shield } from 'lucide-react';

interface TravelConnectNavProps {
  onOpenSettings?: () => void;
}

export default function TravelConnectNav({ onOpenSettings }: TravelConnectNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Discover Travelers',
      href: '/travel-connect',
      icon: Compass,
      active: pathname === '/travel-connect',
    },
    {
      label: 'Requests',
      href: '/travel-connect/requests',
      icon: Users,
      active: pathname === '/travel-connect/requests',
    },
    {
      label: 'Connected Travelers & Chat',
      href: '/travel-connect/connections',
      icon: MessageSquare,
      active: pathname === '/travel-connect/connections',
    },
  ];

  return (
    <div className="bg-white border-b border-gray-200 sticky top-16 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between overflow-x-auto py-2.5 gap-4">
          <div className="flex items-center gap-2 shrink-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                    item.active
                      ? 'bg-amber-100 text-amber-900 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-amber-800 hover:bg-amber-50 rounded-xl transition shrink-0"
              title="Manage your Travel Connect privacy and visibility"
            >
              <Shield className="w-3.5 h-3.5 text-amber-600" />
              <span>Visibility Settings</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

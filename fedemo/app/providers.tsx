'use client';

import { usePathname } from 'next/navigation';
import { Theme } from '@astryxdesign/core/theme';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';
import { AppShell } from '@astryxdesign/core/AppShell';
import {
  SideNav,
  SideNavHeading,
  SideNavItem,
  SideNavSection,
} from '@astryxdesign/core/SideNav';

const NAV_ITEMS = [
  { label: 'Source Links', href: '/source-links', icon: 'externalLink' },
  { label: 'Opportunities', href: '/opportunity', icon: 'calendar' },
  { label: 'Dancers', href: '/dancer', icon: 'search' },
  { label: 'Recommendations', href: '/recommendation', icon: 'check' },
] as const;

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <Theme theme={neutralTheme}>
      <AppShell
        contentPadding={6}
        sideNav={
          <SideNav header={<SideNavHeading heading="Hammer" headingHref="/" />}>
            <SideNavSection title="Data" isHeaderHidden>
              {NAV_ITEMS.map((item) => (
                <SideNavItem
                  key={item.href}
                  label={item.label}
                  icon={item.icon}
                  href={item.href}
                  isSelected={
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`)
                  }
                />
              ))}
            </SideNavSection>
          </SideNav>
        }
      >
        {children}
      </AppShell>
    </Theme>
  );
}

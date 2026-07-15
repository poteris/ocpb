
'use client';

import Image from 'next/image'
import Link from 'next/link'
import { useTenant } from '@/context/TenantContext'

const Navbar = () => {
  const { branding } = useTenant();
  
  // Use custom logo if available, otherwise fallback to default
  const logoSrc = branding.logoUrl || "/logo.svg";

  return (
    <nav className="h-[85px] w-full flex items-center justify-between px-4 md:px-8" style={{ backgroundColor: branding.primaryColor }}>
      <Link href="/" className="text-white text-xl md:text-[30px] font-regular ml-2 md:ml-8">
        Convo Coach
      </Link>

      <div className="flex items-center gap-6">
        <Link href="/leaderboard" className="text-white text-sm md:text-lg font-regular" data-testid="navbarLeaderboardLink">
          Leaderboard
        </Link>

        <div className="relative h-12 w-12 md:h-16 md:w-16">
        <Image
          src={logoSrc}
          alt="Convo Coach Logo"
          fill
          className="object-contain rounded-full"
          priority
          onError={(e) => {
            // Fallback to default logo if custom logo fails to load
            e.currentTarget.src = "/logo.svg";
          }}
        />
        </div>
      </div>
    </nav>
  )
}

export default Navbar 
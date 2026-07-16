"use client"

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const Navbar = () => {
  const pathname = usePathname()
  const isInitiateChat = pathname === '/initiate-chat'
  const isChatScreen = pathname === '/chat-screen'
  const useLightBackground = isInitiateChat || isChatScreen
  
  return (
    <nav className={`h-[85px] w-full flex items-center justify-between px-4 md:px-8 ${useLightBackground ? 'bg-primary-light' : 'bg-primary'}`}>
      <div className="flex items-center">
        {useLightBackground && (
          <div className="relative h-12 w-12 md:h-16 md:w-16 mr-4">
            <Image
              src="/logo.svg"
              alt="Canvass Coach Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        )}
        <Link href="/" className={`text-[30px] font-regular ${useLightBackground ? 'text-black' : 'text-white'}`}>
          Canvass Coach
        </Link>
      </div>

      <Link
        href="/leaderboard"
        className={`text-sm md:text-lg font-regular ${useLightBackground ? 'text-black' : 'text-white'}`}
        data-testid="navbarLeaderboardLink"
      >
        Leaderboard
      </Link>
    </nav>
  )
}

export default Navbar 
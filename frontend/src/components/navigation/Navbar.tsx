
import Image from 'next/image'
import Link from 'next/link'
const Navbar = () => {
  return (
    <nav className="h-[85px] bg-primary w-full flex items-center justify-between px-4 md:px-8">
      <Link href="/" className="text-white text-[30px] font-regular ml-8">
        Rep Coach
      </Link>

      <div className="relative h-12 w-12 md:h-16 md:w-16">
        <Image
          src="/logo.svg"
          alt="Rep Coach Logo"
          fill
          className="object-contain"
          priority
        />
      </div>
    </nav>
  )
}

export default Navbar 
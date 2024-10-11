import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold mb-4">
          404 - Page Not Found
        </h1>
        <p className="text-xl mb-8">
          Oops! The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/" className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700 transition-colors">
          Go back home
        </Link>
      </main>
    </div>
  )
}
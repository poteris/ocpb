'use client'

import { useEffect, useState } from 'react'
import { SiteAdmin } from '@/components/screens/SiteAdmin'
import Login from '@/components/Login'
import { Session } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import axios from 'axios'


async function getSession() {
  const response = await axios.get('/api/session')
  return response.data
}

export default function SiteAdminPage() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()

  useEffect(() => {
    async function verifySession() {
      setLoading(true)
      
      try {
        const session = await getSession()
        
        if (session) {
          setSession(session)
        } else {
          setSession(null)
        }
      } catch (err) {
        console.error('Auth verification error:', err)
        setError('An unexpected error occurred during authentication verification.')
        setSession(null)
      } finally {
        setLoading(false)
      }
    }

    verifySession()

    // const {
    //   data: { subscription },
    //   } = supabase.auth.onAuthStateChange((_event, session) => {
    //   setSession(session)
    // })

    // return () => subscription.unsubscribe()
  }, [router])

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Authentication Error</h2>
          <p className="mb-6">{error}</p>
          <button 
            onClick={() => window.location.href = '/admin'} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Return to Login
          </button>
        </div>
      </div>
    )
  }

  if (!session) {
    return <Login />
  }

  return <SiteAdmin />
}
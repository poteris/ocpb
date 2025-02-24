'use client'

import { useEffect, useState } from 'react'
import { SiteAdmin } from '@/components/screens/SiteAdmin'
import Login from '@/components/Login'
import { supabase } from '@/lib/init'
import { Session } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

export default function SiteAdminPage() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Function to verify the user session and role
    async function verifySession() {
      setLoading(true)
      
      try {
        // Get the current session from Supabase
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          throw sessionError
        }
        
        if (session) {
          // Verify if the user has admin privileges
          // You can check user metadata or query a roles table in your database
          // This example assumes you've stored role info in user metadata
          const userRole = session.user.user_metadata.role
          
          if (userRole !== 'admin') {
            // User doesn't have admin role
            console.warn('Unauthorized access attempt - user lacks admin role')
            await supabase.auth.signOut() 
            setError('You do not have permission to access the admin panel.')
            setSession(null)
            return
          }
          
          // User is authenticated and authorized
          setSession(session)
          
          // Optional: Log admin access for security auditing
          logAdminAccess(session.user.id)
        } else {
          // No active session
          setSession(null)
        }
      } catch (err) {
        console.error('Auth verification error:', err)
        setError('An unexpected error occurred during authentication.')
        setSession(null)
      } finally {
        setLoading(false)
      }
    }

    // Initial session verification
    verifySession()

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        // When session changes, verify admin role again
        const userRole = session.user.user_metadata.role
        if (userRole !== 'admin') {
          supabase.auth.signOut()
          setError('You do not have permission to access the admin panel.')
          setSession(null)
        } else {
          setSession(session)
        }
      } else {
        setSession(null)
      }
    })

    // Clean up subscription when component unmounts
    return () => subscription.unsubscribe()
  }, [router])

  // Helper function to log admin access (optional but recommended for security)
  async function logAdminAccess(userId: string) {
    try {
      // This could be a call to your database or analytics service
      // For example:
      await supabase
        .from('admin_access_logs')
        .insert({
          user_id: userId,
          accessed_at: new Date().toISOString(),
          ip_address: 'client-side-not-available', // You'd need server-side code for actual IP
          user_agent: navigator.userAgent
        })
    } catch (error) {
      // Log error but don't block the user from accessing the admin
      console.error('Failed to log admin access:', error)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
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

  // Show login if no session, otherwise show admin panel
  if (!session) {
    return <Login />
  }

  return <SiteAdmin />
}
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/init"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { v4 as uuidv4 } from 'uuid' // You'll need to install this package

export default function Login() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [csrfToken, setCsrfToken] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [isLinkSent, setIsLinkSent] = useState(false)

  // Generate and store CSRF token on component mount
  useEffect(() => {
    // Generate a random token
    const newCsrfToken = uuidv4()
    
    // Store it in localStorage and state
    localStorage.setItem('csrf_token', newCsrfToken)
    setCsrfToken(newCsrfToken)
    
    // Optional: Set expiry for the token
    const expiryTime = Date.now() + 1000 * 60 * 15 // 15 minutes
    localStorage.setItem('csrf_token_expiry', expiryTime.toString())
  }, [])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0 && isLinkSent) {
      setIsLinkSent(false)
    }
  }, [countdown])

  async function handleLogin(e: React.MouseEvent<HTMLButtonElement>) {
    try {
      e.preventDefault()
      
      // Validate CSRF token exists
      if (!csrfToken) {
        setMessage('Security verification failed. Please refresh the page.')
        return
      }
      
      setIsLoading(true)
      
      // Include the CSRF token in the redirectTo URL as a query parameter
      const redirectUrl = new URL(`${window.location.origin}/admin`)
      redirectUrl.searchParams.append('csrf_token', csrfToken)
      
      // Send a magic link to the admin email
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: redirectUrl.toString(),
          // You can also pass additional metadata if needed
          data: {
            csrf_protection: true
          }
        }
      })
      
      if (error) {
        setMessage('Failed to send login link')
        console.error('Login error:', error.message)
      } else {
        setMessage('Check your email for the login link!')
        setIsLinkSent(true)
        setCountdown(60)
      }
    } catch (err) {
      setMessage('An unexpected error occurred')
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
          <CardDescription className="text-center">Choose your preferred login method</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Card content remains the same */}
          <div className="space-y-2">
            <Button variant="outline" className="w-full">
              <Image src="/google-logo.svg" alt="Google" width={20} height={20} />
              Sign in with Google
            </Button>
            <Button variant="outline" className="w-full">
              <Image src="/microsoft-logo.svg" alt="Microsoft" width={20} height={20} />
              Sign in with Microsoft
            </Button>
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Email address
            </label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
            />
          </div>
          <Button 
            onClick={handleLogin} 
            className="w-full" 
            disabled={isLoading || !csrfToken || countdown > 0} 
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                Sending link...
              </>
            ) : (
              countdown > 0 
                ? `Wait ${countdown}s to resend` 
                : 'Send Magic Link'
            )}
          </Button>
          {message && <p className="text-center text-sm text-gray-500 mt-2">{message}</p>}
          {/* Hidden input field for CSRF token */}
          <input type="hidden" name="csrf_token" value={csrfToken} />
        </CardContent>
      </Card>
    </div>
  )
}
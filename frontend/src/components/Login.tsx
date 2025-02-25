import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/init"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function Login() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [isLinkSent, setIsLinkSent] = useState(false)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0 && isLinkSent) {
      setIsLinkSent(false)
    }
  }, [countdown, isLinkSent])

  async function handleLogin(e: React.MouseEvent<HTMLButtonElement>) {
    try {
      e.preventDefault()
      
      setIsLoading(true)
      
      const redirectUrl = new URL(`${window.location.origin}/admin`)
      
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: redirectUrl.toString(),
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
          <CardDescription className="text-center">Enter your email to receive a login link</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ml-2"
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
            disabled={isLoading || countdown > 0} 
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
        </CardContent>
      </Card>
    </div>
  )
}
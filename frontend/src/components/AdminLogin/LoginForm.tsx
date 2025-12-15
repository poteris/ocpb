"use client"

import { useState, useEffect } from 'react'
import { loginWithOtp } from './actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { z } from 'zod'

const emailSchema = z.string().email()

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [isLinkSent, setIsLinkSent] = useState(false)

  useEffect(() => {
    // Supabase allows only one login link per email address per minute
    // we  show a countdown to the user to prevent spam and better user experience
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0 && isLinkSent) {
      setIsLinkSent(false)
    }
  }, [countdown, isLinkSent])

  
  const handleLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    // Validate email before submission
    const validatedEmail = emailSchema.safeParse(email)
    if (!validatedEmail.success) {
      setMessage('Invalid email address')
      return
    }

    
    setIsLoading(true);
    
    try {
      // Create FormData from the email state
      const formData = new FormData();
      formData.append('email', validatedEmail.data);
      
      const { error } = await loginWithOtp(formData);
      
      if (error) {
        setMessage(error);
      } else {
        setMessage('Magic link sent! Check your email.');
        setIsLinkSent(true);
        setCountdown(60);
      }
    } catch (err) {
      setMessage('An error occurred. Please try again.');
      console.log('Login error:', err);
    } finally {
      setIsLoading(false);
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
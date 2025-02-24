'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState } from "react";

import { useRouter } from 'next/navigation';
import { supabase } from "@/lib/init";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      // Check if user has admin role
      const isAdmin = data.user?.user_metadata?.role === 'admin';
      
      if (!isAdmin) {
        throw new Error('Unauthorized');
      }

      // Successful admin login
      router.push('/admin');

    } catch (err) {
      setError('Invalid login credentials');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm space-y-6 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Admin Login
          </h1>
        </div>
        
        <form className="space-y-4" onSubmit={handleLogin}>
          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <Input 
              type="email"
              placeholder="Email"
              className="w-full"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <Input 
              type="password"
              placeholder="Password"
              className="w-full"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end">
            <Link 
              href="/" 
              className="text-sm font-medium text-blue-600 hover:text-blue-500 underline underline-offset-4"
            >
              Forgot Password?
            </Link>
          </div>

          <Button 
            className="w-full" 
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Log in'}
          </Button>
        </form>
      </div>
    </div>
  );
}

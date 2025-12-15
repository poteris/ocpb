"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface PasswordProtectionProps {
  children: React.ReactNode;
}

const PasswordModal: React.FC<{
  isOpen: boolean;
  onPasswordSubmit: (password: string) => void;
  error: string | null;
  loading: boolean;
}> = ({ isOpen, onPasswordSubmit, error, loading }) => {
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      onPasswordSubmit(password.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            🔐 Admin Access Required
          </h2>
          <p className="text-gray-600">
            Enter the admin password to access the evaluation dashboard
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              disabled={loading}
              autoFocus
              className={error ? "border-red-500" : ""}
            />
            {error && (
              <p className="text-red-600 text-sm mt-1">{error}</p>
            )}
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={loading || !password.trim()}
          >
            {loading ? "Verifying..." : "Access Dashboard"}
          </Button>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>This page is protected to ensure data privacy and security.</p>
        </div>
      </Card>
    </div>
  );
};

export const PasswordProtection: React.FC<PasswordProtectionProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = () => {
      const storedAuth = sessionStorage.getItem('evals_authenticated');
      const authTimestamp = sessionStorage.getItem('evals_auth_timestamp');
      
      if (storedAuth === 'true' && authTimestamp) {
        const authTime = parseInt(authTimestamp, 10);
        const now = Date.now();
        const authAge = now - authTime;
        
        // Session expires after 8 hours (8 * 60 * 60 * 1000 ms)
        if (authAge < 8 * 60 * 60 * 1000) {
          setIsAuthenticated(true);
          setShowModal(false);
        } else {
          // Session expired, clear storage
          sessionStorage.removeItem('evals_authenticated');
          sessionStorage.removeItem('evals_auth_timestamp');
          setShowModal(true);
        }
      } else {
        setShowModal(true);
      }
      
      setIsInitializing(false);
    };

    checkAuth();
  }, []);

  const verifyPassword = async (password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/evals/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const result = await response.json();

      if (response.ok && result.authenticated) {
        // Store authentication state
        sessionStorage.setItem('evals_authenticated', 'true');
        sessionStorage.setItem('evals_auth_timestamp', Date.now().toString());
        
        setIsAuthenticated(true);
        setShowModal(false);
        setError(null);
      } else {
        setError(result.error || 'Invalid password. Please try again.');
      }
    } catch (err) {
      setError('Failed to verify password. Please try again.');
      console.error('Password verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (isInitializing) {
    return (
      <div className="fixed inset-0 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PasswordModal
        isOpen={showModal}
        onPasswordSubmit={verifyPassword}
        error={error}
        loading={loading}
      />
      
      {isAuthenticated && children}
    </>
  );
};

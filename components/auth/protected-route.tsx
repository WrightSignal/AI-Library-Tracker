"use client"

import { useUser } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, LogIn } from 'lucide-react';
import { AuthLoading } from './loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, error, isLoading } = useUser();

  if (isLoading) {
    return <AuthLoading />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-warm-gray flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Authentication Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-stone-gray mb-4">{error.message}</p>
            <Button asChild>
              <a href="/api/auth/login">Try Again</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // For testing purposes, allow access to see the Auth0 login flow
  if (!user) {
    return (
      fallback || (
        <div className="min-h-screen bg-warm-gray flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center gap-2">
                <Lock className="h-5 w-5" />
                Test Auth0 Authentication
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-stone-gray">
                Auth0 is configured and ready to test. Click login to try the authentication flow.
              </p>
              <div className="bg-blue-50 p-3 rounded text-sm text-blue-800">
                This will redirect you to Auth0's login page where you can create an account or sign in.
              </div>
              <Button asChild className="w-full">
                <a href="/api/auth/login" className="flex items-center justify-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Test Auth0 Login
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    );
  }

  return <>{children}</>;
} 
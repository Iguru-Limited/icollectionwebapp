'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useCompanyTemplateStore } from '@/store/companyTemplateStore';
import { useAppStore } from '@/store/appStore';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Lock, Eye, EyeOff } from 'lucide-react';

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Attempt sign-in with NextAuth credentials provider
      const result = await signIn('credentials', {
        username,
        password,
        callbackUrl: '/user',
        redirect: false,
      });

      // Log the full sign-in response for debugging in the browser console
      console.log('Sign-in response:', result);

      if (result?.error) {
        console.error('Sign-in error:', result.error);
        setError('Invalid username or password');
      } else if (result?.ok) {
        // Fetch session to get company_template and printer
        const session = await getSession();
        console.log('Session after login:', session);

        // Persist company_template and printer from session to Zustand stores
        if (session?.company_template) {
          useCompanyTemplateStore.getState().setTemplate(session.company_template);
        }
        if (session?.user?.printer) {
          useAppStore.getState().setSelectedPrinter(session.user.printer);
        }

        // Redirect to /user page on successful login
        router.push('/user');
      }
    } catch {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn('flex flex-col gap-6 w-full max-w-sm mx-auto', className)} {...props}>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Welcome!</h1>
          <p className="text-gray-500 text-xl md:text-2xl">Please login in to continue.</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription className="text-xl">{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {/* Username Input */}
          <div className="relative">
            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-300 w-6 h-6" />
            <Input
              id="username"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
              className="pl-12 h-14 bg-purple-50 border-purple-100 rounded-full text-gray-700 text-xl placeholder:text-purple-300 focus:border-purple-400 focus:ring-purple-400"
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-300 w-6 h-6" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="pl-12 pr-12 h-14 bg-purple-50 border-purple-100 rounded-full text-gray-700 text-xl placeholder:text-purple-300 focus:border-purple-400 focus:ring-purple-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-300 hover:text-purple-500"
            >
              {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
            </button>
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            className="w-full h-14 bg-purple-700 hover:bg-purple-800 text-white rounded-full font-medium text-xl md:text-2xl"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </div>
      </form>

      {/* Footer */}
      <div className="text-center">
        <p className="text-gray-400 text-lg md:text-xl">©2025,iGuru Limited.All rights reserved</p>
      </div>
    </div>
  );
}

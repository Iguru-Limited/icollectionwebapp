'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useCompanyTemplateStore } from '@/store/companyTemplateStore';
import { useAppStore } from '@/store/appStore';
import { useRouter } from 'next/navigation';
// API_ENDPOINTS no longer needed here; we use internal proxy route
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

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
      // 1. Call internal proxy to perform server-side login (avoids CORS)
      const proxyResp = await fetch('/api/auth/raw-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const proxyJson = await proxyResp.json();
      console.log('Proxy login response:', proxyJson);

      if (!proxyResp.ok) {
        setError(proxyJson?.error || 'Invalid username or password');
        setIsLoading(false);
        return;
      }

      const auth = proxyJson.auth;
      if (!auth?.access_token || !auth?.user?.user_id) {
        setError('Malformed login response');
        setIsLoading(false);
        return;
      }

      // 2. Persist company_template directly (never enters NextAuth)
      if (proxyJson.company_template) {
        useCompanyTemplateStore.getState().setTemplate(proxyJson.company_template);
      }

      // 3. Persist printer directly
      if (auth.user?.printer) {
        useAppStore.getState().setSelectedPrinter(auth.user.printer);
      }

      // 4. Prepare stripped JSON for NextAuth signIn (no company_template)
      const raw_login_json = JSON.stringify(auth);

      // 5. Call NextAuth credentials provider with raw_login_json (skips second backend call)
      const result = await signIn('credentials', {
        raw_login_json,
        redirect: false,
        callbackUrl: '/user',
      });
      console.log('Sign-in result after raw_login_json:', result);

      if (result?.error) {
        setError('Authentication failed establishing session');
        setIsLoading(false);
        return;
      }

      // 6. Navigate to user dashboard
      router.push('/user');
    } catch (err) {
      console.error('Login process error:', err);
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
            <UserIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-300 w-6 h-6" />
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
            <LockClosedIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-300 w-6 h-6" />
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
              {showPassword ? <EyeSlashIcon className="w-6 h-6" /> : <EyeIcon className="w-6 h-6" />}
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

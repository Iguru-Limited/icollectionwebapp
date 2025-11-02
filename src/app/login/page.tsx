import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <div className="bg-gray-50 flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm md:max-w-md lg:max-w-lg">
        <LoginForm />
      </div>
    </div>
  );
}

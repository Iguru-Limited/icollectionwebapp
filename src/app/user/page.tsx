'use client';
import HomeTiles from '@/components/home/HomeTiles';

export default function UserPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 pb-20 md:pb-6 space-y-6 max-w-screen-xl">
        {/* Quick Actions tiles */}
        <HomeTiles />       
      </div>
    </div>
  );
}

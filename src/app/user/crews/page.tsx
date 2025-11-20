"use client";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { PageContainer, PageHeader } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';

// Categories landing page showing counts per crew role from session.stats
export default function CrewCategoriesPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const roleStats = session?.stats?.crew?.roles || [];

  const toPlural = (roleName: string) => {
    const proper = roleName.charAt(0) + roleName.slice(1).toLowerCase();
    // Simple plural: add s if count != 1
    return proper + 's';
  };

  return (
    <PageContainer>
      <PageHeader title="Crew" />
      <main className="px-4 pb-24 max-w-md mx-auto">
        <div className="grid grid-cols-1 gap-4">
          {roleStats.map((r) => {
            const count = parseInt(String(r.count), 10) || 0;
            const slug = r.role_name.toLowerCase(); // e.g. CONDUCTOR -> conductor
            return (
              <Card
                key={r.crew_role_id}
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/user/crews/roles/${slug}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    router.push(`/user/crews/roles/${slug}`);
                  }
                }}
                className="cursor-pointer rounded-full border-gray-200 hover:shadow-md transition-shadow"
              >
                <CardContent className="py-4 px-6 flex items-center justify-between">
                  <span className="font-semibold text-gray-800 text-lg">{`${toPlural(r.role_name)} (${count})`}</span>
                  <span className="text-sm text-gray-500">View</span>
                </CardContent>
              </Card>
            );
          })}
          {roleStats.length === 0 && (
            <div className="text-center text-gray-500 py-12">No crew role statistics available.</div>
          )}
        </div>
      </main>
    </PageContainer>
  );
}

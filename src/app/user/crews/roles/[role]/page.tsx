"use client";
import { useParams } from 'next/navigation';
import { PageContainer, PageHeader, SearchBar } from '@/components/layout';
import { useCrews } from '@/hooks/crew';
import { CrewList } from '@/components/crews';
import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';

export default function CrewRolePage() {
  const params = useParams();
  const roleParam = (params?.role as string)?.toUpperCase(); // e.g. CONDUCTOR
  const singular = roleParam?.charAt(0) + roleParam?.slice(1).toLowerCase();
  const pluralLabel = singular + 's';
  const [q, setQ] = useState('');
  const [visibleCount, setVisibleCount] = useState(20); // Lazy load: show 20 items at a time

  const { data: crewsResponse, isLoading, error } = useCrews();
  const filtered = useMemo(() => {
    const crews = crewsResponse?.data || [];
    return crews.filter(c =>
      c.role_name?.toUpperCase() === roleParam &&
      (c.name?.toLowerCase().includes(q.toLowerCase()) ||
       c.badge_number?.toLowerCase().includes(q.toLowerCase()) ||
       c.phone?.toLowerCase().includes(q.toLowerCase()))
    );
  }, [crewsResponse?.data, roleParam, q]);

  // Lazy load: only display first visibleCount items
  const displayedCrews = useMemo(() => {
    return filtered.slice(0, visibleCount);
  }, [filtered, visibleCount]);

  const hasMore = filtered.length > visibleCount;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 20);
  };

  return (
    <PageContainer>
      <PageHeader title={pluralLabel} backHref = '/user/crews' />
      <main className="px-4 pb-24 max-w-screen-xl mx-auto space-y-4">
        {/* Loading Skeleton */}
        {isLoading && (
          <div className="space-y-4">
            {/* Search Bar Skeleton */}
            <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg animate-pulse" />
            {/* List Skeleton */}
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        )}

        {/* Content - Rendered when data is loaded */}
        {!isLoading && (
          <>
            <SearchBar
              value={q}
              onChange={setQ}
              placeholder={`Search ${pluralLabel} by Name, Badge No, or Phone...`}
            />

            {error ? (
              <div className="text-center text-red-600 py-8">Error loading crews: {error.message}</div>
            ) : (
              <>
                {/* Crew List with Lazy Loading */}
                <CrewList crews={displayedCrews} isLoading={false} />

                {/* Load More Button */}
                {hasMore && (
                  <div className="flex justify-center py-4">
                    <button
                      onClick={handleLoadMore}
                      className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Load More ({visibleCount} of {filtered.length})
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>
    </PageContainer>
  );
}

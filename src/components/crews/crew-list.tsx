import type { Crew } from '@/types/crew';
import { useRouter } from 'next/navigation';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface CrewListProps {
  crews: Crew[];
  isLoading?: boolean;
}

export function CrewList({ crews, isLoading }: CrewListProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (crews.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No crew members found</EmptyTitle>
          <EmptyDescription>Try adjusting your search or filter criteria</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'C';
  };

  const isExpired = (expiryDate: string | null) => {
    return expiryDate ? new Date(expiryDate) < new Date() : false;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="rounded-lg border bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]">Thumbnail</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Badge No.</TableHead>
            <TableHead>Badge Expiry</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {crews.map((crew) => (
            <TableRow 
              key={crew.crew_id}
              className="cursor-pointer"
              onClick={() => router.push(`/user/crews/${crew.crew_id}`)}
            >
              <TableCell>
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                    {getInitials(crew.name)}
                  </AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell className="font-medium">{crew.name}</TableCell>
              <TableCell className="font-mono text-sm">{crew.badge_number || '-'}</TableCell>
              <TableCell>
                <span className={isExpired(crew.badge_expiry) ? 'text-red-600 font-semibold' : 'text-gray-900'}>
                  {formatDate(crew.badge_expiry)}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

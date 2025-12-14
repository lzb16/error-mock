import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const METHOD_COLORS: Record<string, string> = {
  GET: 'em:bg-blue-100 em:text-blue-800',
  POST: 'em:bg-green-100 em:text-green-800',
  PUT: 'em:bg-orange-100 em:text-orange-800',
  DELETE: 'em:bg-red-100 em:text-red-800',
  PATCH: 'em:bg-purple-100 em:text-purple-800',
};

const DEFAULT_METHOD_COLOR = 'em:bg-gray-100 em:text-gray-800';

interface MethodBadgeProps {
  method: string;
  className?: string;
}

export function MethodBadge({ method, className }: MethodBadgeProps) {
  const upperMethod = method.toUpperCase();

  return (
    <Badge
      variant="secondary"
      className={cn(
        'em:flex-shrink-0 em:text-[10px] em:font-bold',
        METHOD_COLORS[upperMethod] || DEFAULT_METHOD_COLOR,
        className
      )}
    >
      {upperMethod}
    </Badge>
  );
}

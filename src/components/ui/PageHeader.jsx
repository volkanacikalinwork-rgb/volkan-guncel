import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function PageHeader({ title, subtitle, action, onAction, actionIcon: ActionIcon = Plus }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold font-jakarta text-foreground">{title}</h1>
        {subtitle && <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>}
      </div>
      {action && (
        <Button onClick={onAction} className="gap-2 gradient-primary text-white border-0 hover:opacity-90">
          <ActionIcon className="w-4 h-4" />
          {action}
        </Button>
      )}
    </div>
  );
}
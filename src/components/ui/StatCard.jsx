import { cn } from '@/lib/utils';

export default function StatCard({ title, value, icon: Icon, color, trend, trendLabel }) {
  const colorMap = {
    violet: 'bg-[hsl(246,83%,62%)/10] text-[hsl(246,83%,62%)] border-[hsl(246,83%,62%)/20]',
    purple: 'bg-[hsl(262,83%,58%)/10] text-[hsl(262,83%,58%)] border-[hsl(262,83%,58%)/20]',
    cyan: 'bg-[hsl(192,91%,52%)/10] text-[hsl(192,91%,52%)] border-[hsl(192,91%,52%)/20]',
    emerald: 'bg-[hsl(160,84%,39%)/10] text-[hsl(160,84%,39%)] border-[hsl(160,84%,39%)/20]',
    amber: 'bg-[hsl(38,92%,50%)/10] text-[hsl(38,92%,50%)] border-[hsl(38,92%,50%)/20]',
    rose: 'bg-[hsl(346,77%,49%)/10] text-[hsl(346,77%,49%)] border-[hsl(346,77%,49%)/20]',
  };

  const gradMap = {
    violet: 'from-[hsl(246,83%,62%)] to-[hsl(262,83%,58%)]',
    purple: 'from-[hsl(262,83%,58%)] to-[hsl(280,83%,58%)]',
    cyan: 'from-[hsl(192,91%,52%)] to-[hsl(206,91%,52%)]',
    emerald: 'from-[hsl(160,84%,39%)] to-[hsl(145,84%,39%)]',
    amber: 'from-[hsl(38,92%,50%)] to-[hsl(28,92%,50%)]',
    rose: 'from-[hsl(346,77%,49%)] to-[hsl(330,77%,49%)]',
  };

  return (
    <div className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          "w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br",
          gradMap[color] || gradMap.violet
        )}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend !== undefined && (
          <span className={cn(
            "text-xs font-semibold px-2 py-0.5 rounded-full",
            trend > 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
          )}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold font-jakarta text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{title}</p>
      {trendLabel && <p className="text-xs text-muted-foreground mt-1">{trendLabel}</p>}
    </div>
  );
}
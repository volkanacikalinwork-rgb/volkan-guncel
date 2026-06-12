import { Bell, Search, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';

export default function TopBar() {
  return (
    <header className="h-16 bg-card border-b border-border flex items-center gap-4 px-6 sticky top-0 z-40">
      <div className="flex-1 max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Ara..."
            className="pl-9 h-9 bg-muted border-0 text-sm"
          />
        </div>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-xs"
          onClick={() => window.open('https://propertiesforsaleturkey.com', '_blank')}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Siteyi Görüntüle
        </Button>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-4.5 h-4.5 w-5 h-5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => base44.auth.logout()}
          className="text-xs"
        >
          Çıkış
        </Button>
      </div>
    </header>
  );
}
import { ALL_FEATURES } from '@/lib/constants';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function FeaturesSelector({ selected = [], onChange }) {
  const [search, setSearch] = useState('');

  const filtered = ALL_FEATURES.filter(f =>
    f.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (feature) => {
    if (selected.includes(feature)) {
      onChange(selected.filter(f => f !== feature));
    } else {
      onChange([...selected, feature]);
    }
  };

  return (
    <div>
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Özellik ara..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
          {selected.map(f => (
            <button
              key={f}
              type="button"
              onClick={() => toggle(f)}
              className="text-xs bg-primary text-white px-2.5 py-1 rounded-full hover:bg-primary/80 transition-colors"
            >
              {f} ×
            </button>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-1.5 max-h-64 overflow-y-auto pr-1">
        {filtered.map(f => {
          const isSelected = selected.includes(f);
          return (
            <button
              key={f}
              type="button"
              onClick={() => toggle(f)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                isSelected
                  ? 'bg-primary text-white border-primary'
                  : 'bg-background text-muted-foreground border-border hover:border-primary hover:text-primary'
              }`}
            >
              {f}
            </button>
          );
        })}
      </div>
    </div>
  );
}
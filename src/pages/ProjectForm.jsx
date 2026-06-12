import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const defaultForm = {
  title: '', slug: '', status: 'draft', city: 'istanbul', district: '', developer: '',
  completion_date: '', min_price: '', max_price: '', currency: 'USD',
  total_units: '', available_units: '', description: '', main_image: '',
  citizenship_eligible: false, featured: false,
  seo_title: '', seo_description: '', seo_keywords: ''
};

export default function ProjectForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = id === 'new';
  const [form, setForm] = useState(defaultForm);

  const { data: project } = useQuery({
    queryKey: ['project', id],
    queryFn: () => base44.entities.Project.filter({ id }),
    enabled: !isNew
  });

  useEffect(() => {
    if (project?.[0]) setForm({ ...defaultForm, ...project[0] });
  }, [project]);

  const mutation = useMutation({
    mutationFn: (data) => isNew
      ? base44.entities.Project.create(data)
      : base44.entities.Project.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success(isNew ? 'Proje oluşturuldu!' : 'Proje güncellendi!');
      navigate('/projects');
    }
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...form };
    ['min_price', 'max_price', 'total_units', 'available_units'].forEach(k => {
      if (data[k] !== '') data[k] = Number(data[k]);
    });
    mutation.mutate(data);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/projects"><Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div>
          <h1 className="text-xl font-bold font-jakarta">{isNew ? 'Yeni Proje' : 'Projeyi Düzenle'}</h1>
          <p className="text-sm text-muted-foreground">{form.title || 'Proje adı'}</p>
        </div>
        <Button onClick={handleSubmit} disabled={mutation.isPending} className="ml-auto gap-2 gradient-primary text-white border-0 hover:opacity-90">
          {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Kaydet
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6">
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-semibold font-jakarta mb-4">Proje Bilgileri</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>Proje Adı *</Label>
              <Input value={form.title} onChange={e => set('title', e.target.value)} className="mt-1.5" required />
            </div>
            <div>
              <Label>Durum</Label>
              <Select value={form.status} onValueChange={v => set('status', v)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Taslak</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="upcoming">Yakında</SelectItem>
                  <SelectItem value="completed">Tamamlandı</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Şehir</Label>
              <Select value={form.city} onValueChange={v => set('city', v)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['istanbul','antalya','fethiye','bodrum','ankara','izmir','alanya','other'].map(c => (
                    <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>İlçe</Label>
              <Input value={form.district} onChange={e => set('district', e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label>Geliştirici</Label>
              <Input value={form.developer} onChange={e => set('developer', e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label>Bitiş Tarihi</Label>
              <Input type="date" value={form.completion_date} onChange={e => set('completion_date', e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label>Min. Fiyat</Label>
              <Input type="number" value={form.min_price} onChange={e => set('min_price', e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label>Max. Fiyat</Label>
              <Input type="number" value={form.max_price} onChange={e => set('max_price', e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label>Para Birimi</Label>
              <Select value={form.currency} onValueChange={v => set('currency', v)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['USD','EUR','GBP','TRY'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Toplam Ünite</Label>
              <Input type="number" value={form.total_units} onChange={e => set('total_units', e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label>Mevcut Ünite</Label>
              <Input type="number" value={form.available_units} onChange={e => set('available_units', e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label>Ana Görsel URL</Label>
              <Input value={form.main_image} onChange={e => set('main_image', e.target.value)} className="mt-1.5" placeholder="https://..." />
            </div>
            <div className="md:col-span-2">
              <Label>Açıklama</Label>
              <Textarea value={form.description} onChange={e => set('description', e.target.value)} className="mt-1.5 min-h-[100px]" />
            </div>
          </div>
          <div className="flex flex-wrap gap-6 mt-4">
            {[{ key: 'featured', label: 'Öne Çıkan' }, { key: 'citizenship_eligible', label: 'Vatandaşlık Uygun' }].map(({ key, label }) => (
              <div key={key} className="flex items-center gap-2.5">
                <Switch checked={!!form[key]} onCheckedChange={v => set(key, v)} />
                <Label>{label}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-semibold font-jakarta mb-4">SEO</h2>
          <div className="space-y-4">
            <div>
              <Label>SEO Başlığı</Label>
              <Input value={form.seo_title} onChange={e => set('seo_title', e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label>Meta Açıklama</Label>
              <Textarea value={form.seo_description} onChange={e => set('seo_description', e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label>Anahtar Kelimeler</Label>
              <Input value={form.seo_keywords} onChange={e => set('seo_keywords', e.target.value)} className="mt-1.5" />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
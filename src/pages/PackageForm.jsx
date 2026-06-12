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
  title: '', slug: '', status: 'draft', type: 'citizenship',
  total_price: '', currency: 'USD', description: '', main_image: '',
  number_of_properties: '', featured: false,
  seo_title: '', seo_description: ''
};

export default function PackageForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = id === 'new';
  const [form, setForm] = useState(defaultForm);

  const { data: pkg } = useQuery({
    queryKey: ['package', id],
    queryFn: () => base44.entities.Package.filter({ id }),
    enabled: !isNew
  });

  useEffect(() => {
    if (pkg?.[0]) setForm({ ...defaultForm, ...pkg[0] });
  }, [pkg]);

  const mutation = useMutation({
    mutationFn: (data) => isNew
      ? base44.entities.Package.create(data)
      : base44.entities.Package.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      toast.success(isNew ? 'Paket oluşturuldu!' : 'Paket güncellendi!');
      navigate('/packages');
    }
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...form };
    ['total_price', 'number_of_properties'].forEach(k => {
      if (data[k] !== '') data[k] = Number(data[k]);
    });
    mutation.mutate(data);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/packages"><Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div>
          <h1 className="text-xl font-bold font-jakarta">{isNew ? 'Yeni Paket' : 'Paketi Düzenle'}</h1>
          <p className="text-sm text-muted-foreground">{form.title || 'Paket adı'}</p>
        </div>
        <Button onClick={handleSubmit} disabled={mutation.isPending} className="ml-auto gap-2 gradient-primary text-white border-0 hover:opacity-90">
          {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Kaydet
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6">
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-semibold font-jakarta mb-4">Paket Bilgileri</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>Paket Adı *</Label>
              <Input value={form.title} onChange={e => set('title', e.target.value)} className="mt-1.5" required />
            </div>
            <div>
              <Label>Tip</Label>
              <Select value={form.type} onValueChange={v => set('type', v)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="citizenship">Vatandaşlık</SelectItem>
                  <SelectItem value="residency">İkamet</SelectItem>
                  <SelectItem value="investment">Yatırım</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Durum</Label>
              <Select value={form.status} onValueChange={v => set('status', v)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Taslak</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="sold_out">Tükendi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Toplam Fiyat *</Label>
              <Input type="number" value={form.total_price} onChange={e => set('total_price', e.target.value)} className="mt-1.5" required />
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
              <Label>Mülk Sayısı</Label>
              <Input type="number" value={form.number_of_properties} onChange={e => set('number_of_properties', e.target.value)} className="mt-1.5" />
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
          <div className="flex items-center gap-2.5 mt-4">
            <Switch checked={!!form.featured} onCheckedChange={v => set('featured', v)} />
            <Label>Öne Çıkan Paket</Label>
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
          </div>
        </div>
      </form>
    </div>
  );
}
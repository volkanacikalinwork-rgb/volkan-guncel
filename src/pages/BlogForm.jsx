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
import ReactQuill from 'react-quill';
import SeoAutoFill from '@/components/seo/SeoAutoFill';

const defaultForm = {
  title: '', slug: '', type: 'blog', status: 'draft', category: 'market-news',
  author: '', excerpt: '', content: '', main_image: '', featured: false,
  published_date: '', reading_time_min: '',
  seo_title: '', seo_description: '', seo_keywords: ''
};

export default function BlogForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = id === 'new';
  const [form, setForm] = useState(defaultForm);
  const [activeTab, setActiveTab] = useState('general');

  const { data: post } = useQuery({
    queryKey: ['post', id],
    queryFn: () => base44.entities.BlogPost.filter({ id }),
    enabled: !isNew
  });

  useEffect(() => {
    if (post?.[0]) setForm({ ...defaultForm, ...post[0] });
  }, [post]);

  const mutation = useMutation({
    mutationFn: (data) => isNew
      ? base44.entities.BlogPost.create(data)
      : base44.entities.BlogPost.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success(isNew ? 'İçerik oluşturuldu!' : 'İçerik güncellendi!');
      navigate('/blog');
    }
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...form };
    if (data.reading_time_min) data.reading_time_min = Number(data.reading_time_min);
    mutation.mutate(data);
  };

  const tabs = [
    { id: 'general', label: 'Genel' },
    { id: 'content', label: 'İçerik' },
    { id: 'seo', label: 'SEO' },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/blog">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold font-jakarta">{isNew ? 'Yeni İçerik' : 'İçeriği Düzenle'}</h1>
          <p className="text-sm text-muted-foreground">{form.title || 'İçerik başlığı'}</p>
        </div>
        <Button onClick={handleSubmit} disabled={mutation.isPending} className="ml-auto gap-2 gradient-primary text-white border-0 hover:opacity-90">
          {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Kaydet
        </Button>
      </div>

      <div className="flex gap-1 bg-muted p-1 rounded-lg mb-6 w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === t.id ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {activeTab === 'general' && (
          <div className="grid gap-6">
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="font-semibold font-jakarta mb-4">Temel Bilgiler</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Başlık *</Label>
                  <Input value={form.title} onChange={e => set('title', e.target.value)} className="mt-1.5" required />
                </div>
                <div>
                  <Label>Tip</Label>
                  <Select value={form.type} onValueChange={v => set('type', v)}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blog">Blog</SelectItem>
                      <SelectItem value="news">Haber</SelectItem>
                      <SelectItem value="guide">Turkey Guide</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Durum</Label>
                  <Select value={form.status} onValueChange={v => set('status', v)}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Taslak</SelectItem>
                      <SelectItem value="published">Yayında</SelectItem>
                      <SelectItem value="archived">Arşiv</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Kategori</Label>
                  <Select value={form.category} onValueChange={v => set('category', v)}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['market-news','investment','citizenship','residency','lifestyle','legal','city-guides','other'].map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Yazar</Label>
                  <Input value={form.author} onChange={e => set('author', e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <Label>Yayın Tarihi</Label>
                  <Input type="date" value={form.published_date} onChange={e => set('published_date', e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <Label>Okuma Süresi (dk)</Label>
                  <Input type="number" value={form.reading_time_min} onChange={e => set('reading_time_min', e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <Label>URL Slug</Label>
                  <Input value={form.slug} onChange={e => set('slug', e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <Label>Ana Görsel URL</Label>
                  <Input value={form.main_image} onChange={e => set('main_image', e.target.value)} className="mt-1.5" placeholder="https://..." />
                </div>
                <div className="md:col-span-2">
                  <Label>Özet</Label>
                  <Textarea value={form.excerpt} onChange={e => set('excerpt', e.target.value)} className="mt-1.5" />
                </div>
              </div>
              <div className="flex items-center gap-2.5 mt-4">
                <Switch checked={!!form.featured} onCheckedChange={v => set('featured', v)} />
                <Label>Öne Çıkan İçerik</Label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-semibold font-jakarta mb-4">İçerik Editörü</h2>
            <ReactQuill
              value={form.content}
              onChange={val => set('content', val)}
              className="min-h-[400px]"
              theme="snow"
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, 3, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                  ['link', 'image'],
                  ['clean']
                ]
              }}
            />
          </div>
        )}

        {activeTab === 'seo' && (
          <div className="bg-card rounded-xl border border-border p-6">
            <SeoAutoFill
              title={form.title}
              description={form.excerpt}
              city={null}
              type={form.type}
              price={null}
              currency={null}
              form={form}
              onUpdate={(updates) => setForm(f => ({ ...f, ...updates }))}
            />
          </div>
        )}
      </form>
    </div>
  );
}
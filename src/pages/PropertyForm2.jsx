import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, Loader2, ShieldCheck, Coins, LayoutGrid, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import FeaturesSelector from '@/components/property/FeaturesSelector';
import SeoAutoFill from '@/components/seo/SeoAutoFill';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'TRY'];

export default function PropertyForm2() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('specs');

  const [form, setForm] = useState({
    title: '', slug: '', type: 'apartment', sub_type: '',
    price: '', currency: 'USD', bedrooms: '', bathrooms: '', size_sqm: '',
    sea_view: false, seafront: false, citizenship_eligible: false, residency_eligible: false,
    description: '', features: [], main_image: '', featured: false,
    floor_number: '',
    // Proje Detayları Eklenen Alanlar
    construction_year: '', total_sqm: '', block_count: '', floor_count: '',
    developer_company: '', list_link_1: '', list_link_2: '',
    payment_down: 100, payment_under_construction: 0, payment_delivery: 0, payment_installment: 0
  });

  const { data: propertyData, isLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: () => base44.entities.Property.filter({ id }),
    enabled: !!id,
  });

  const { data: propertyTypes = [] } = useQuery({
    queryKey: ['property-types'],
    queryFn: () => base44.entities.PropertyType.list('order'),
  });

  useEffect(() => {
    if (propertyData?.[0]) {
      setForm(prev => ({ ...prev, ...propertyData[0] }));
    }
  }, [propertyData]);

  const mutation = useMutation({
    mutationFn: (data) => base44.entities.Property.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Mülk portföy detayları başarıyla tamamlandı ve mühürlendi! ☁️');
      navigate('/properties');
    },
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...form };
    if (data.price) data.price = Number(data.price);
    if (data.bedrooms) data.bedrooms = Number(data.bedrooms);
    if (data.bathrooms) data.bathrooms = Number(data.bathrooms);
    if (data.size_sqm) data.size_sqm = Number(data.size_sqm);
    if (data.floor_number) data.floor_number = Number(data.floor_number);
    if (data.total_sqm) data.total_sqm = Number(data.total_sqm);
    if (data.block_count) data.block_count = Number(data.block_count);
    if (data.floor_count) data.floor_count = Number(data.floor_count);
    if (data.payment_down) data.payment_down = Number(data.payment_down);
    if (data.payment_under_construction) data.payment_under_construction = Number(data.payment_under_construction);
    if (data.payment_delivery) data.payment_delivery = Number(data.payment_delivery);
    if (data.payment_installment) data.payment_installment = Number(data.payment_installment);
    
    if (!data.title) data.title = data.seo_title || data.project_name || 'Gayrimenkul Portföyü';

    mutation.mutate(data);
  };

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
    </div>
  );

  const selectedTypeObj = propertyTypes.find(t => t.slug === form.type);
  const subTypeOptions = selectedTypeObj?.sub_types || [];

  const tabs = [
    { id: 'specs', label: '🛏️ Yapı & Fiyat' },
    { id: 'features', label: '✨ Özellik Seçimi' },
    { id: 'desc', label: '📄 Detaylı İlan Metni' },
    { id: 'seo', label: '🔍 SEO Yapılandırma' },
  ];

  const totalPayment = (Number(form.payment_down) || 0) + (Number(form.payment_under_construction) || 0) + (Number(form.payment_delivery) || 0) + (Number(form.payment_installment) || 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-border rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <Link to={`/properties/${id}`}>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-700">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold font-jakarta text-foreground">Hızlı Portföy Ekleme - Adım 2</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ref No: <span className="font-mono font-bold text-primary">{form.property_ref || 'Atanmadı'}</span> · Proje: {form.project_name || 'Belirtilmedi'}
            </p>
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={mutation.isPending} className="sm:ml-auto gap-2 gradient-primary text-white border-0 hover:opacity-90 px-6 h-10 rounded-xl shadow-sm">
          {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Portföyü Yayına Al
        </Button>
      </div>

      <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit border border-border">
        {tabs.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === t.id 
                ? 'bg-white text-foreground shadow-xs' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {activeTab === 'specs' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card rounded-xl border border-border p-5 space-y-4">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                  <LayoutGrid className="w-4 h-4 text-primary" /> Yapısal Sınıflandırma
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Mülk Ana Tipi</Label>
                    <Select value={form.type || 'apartment'} onValueChange={v => { set('type', v); set('sub_type', ''); }}>
                      <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {propertyTypes.filter(t => t.is_active).map(t => (
                          <SelectItem key={t.slug} value={t.slug}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Alt Mülk Tipi (Sub-type)</Label>
                    <Select value={form.sub_type || ''} onValueChange={v => set('sub_type', v)} disabled={subTypeOptions.length === 0}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder="Alt tip seçin..." /></SelectTrigger>
                      <SelectContent>
                        {subTypeOptions.map(st => (
                          <SelectItem key={st} value={st}>{st}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-5 space-y-4">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                  <Coins className="w-4 h-4 text-primary" /> Fiyat ve Metraj Detayları
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs">Başlangıç Fiyatı</Label>
                    <Input type="number" value={form.price || ''} onChange={e => set('price', e.target.value)} className="mt-1.5" placeholder="0" />
                  </div>
                  <div>
                    <Label className="text-xs">Para Birimi</Label>
                    <Select value={form.currency || 'USD'} onValueChange={v => set('currency', v)}>
                      <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Toplam Net Alan (m²)</Label>
                    <Input type="number" value={form.size_sqm || ''} onChange={e => set('size_sqm', e.target.value)} className="mt-1.5" placeholder="0" />
                  </div>
                  <div>
                    <Label className="text-xs">Yatak Odası Sayısı</Label>
                    <Input type="number" value={form.bedrooms || ''} onChange={e => set('bedrooms', e.target.value)} className="mt-1.5" placeholder="Örn: 2" />
                  </div>
                  <div>
                    <Label className="text-xs">Banyo Sayısı</Label>
                    <Input type="number" value={form.bathrooms || ''} onChange={e => set('bathrooms', e.target.value)} className="mt-1.5" placeholder="Örn: 1" />
                  </div>
                  <div>
                    <Label className="text-xs">Bulunduğu Kat</Label>
                    <Input type="number" value={form.floor_number || ''} onChange={e => set('floor_number', e.target.value)} className="mt-1.5" placeholder="Örn: 3" />
                  </div>
                </div>
              </div>

              {/* YENİ: Proje Detayları */}
              <div className="bg-card rounded-xl border border-border p-5 space-y-5">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                  <Building2 className="w-4 h-4 text-primary" /> Proje Detayları
                </h3>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">📅 İNŞAAT YILI *</Label>
                    <Input type="text" value={form.construction_year || ''} onChange={e => set('construction_year', e.target.value)} className="mt-1.5 border-emerald-200 focus-visible:ring-emerald-500" placeholder="06/2026" />
                  </div>
                  <div>
                    <Label className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">📐 TOPLAM M²</Label>
                    <div className="relative mt-1.5">
                      <Input type="number" value={form.total_sqm || ''} onChange={e => set('total_sqm', e.target.value)} className="border-emerald-200 focus-visible:ring-emerald-500 pr-8" placeholder="3" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">m²</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">🏢 BLOK SAYISI *</Label>
                    <Input type="number" value={form.block_count || ''} onChange={e => set('block_count', e.target.value)} className="mt-1.5 border-emerald-200 focus-visible:ring-emerald-500" placeholder="1" />
                  </div>
                  <div>
                    <Label className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">🏢 KAT SAYISI *</Label>
                    <Input type="number" value={form.floor_count || ''} onChange={e => set('floor_count', e.target.value)} className="mt-1.5 border-emerald-200 focus-visible:ring-emerald-500" placeholder="2" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <Label className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">👷 GELİŞTİRİCİ ŞİRKET *</Label>
                    <Input type="text" value={form.developer_company || ''} onChange={e => set('developer_company', e.target.value)} className="mt-1.5 border-emerald-200 focus-visible:ring-emerald-500" placeholder="Firma Adı" />
                  </div>
                  <div>
                    <Label className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">🔗 LİSTE LİNKİ 1 *</Label>
                    <Input type="text" value={form.list_link_1 || ''} onChange={e => set('list_link_1', e.target.value)} className="mt-1.5 border-emerald-200 focus-visible:ring-emerald-500" placeholder="1" />
                  </div>
                  <div>
                    <Label className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">🔗 LİSTE LİNKİ 2 *</Label>
                    <Input type="text" value={form.list_link_2 || ''} onChange={e => set('list_link_2', e.target.value)} className="mt-1.5 border-emerald-200 focus-visible:ring-emerald-500" placeholder="1" />
                  </div>
                </div>

                {/* Ödeme Planı Yapılandırma */}
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-5 mt-4 space-y-4">
                  <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                    <Label className="text-xs font-bold text-gray-800 flex items-center gap-2">💳 Ödeme Planı Yapılandırma *</Label>
                    <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${totalPayment === 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      TOPLAM: %{totalPayment}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-3 border border-emerald-200 text-center">
                      <Label className="text-[10px] font-bold text-emerald-600 mb-1 block">PEŞİNAT</Label>
                      <div className="flex items-center justify-center gap-1">
                        <Input type="number" min="0" max="100" value={form.payment_down ?? ''} onChange={e => set('payment_down', e.target.value)} className="w-16 h-8 text-center font-bold border-0 bg-transparent focus-visible:ring-0 shadow-none text-lg p-0" />
                        <span className="text-lg font-bold text-gray-700">%</span>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-100 text-center hover:border-emerald-200 transition-colors">
                      <Label className="text-[10px] font-bold text-gray-400 mb-1 block">İNŞAAT ALTI</Label>
                      <div className="flex items-center justify-center gap-1">
                        <Input type="number" min="0" max="100" value={form.payment_under_construction ?? ''} onChange={e => set('payment_under_construction', e.target.value)} className="w-16 h-8 text-center font-bold border-0 bg-transparent focus-visible:ring-0 shadow-none text-lg p-0 text-gray-500" />
                        <span className="text-lg font-bold text-gray-400">%</span>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-100 text-center hover:border-emerald-200 transition-colors">
                      <Label className="text-[10px] font-bold text-gray-400 mb-1 block">TESLİMATTA</Label>
                      <div className="flex items-center justify-center gap-1">
                        <Input type="number" min="0" max="100" value={form.payment_delivery ?? ''} onChange={e => set('payment_delivery', e.target.value)} className="w-16 h-8 text-center font-bold border-0 bg-transparent focus-visible:ring-0 shadow-none text-lg p-0 text-gray-500" />
                        <span className="text-lg font-bold text-gray-400">%</span>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-100 text-center hover:border-emerald-200 transition-colors">
                      <Label className="text-[10px] font-bold text-gray-400 mb-1 block">VADE</Label>
                      <div className="flex items-center justify-center gap-1">
                        <Input type="number" min="0" max="100" value={form.payment_installment ?? ''} onChange={e => set('payment_installment', e.target.value)} className="w-16 h-8 text-center font-bold border-0 bg-transparent focus-visible:ring-0 shadow-none text-lg p-0 text-gray-500" />
                        <span className="text-lg font-bold text-gray-400">%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <div className="flex items-center justify-between text-[10px] font-bold text-gray-500">
                      <span>DAĞILIM İLERLEMESİ</span>
                      <span className={totalPayment !== 100 ? 'text-rose-500' : 'text-emerald-600'}>%{totalPayment} / %100</span>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden flex">
                      <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${Math.min(form.payment_down || 0, 100)}%` }} title="Peşinat"></div>
                      <div className="h-full bg-teal-400 transition-all duration-300" style={{ width: `${Math.min(form.payment_under_construction || 0, 100)}%` }} title="İnşaat Altı"></div>
                      <div className="h-full bg-cyan-400 transition-all duration-300" style={{ width: `${Math.min(form.payment_delivery || 0, 100)}%` }} title="Teslimatta"></div>
                      <div className="h-full bg-blue-400 transition-all duration-300" style={{ width: `${Math.min(form.payment_installment || 0, 100)}%` }} title="Vade"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-5 space-y-4">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                  <ShieldCheck className="w-4 h-4 text-primary" /> Durum &amp; Regülasyon
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs cursor-pointer" htmlFor="citizenship">🇹🇷 Türk Vatandaşlığına Uygun</Label>
                    <Switch id="citizenship" checked={!!form.citizenship_eligible} onCheckedChange={v => set('citizenship_eligible', v)} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs cursor-pointer" htmlFor="residency">🪪 İkamet İznine Uygun</Label>
                    <Switch id="residency" checked={!!form.residency_eligible} onCheckedChange={v => set('residency_eligible', v)} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs cursor-pointer" htmlFor="seaview">🌊 Deniz Manzaralı</Label>
                    <Switch id="seaview" checked={!!form.sea_view} onCheckedChange={v => set('sea_view', v)} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs cursor-pointer" htmlFor="seafront">🏖️ Denize Sıfır</Label>
                    <Switch id="seafront" checked={!!form.seafront} onCheckedChange={v => set('seafront', v)} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs cursor-pointer" htmlFor="featured">⭐ Öne Çıkan Vitrin İlanı</Label>
                    <Switch id="featured" checked={!!form.featured} onCheckedChange={v => set('featured', v)} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'features' && (
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="mb-4">
              <h2 className="font-semibold font-jakarta text-foreground">Sosyal Donatılar ve İlan Özellikleri</h2>
              <p className="text-xs text-muted-foreground mt-0.5">propertiesforsaleturkey.com filtre altyapısı için listeden seçim yapın</p>
            </div>
            <FeaturesSelector selected={form.features || []} onChange={v => set('features', v)} />
          </div>
        )}

        {activeTab === 'desc' && (
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <div>
              <h2 className="font-semibold font-jakarta text-foreground">Detaylı Gayrimenkul Tanıtım Metni</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Zengin metin editörünü kullanarak profesyonel HTML açıklama metni hazırlayın</p>
            </div>
            
            <div className="space-y-2">
              <Label>Vitrin İlan Başlığı</Label>
              <Input value={form.title || ''} onChange={e => set('title', e.target.value)} placeholder="Örn: Luxury 2+1 Penthouse Apartment in Alanya Center" />
            </div>

            <div className="min-h-[400px] border rounded-lg overflow-hidden bg-white">
              <ReactQuill
                value={form.description || ''}
                onChange={val => set('description', val)}
                className="h-72"
                theme="snow"
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                    ['link', 'clean']
                  ]
                }}
              />
            </div>
          </div>
        )}

        {activeTab === 'seo' && (
          <div className="bg-card rounded-xl border border-border p-6">
            <SeoAutoFill
              title={form.title || form.project_name}
              description={form.description?.replace(/<[^>]*>/g, '').slice(0, 150)}
              city={form.city}
              type={form.type}
              price={form.price}
              currency={form.currency}
              form={form}
              onUpdate={(updates) => setForm(f => ({ ...f, ...updates }))}
            />
            
            <div className="border-t pt-5 mt-5 space-y-4">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">🖼️ İlan Ana Görsel Kaynağı</h3>
              <div>
                <Label className="text-xs">Ana Görsel URL (VTR Resim)</Label>
                <Input value={form.main_image || ''} onChange={e => set('main_image', e.target.value)} className="mt-1.5 font-mono text-xs" placeholder="https://propertiesforsaleturkey.com/images/..." />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <Button onClick={handleSubmit} disabled={mutation.isPending} className="gap-2 gradient-primary text-white border-0 hover:opacity-90 px-8 h-11 rounded-xl shadow-md font-bold text-sm">
          {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Kaydet ve Sihirbazı Kapat
        </Button>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Upload, Image, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function SiteSettingsPage() {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const { data: settings = [] } = useQuery({
    queryKey: ['site-settings'],
    queryFn: () => base44.entities.SiteSettings.list(),
  });

  const bgSetting = settings.find(s => s.key === 'background_image');

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SiteSettings.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast.success('Ayar güncellendi');
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.SiteSettings.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast.success('Arka plan kaydedildi');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SiteSettings.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast.success('Arka plan kaldırıldı');
    },
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    if (bgSetting) {
      updateMutation.mutate({ id: bgSetting.id, data: { value: file_url } });
    } else {
      createMutation.mutate({ key: 'background_image', value: file_url, label: 'Arka Plan Fotoğrafı' });
    }
    setUploading(false);
  };

  const handleUrlSave = (url) => {
    if (!url) return;
    if (bgSetting) {
      updateMutation.mutate({ id: bgSetting.id, data: { value: url } });
    } else {
      createMutation.mutate({ key: 'background_image', value: url, label: 'Arka Plan Fotoğrafı' });
    }
  };

  const [urlInput, setUrlInput] = useState('');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold font-jakarta">Site Ayarları</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Arka plan ve görsel ayarları</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 max-w-2xl">
        <div className="flex items-center gap-2 mb-5">
          <Image className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Arka Plan Fotoğrafı</h2>
        </div>

        {/* Mevcut arka plan */}
        {bgSetting?.value ? (
          <div className="mb-5 relative rounded-xl overflow-hidden border border-border">
            <img src={bgSetting.value} alt="Arka plan" className="w-full h-48 object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteMutation.mutate(bgSetting.id)}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Kaldır
              </Button>
            </div>
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
              Aktif arka plan
            </div>
          </div>
        ) : (
          <div className="mb-5 h-48 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted/20">
            <p className="text-muted-foreground text-sm">Henüz arka plan yok</p>
          </div>
        )}

        {/* Dosya yükle */}
        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">Bilgisayardan Yükle</label>
          <label className="cursor-pointer">
            <div className="flex items-center gap-3 px-4 py-2.5 border border-border rounded-lg hover:bg-muted/30 transition-colors w-fit">
              <Upload className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{uploading ? 'Yükleniyor...' : 'Fotoğraf Seç'}</span>
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
          </label>
        </div>

        {/* URL ile ekle */}
        <div>
          <label className="text-sm font-medium mb-2 block">URL ile Ekle</label>
          <div className="flex gap-2">
            <Input
              placeholder="https://example.com/image.jpg"
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              className="flex-1"
            />
            <Button onClick={() => { handleUrlSave(urlInput); setUrlInput(''); }} disabled={!urlInput}>
              <Save className="w-4 h-4 mr-2" />
              Kaydet
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
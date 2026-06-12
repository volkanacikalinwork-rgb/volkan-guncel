import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Building2, FolderOpen, Package, FileText,
  Map, Users, Users2, MessageSquare, ChevronRight,
  Home, Tags, Languages, MapPin, Settings,
  Star, MessageCircle, Phone, Handshake, Shield, FileCheck,
  Cookie, AlertCircle, HelpCircle, Globe,
  Briefcase, Scale, Car, Sofa, KeyRound, TrendingUp, HeartHandshake,
  LayoutGrid, Gem, Hash
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const navGroups = [
  {
    label: 'Ana Menü',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    ]
  },
  {
    label: 'Gayrimenkul',
    items: [
      { label: 'İlanlar', icon: Building2, path: '/properties' },
      { label: 'Projeler', icon: FolderOpen, path: '/projects' },
      { label: 'Paketler', icon: Package, path: '/packages' },
    ]
  },
  {
    label: 'İçerik',
    items: [
      { label: 'Blog & Haberler', icon: FileText, path: '/blog' },
      { label: 'Turkey Guide', icon: Map, path: '/turkey-guide' },
      { label: 'Gayrimenkul Kategorileri', icon: LayoutGrid, path: '/property-categories' },
    ]
  },
  {
    label: 'Hizmetler',
    items: [
      { label: 'Hizmetler', icon: Briefcase, path: '/services' },
      { label: 'Mülk Yönetimi', icon: Building2, path: '/property-management' },
      { label: 'Satış Sonrası', icon: HeartHandshake, path: '/after-sales-services' },
      { label: 'Hukuki & Tapu', icon: Scale, path: '/legal-and-title-deed-assistance' },
      { label: 'Havalimanı Transfer', icon: Car, path: '/airport-transfer-services' },
      { label: 'Mobilya Paketleri', icon: Sofa, path: '/furniture-packages-turkey' },
      { label: 'Kiralama Yönetimi', icon: KeyRound, path: '/rental-management-services' },
      { label: 'Yatırım Danışmanlığı', icon: TrendingUp, path: '/investment-consulting' },
    ]
  },
  {
    label: 'Kurumsal',
    items: [
      { label: 'Hakkımızda', icon: Building2, path: '/about-us' },
      { label: 'Neden Biz?', icon: Star, path: '/why-choose-us' },
      { label: 'Ekibimiz', icon: Users2, path: '/our-team' },
      { label: 'Müşteri Yorumları', icon: MessageCircle, path: '/client-testimonials' },
      { label: 'Mülkünüzü Satın', icon: Home, path: '/sell-property' },
      { label: 'İletişim', icon: Phone, path: '/contact-us' },
      { label: 'Ortaklar & Geliştiriciler', icon: Handshake, path: '/partners-and-developers' },
    ]
  },
  {
    label: 'Hukuki',
    items: [
      { label: 'Gizlilik Politikası', icon: Shield, path: '/privacy-policy' },
      { label: 'Kullanım Koşulları', icon: FileCheck, path: '/terms-and-conditions' },
      { label: 'Çerez Politikası', icon: Cookie, path: '/cookie-policy' },
      { label: 'Sorumluluk Reddi', icon: AlertCircle, path: '/disclaimer' },
      { label: 'SSS', icon: HelpCircle, path: '/faq' },
      { label: 'Site Haritası', icon: Globe, path: '/sitemap' },
    ]
  },
  {
    label: 'Müşteri',
    items: [
      { label: 'Leads & CRM', icon: MessageSquare, path: '/leads' },
      { label: 'Kullanıcılar', icon: Users, path: '/users', adminOnly: true },
    ]
  },
  {
    label: 'Araçlar',
    items: [
      { label: 'Gem Linkleri', icon: Gem, path: '/gem-links', adminOnly: true },
    ]
  },
  {
    label: 'Sistem',
    items: [
      { label: 'Dil Yönetimi', icon: Languages, path: '/languages', adminOnly: true },
      { label: 'Konum Yönetimi', icon: MapPin, path: '/locations', adminOnly: true },
      { label: 'Özellik Yönetimi', icon: Tags, path: '/features', adminOnly: true },
      { label: 'Mülk Tipleri', icon: Building2, path: '/property-types', adminOnly: true },
      { label: 'Ref No - Konum', icon: Hash, path: '/ref-no-location', adminOnly: true },
      { label: 'Site Ayarları', icon: Settings, path: '/site-settings', adminOnly: true },
    ]
  },
];

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-full bg-[hsl(224,71%,4%)] sidebar-glow flex flex-col transition-all duration-300 z-50",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-[hsl(224,50%,12%)]">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
          <Home className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-white font-jakarta font-bold text-sm leading-tight">Properties</p>
            <p className="text-[hsl(246,83%,72%)] text-xs font-medium">Turkey Admin</p>
          </div>
        )}
        <button
          onClick={onToggle}
          className={cn("ml-auto text-[hsl(220,8%,46%)] hover:text-white transition-colors", collapsed && "mx-auto ml-0")}
        >
          <ChevronRight className={cn("w-4 h-4 transition-transform", !collapsed && "rotate-180")} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-4">
            {!collapsed && (
              <p className="text-[hsl(220,8%,36%)] text-[10px] font-semibold uppercase tracking-widest px-3 mb-2">
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
              if (item.adminOnly && !isAdmin) return null;
              const isActive = location.pathname === item.path || 
                (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 transition-all duration-150 group",
                    isActive
                      ? "bg-[hsl(246,83%,62%)] text-white shadow-lg shadow-[hsl(246,83%,62%)]/25"
                      : "text-[hsl(220,8%,56%)] hover:bg-[hsl(224,50%,12%)] hover:text-white"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="flex-shrink-0 w-5 h-5" />
                  {!collapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User info */}
      {!collapsed && user && (
        <div className="p-4 border-t border-[hsl(224,50%,12%)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
              {user.full_name?.charAt(0) || user.email?.charAt(0) || '?'}
            </div>
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user.full_name || 'User'}</p>
              <p className="text-[hsl(220,8%,46%)] text-xs truncate">{user.role}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
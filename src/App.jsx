import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/UserNotRegisteredError'; 
import { Toaster as SonnerToaster } from 'sonner';
import AppLayout from '@/components/layout/AppLayout';

// Pages
import Dashboard from '@/pages/Dashboard';
import Properties from '@/pages/Properties';
import PropertyForm from '@/pages/PropertyForm';
import Projects from '@/pages/Projects';
import ProjectForm from '@/pages/ProjectForm';
import Packages from '@/pages/Packages';
import PackageForm from '@/pages/PackageForm';
import Blog from '@/pages/Blog';
import BlogForm from '@/pages/BlogForm';
import TurkeyGuide from '@/pages/TurkeyGuide';
import Leads from '@/pages/Leads';
import UsersPage from '@/pages/UsersPage';
import PropertyTypes from '@/pages/PropertyTypes';
import Languages from '@/pages/Languages';
import Locations from '@/pages/Locations';
import Features from '@/pages/Features';
import SiteSettingsPage from '@/pages/SiteSettingsPage';
import AboutUs from '@/pages/AboutUs';
import WhyChooseUs from '@/pages/WhyChooseUs';
import OurTeam from '@/pages/OurTeam';
import ClientTestimonials from '@/pages/ClientTestimonials';
import SellProperty from '@/pages/SellProperty';
import ContactUs from '@/pages/ContactUs';
import PartnersAndDevelopers from '@/pages/PartnersAndDevelopers';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsAndConditions from '@/pages/TermsAndConditions';
import CookiePolicy from '@/pages/CookiePolicy';
import Disclaimer from '@/pages/Disclaimer';
import FAQ from '@/pages/FAQ';
import Sitemap from '@/pages/Sitemap';
import Services from '@/pages/Services';
import PropertyManagement from '@/pages/PropertyManagement';
import AfterSalesServices from '@/pages/AfterSalesServices';
import LegalAndTitleDeed from '@/pages/LegalAndTitleDeed';
import AirportTransfer from '@/pages/AirportTransfer';
import FurniturePackages from '@/pages/FurniturePackages';
import RentalManagement from '@/pages/RentalManagement';
import InvestmentConsulting from '@/pages/InvestmentConsulting';
import PropertyCategories from '@/pages/PropertyCategories';
import GemLinks from '@/pages/GemLinks';
import RefNoLocation from '@/pages/RefNoLocation';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/properties/new" element={<PropertyForm />} />
        <Route path="/properties/:id" element={<PropertyForm />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/new" element={<ProjectForm />} />
        <Route path="/projects/:id" element={<ProjectForm />} />
        <Route path="/packages" element={<Packages />} />
        <Route path="/packages/new" element={<PackageForm />} />
        <Route path="/packages/:id" element={<PackageForm />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/new" element={<BlogForm />} />
        <Route path="/blog/:id" element={<BlogForm />} />
        <Route path="/turkey-guide" element={<TurkeyGuide />} />
        <Route path="/leads" element={<Leads />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/property-types" element={<PropertyTypes />} />
        <Route path="/languages" element={<Languages />} />
        <Route path="/locations" element={<Locations />} />
        <Route path="/features" element={<Features />} />
        <Route path="/site-settings" element={<SiteSettingsPage />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/why-choose-us" element={<WhyChooseUs />} />
        <Route path="/our-team" element={<OurTeam />} />
        <Route path="/client-testimonials" element={<ClientTestimonials />} />
        <Route path="/sell-property" element={<SellProperty />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/partners-and-developers" border-0 element={<PartnersAndDevelopers />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/sitemap" element={<Sitemap />} />
        <Route path="/services" element={<Services />} />
        <Route path="/property-management" element={<PropertyManagement />} />
        <Route path="/after-sales-services" element={<AfterSalesServices />} />
        <Route path="/legal-and-title-deed-assistance" element={<LegalAndTitleDeed />} />
        <Route path="/airport-transfer-services" element={<AirportTransfer />} />
        <Route path="/furniture-packages-turkey" element={<FurniturePackages />} />
        <Route path="/rental-management-services" element={<RentalManagement />} />
        <Route path="/investment-consulting" element={<InvestmentConsulting />} />
        <Route path="/property-categories" element={<PropertyCategories />} />
        <Route path="/gem-links" element={<GemLinks />} />
        <Route path="/ref-no-location" element={<RefNoLocation />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
        <SonnerToaster position="top-right" richColors />
      </QueryClientProvider>
    </AuthProvider>
  )
}
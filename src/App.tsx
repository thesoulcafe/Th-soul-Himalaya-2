import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './lib/AuthContext';
import { CartProvider } from './lib/CartContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';
import SmoothScroll from './components/SmoothScroll';
import { Toaster } from 'sonner';

// Lazy load pages for better mobile performance
const Home = lazy(() => import('./pages/Home'));
const Tours = lazy(() => import('./pages/Tours'));
const Trekks = lazy(() => import('./pages/Trekks'));
const WFH = lazy(() => import('./pages/WFH'));
const Yoga = lazy(() => import('./pages/Yoga'));
const Meditation = lazy(() => import('./pages/Meditation'));
const Adventure = lazy(() => import('./pages/Adventure'));
const Shop = lazy(() => import('./pages/Shop'));
const Blueberry = lazy(() => import('./pages/Blueberry'));
const About = lazy(() => import('./pages/About'));
const Guide = lazy(() => import('./pages/Guide'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Contact = lazy(() => import('./pages/Contact'));
const Services = lazy(() => import('./pages/Services'));
const TailorMade = lazy(() => import('./pages/TailorMade'));
const Admin = lazy(() => import('./pages/Admin'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const BookingDetails = lazy(() => import('./pages/BookingDetails'));
const ParvatiValley = lazy(() => import('./pages/ParvatiValley'));
const HamletDetail = lazy(() => import('./pages/HamletDetail'));
const CosmicManifestation = lazy(() => import('./pages/CosmicManifestation'));
const ServiceDetail = lazy(() => import('./pages/ServiceDetail'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const ArticleDetail = lazy(() => import('./pages/ArticleDetail'));
const SoulCafe = lazy(() => import('./pages/SoulCafe'));
const Success = lazy(() => import('./pages/Success'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-cream">
    <div className="flex flex-col items-center gap-4">
      <div className="h-12 w-12 border-4 border-forest/10 border-t-terracotta rounded-full animate-spin" />
      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-forest/40">Manifesting...</span>
    </div>
  </div>
);

export default function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <AuthProvider>
          <CartProvider>
            <SmoothScroll />
            <Toaster position="top-center" richColors />
            <Router>
              <ScrollToTop />
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="tours" element={<Tours />} />
                    <Route path="trekks" element={<Trekks />} />
                    <Route path="wfh" element={<WFH />} />
                    <Route path="yoga" element={<Yoga />} />
                    <Route path="meditation" element={<Meditation />} />
                    <Route path="adventure" element={<Adventure />} />
                    <Route path=":category/:id" element={<ServiceDetail />} />
                    <Route path=":category/:id/book" element={<BookingPage />} />
                    <Route path="shop" element={<Shop />} />
                    <Route path="cart" element={<Cart />} />
                    <Route path="blueberry" element={<Blueberry />} />
                    <Route path="about" element={<About />} />
                    <Route path="guide" element={<Guide />} />
                    <Route path="gallery" element={<Gallery />} />
                    <Route path="contact" element={<Contact />} />
                    <Route path="services" element={<Services />} />
                    <Route path="tailor-made" element={<TailorMade />} />
                    <Route path="admin" element={<Admin />} />
                    <Route path="checkout" element={<Checkout />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="dashboard/booking/:id" element={<BookingDetails />} />
                    <Route path="parvati-valley" element={<ParvatiValley />} />
                    <Route path="parvati-valley/:hamletId" element={<HamletDetail />} />
                    <Route path="cosmic-manifestation" element={<CosmicManifestation />} />
                    <Route path="soul-cafe" element={<SoulCafe />} />
                    <Route path="enquiry-success" element={<Success />} />
                    <Route path="hamlet/:hamletId/article/:articleId" element={<ArticleDetail />} />
                  </Route>
                </Routes>
              </Suspense>
            </Router>
          </CartProvider>
        </AuthProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Tours from './pages/Tours';
import Trekks from './pages/Trekks';
import WFH from './pages/WFH';
import Yoga from './pages/Yoga';
import Meditation from './pages/Meditation';
import Adventure from './pages/Adventure';
import Shop from './pages/Shop';
import Blueberry from './pages/Blueberry';
import About from './pages/About';
import Guide from './pages/Guide';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import Services from './pages/Services';
import TailorMade from './pages/TailorMade';
import Admin from './pages/Admin';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Dashboard from './pages/Dashboard';
import BookingDetails from './pages/BookingDetails';
import ParvatiValley from './pages/ParvatiValley';
import CosmicManifestation from './pages/CosmicManifestation';
import ServiceDetail from './pages/ServiceDetail';
import BookingPage from './pages/BookingPage';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './lib/AuthContext';
import { CartProvider } from './lib/CartContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';
import SmoothScroll from './components/SmoothScroll';
import { Toaster } from 'sonner';

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
                    <Route path="cosmic-manifestation" element={<CosmicManifestation />} />
                  </Route>
                </Routes>
              </Router>
            </CartProvider>
          </AuthProvider>
        </ErrorBoundary>
    </HelmetProvider>
  );
}

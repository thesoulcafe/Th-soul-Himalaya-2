import Navbar from './Navbar';
import Footer from './Footer';
import { Outlet, useNavigate } from 'react-router-dom';
import AIAssistant from './AIAssistant';
import { Button } from './ui/button';
import { ArrowLeft, Home } from 'lucide-react';

export default function Layout() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-terracotta selection:text-white relative">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />

      {/* Persistent Navigation Buttons */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2">
        <Button 
          onClick={() => navigate(-1)}
          variant="outline"
          size="icon"
          className="rounded-full shadow-lg bg-white/80 backdrop-blur-md border-forest/10 hover:bg-forest hover:text-white transition-all"
          title="Go Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button 
          onClick={() => navigate('/')}
          variant="outline"
          size="icon"
          className="rounded-full shadow-lg bg-white/80 backdrop-blur-md border-forest/10 hover:bg-forest hover:text-white transition-all"
          title="Go Home"
        >
          <Home className="h-4 w-4" />
        </Button>
      </div>

      {/* 2026 Generative AI Assistant */}
      <AIAssistant />
    </div>
  );
}

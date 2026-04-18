import Navbar from './Navbar';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';
import AIAssistant from './AIAssistant';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-terracotta selection:text-white">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />

      {/* 2026 Generative AI Assistant */}
      <AIAssistant />
    </div>
  );
}

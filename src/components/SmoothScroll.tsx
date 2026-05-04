import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

export default function SmoothScroll() {
  useEffect(() => {
    let lenis: any;
    try {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
        infinite: false,
      });

      function raf(time: number) {
        if (lenis) {
          lenis.raf(time);
          requestAnimationFrame(raf);
        }
      }

      requestAnimationFrame(raf);
    } catch (error) {
      console.error("Lenis initialization failed:", error);
      return;
    }

    // Handle internal links for Lenis
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor && anchor.hash && anchor.origin === window.location.origin) {
        e.preventDefault();
        lenis.scrollTo(anchor.hash);
      }
    };

    // Watch for body overflow changes to stop/start lenis
    const observer = new MutationObserver(() => {
      if (!lenis) return;
      if (document.body.style.overflow === 'hidden') {
        lenis.stop();
      } else {
        lenis.start();
      }
    });

    observer.observe(document.body, { attributes: true, attributeFilter: ['style'] });

    document.body.addEventListener('click', (e) => {
      if (!lenis) return;
      handleAnchorClick(e);
    });

    return () => {
      if (lenis) {
        lenis.destroy();
      }
      observer.disconnect();
      document.body.removeEventListener('click', handleAnchorClick);
    };
  }, []);

  return null;
}

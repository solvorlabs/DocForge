import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll the main window to top
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });

    // Also scroll document body and html element
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;

    // Find and scroll any scrollable containers to top
    const scrollableElements = document.querySelectorAll('[style*="overflow"]');
    scrollableElements.forEach(element => {
      element.scrollTop = 0;
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;

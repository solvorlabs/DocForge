// app/layouts/Layout.jsx
import React, { useState, useEffect } from 'react';
import '../../shared/components/navigation/Layout.css';
import Sidebar from '../../shared/components/navigation/Sidebar';
import MobileNavigation from '../../shared/components/navigation/MobileNavigation';
import VolumeControl from '../../shared/components/audio/VolumeControl';

const Layout = ({ children, hideSidebar = false }) => {
  const [screenSize, setScreenSize] = useState(() => {
    if (window.innerWidth >= 1024) return 'large';
    if (window.innerWidth >= 769) return 'medium';
    return 'mobile';
  });

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setScreenSize('large');
      } else if (window.innerWidth >= 769) {
        setScreenSize('medium');
      } else {
        setScreenSize('mobile');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="layout-container" style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Volume Control - available on all pages */}
      
      {/* Sidebar - only show on medium and large screens, and when not hidden */}
      {!hideSidebar && screenSize !== 'mobile' && (
        <Sidebar screenSize={screenSize} />
      )}

      <main className={`layout-content ${
        hideSidebar || screenSize === 'mobile' ? '' :
        screenSize === 'large' ? 'with-sidebar-full' : 
        screenSize === 'medium' ? 'with-sidebar-compact' : ''
      }`}>
        {children}
      </main>

      {/* Mobile Navigation - only show on mobile */}
      <MobileNavigation />
    </div>
  );
};

export default Layout;

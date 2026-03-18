import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './PageTransitionLoader.css';

const PageTransitionLoader = () => {
  const location = useLocation();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 1200);
    return () => clearTimeout(timer);
  }, [location]);

  if (!isAnimating) return null;

  return (
    <div className="page-transition-overlay">
      <div className="page-turner"></div>
    </div>
  );
};

export default PageTransitionLoader;

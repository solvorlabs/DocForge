/**
 * MathJax Component
 * Handles rendering of mathematical expressions using MathJax
 */

import React, { useEffect, useRef } from 'react';

const MathJaxContent = ({ children, inline = false, className = "" }) => {
  const mathRef = useRef(null);

  useEffect(() => {
    const renderMath = async () => {
      if (!mathRef.current) return;

      // Wait for MathJax to be ready
      if (window.MathJax && window.MathJax.typesetPromise) {
        try {
          // Typeset the content
          await window.MathJax.typesetPromise([mathRef.current]);
        } catch (error) {
          console.warn('MathJax rendering error:', error);
        }
      }
    };

    renderMath();
  }, [children]);

  const WrapperElement = inline ? 'span' : 'div';
  
  return (
    <WrapperElement
      ref={mathRef}
      className={className}
      style={{
        minHeight: inline ? 'auto' : '1.2em',
        display: inline ? 'inline' : 'block'
      }}
    >
      {children}
    </WrapperElement>
  );
};

export default MathJaxContent;
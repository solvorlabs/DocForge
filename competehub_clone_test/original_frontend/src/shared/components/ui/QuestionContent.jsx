import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

/**
 * QuestionContent - A component for rendering question text with LaTeX and HTML support
 * Used in GameBoard for GATE/JEE questions
 */

// Clean explanation text by removing JSON artifacts
const cleanText = (text) => {
  if (!text) return '';
  
  // Remove everything after JSON markers
  const jsonMarkers = ['},hi:{', '},en:{', '"},hi:', '"},en:'];
  let cleanedText = text;
  
  for (const marker of jsonMarkers) {
    const markerIndex = cleanedText.indexOf(marker);
    if (markerIndex !== -1) {
      cleanedText = cleanedText.substring(0, markerIndex);
    }
  }
  
  return cleanedText;
};

// Unescape LaTeX backslashes
const unescapeLatex = (text) => {
  if (!text) return '';
  // Handle various backslash escaping scenarios
  let result = text;
  
  // Replace quadruple backslashes with double
  result = result.replace(/\\\\\\\\/g, '\\\\');
  
  // Replace double backslashes with single (but preserve some LaTeX commands)
  // Be careful not to break LaTeX commands that need double backslashes
  result = result.replace(/\\\\(?![\\{}])/g, '\\');
  
  return result;
};

// Parse and render LaTeX in text
const renderLatexInText = (text) => {
  if (!text) return null;

  // Clean the text first
  const cleanedText = cleanText(text);
  
  // Regular expressions for different LaTeX patterns
  const patterns = [
    { regex: /\$\$(.*?)\$\$/gs, type: 'block' },
    { regex: /\\\[(.*?)\\\]/gs, type: 'block' },
    { regex: /\$(.*?)\$/g, type: 'inline' },
    { regex: /\\\((.*?)\\\)/g, type: 'inline' },
  ];
  
  let result = cleanedText;
  const replacements = [];
  
  // Find all LaTeX expressions
  patterns.forEach(({ regex, type }) => {
    let match;
    const tempRegex = new RegExp(regex.source, regex.flags);
    while ((match = tempRegex.exec(cleanedText)) !== null) {
      replacements.push({
        start: match.index,
        end: match.index + match[0].length,
        latex: match[1],
        type,
        original: match[0]
      });
    }
  });
  
  // Sort replacements by position (reverse order for easier replacement)
  replacements.sort((a, b) => b.start - a.start);
  
  // If no LaTeX found, return as plain text
  if (replacements.length === 0) {
    return <span dangerouslySetInnerHTML={{ __html: cleanedText }} />;
  }
  
  // Build result with React components
  const parts = [];
  let lastIndex = cleanedText.length;
  
  replacements.forEach((rep, idx) => {
    // Add text after this replacement
    if (rep.end < lastIndex) {
      const textAfter = cleanedText.slice(rep.end, lastIndex);
      if (textAfter) {
        parts.unshift(
          <span key={`text-${idx}`} dangerouslySetInnerHTML={{ __html: textAfter }} />
        );
      }
    }
    
    // Add the LaTeX component
    try {
      const latexContent = unescapeLatex(rep.latex);
      
      if (rep.type === 'block') {
        parts.unshift(
          <div key={`latex-${idx}`} style={{ margin: '8px 0', textAlign: 'center' }}>
            <BlockMath math={latexContent} />
          </div>
        );
      } else {
        parts.unshift(
          <InlineMath key={`latex-${idx}`} math={latexContent} />
        );
      }
    } catch (e) {
      // If LaTeX parsing fails, show original text
      parts.unshift(
        <span key={`latex-error-${idx}`}>{rep.original}</span>
      );
    }
    
    lastIndex = rep.start;
  });
  
  // Add remaining text at the beginning
  if (lastIndex > 0) {
    const textBefore = cleanedText.slice(0, lastIndex);
    if (textBefore) {
      parts.unshift(
        <span key="text-start" dangerouslySetInnerHTML={{ __html: textBefore }} />
      );
    }
  }
  
  return <>{parts}</>;
};

/**
 * QuestionText - Renders the main question text with LaTeX support
 */
export function QuestionText({ text, html, style = {} }) {
  const content = html || text;
  
  if (!content) {
    return <span style={style}>Question text not available</span>;
  }
  
  return (
    <div style={{ lineHeight: 1.6, ...style }}>
      {renderLatexInText(content)}
    </div>
  );
}

/**
 * OptionText - Renders an option with LaTeX support
 */
export function OptionText({ text, imageUrl, style = {} }) {
  // If we have an image URL, display the image instead of text
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={text || 'Option'}
        style={{
          maxWidth: '100%',
          maxHeight: '120px',
          height: 'auto',
          borderRadius: '6px',
          border: '2px solid var(--doodle-sketch)',
          display: 'block',
          ...style
        }}
        onError={(e) => {
          // Fallback to text if image fails
          e.target.style.display = 'none';
          const textSpan = document.createElement('span');
          textSpan.textContent = text || 'Image unavailable';
          e.target.parentNode.appendChild(textSpan);
        }}
      />
    );
  }
  
  if (!text) return null;
  
  return (
    <span style={{ lineHeight: 1.5, ...style }}>
      {renderLatexInText(text)}
    </span>
  );
}

/**
 * ExplanationText - Renders explanation with LaTeX and images
 */
export function ExplanationText({ text, hasImages = false, imageUrls = [], style = {} }) {
  // Only show images if hasImages is true and imageUrls has items
  const showImages = hasImages && imageUrls && imageUrls.length > 0;
  
  if (!text && !showImages) return null;
  
  return (
    <div style={style}>
      {text && (
        <div style={{ marginBottom: showImages ? '12px' : 0 }}>
          {renderLatexInText(text)}
        </div>
      )}
      {showImages && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {imageUrls.map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`Explanation image ${index + 1}`}
              style={{
                maxWidth: '100%',
                height: 'auto',
                borderRadius: '8px',
                border: '2px solid var(--doodle-sketch)'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * QuestionImages - Renders question images
 */
export function QuestionImages({ imageUrls = [], style = {} }) {
  if (!imageUrls || imageUrls.length === 0) return null;
  
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '8px',
      marginTop: '12px',
      ...style 
    }}>
      {imageUrls.map((url, index) => (
        <img
          key={index}
          src={url}
          alt={`Question image ${index + 1}`}
          style={{
            maxWidth: '100%',
            height: 'auto',
            borderRadius: '8px',
            border: '2px solid var(--doodle-sketch)'
          }}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      ))}
    </div>
  );
}

/**
 * QuestionMetadata - Renders question metadata badges
 */
export function QuestionMetadata({ 
  questionSource, 
  year, 
  examType, 
  topic, 
  difficultyLevel,
  marksPositive,
  marksNegative,
  isMobile = false 
}) {
  const getBadgeStyle = (color = 'var(--doodle-blue)') => ({
    background: color,
    color: 'white',
    fontSize: isMobile ? '0.65rem' : '0.7rem',
    padding: '3px 6px',
    borderRadius: '6px',
     
    fontWeight: '600',
    border: '2px solid var(--doodle-ink)',
    boxShadow: '2px 2px 0 rgba(0,0,0,0.1)'
  });

  const getDifficultyColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'easy': return 'var(--doodle-green)';
      case 'medium': return 'var(--doodle-yellow)';
      case 'hard': return 'var(--doodle-accent)';
      default: return 'var(--doodle-blue)';
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexWrap: 'wrap', 
      gap: '4px', 
      alignItems: 'center',
      marginBottom: '8px'
    }}>
      {/* Question Source Badge */}
      {questionSource && questionSource !== 'native' && (
        <span style={getBadgeStyle('var(--doodle-yellow)')}>
          {questionSource.toUpperCase()}
        </span>
      )}
      
      {/* Year Badge */}
      {year && (
        <span style={getBadgeStyle('var(--doodle-blue)')}>
          {year}
        </span>
      )}
      
      {/* Exam Type Badge */}
      {examType && (
        <span style={getBadgeStyle('var(--doodle-green)')}>
          {examType}
        </span>
      )}
      
      {/* Topic Badge */}
      {topic && (
        <span style={getBadgeStyle('var(--doodle-purple)')}>
          {topic.length > 15 ? topic.slice(0, 15) + '...' : topic}
        </span>
      )}
      
      {/* Difficulty Badge */}
      {difficultyLevel && (
        <span style={getBadgeStyle(getDifficultyColor(difficultyLevel))}>
          {difficultyLevel}
        </span>
      )}
      
      {/* Marks Badge */}
      {(marksPositive || marksNegative) && (
        <span style={getBadgeStyle('var(--doodle-blue)')}>
          +{marksPositive || 4} / -{marksNegative || 1}
        </span>
      )}
    </div>
  );
}

export default {
  QuestionText,
  OptionText,
  ExplanationText,
  QuestionImages,
  QuestionMetadata
};

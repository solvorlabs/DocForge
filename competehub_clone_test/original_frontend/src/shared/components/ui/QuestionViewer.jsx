import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Chip,
  Divider,
  Card,
  CardContent,
  IconButton,
  Stack,
  Collapse,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Paper
} from '@mui/material';
import {
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import ReactMarkdown from 'react-markdown';

function QuestionViewer({ question, examType, onClose, uiTheme = 'basic' }) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [checkResult, setCheckResult] = useState(null);

  if (!question) return null;

  // Theme-based styling
  const getThemeStyles = () => {
    switch (uiTheme) {
      case 'neo':
        return {
          dialog: {
            '& .MuiDialog-paper': {
              border: '3px solid black',
              boxShadow: '12px 12px 0px black',
              borderRadius: 0
            }
          },
          button: {
            border: '2px solid black',
            borderRadius: 0,
            fontWeight: 700,
            textTransform: 'uppercase',
            '&:hover': {
              transform: 'translate(-2px, -2px)',
              boxShadow: '4px 4px 0px black'
            }
          },
          card: {
            border: '3px solid black',
            borderRadius: 0,
            boxShadow: '4px 4px 0px black'
          },
          chip: {
            border: '2px solid black',
            borderRadius: '4px',
            fontWeight: 600
          },
          paper: {
            border: '2px solid black',
            borderRadius: 0
          }
        };
      
      case 'doodle':
        return {
          dialog: {
            '& .MuiDialog-paper': {
              border: '2px solid #2d3436',
              borderRadius: '24px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
            }
          },
          button: {
            borderRadius: '12px',
            fontWeight: 600,
            border: '2px solid currentColor',
            '&:hover': {
              transform: 'rotate(-1deg) scale(1.05)',
              boxShadow: '0 6px 16px rgba(0,0,0,0.15)'
            }
          },
          card: {
            border: '2px solid #2d3436',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          },
          chip: {
            borderRadius: '10px',
            fontWeight: 500,
            border: '1.5px solid currentColor'
          },
          paper: {
            borderRadius: '16px',
            border: '2px solid #e0e0e0'
          }
        };
      
      default: // basic
        return {
          dialog: {},
          button: {},
          card: {},
          chip: {},
          paper: {}
        };
    }
  };

  const themeStyles = getThemeStyles();

  const cleanExplanation = (text) => {
    if (!text) return null;
    
    // Remove everything after "},hi:{" or similar JSON artifacts
    const jsonMarkers = ['},hi:{', '},en:{', '"},hi:', '"},en:'];
    let cleanedText = text;
    
    for (const marker of jsonMarkers) {
      const index = cleanedText.indexOf(marker);
      if (index !== -1) {
        cleanedText = cleanedText.substring(0, index);
        break;
      }
    }
    
    return cleanedText;
  };

  const unescapeLatex = (text) => {
    if (!text) return '';
    // Replace double backslashes with single backslashes for LaTeX
    return text.replace(/\\\\\\\\/g, '\\\\').replace(/\\\\/g, '\\');
  };

  const renderLatex = (text) => {
    if (!text) return null;

    // Clean the text first (remove JSON artifacts)
    let cleanedText = cleanExplanation(text);
    
    // If it's HTML content with LaTeX
    if (cleanedText.includes('<p>') || cleanedText.includes('<div>')) {
      // Extract and render LaTeX from HTML
      const htmlWithLatex = cleanedText;
      const parts = [];
      let lastIndex = 0;
      
      // Split by <p> tags and process each part
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlWithLatex;
      const paragraphs = tempDiv.querySelectorAll('p');
      
      if (paragraphs.length > 0) {
        return (
          <Box sx={{ '& > *': { mb: 1 }, '& > *:last-child': { mb: 0 } }}>
            {Array.from(paragraphs).map((p, pIndex) => {
              const pText = p.textContent || p.innerText;
              const renderedContent = renderLatexInText(pText);
              return (
                <Typography key={pIndex} component="div" sx={{ fontSize: '1rem', lineHeight: 1.6 }}>
                  {renderedContent}
                </Typography>
              );
            })}
          </Box>
        );
      }
      
      // Fallback to text rendering
      return renderLatexInText(cleanedText);
    }
    
    // For plain text with LaTeX
    return renderLatexInText(cleanedText);
  };

  const renderLatexInText = (text) => {
    if (!text) return null;
    
    const parts = [];
    let currentIndex = 0;
    
    // Match both inline ($...$) and block ($$...$$) LaTeX
    const latexRegex = /\$\$([^$]+)\$\$|\$([^$]+)\$/g;
    let match;
    
    while ((match = latexRegex.exec(text)) !== null) {
      // Add text before LaTeX
      if (match.index > currentIndex) {
        parts.push({
          type: 'text',
          content: text.substring(currentIndex, match.index)
        });
      }
      
      // Add LaTeX (unescape backslashes)
      if (match[1]) {
        // Block math ($$...$$)
        parts.push({
          type: 'block-math',
          content: unescapeLatex(match[1].trim())
        });
      } else if (match[2]) {
        // Inline math ($...$)
        parts.push({
          type: 'inline-math',
          content: unescapeLatex(match[2].trim())
        });
      }
      
      currentIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (currentIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.substring(currentIndex)
      });
    }
    
    return (
      <>
        {parts.map((part, index) => {
          try {
            if (part.type === 'block-math') {
              return <BlockMath key={index} math={part.content} />;
            } else if (part.type === 'inline-math') {
              return <InlineMath key={index} math={part.content} />;
            } else {
              return <span key={index}>{part.content}</span>;
            }
          } catch (error) {
            console.error('LaTeX rendering error:', error);
            return <span key={index}>{part.content}</span>;
          }
        })}
      </>
    );
  };

  const renderQuestionText = () => {
    // Use question_statement with LaTeX rendering
    const questionText = question.question_statement || question.question_html;
    
    // Remove HTML tags if present
    let cleanText = questionText;
    if (cleanText.includes('<div') || cleanText.includes('<!--')) {
      cleanText = cleanText.replace(/<div[^>]*>(<!--\s*HTML_TAG_START\s*-->)?/, '');
      cleanText = cleanText.replace(/(<!--\s*HTML_TAG_END\s*-->)?<\/div>\s*$/g, '');
      cleanText = cleanText.trim();
    }
    
    return (
      <Typography component="div" variant="body1" sx={{ my: 2, fontSize: '1.1rem', lineHeight: 1.8 }}>
        {renderLatexInText(cleanText)}
      </Typography>
    );
  };

  const renderOptions = () => {
    if (!question.options || question.options.length === 0) {
      return null;
    }

    const isMultipleChoice = question.question_type === 'MSQ' || question.question_type === 'Multiple Correct';
    const optionImages = getOptionImages();

    return (
      <Box sx={{ my: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Options:
        </Typography>
        <RadioGroup value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)}>
          <Stack spacing={1.5}>
            {question.options.map((option, index) => {
              const optionLabel = String.fromCharCode(65 + index); // A, B, C, D
              const correctAnswer = parseCorrectAnswer();
              const isCorrect = showAnswer && (
                correctAnswer === optionLabel ||
                (Array.isArray(correctAnswer) && correctAnswer.includes(optionLabel))
              );
              const isSelected = userAnswer === optionLabel;
              
              // Determine if this is a text option or image-only option
              const isImageOnly = option === '' && optionImages.length > index;
              const optionText = typeof option === 'string' ? option : option.text || '';

              return (
                <Card
                  key={index}
                  sx={{
                    ...themeStyles.card,
                    border: 1,
                    borderColor: isCorrect && showAnswer ? 'success.main' :
                                isSelected && checkResult === false ? 'error.main' : 'divider',
                    bgcolor: isCorrect && showAnswer ? 'success.light' :
                            isSelected && checkResult === false ? 'error.light' : 'background.paper',
                    boxShadow: isCorrect && showAnswer || isSelected ? themeStyles.card.boxShadow : 
                               uiTheme === 'neo' ? '2px 2px 0px black' : 
                               uiTheme === 'doodle' ? '0 1px 4px rgba(0,0,0,0.08)' : 1
                  }}
                >
                  <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                    <FormControlLabel
                      value={optionLabel}
                      control={<Radio disabled={showAnswer} />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, width: '100%', flexDirection: 'column' }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, width: '100%' }}>
                            <Typography component="span" sx={{ fontWeight: 600, minWidth: 30 }}>
                              {optionLabel}.
                            </Typography>
                            {!isImageOnly && optionText && (
                              <Typography component="div" sx={{ flex: 1 }}>
                                {renderLatexInText(optionText)}
                              </Typography>
                            )}
                            {isCorrect && showAnswer && (
                              <CheckCircleIcon color="success" fontSize="small" />
                            )}
                          </Box>
                          
                          {/* Option Image - from option object */}
                          {!isImageOnly && typeof option === 'object' && (option.image_path || option.image_url) && (
                            <Box sx={{ mt: 1, pl: 4, width: '100%' }}>
                              <img
                                src={option.image_path ? `/${option.image_path}` : option.image_url}
                                alt={`Option ${optionLabel} diagram`}
                                style={{ 
                                  maxWidth: '100%', 
                                  height: 'auto', 
                                  maxHeight: '200px',
                                  borderRadius: 8,
                                  border: '2px solid #e0e0e0'
                                }}
                                onError={(e) => {
                                  console.log('Option image error:', option);
                                  // If local path fails, try original URL
                                  if (option.image_path && option.image_url) {
                                    e.target.src = option.image_url;
                                  } else {
                                    e.target.style.display = 'none';
                                  }
                                }}
                              />
                            </Box>
                          )}
                          
                          {/* Option Image - from explanation_image_urls (image-only options) */}
                          {isImageOnly && optionImages[index] && (
                            <Box sx={{ mt: 1, pl: 4, width: '100%' }}>
                              <img
                                src={optionImages[index]}
                                alt={`Option ${optionLabel}`}
                                style={{ 
                                  maxWidth: '100%', 
                                  height: 'auto', 
                                  maxHeight: '200px',
                                  borderRadius: 8,
                                  border: '2px solid #e0e0e0',
                                  display: 'block'
                                }}
                                onError={(e) => {
                                  console.error('Failed to load option image:', optionImages[index]);
                                  e.target.style.display = 'none';
                                }}
                              />
                            </Box>
                          )}
                        </Box>
                      }
                      sx={{ width: '100%', m: 0 }}
                    />
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        </RadioGroup>
      </Box>
    );
  };

  const renderNumericalInput = () => {
    if (question.question_type !== 'Numerical' && 
        question.question_type !== 'NAT' && 
        question.question_type !== 'Integer') {
      return null;
    }

    return (
      <Box sx={{ my: 3 }}>
        <TextField
          fullWidth
          type="number"
          label="Your Answer"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          disabled={showAnswer}
          placeholder="Enter numerical value"
          variant="outlined"
        />
      </Box>
    );
  };

  const parseCorrectAnswer = () => {
    let correctAnswer = question.correct_answer;
    
    // Handle JSON string format like "[\"C\"]"
    if (typeof correctAnswer === 'string') {
      try {
        correctAnswer = JSON.parse(correctAnswer);
      } catch (e) {
        // If parsing fails, use as-is
      }
    }
    
    return correctAnswer;
  };

  const handleCheckAnswer = () => {
    if (!userAnswer) {
      setCheckResult(null);
      return;
    }

    let isCorrect = false;
    const correctAnswer = parseCorrectAnswer();

    if (question.question_type === 'Numerical' || 
        question.question_type === 'NAT' || 
        question.question_type === 'Integer') {
      const userNum = parseFloat(userAnswer);
      const correctNum = Array.isArray(correctAnswer) ? 
        parseFloat(correctAnswer[0]) : parseFloat(correctAnswer);
      
      isCorrect = Math.abs(userNum - correctNum) < 0.01;
    } else {
      isCorrect = Array.isArray(correctAnswer) ? 
        correctAnswer.includes(userAnswer) : 
        correctAnswer === userAnswer;
    }

    setCheckResult(isCorrect);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'success';
      case 'Medium': return 'warning';
      case 'Hard': return 'error';
      default: return 'default';
    }
  };

  // Extract option images from explanation_image_urls
  const getOptionImages = () => {
    if (!question.explanation_image_urls || question.explanation_image_urls.length === 0) {
      return [];
    }

    // Check if options are empty strings (indicating image-only options)
    const hasEmptyOptions = question.options && question.options.every(opt => opt === '');
    if (!hasEmptyOptions) {
      return [];
    }

    // Strategy 1: Filter by URL patterns that contain option identifiers
    const optionUrlPatterns = question.explanation_image_urls.filter(url => {
      const lowerUrl = url.toLowerCase();
      // Match URLs that contain common option patterns
      return lowerUrl.includes('option') || 
             lowerUrl.includes('choice') ||
             // Match image URLs that are likely options (after question images)
             (lowerUrl.includes('.png') || lowerUrl.includes('.jpg'));
    });

    // Strategy 2: Parse the explanation HTML to find option images
    if (question.explanation && typeof question.explanation === 'string') {
      const htmlContent = question.explanation;
      const optionImageRegex = /<img[^>]*alt="[^"]*Option[^"]*"[^>]*src="([^"]*)"/gi;
      const matches = [...htmlContent.matchAll(optionImageRegex)];
      
      if (matches.length >= question.options.length) {
        return matches.slice(0, question.options.length).map(match => match[1]);
      }
    }

    // Strategy 3: For questions with exactly 4 empty options and more than 4 images,
    // assume the pattern: [question_image, option_A, option_B, option_C, option_D, explanation_images...]
    if (question.options.length === 4 && question.explanation_image_urls.length >= 5) {
      const questionImageCount = question.image_urls ? question.image_urls.length : 0;
      
      // If we have question images, skip them
      if (questionImageCount > 0 && question.explanation_image_urls.length >= questionImageCount + 4) {
        return question.explanation_image_urls.slice(questionImageCount, questionImageCount + 4);
      }
      
      // Otherwise, assume first image is question, next 4 are options
      return question.explanation_image_urls.slice(1, 5);
    }

    // Fallback: Return filtered option URLs or first N images
    if (optionUrlPatterns.length >= question.options.length) {
      return optionUrlPatterns.slice(0, question.options.length);
    }

    // Last resort: take first N images after skipping potential question images
    const skipCount = question.image_urls && question.image_urls.length > 0 ? question.image_urls.length : 0;
    return question.explanation_image_urls.slice(skipCount, skipCount + question.options.length);
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      sx={themeStyles.dialog}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        fontWeight: uiTheme !== 'basic' ? 700 : 400
      }}>
        <Typography variant="h6" sx={{ fontWeight: uiTheme !== 'basic' ? 700 : 600 }}>
          {examType.toUpperCase()} Question
        </Typography>
        <IconButton onClick={onClose} size="small" sx={uiTheme === 'neo' ? themeStyles.button : {}}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Question Metadata */}
        <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {question.year && (
            <Chip label={`Year: ${question.year}`} size="small" color="primary" sx={themeStyles.chip} />
          )}
          {question.difficulty_level && (
            <Chip
              label={question.difficulty_level}
              size="small"
              color={getDifficultyColor(question.difficulty_level)}
              sx={themeStyles.chip}
            />
          )}
          <Chip label={question.question_type} size="small" sx={themeStyles.chip} />
          <Chip label={question.subject} size="small" variant="outlined" sx={themeStyles.chip} />
          <Chip label={question.topic} size="small" variant="outlined" sx={themeStyles.chip} />
          {question.marks_positive && (
            <Chip
              label={`+${question.marks_positive} / -${question.marks_negative || 0}`}
              size="small"
              color="info"
              variant="outlined"
              sx={themeStyles.chip}
            />
          )}
        </Box>

        {/* Question Statement */}
        <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', mb: 2, ...themeStyles.paper }}>
          {renderQuestionText()}
          
          {/* Question Images */}
          {question.hasImages && question.imageUrls && question.imageUrls.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Stack spacing={2}>
                {question.imageUrls.map((url, index) => (
                  <Box key={index}>
                    <img
                      src={url}
                      alt={`Question image ${index + 1}`}
                      style={{ 
                        maxWidth: '100%', 
                        height: 'auto', 
                        borderRadius: 8,
                        border: '2px solid #e0e0e0'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            </Box>
          )}
        </Paper>

        {/* Legacy Question Images (for backward compatibility) */}
        {question.has_images && question.image_urls && question.image_urls.length > 0 && (
          <Box sx={{ my: 2 }}>
            <Stack spacing={2}>
              {question.image_urls.map((url, index) => (
                <Box key={index}>
                  <img
                    src={url}
                    alt={`Question image ${index + 1}`}
                    style={{ 
                      maxWidth: '100%', 
                      height: 'auto', 
                      borderRadius: 8,
                      border: '2px solid #e0e0e0'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </Box>
        )}

        {/* Options or Numerical Input */}
        {renderOptions()}
        {renderNumericalInput()}

        {/* Check Answer Button */}
        {userAnswer && !showAnswer && (
          <Button
            variant="contained"
            fullWidth
            onClick={handleCheckAnswer}
            sx={{ my: 2, ...themeStyles.button }}
          >
            Check Answer
          </Button>
        )}

        {/* Answer Result */}
        {checkResult !== null && !showAnswer && (
          <Alert
            severity={checkResult ? 'success' : 'error'}
            sx={{ mb: 2 }}
            icon={checkResult ? <CheckCircleIcon /> : <CancelIcon />}
          >
            {checkResult ? 'Correct! Well done!' : 'Incorrect. Try again or view the answer.'}
          </Alert>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Show Answer Section */}
        <Box sx={{ my: 2 }}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={showAnswer ? <VisibilityOffIcon /> : <VisibilityIcon />}
            onClick={() => setShowAnswer(!showAnswer)}
            sx={themeStyles.button}
          >
            {showAnswer ? 'Hide Answer' : 'Show Answer'}
          </Button>

          <Collapse in={showAnswer}>
            <Paper sx={{ p: 2, mt: 2, bgcolor: 'success.light', ...themeStyles.paper }}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: uiTheme !== 'basic' ? 600 : 400 }}>
                Correct Answer:
              </Typography>
              <Typography variant="h6" color="success.dark" sx={{ fontWeight: uiTheme === 'neo' ? 700 : 600 }}>
                {(() => {
                  const correctAnswer = parseCorrectAnswer();
                  return Array.isArray(correctAnswer) 
                    ? correctAnswer.join(', ')
                    : correctAnswer;
                })()}
              </Typography>
            </Paper>
          </Collapse>
        </Box>

        {/* Explanation Section */}
        {question.explanation && (
          <Box sx={{ my: 2 }}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<InfoIcon />}
              onClick={() => setShowExplanation(!showExplanation)}
              sx={themeStyles.button}
            >
              {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
            </Button>

            <Collapse in={showExplanation}>
              <Paper sx={{ p: 2, mt: 2, bgcolor: '#fff7ed', ...themeStyles.paper }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: uiTheme === 'neo' ? 700 : 600 }}>
                  Explanation:
                </Typography>
                <Box sx={{ mt: 1 }}>
                  {renderLatex(question.explanation)}
                </Box>

                {/* Explanation Images */}
                {question.has_explanation_images && 
                 question.explanation_image_urls && 
                 question.explanation_image_urls.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Stack spacing={2}>
                      {question.explanation_image_urls.map((url, index) => (
                        <Box key={index}>
                          <img
                            src={url}
                            alt={`Explanation image ${index + 1}`}
                            style={{ maxWidth: '100%', height: 'auto', borderRadius: 8 }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Paper>
            </Collapse>
          </Box>
        )}

        {/* Additional Metadata */}
        {(question.exam_type || question.session || question.shift || question.chapter) && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            {question.exam_type && (
              <Typography variant="caption" color="text.secondary" display="block">
                Exam: {question.exam_type}
              </Typography>
            )}
            {question.session && (
              <Typography variant="caption" color="text.secondary" display="block">
                Session: {question.session}
              </Typography>
            )}
            {question.shift && (
              <Typography variant="caption" color="text.secondary" display="block">
                Shift: {question.shift}
              </Typography>
            )}
            {question.chapter && (
              <Typography variant="caption" color="text.secondary" display="block">
                Chapter: {question.chapter}
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} sx={themeStyles.button}>Close</Button>
        {!showAnswer && userAnswer && (
          <Button
            variant="contained"
            onClick={() => {
              setShowAnswer(true);
              setShowExplanation(true);
            }}
            sx={themeStyles.button}
          >
            View Solution
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default QuestionViewer;


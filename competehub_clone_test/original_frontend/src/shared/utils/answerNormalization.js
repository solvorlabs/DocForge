/**
 * Answer Normalization Utilities
 * Handles normalization and comparison of answers from various question formats
 */

/**
 * Normalize correct answer from database format
 * Handles formats like: ["A"], "A", '["A"]', etc.
 * @param {*} answer - The answer from the database
 * @returns {string} - Normalized answer string
 */
export function normalizeCorrectAnswer(answer) {
  if (!answer) return '';
  
  let normalized = answer;
  
  // If it's an array, get first element
  if (Array.isArray(answer)) {
    normalized = answer[0] || '';
  }
  
  // Convert to string
  normalized = String(normalized);
  
  // Remove JSON array brackets, quotes, and extra whitespace
  normalized = normalized
    .replace(/^\s*\[\s*/, '')           // Remove leading [
    .replace(/\s*\]\s*$/, '')           // Remove trailing ]
    .replace(/^["']\s*/, '')            // Remove leading quotes
    .replace(/\s*["']\s*$/, '')         // Remove trailing quotes
    .replace(/\\n/g, ' ')               // Replace newlines with space
    .replace(/\\u[\dA-F]{4}/gi, '')     // Remove unicode escapes
    .replace(/<br\s*\/?>/gi, ' ')       // Replace <br> with space
    .trim();
  
  return normalized;
}

/**
 * Check if user's answer matches the correct answer
 * @param {string} userAnswer - User's provided answer
 * @param {*} correctAnswer - Correct answer from database
 * @param {string} questionType - Type of question (MCQ, Numerical, etc.)
 * @returns {boolean} - Whether the answer is correct
 */
export function checkAnswer(userAnswer, correctAnswer, questionType) {
  try {
    // Normalize the correct answer
    let normalized = normalizeCorrectAnswer(correctAnswer);
    
    // For Numerical/NAT/Integer type questions
    if (questionType === 'Numerical' || questionType === 'NAT' || questionType === 'Integer') {
      const userNum = parseFloat(userAnswer);
      const correctNum = parseFloat(normalized);
      
      if (isNaN(userNum) || isNaN(correctNum)) return false;
      
      // Allow small tolerance for floating point
      const tolerance = Math.max(Math.abs(correctNum) * 0.02, 0.01);
      return Math.abs(userNum - correctNum) <= tolerance;
    }
    
    // For MCQ/MSQ - case insensitive letter comparison
    const userNormalized = String(userAnswer).trim().toUpperCase();
    const correctNormalized = normalized.trim().toUpperCase();
    
    return userNormalized === correctNormalized;
    
  } catch (error) {
    console.error('Error checking answer:', error);
    return false;
  }
}

/**
 * Extract option letter from correct answer
 * @param {*} correctAnswer - Correct answer from database
 * @returns {string} - The option letter (A, B, C, D)
 */
export function getOptionLetter(correctAnswer) {
  const normalized = normalizeCorrectAnswer(correctAnswer);
  
  // Try to extract letter A-D from the answer
  const match = normalized.match(/[A-D]/i);
  if (match) {
    return match[0].toUpperCase();
  }
  
  return normalized.toUpperCase();
}

/**
 * Get the correct option text for MCQ questions
 * @param {Array} options - Array of option strings
 * @param {*} correctAnswer - Correct answer from database (usually a letter)
 * @returns {string} - The text of the correct option
 */
export function getCorrectOptionText(options, correctAnswer) {
  if (!options || !Array.isArray(options) || options.length === 0) {
    return '';
  }
  
  const letter = getOptionLetter(correctAnswer);
  const index = letter.charCodeAt(0) - 65; // A=0, B=1, etc.
  
  if (index >= 0 && index < options.length) {
    return options[index];
  }
  
  return '';
}

/**
 * Format options array from database
 * Handles various option formats
 * @param {Array} options - Options from database
 * @returns {Array<string>} - Formatted options array
 */
export function formatOptions(options) {
  if (!options || !Array.isArray(options)) {
    return [];
  }
  
  return options.map(option => {
    if (typeof option === 'string') {
      return option;
    } else if (option && option.text) {
      return typeof option.text === 'string' ? option.text : String(option.text);
    }
    return String(option);
  });
}

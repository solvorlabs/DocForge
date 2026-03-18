import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Pagination,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  IconButton,
  InputAdornment,
  Collapse,
  Stack,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  Avatar
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Book as BookIcon,
  School as SchoolIcon,
  Business as UniversityIcon,
  Language as GlobalIcon,
  Calculate as MathIcon,
  Engineering as EngineeringIcon
} from '@mui/icons-material';
import { Palette, Sparkles, Layout } from 'lucide-react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import QuestionViewer from '../../../shared/components/ui/QuestionViewer';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

function QuestionBank() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [viewMode, setViewMode] = useState(localStorage.getItem('questionBankMode') || 'competitive');
  const [examType, setExamType] = useState(searchParams.get('exam') || 'jee');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [uiTheme, setUiTheme] = useState(localStorage.getItem('questionBankTheme') || 'doodle');

  // University mode state
  const [universities, setUniversities] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [universitySyllabus, setUniversitySyllabus] = useState([]);

  // Filter states
  const [filters, setFilters] = useState({
    subject: searchParams.get('subject') || '',
    topic: searchParams.get('topic') || '',
    difficulty: searchParams.get('difficulty') || '',
    questionType: searchParams.get('questionType') || '',
    year: searchParams.get('year') || '',
    search: searchParams.get('search') || ''
  });

  // Pagination
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Filter options
  const [filterOptions, setFilterOptions] = useState({
    subjects: [],
    topics: [],
    years: [],
    difficulties: [],
    questionTypes: []
  });

  // Persist view mode preference
  useEffect(() => {
    localStorage.setItem('questionBankMode', viewMode);
  }, [viewMode]);

  // Load universities when entering semester mode
  useEffect(() => {
    if (viewMode === 'university' && universities.length === 0) {
      fetchUniversities();
    }
  }, [viewMode]);

  // Load syllabus when university selected
  useEffect(() => {
    if (selectedUniversity) {
      fetchUniversitySyllabus(selectedUniversity.code);
    } else {
      setUniversitySyllabus([]);
    }
  }, [selectedUniversity]);

  // Fetch filter options
  useEffect(() => {
    fetchFilterOptions();
  }, [examType]);

  // Fetch questions when filters or page changes
  useEffect(() => {
    // In university mode, don't fetch until subject or search is chosen
    if (examType === 'university' && !filters.subject && !filters.search) return;
    fetchQuestions();
  }, [examType, filters, page, selectedUniversity]);

  // Fetch topics when subject changes
  useEffect(() => {
    if (filters.subject) {
      fetchTopics(filters.subject);
    } else {
      setFilterOptions(prev => ({ ...prev, topics: [] }));
    }
  }, [filters.subject, examType]);

  const fetchUniversities = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/exam-questions/universities`);
      const data = await response.json();
      if (data.success) {
        setUniversities(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching universities:', err);
    }
  };

  const fetchUniversitySyllabus = async (code) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/exam-questions/university/${code}/syllabus`);
      const data = await response.json();
      if (data.success) {
        setUniversitySyllabus(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching syllabus:', err);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/exam-questions/filters/${examType}`);
      const data = await response.json();

      if (data.success) {
        // Ensure all arrays exist in the response, fallback to empty arrays
        setFilterOptions({
          subjects: data.data?.subjects || [],
          topics: data.data?.topics || [],
          years: data.data?.years || [],
          difficulties: data.data?.difficulties || [],
          questionTypes: data.data?.questionTypes || []
        });
      }
    } catch (err) {
      console.error('Error fetching filter options:', err);
      // Reset to empty arrays on error
      setFilterOptions({
        subjects: [],
        topics: [],
        years: [],
        difficulties: [],
        questionTypes: []
      });
    }
  };

  const fetchTopics = async (subject) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/exam-questions/topics/${examType}?subject=${encodeURIComponent(subject)}`
      );
      const data = await response.json();

      if (data.success) {
        setFilterOptions(prev => ({
          ...prev,
          topics: data.data || []
        }));
      } else {
        // Reset topics if request fails
        setFilterOptions(prev => ({
          ...prev,
          topics: []
        }));
      }
    } catch (err) {
      console.error('Error fetching topics:', err);
      // Reset topics on error
      setFilterOptions(prev => ({
        ...prev,
        topics: []
      }));
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(filters.subject && { subject: filters.subject }),
        ...(filters.topic && { topic: filters.topic }),
        ...(filters.difficulty && { difficulty: filters.difficulty }),
        ...(filters.questionType && { questionType: filters.questionType }),
        ...(filters.year && { year: filters.year }),
        ...(filters.search && { search: filters.search }),
        ...(examType === 'university' && selectedUniversity && { university: selectedUniversity.code })
      });

      const typeToFetch = examType;
      const response = await fetch(
        `${API_BASE_URL}/api/exam-questions/browse/${typeToFetch}?${params}`
      );
      const data = await response.json();

      if (data.success) {
        setQuestions(data.data);
        setPagination(data.pagination);
      } else {
        setError(data.message || 'Failed to fetch questions');
      }
    } catch (err) {
      setError('Error loading questions. Please try again.');
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExamTypeChange = (newValue) => {
    setExamType(newValue);
    setPage(1);
    setFilters({
      subject: '',
      topic: '',
      difficulty: '',
      questionType: '',
      year: '',
      search: ''
    });
    updateURL(newValue, {}, 1);
  };

  const handleViewModeChange = (mode) => {
    if (!mode) return;
    setViewMode(mode);
    setQuestions([]);
    setPage(1);
    setFilters({
      subject: '',
      topic: '',
      difficulty: '',
      questionType: '',
      year: '',
      search: ''
    });
    if (mode === 'competitive') {
      handleExamTypeChange('jee');
      setSelectedUniversity(null);
    } else {
      handleExamTypeChange('university');
      // In semester mode, questions load after subject selection
    }
  };

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };

    // Reset topic if subject changes
    if (field === 'subject') {
      newFilters.topic = '';
    }

    setFilters(newFilters);
    setPage(1);
    updateURL(examType, newFilters, 1);
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleSearchSubmit = () => {
    setPage(1);
    updateURL(examType, filters, 1);
    fetchQuestions();
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    updateURL(examType, filters, newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    const newFilters = {
      subject: '',
      topic: '',
      difficulty: '',
      questionType: '',
      year: '',
      search: ''
    };
    setFilters(newFilters);
    setPage(1);
    updateURL(examType, newFilters, 1);
  };

  const updateURL = (exam, filterData, pageNum) => {
    const params = new URLSearchParams({ exam });

    if (filterData.subject) params.set('subject', filterData.subject);
    if (filterData.topic) params.set('topic', filterData.topic);
    if (filterData.difficulty) params.set('difficulty', filterData.difficulty);
    if (filterData.questionType) params.set('questionType', filterData.questionType);
    if (filterData.year) params.set('year', filterData.year);
    if (filterData.search) params.set('search', filterData.search);
    if (pageNum > 1) params.set('page', pageNum.toString());

    setSearchParams(params);
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== '').length;

  // Helper functions for LaTeX rendering in preview
  const unescapeLatex = (text) => {
    if (!text) return '';
    return text.replace(/\\\\\\\\/g, '\\\\').replace(/\\\\/g, '\\');
  };

  const renderPreviewText = (text) => {
    if (!text) return null;

    // Remove HTML tags
    let cleanText = text.replace(/<[^>]*>/g, '');

    // Extract LaTeX and render
    const parts = [];
    const latexRegex = /\$([^$]+)\$/g;
    let lastIndex = 0;
    let match;

    while ((match = latexRegex.exec(cleanText)) !== null) {
      // Add text before LaTeX
      if (match.index > lastIndex) {
        const textContent = cleanText.substring(lastIndex, match.index);
        if (textContent) {
          parts.push(<span key={`text-${lastIndex}`}>{textContent}</span>);
        }
      }

      // Add LaTeX rendering
      try {
        const latexContent = unescapeLatex(match[1].trim());
        parts.push(<InlineMath key={`math-${match.index}`} math={latexContent} />);
      } catch (e) {
        parts.push(<span key={`error-${match.index}`}>{match[1]}</span>);
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < cleanText.length) {
      const remainingText = cleanText.substring(lastIndex);
      if (remainingText) {
        parts.push(<span key={`text-${lastIndex}`}>{remainingText}</span>);
      }
    }

    // If no LaTeX was found, return the clean text
    if (parts.length === 0) {
      return cleanText;
    }

    return <>{parts}</>;
  };



  // Theme-based styling
  const getThemeStyles = () => {
    switch (uiTheme) {
      case 'neo':
        return {
          container: {
            bgcolor: 'rgba(255, 255, 255, 0.3)',
            minHeight: '100vh'
          },
          paper: {
            border: '3px solid black',
            boxShadow: '8px 8px 0px black',
            borderRadius: 0,
            bgcolor: 'white'
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
            boxShadow: '6px 6px 0px black',
            bgcolor: 'rgba(255, 255, 255, 0.3)',

            transition: 'all 0.2s',
            '&:hover': {
              transform: 'translate(-3px, -3px)',
              boxShadow: '9px 9px 0px black'
            }
          },
          chip: {
            border: '2px solid black',
            borderRadius: '4px',
            fontWeight: 600
          }
        };

      case 'doodle':
        return {
          container: {
            bgcolor: 'rgba(255, 255, 255, 0.3)',

            minHeight: '100vh',
            backgroundImage: `
              radial-gradient(circle at 10% 20%, rgba(255, 200, 124, 0.1) 0%, transparent 20%),
              radial-gradient(circle at 90% 80%, rgba(124, 200, 255, 0.1) 0%, transparent 20%)
            `
          },
          paper: {
            border: '2px solid #2d3436',
            borderRadius: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            bgcolor: 'rgba(255, 255, 255, 0.3)',

            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -2,
              left: -2,
              right: -2,
              bottom: -2,
              background: 'linear-gradient(45deg, #ffeaa7, #74b9ff, #a29bfe, #fd79a8)',
              borderRadius: '20px',
              zIndex: -1,
              opacity: 0.3
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
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            bgcolor: 'white',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-4px) rotate(0.5deg)',
              boxShadow: '0 12px 24px rgba(0,0,0,0.12)'
            }
          },
          chip: {
            borderRadius: '10px',
            fontWeight: 500,
            border: '1.5px solid currentColor'
          }
        };

      default: // basic
        return {
          container: {
            bgcolor: 'rgba(255, 255, 255, 0.3)',

          },
          paper: {
            bgcolor: 'rgba(255, 255, 255, 0.3)',
            border: '1px solid',
          },
          button: {},
          card: {
            // bgcolor: 'rgba(255, 255, 255, 0.3)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
              boxShadow: 4,
              transform: 'translateY(-2px)'
            }
          },
          chip: {}
        };
    }
  };

  const themeStyles = getThemeStyles();

  return (
    <>
      <Helmet>
        <title>JEE, NEET &amp; GATE Question Bank – Filterable Practice on CompeteHub</title>
        <meta
          name="description"
          content="Browse thousands of JEE, NEET &amp; GATE questions with filters by subject, topic, difficulty and year. Practice with detailed explanations and LaTeX math rendering."
        />
        <meta
          name="keywords"
          content="JEE question bank, NEET question bank, GATE CSE question bank, previous year questions, topic-wise practice, exam filters, detailed explanations"
        />
      </Helmet>
      <Container maxWidth="xl" sx={{ py: 4, ...themeStyles.container }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              {uiTheme === 'doodle' && <Sparkles size={24} style={{ transform: 'rotate(-240deg)' }} />}
              Question Bank
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {viewMode === 'competitive'
                ? 'Practice competitive exams like JEE, GATE, SAT, GAOKAO and CAT.'
                : 'Browse semester exam questions organised by university and subject.'}
            </Typography>
          </Box>

          {/* Theme Toggle */}
          <Box>
            <IconButton
              onClick={() => {
                const themes = ['basic', 'neo', 'doodle'];
                const currentIndex = themes.indexOf(uiTheme);
                const nextIndex = (currentIndex + 1) % themes.length;
                const newTheme = themes[nextIndex];
                setUiTheme(newTheme);
                localStorage.setItem('questionBankTheme', newTheme);
              }}
              sx={{
                width: 48,
                height: 48,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: `rotate(${uiTheme === 'basic' ? '0deg' : uiTheme === 'neo' ? '120deg' : '240deg'})`,
                bgcolor: uiTheme === 'basic' ? 'grey.100' : uiTheme === 'neo' ? 'primary.light' : 'secondary.light',
                border: uiTheme === 'neo' ? '2px solid black' : 'none',
                borderRadius: uiTheme === 'doodle' ? '50% 40% 60% 30%' : uiTheme === 'neo' ? 0 : '50%',
                boxShadow: uiTheme === 'neo' ? '4px 4px 0px black' : uiTheme === 'doodle' ? '0 4px 12px rgba(0,0,0,0.15)' : 2,
                '&:hover': {
                  transform: `rotate(${uiTheme === 'basic' ? '0deg' : uiTheme === 'neo' ? '120deg' : '240deg'}) scale(1.1)`,
                  bgcolor: uiTheme === 'basic' ? 'grey.200' : uiTheme === 'neo' ? 'primary.main' : 'secondary.main',
                  boxShadow: uiTheme === 'neo' ? '6px 6px 0px black' : uiTheme === 'doodle' ? '0 8px 20px rgba(0,0,0,0.2)' : 4,
                }
              }}
            >
              {uiTheme === 'basic' && <Layout size={24} style={{ transform: 'rotate(0deg)' }} />}
              {uiTheme === 'neo' && <Palette size={24} style={{ transform: 'rotate(-120deg)' }} />}
              {uiTheme === 'doodle' && <Sparkles size={24} style={{ transform: 'rotate(-240deg)' }} />}
            </IconButton>
          </Box>
        </Box>

        {/* What are you looking for? (mode selection) */}
        <Box sx={{ mb: 1, display: 'flex', justifyContent: 'center' }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, mode) => handleViewModeChange(mode)}
            aria-label="mode-select"
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.3)',
              // borderRadius: '999px',
              boxShadow: uiTheme === 'doodle' ? 3 : 1,
              p: 0.5
            }}
          >
            <ToggleButton value="competitive" sx={{ px: 3 }}>
              <GlobalIcon sx={{ mr: 1 }} /> Competitive Exams
            </ToggleButton>
            <ToggleButton value="university" sx={{ px: 3 }}>
              <UniversityIcon sx={{ mr: 1 }} /> Semester Exams
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Competitive exam shortcuts */}
        {viewMode === 'competitive' && (
          <Paper sx={{ mb: 3, p: 2, ...themeStyles.paper }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Choose your exam</Typography>
            <Grid container spacing={1}>
              {[
                { id: 'jee', label: 'JEE Main', icon: <SchoolIcon /> },
                { id: 'gate', label: 'GATE (CSE/ME/EE/MA)', icon: <EngineeringIcon /> },
                { id: 'sat', label: 'SAT', icon: <GlobalIcon /> },
                { id: 'gaokao', label: 'GAOKAO', icon: <BookIcon /> },
                { id: 'cat', label: 'CAT', icon: <MathIcon /> }
              ].map((exam) => (
                <Grid item key={exam.id}>
                  <Card
                    onClick={() => handleExamTypeChange(exam.id)}
                    sx={{
                      cursor: 'pointer',
                      ...themeStyles.card,
                      borderColor: examType === exam.id ? 'primary.main' : 'divider',
                      bgcolor: examType === exam.id ? 'lightskyblue' : 'rgba(255, 255, 255, 0.5)',
                      border: '1px solid',
                    }}
                  >
                    <div style={{ textAlign: 'center', display: 'flex', alignItems: 'center', gap: 1, paddingTop: 8, paddingBottom: 8, paddingLeft: 12, paddingRight: 12 }}>
                      <Box sx={{}}>{exam.icon}</Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{exam.label}</Typography>
                    </div>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}

        {/* University selection flow */}
        {viewMode === 'university' && !selectedUniversity && (
          <Paper sx={{ mb: 3, p: 3, ...themeStyles.paper }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Select your university</Typography>
            <Grid container spacing={2}>
              {universities.map((uni) => (
                <Grid item xs={12} sm={6} md={4} key={uni.code}>
                  <Card sx={{ cursor: 'pointer', ...themeStyles.card }} onClick={() => setSelectedUniversity(uni)}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {/* <Avatar sx={{ bgcolor: 'primary.main' }}>{uni.code.slice(0, 2)}</Avatar> */}
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{uni.code}</Typography>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: 180
                            }}
                          >
                            {uni.name}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}

        {viewMode === 'university' && selectedUniversity && !filters.subject && !filters.search && (
          <Paper sx={{ mb: 3, p: 3, ...themeStyles.paper }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>{selectedUniversity.code.slice(0, 2)}</Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>{selectedUniversity.name}</Typography>
                  <Typography variant="body2" color="text.secondary">Select a subject to start practising</Typography>
                </Box>
              </Box>
              <Button size="small" onClick={() => setSelectedUniversity(null)}>Change University</Button>
            </Box>
            <Grid container spacing={2}>
              {universitySyllabus.map((subj, idx) => (
                <Grid item xs={12} sm={6} md={4} key={`${subj.code}-${idx}`}>
                  <Card
                    sx={{ cursor: 'pointer', ...themeStyles.card }}
                    onClick={() => handleFilterChange('subject', subj.name)}
                  >
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{subj.name}</Typography>
                      {subj.code && (
                        <Typography variant="body2" color="text.secondary">{subj.code}</Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}

        {/* Search and Filter Toggle */}
        <Paper sx={{ p: 2, mb: 2, ...themeStyles.paper }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              placeholder="Search questions..."
              value={filters.search}
              onChange={handleSearchChange}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: filters.search && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => handleFilterChange('search', '')}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: uiTheme === 'neo' ? { borderRadius: 0 } : uiTheme === 'doodle' ? { borderRadius: '12px' } : {}
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button
                startIcon={<FilterIcon />}
                onClick={() => setShowFilters(!showFilters)}
                variant="outlined"
                sx={themeStyles.button}
              >
                Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </Button>

              {activeFilterCount > 0 && (
                <Button
                  startIcon={<ClearIcon />}
                  onClick={clearFilters}
                  size="small"
                  sx={themeStyles.button}
                >
                  Clear All
                </Button>
              )}
            </Box>
          </Stack>
        </Paper>

        {/* Filters */}
        <Collapse in={showFilters}>
          <Paper sx={{ p: 3, mb: 3, ...themeStyles.paper }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Subject</InputLabel>
                  <Select
                    value={filters.subject}
                    onChange={(e) => handleFilterChange('subject', e.target.value)}
                    label="Subject"
                  >
                    <MenuItem value="">All Subjects</MenuItem>
                    {filterOptions.subjects?.map((subject) => (
                      <MenuItem key={subject.name} value={subject.name}>
                        {subject.name} ({subject.count})
                      </MenuItem>
                    )) || []}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth disabled={!filters.subject}>
                  <InputLabel>Topic</InputLabel>
                  <Select
                    value={filters.topic}
                    onChange={(e) => handleFilterChange('topic', e.target.value)}
                    label="Topic"
                  >
                    <MenuItem value="">All Topics</MenuItem>
                    {filterOptions.topics?.map((topic) => (
                      <MenuItem key={topic.name} value={topic.name}>
                        {topic.name} ({topic.count})
                      </MenuItem>
                    )) || []}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Difficulty</InputLabel>
                  <Select
                    value={filters.difficulty}
                    onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                    label="Difficulty"
                  >
                    <MenuItem value="">All</MenuItem>
                    {filterOptions.difficulties?.map((diff) => (
                      <MenuItem key={diff.level} value={diff.level}>
                        {diff.level} ({diff.count})
                      </MenuItem>
                    )) || []}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={filters.questionType}
                    onChange={(e) => handleFilterChange('questionType', e.target.value)}
                    label="Type"
                  >
                    <MenuItem value="">All Types</MenuItem>
                    {filterOptions.questionTypes?.map((type) => (
                      <MenuItem key={type.type} value={type.type}>
                        {type.type} ({type.count})
                      </MenuItem>
                    )) || []}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Year</InputLabel>
                  <Select
                    value={filters.year}
                    onChange={(e) => handleFilterChange('year', e.target.value)}
                    label="Year"
                  >
                    <MenuItem value="">All Years</MenuItem>
                    {filterOptions.years?.map((yearData) => (
                      <MenuItem key={yearData.year} value={yearData.year}>
                        {yearData.year} ({yearData.count})
                      </MenuItem>
                    )) || []}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Active Filters Display */}
            {activeFilterCount > 0 && (
              <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {filters.subject && (
                  <Chip
                    label={`Subject: ${filters.subject}`}
                    onDelete={() => handleFilterChange('subject', '')}
                    size="small"
                    sx={themeStyles.chip}
                  />
                )}
                {filters.topic && (
                  <Chip
                    label={`Topic: ${filters.topic}`}
                    onDelete={() => handleFilterChange('topic', '')}
                    size="small"
                    sx={themeStyles.chip}
                  />
                )}
                {filters.difficulty && (
                  <Chip
                    label={`Difficulty: ${filters.difficulty}`}
                    onDelete={() => handleFilterChange('difficulty', '')}
                    size="small"
                    sx={themeStyles.chip}
                  />
                )}
                {filters.questionType && (
                  <Chip
                    label={`Type: ${filters.questionType}`}
                    onDelete={() => handleFilterChange('questionType', '')}
                    size="small"
                    sx={themeStyles.chip}
                  />
                )}
                {filters.year && (
                  <Chip
                    label={`Year: ${filters.year}`}
                    onDelete={() => handleFilterChange('year', '')}
                    size="small"
                    sx={themeStyles.chip}
                  />
                )}
              </Box>
            )}
          </Paper>
        </Collapse>

        {/* Results Info */}
        {!loading && !error && (
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontWeight: uiTheme !== 'basic' ? 600 : 400,
                fontSize: '0.875rem'
              }}
            >
              {/* Showing {questions.filter(q => !q.has_images).length} text-based questions */}
              Showing {questions.length} questions
              {pagination.totalPages > 1 && ` • Page ${pagination.page} of ${pagination.totalPages}`}
              {pagination.total > 0 && ` • ${pagination.total.toLocaleString()} total`}
            </Typography>
          </Box>
        )}

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Questions List */}
        {!loading && !error && questions.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Looks like our developers are lazy and haven't added questions for these filters yet! Sorry Complain and suggest at contact.essolutions@gmail.com
            </Typography>
            <Button onClick={clearFilters} sx={{ mt: 2 }}>
              Clear Filters
            </Button>
          </Paper>
        )}

        {!loading && questions.length > 0 && (
          <Grid container spacing={3}>
            {questions
              // .filter(question => !question.has_images) // Filter out questions with images
              .map((question, index) => (
                <Grid item xs={12} key={question._id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      ...themeStyles.card
                    }}
                    onClick={() => setSelectedQuestion(question)}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          sx={{
                            fontWeight: uiTheme !== 'basic' ? 700 : 600,
                            fontSize: '0.875rem',
                            textTransform: 'uppercase',
                            letterSpacing: 0.5
                          }}
                        >
                          Question {(page - 1) * pagination.limit + index + 1}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                          {question.year && (
                            <Chip
                              label={question.year}
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={themeStyles.chip}
                            />
                          )}
                          {question.difficulty_level && (
                            <Chip
                              label={question.difficulty_level}
                              size="small"
                              color={
                                question.difficulty_level === 'Easy' ? 'success' :
                                  question.difficulty_level === 'Medium' ? 'warning' : 'error'
                              }
                              sx={themeStyles.chip}
                            />
                          )}
                          <Chip
                            label={question.question_type}
                            size="small"
                            sx={themeStyles.chip}
                          />
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          mb: 2,
                          fontWeight: uiTheme === 'neo' ? 500 : 400,
                          fontSize: '1.05rem',
                          lineHeight: 1.7,
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          textOverflow: 'ellipsis',
                          minHeight: '60px'
                        }}
                      >
                        <Typography variant="body1" component="div">
                          {renderPreviewText(question.question_statement)}
                        </Typography>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                        <Chip
                          label={question.subject}
                          size="small"
                          variant="outlined"
                          sx={themeStyles.chip}
                        />
                        <Chip
                          label={question.topic}
                          size="small"
                          variant="outlined"
                          sx={themeStyles.chip}
                        />
                        {question.explanation && (
                          <Chip
                            label={uiTheme === 'basic' ? '📝 Has Explanation' : 'Has Explanation'}
                            size="small"
                            color="success"
                            variant="outlined"
                            sx={themeStyles.chip}
                          />
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
          </Grid>
        )}

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={pagination.totalPages}
              page={pagination.page}
              onChange={handlePageChange}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
            />
          </Box>
        )}

        {/* Question Viewer Dialog */}
        {selectedQuestion && (
          <QuestionViewer
            question={selectedQuestion}
            examType={examType}
            onClose={() => setSelectedQuestion(null)}
            uiTheme={uiTheme}
          />
        )}
      </Container>
    </>
  );
}

export default QuestionBank;


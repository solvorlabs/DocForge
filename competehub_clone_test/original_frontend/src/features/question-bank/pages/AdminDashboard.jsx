import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  Snackbar,
  Divider,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  CircularProgress
} from '@mui/material';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [universities, setUniversities] = useState([]);

  // Form States
  const [uniForm, setUniForm] = useState({ name: '', code: '', location: '' });
  const [questionForm, setQuestionForm] = useState({
    examType: 'university', // university, jee, gate, sat, etc.
    question_statement: '',
    correct_answer: '',
    options: ['', '', '', ''],
    subject: '',
    topic: '',
    difficulty_level: 'Medium',
    question_type: 'MCQ',
    universities: [], // For university specific tagging
    marks: 4
  });

  // Admin selects for subjects/topics
  const [examSubjects, setExamSubjects] = useState([]);
  const [examTopics, setExamTopics] = useState([]);

  // Question list for admin view
  const [questionListExam, setQuestionListExam] = useState('jee');
  const [questionListSubject, setQuestionListSubject] = useState('');
  const [questionListTopic, setQuestionListTopic] = useState('');
  const [questionList, setQuestionList] = useState([]);
  const [questionListLoading, setQuestionListLoading] = useState(false);

  useEffect(() => {
    fetchUniversities();
    // Preload subjects for default exam type
    fetchSubjectsForExam(questionForm.examType).catch(() => {});
  }, []);

  const fetchUniversities = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/exam-questions/universities`);
      const data = await res.json();
      if (data.success) setUniversities(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubjectsForExam = async (examType) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/exam-questions/subjects?examType=${examType}`);
      const data = await res.json();
      if (data.success) {
        setExamSubjects(data.data || []);
      } else {
        setExamSubjects([]);
      }
    } catch (err) {
      console.error('Failed to fetch subjects', err);
      setExamSubjects([]);
    }
  };

  const fetchTopicsForExam = async (examType, subjectName) => {
    if (!subjectName) {
      setExamTopics([]);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/exam-questions/topics?examType=${examType}&subject=${encodeURIComponent(subjectName)}`);
      const data = await res.json();
      if (data.success) {
        setExamTopics(data.data || []);
      } else {
        setExamTopics([]);
      }
    } catch (err) {
      console.error('Failed to fetch topics', err);
      setExamTopics([]);
    }
  };

  const fetchAdminQuestions = async () => {
    setQuestionListLoading(true);
    try {
      const params = new URLSearchParams({
        examType: questionListExam,
        limit: '100',
        ...(questionListSubject && { subject: questionListSubject }),
        ...(questionListTopic && { topic: questionListTopic })
      });
      const res = await fetch(`${API_BASE_URL}/api/exam-questions/admin/questions?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setQuestionList(data.data || []);
      } else {
        setQuestionList([]);
      }
    } catch (err) {
      console.error('Failed to fetch admin questions', err);
      setQuestionList([]);
    } finally {
      setQuestionListLoading(false);
    }
  };

  const handleUniSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/exam-questions/admin/university`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
           ...uniForm,
           semesters: [] // Default empty semesters
        })
      });
      const data = await res.json();
      if (data.success) {
        setSnackbar({ open: true, message: 'University created!', severity: 'success' });
        setUniForm({ name: '', code: '', location: '' });
        fetchUniversities();
      } else {
        setSnackbar({ open: true, message: data.message, severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Error creating university', severity: 'error' });
    }
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...questionForm };
      
      // Map universities array only for university examType
      if (payload.examType !== 'university') {
        delete payload.universities;
      }

      const res = await fetch(`${API_BASE_URL}/api/exam-questions/admin/question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setSnackbar({ open: true, message: 'Question created!', severity: 'success' });
        // Reset essential fields
        setQuestionForm(prev => ({ ...prev, question_statement: '', options: ['', '', '', ''], correct_answer: '' }));
      } else {
        setSnackbar({ open: true, message: data.message, severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Error creating question', severity: 'error' });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Question Bank Admin</Typography>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab label="Add University" />
          <Tab label="Add Question" />
          <Tab label="View Questions" />
        </Tabs>
      </Paper>

      {/* Add University Tab */}
      {activeTab === 0 && (
        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleUniSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth label="University Name" 
                  value={uniForm.name}
                  onChange={e => setUniForm({...uniForm, name: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField 
                  fullWidth label="Code (e.g. DTU)" 
                  value={uniForm.code}
                  onChange={e => setUniForm({...uniForm, code: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField 
                  fullWidth label="Location" 
                  value={uniForm.location}
                  onChange={e => setUniForm({...uniForm, location: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" type="submit">Create University</Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      )}

      {/* Add Question Tab */}
      {activeTab === 1 && (
        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleQuestionSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Exam Type</InputLabel>
                  <Select 
                    value={questionForm.examType} 
                    label="Exam Type"
                    onChange={async (e) => {
                      const value = e.target.value;
                      setQuestionForm(prev => ({ ...prev, examType: value, subject: '', topic: '' }));
                      setExamTopics([]);
                      await fetchSubjectsForExam(value);
                    }}
                  >
                    <MenuItem value="university">University / Semester</MenuItem>
                    <MenuItem value="jee">JEE Main</MenuItem>
                    <MenuItem value="gate">GATE</MenuItem>
                    <MenuItem value="sat">SAT</MenuItem>
                    <MenuItem value="gaokao">GAOKAO</MenuItem>
                    <MenuItem value="cat">CAT</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Subject</InputLabel>
                  <Select
                    value={questionForm.subject}
                    label="Subject"
                    onChange={async (e) => {
                      const value = e.target.value;
                      setQuestionForm(prev => ({ ...prev, subject: value, topic: '' }));
                      await fetchTopicsForExam(questionForm.examType, value);
                    }}
                    required
                  >
                    <MenuItem value="">
                      <em>Select Subject</em>
                    </MenuItem>
                    {examSubjects.map((s) => (
                      <MenuItem key={s.name} value={s.name}>{s.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth disabled={!questionForm.subject}>
                  <InputLabel>Topic</InputLabel>
                  <Select
                    value={questionForm.topic}
                    label="Topic"
                    onChange={(e) => setQuestionForm(prev => ({ ...prev, topic: e.target.value }))}
                    required
                  >
                    <MenuItem value="">
                      <em>Select Topic</em>
                    </MenuItem>
                    {examTopics.map((t) => (
                      <MenuItem key={t.name} value={t.name}>{t.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField 
                  fullWidth multiline rows={3} 
                  label="Question Statement" 
                  value={questionForm.question_statement}
                  onChange={e => setQuestionForm({...questionForm, question_statement: e.target.value})}
                  required
                />
              </Grid>

              {/* Options (for MCQ) */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Options (for MCQ)</Typography>
              </Grid>
              {[0, 1, 2, 3].map((idx) => (
                <Grid item xs={12} sm={6} key={idx}>
                  <TextField 
                    fullWidth label={`Option ${String.fromCharCode(65 + idx)}`}
                    value={questionForm.options[idx]}
                    onChange={e => {
                      const newOptions = [...questionForm.options];
                      newOptions[idx] = e.target.value;
                      setQuestionForm({...questionForm, options: newOptions});
                    }}
                  />
                </Grid>
              ))}

              <Grid item xs={12} sm={6}>
                 <TextField 
                  fullWidth label="Correct Answer" 
                  value={questionForm.correct_answer}
                  onChange={e => setQuestionForm({...questionForm, correct_answer: e.target.value})}
                  helperText="Enter the exact option text or value"
                  required
                />
              </Grid>

               <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Difficulty</InputLabel>
                  <Select 
                    value={questionForm.difficulty_level} 
                    label="Difficulty"
                    onChange={e => setQuestionForm({...questionForm, difficulty_level: e.target.value})}
                  >
                    <MenuItem value="Easy">Easy</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="Hard">Hard</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {questionForm.examType === 'university' && (
                <Grid item xs={12} sm={12}>
                  <FormControl fullWidth>
                    <InputLabel>Tag Universities (optional)</InputLabel>
                    <Select
                      multiple
                      value={questionForm.universities}
                      label="Tag Universities (optional)"
                      onChange={(e) => setQuestionForm(prev => ({ ...prev, universities: e.target.value }))}
                      renderValue={(selected) => selected.join(', ')}
                    >
                      {universities.map((u) => (
                        <MenuItem key={u.code} value={u.code}>{u.code} - {u.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              <Grid item xs={12}>
                <Button variant="contained" type="submit">Add Question</Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      )}

      {/* View Questions Tab */}
      {activeTab === 2 && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <FormControl sx={{ minWidth: 160 }}>
              <InputLabel>Exam</InputLabel>
              <Select
                value={questionListExam}
                label="Exam"
                onChange={async (e) => {
                  const value = e.target.value;
                  setQuestionListExam(value);
                  setQuestionListSubject('');
                  setQuestionListTopic('');
                  setExamTopics([]);
                  await fetchSubjectsForExam(value);
                }}
              >
                <MenuItem value="jee">JEE</MenuItem>
                <MenuItem value="gate">GATE</MenuItem>
                <MenuItem value="sat">SAT</MenuItem>
                <MenuItem value="gaokao">GAOKAO</MenuItem>
                <MenuItem value="cat">CAT</MenuItem>
                <MenuItem value="university">University</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 160 }}>
              <InputLabel>Subject</InputLabel>
              <Select
                value={questionListSubject}
                label="Subject"
                onChange={async (e) => {
                  const value = e.target.value;
                  setQuestionListSubject(value);
                  setQuestionListTopic('');
                  await fetchTopicsForExam(questionListExam, value);
                }}
              >
                <MenuItem value="">
                  <em>All</em>
                </MenuItem>
                {examSubjects.map((s) => (
                  <MenuItem key={s.name} value={s.name}>{s.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 160 }} disabled={!questionListSubject}>
              <InputLabel>Topic</InputLabel>
              <Select
                value={questionListTopic}
                label="Topic"
                onChange={(e) => setQuestionListTopic(e.target.value)}
              >
                <MenuItem value="">
                  <em>All</em>
                </MenuItem>
                {examTopics.map((t) => (
                  <MenuItem key={t.name} value={t.name}>{t.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button variant="contained" onClick={fetchAdminQuestions}>
              Refresh List
            </Button>
          </Box>

          {questionListLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Exam</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Topic</TableCell>
                  <TableCell>Difficulty</TableCell>
                  <TableCell>Question</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {questionList.map((q) => (
                  <TableRow key={q._id} hover>
                    <TableCell>{q.exam_type || questionListExam.toUpperCase()}</TableCell>
                    <TableCell>{q.subject}</TableCell>
                    <TableCell>{q.topic}</TableCell>
                    <TableCell>
                      {q.difficulty_level && (
                        <Chip size="small" label={q.difficulty_level} />
                      )}
                    </TableCell>
                    <TableCell>{(q.question_statement || '').slice(0, 80)}...</TableCell>
                  </TableRow>
                ))}
                {questionList.length === 0 && !questionListLoading && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No questions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </Paper>
      )}

      <Snackbar
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({...snackbar, open: false})}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
}

export default AdminDashboard;

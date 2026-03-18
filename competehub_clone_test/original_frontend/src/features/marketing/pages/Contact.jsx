import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Paper, Button, TextField, Grid } from '@mui/material';
import { ArrowLeft, Mail, MessageSquare, HelpCircle, Send, CheckCircle } from 'lucide-react';
import '../../../styles/themes/legal.css';

function Contact() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In production, this would send to your backend
    console.log('Contact form submitted:', formData);
    setSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  const contactMethods = [
    {
      icon: <Mail size={32} />,
      title: 'Email Support',
      description: 'General inquiries and support',
      contact: 'contact.essolutions@gmail.com',
      color: 'var(--doodle-blue)'
    },
    {
      icon: <HelpCircle size={32} />,
      title: 'Technical Issues',
      description: 'Report bugs or technical problems',
      contact: 'contact.essolutions@gmail.com',
      color: 'var(--doodle-green)'
    },
    {
      icon: <MessageSquare size={32} />,
      title: 'Business & Partnerships',
      description: 'Collaboration opportunities',
      contact: 'contact.essolutions@gmail.com',
      color: 'var(--doodle-purple)'
    }
  ];

  return (
    <Box className="legal-page">
      {/* Header */}
      <Box className="legal-header">
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
            <Button
              startIcon={<ArrowLeft size={20} />}
              onClick={() => navigate(-1)}
              className="back-button"
              sx={{
                 
                fontWeight: 600,
                color: 'var(--doodle-ink)',
                border: '2px solid var(--doodle-ink)',
                bgcolor: 'white',
                px: 2,
                py: 1,
                '&:hover': {
                  bgcolor: 'var(--doodle-yellow)',
                  transform: 'translate(-2px, -2px)',
                  boxShadow: '4px 4px 0px var(--doodle-ink)'
                }
              }}
            >
              Back
            </Button>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Mail size={40} color="#6c5ce7" />
              <Box>
                <Typography
                  variant="h2"
                  sx={{
                     
                    fontWeight: 800,
                    fontSize: { xs: '1.75rem', md: '2.5rem' },
                    color: 'var(--doodle-ink)',
                    lineHeight: 1.2
                  }}
                >
                  Get In Touch
                </Typography>
              </Box>
            </Box>
          </Box>

          <Typography
            variant="body2"
            sx={{
               
              fontSize: '1rem',
              color: 'var(--doodle-ink)',
              textAlign: 'center',
              maxWidth: '800px',
              mx: 'auto',
              mb: 3
            }}
          >
            Have questions, feedback, or just want to say hi? We'd love to hear from you! 
            Our team typically responds within 24-48 hours.
          </Typography>
        </Container>
      </Box>

      <br />

      {/* Content */}
      <Container maxWidth="lg" sx={{ pb: 8 }}>
        <Grid container spacing={4}>
          {/* Contact Methods */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {contactMethods.map((method, index) => (
                <Paper
                  key={index}
                  elevation={0}
                  sx={{
                    p: 3,
                    border: '3px solid var(--doodle-ink)',
                    borderRadius: '16px',
                    bgcolor: 'white',
                    boxShadow: '6px 6px 0px var(--doodle-ink)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translate(-3px, -3px)',
                      boxShadow: '9px 9px 0px var(--doodle-ink)'
                    }
                  }}
                >
                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: method.color,
                      color: 'white',
                      borderRadius: '12px',
                      border: '2px solid var(--doodle-ink)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2
                    }}
                  >
                    {method.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                       
                      fontWeight: 700,
                      fontSize: '1.2rem',
                      color: 'var(--doodle-ink)',
                      mb: 1
                    }}
                  >
                    {method.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                       
                      fontSize: '0.95rem',
                      color: 'var(--doodle-ink)',
                      opacity: 0.7,
                      mb: 2
                    }}
                  >
                    {method.description}
                  </Typography>
                  <Typography
                    variant="body1"
                    component="a"
                    href={`mailto:${method.contact}`}
                    sx={{
                       
                      fontSize: '1rem',
                      color: method.color,
                      fontWeight: 600,
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    {method.contact}
                  </Typography>
                </Paper>
              ))}

              {/* Social Links */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  border: '3px solid var(--doodle-ink)',
                  borderRadius: '16px',
                  bgcolor: 'var(--doodle-yellow)',
                  boxShadow: '6px 6px 0px var(--doodle-ink)',
                  transform: 'rotate(-2deg)'
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                     
                    fontWeight: 700,
                    fontSize: '1.2rem',
                    color: 'var(--doodle-ink)',
                    mb: 2
                  }}
                >
                  Follow Us
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                     
                    fontSize: '0.95rem',
                    color: 'var(--doodle-ink)',
                    mb: 2
                  }}
                >
                  Stay updated with the latest features, challenges, and community events!
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography
                    variant="body2"
                    component="a"
                    href="https://twitter.com/ESSolutionss"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                       
                      fontSize: '0.95rem',
                      color: 'var(--doodle-ink)',
                      textDecoration: 'none',
                      '&:hover': { 
                        textDecoration: 'underline',
                        color: 'var(--doodle-blue)'
                      }
                    }}
                  >
                    🐦 Twitter: @ESSolutionss
                  </Typography>
                  <Typography
                    variant="body2"
                    component="a"
                    href="https://instagram.com/es_tech_solutions"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                       
                      fontSize: '0.95rem',
                      color: 'var(--doodle-ink)',
                      textDecoration: 'none',
                      '&:hover': { 
                        textDecoration: 'underline',
                        color: 'var(--doodle-purple)'
                      }
                    }}
                  >
                    📸 Instagram: @es_tech_solutions
                  </Typography>
                  <Typography
                    variant="body2"
                    component="a"
                    href="https://linkedin.com/company/es-solutionss"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                       
                      fontSize: '0.95rem',
                      color: 'var(--doodle-ink)',
                      textDecoration: 'none',
                      '&:hover': { 
                        textDecoration: 'underline',
                        color: 'var(--doodle-blue)'
                      }
                    }}
                  >
                    💼 LinkedIn: es-solutionss
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Grid>

          {/* Contact Form */}
          <Grid item xs={12} md={8}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 5 },
                border: '3px solid var(--doodle-ink)',
                borderRadius: '16px',
                bgcolor: 'white',
                boxShadow: '8px 8px 0px var(--doodle-ink)'
              }}
            >
              {submitted ? (
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2
                  }}
                >
                  <CheckCircle size={64} color="#55efc4" />
                  <Typography
                    variant="h4"
                    sx={{
                       
                      fontWeight: 700,
                      color: 'var(--doodle-ink)',
                      mb: 1
                    }}
                  >
                    Message Sent! 🎉
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                       
                      fontSize: '1.1rem',
                      color: 'var(--doodle-ink)',
                      opacity: 0.7
                    }}
                  >
                    Thanks for reaching out! We'll get back to you soon.
                  </Typography>
                </Box>
              ) : (
                <>
                  <Typography
                    variant="h4"
                    sx={{
                       
                      fontWeight: 700,
                      fontSize: { xs: '1.5rem', md: '2rem' },
                      color: 'var(--doodle-ink)',
                      mb: 1
                    }}
                  >
                    Send us a Message
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                       
                      fontSize: '1rem',
                      color: 'var(--doodle-ink)',
                      opacity: 0.7,
                      mb: 4
                    }}
                  >
                    Fill out the form below and we'll respond as soon as possible.
                  </Typography>

                  <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Your Name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          sx={{
                            '& .MuiOutlinedInput-root': {
                               
                              '& fieldset': {
                                borderWidth: '2px',
                                borderColor: 'var(--doodle-ink)'
                              }
                            },
                            '& .MuiInputLabel-root': {
                               
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Your Email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          sx={{
                            '& .MuiOutlinedInput-root': {
                               
                              '& fieldset': {
                                borderWidth: '2px',
                                borderColor: 'var(--doodle-ink)'
                              }
                            },
                            '& .MuiInputLabel-root': {
                               
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          sx={{
                            '& .MuiOutlinedInput-root': {
                               
                              '& fieldset': {
                                borderWidth: '2px',
                                borderColor: 'var(--doodle-ink)'
                              }
                            },
                            '& .MuiInputLabel-root': {
                               
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          multiline
                          rows={6}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                               
                              '& fieldset': {
                                borderWidth: '2px',
                                borderColor: 'var(--doodle-ink)'
                              }
                            },
                            '& .MuiInputLabel-root': {
                               
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          size="large"
                          endIcon={<Send size={20} />}
                          sx={{
                             
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            textTransform: 'none',
                            bgcolor: 'var(--doodle-blue)',
                            color: 'white',
                            border: '3px solid var(--doodle-ink)',
                            boxShadow: '6px 6px 0px var(--doodle-ink)',
                            px: 4,
                            py: 1.5,
                            '&:hover': {
                              bgcolor: 'var(--doodle-purple)',
                              transform: 'translate(-3px, -3px)',
                              boxShadow: '9px 9px 0px var(--doodle-ink)'
                            }
                          }}
                        >
                          Send Message
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Additional Info */}
        <Paper
          elevation={0}
          sx={{
            mt: 4,
            p: 4,
            border: '3px solid var(--doodle-ink)',
            borderRadius: '16px',
            bgcolor: 'var(--doodle-green)',
            boxShadow: '8px 8px 0px var(--doodle-ink)',
            transform: 'rotate(1deg)',
            color: 'white'
          }}
        >
          <Typography
            variant="h5"
            sx={{
               
              fontWeight: 700,
              fontSize: '1.3rem',
              mb: 2
            }}
          >
            💡 Quick Tips
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography
                variant="body2"
                sx={{
                   
                  fontSize: '1rem'
                }}
              >
                <strong>Response Time:</strong> We typically respond within 24-48 hours during business days.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography
                variant="body2"
                sx={{
                   
                  fontSize: '1rem'
                }}
              >
                <strong>Bug Reports:</strong> Please include screenshots and steps to reproduce for faster resolution.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography
                variant="body2"
                sx={{
                   
                  fontSize: '1rem'
                }}
              >
                <strong>Feature Requests:</strong> We love hearing your ideas! Share them on our community forum.
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}

export default Contact;

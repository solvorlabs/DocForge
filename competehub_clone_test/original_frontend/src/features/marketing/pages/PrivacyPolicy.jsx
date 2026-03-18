import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Paper, Button, Divider } from '@mui/material';
import { ArrowLeft, Shield, Eye, Lock, Database, UserCheck, Mail, Cookie, Globe } from 'lucide-react';
import '../../../styles/themes/legal.css';

function PrivacyPolicy() {
  const navigate = useNavigate();

  const sections = [
    {
      icon: <Database size={28} />,
      title: "Information We Collect",
      content: [
        {
          subtitle: "Account Information",
          text: "When you create an account, we collect your username, email address, password (encrypted), exam target preference (JEE, GATE, etc.), and how you heard about us. If you use Google OAuth, we collect your Google profile information including name and profile picture."
        },
        {
          subtitle: "Profile & Gaming Data",
          text: "We track your gaming performance including XP, level, rank, high scores, questions answered, accuracy rates, time spent, ELO ratings, and achievements. This data helps us provide personalized experiences and track your progress."
        },
        {
          subtitle: "Social Interactions",
          text: "We store information about your friends, friend requests, and social connections within CompeteHub to enable social features."
        },
        {
          subtitle: "Usage Data",
          text: "We automatically collect information about your device, browser type, IP address, login times, page views, and game sessions to improve our services and ensure security."
        }
      ]
    },
    {
      icon: <Eye size={28} />,
      title: "How We Use Your Information",
      content: [
        {
          subtitle: "Service Delivery",
          text: "We use your information to provide, maintain, and improve CompeteHub's features including game matching, leaderboards, progression tracking, and social features."
        },
        {
          subtitle: "Personalization",
          text: "Your data helps us personalize your experience, recommend appropriate difficulty levels, suggest friends, and provide relevant content based on your exam target and performance."
        },
        {
          subtitle: "Communication",
          text: "We may send you important updates, security alerts, achievement notifications, and promotional emails (which you can opt out of). We use email verification OTPs to secure your account."
        },
        {
          subtitle: "Analytics & Improvement",
          text: "We analyze aggregated and anonymized usage data to understand user behavior, improve features, fix bugs, and develop new game modes."
        },
        {
          subtitle: "Security & Fraud Prevention",
          text: "Your data helps us detect suspicious activity, prevent cheating, and maintain fair gameplay for all users."
        }
      ]
    },
    {
      icon: <Lock size={28} />,
      title: "Data Security",
      content: [
        {
          text: "We take data security seriously and implement industry-standard measures to protect your information:"
        },
        {
          text: "• <strong>Encryption:</strong> All passwords are hashed using bcrypt. Data transmission uses HTTPS/TLS encryption."
        },
        {
          text: "• <strong>Authentication:</strong> We use JWT (JSON Web Tokens) for secure session management."
        },
        {
          text: "• <strong>Database Security:</strong> Our MongoDB database is secured with access controls and regular backups."
        },
        {
          text: "• <strong>Third-party Services:</strong> We carefully vet all third-party services (Google OAuth, email providers) for security compliance."
        },
        {
          text: "While we implement strong security measures, no system is 100% secure. Please use a strong, unique password for your account."
        }
      ]
    },
    {
      icon: <Globe size={28} />,
      title: "Data Sharing & Third Parties",
      content: [
        {
          subtitle: "We DO NOT sell your personal information.",
          text: "We may share limited data with:"
        },
        {
          text: "• <strong>Google OAuth:</strong> For authentication purposes only, following Google's privacy policies."
        },
        {
          text: "• <strong>Email Service Providers:</strong> To send verification codes and notifications (e.g., SendGrid, AWS SES)."
        },
        {
          text: "• <strong>Analytics Tools:</strong> Anonymized usage data may be shared with analytics platforms to improve our services."
        },
        {
          text: "• <strong>Legal Requirements:</strong> We may disclose information if required by law, court order, or to protect our rights and users' safety."
        },
        {
          text: "• <strong>Public Leaderboards:</strong> Your username, avatar, rank, and scores are publicly visible on leaderboards."
        }
      ]
    },
    {
      icon: <Cookie size={28} />,
      title: "Cookies & Tracking",
      content: [
        {
          text: "We use cookies and similar technologies to:"
        },
        {
          text: "• Keep you logged in across sessions"
        },
        {
          text: "• Remember your preferences and settings"
        },
        {
          text: "• Track your game progress and achievements"
        },
        {
          text: "• Analyze site usage and performance"
        },
        {
          text: "You can control cookies through your browser settings, but disabling them may limit functionality."
        }
      ]
    },
    {
      icon: <UserCheck size={28} />,
      title: "Your Rights & Choices",
      content: [
        {
          subtitle: "You have the following rights:",
          text: ""
        },
        {
          text: "• <strong>Access:</strong> Request a copy of your personal data."
        },
        {
          text: "• <strong>Correction:</strong> Update or correct your profile information in Settings."
        },
        {
          text: "• <strong>Deletion:</strong> Request account deletion (this will permanently remove all your data)."
        },
        {
          text: "• <strong>Opt-out:</strong> Disable email notifications in your Settings."
        },
        {
          text: "• <strong>Data Portability:</strong> Request your data in a machine-readable format."
        },
        {
          text: "To exercise these rights, contact us at <strong>privacy@competehub.app</strong> (or your actual contact email)."
        }
      ]
    },
    {
      icon: <Mail size={28} />,
      title: "Children's Privacy",
      content: [
        {
          text: "CompeteHub is intended for students preparing for competitive exams. While we don't specifically target children under 13, if you're under 18, please ensure you have parental consent before using our services."
        },
        {
          text: "If we discover we've collected data from a child under 13 without parental consent, we will promptly delete it."
        }
      ]
    },
    {
      icon: <Shield size={28} />,
      title: "Data Retention",
      content: [
        {
          text: "We retain your data as long as your account is active or as needed to provide services. If you delete your account, we will remove your personal information within 30 days, except for data we're required to keep for legal purposes."
        },
        {
          text: "Anonymized usage data and aggregated statistics may be retained indefinitely for analytics and research."
        }
      ]
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
              <Shield size={40} color="#6c5ce7" />
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
                  Privacy Policy
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                     
                    fontSize: '0.9rem',
                    color: 'var(--doodle-ink)',
                    opacity: 0.7
                  }}
                >
                  Last Updated: November 8, 2025
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
            At CompeteHub, we're committed to protecting your privacy while helping you dominate JEE & GATE prep. 
            This policy explains how we collect, use, and safeguard your information.
          </Typography>
        </Container>
      </Box>

      <br />

      {/* Content */}
      <Container maxWidth="lg" sx={{ pb: 8 }}>
        <Paper
          className="legal-content"
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            border: '3px solid var(--doodle-ink)',
            borderRadius: '16px',
            bgcolor: 'white',
            boxShadow: '8px 8px 0px var(--doodle-ink)'
          }}
        >
          {sections.map((section, index) => (
            <Box key={index} className="legal-section" sx={{ mb: index !== sections.length - 1 ? 5 : 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box
                  className="section-icon"
                  sx={{
                    p: 1.5,
                    bgcolor: 'var(--doodle-blue)',
                    color: 'white',
                    borderRadius: '12px',
                    border: '2px solid var(--doodle-ink)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {section.icon}
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                     
                    fontWeight: 700,
                    fontSize: { xs: '1.5rem', md: '2rem' },
                    color: 'var(--doodle-ink)'
                  }}
                >
                  {section.title}
                </Typography>
              </Box>

              {section.content.map((item, idx) => (
                <Box key={idx} sx={{ mb: item.subtitle ? 3 : 2 }}>
                  {item.subtitle && (
                    <Typography
                      variant="h6"
                      sx={{
                         
                        fontWeight: 600,
                        fontSize: '1.2rem',
                        color: 'var(--doodle-ink)',
                        mb: 1
                      }}
                    >
                      {item.subtitle}
                    </Typography>
                  )}
                  <Typography
                    variant="body1"
                    sx={{
                       
                      fontSize: '1rem',
                      lineHeight: 1.8,
                      color: 'var(--doodle-ink)',
                      opacity: 0.85
                    }}
                    dangerouslySetInnerHTML={{ __html: item.text }}
                  />
                </Box>
              ))}

              {index !== sections.length - 1 && (
                <Divider sx={{ mt: 4, borderColor: 'var(--doodle-ink)', opacity: 0.2 }} />
              )}
            </Box>
          ))}

          {/* Contact Section */}
          <Box
            sx={{
              mt: 5,
              p: 3,
              bgcolor: 'var(--doodle-yellow)',
              border: '3px solid var(--doodle-ink)',
              borderRadius: '12px',
              transform: 'rotate(-1deg)'
            }}
          >
            <Typography
              variant="h5"
              sx={{
                 
                fontWeight: 700,
                fontSize: '1.3rem',
                color: 'var(--doodle-ink)',
                mb: 2
              }}
            >
              Questions About Your Privacy?
            </Typography>
            <Typography
              variant="body1"
              sx={{
                 
                fontSize: '1rem',
                color: 'var(--doodle-ink)',
                mb: 2
              }}
            >
              We're here to help! If you have any questions or concerns about this Privacy Policy or how we handle your data, reach out to us:
            </Typography>
            <Typography
              variant="body1"
              sx={{
                 
                fontSize: '1rem',
                color: 'var(--doodle-ink)',
                fontWeight: 600
              }}
            >
              📧 Email: <strong>contact.essolutions@gmail.com</strong>
              <br />
              🌐 Website: <strong>competehub.essolutions.dev</strong>
            </Typography>
          </Box>

          {/* Updates Notice */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography
              variant="body2"
              sx={{
                 
                fontSize: '0.9rem',
                color: 'var(--doodle-ink)',
                opacity: 0.6,
                fontStyle: 'italic'
              }}
            >
              We may update this Privacy Policy from time to time. We'll notify you of significant changes via email or a prominent notice on our platform.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default PrivacyPolicy;

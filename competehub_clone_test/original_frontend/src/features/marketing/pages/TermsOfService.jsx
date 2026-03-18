import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Paper, Button, Divider } from '@mui/material';
import { ArrowLeft, FileText, Users, Shield, AlertTriangle, Trophy, Ban, Scale, Zap } from 'lucide-react';
import '../../../styles/themes/legal.css';

function TermsOfService() {
  const navigate = useNavigate();

  const sections = [
    {
      icon: <FileText size={28} />,
      title: "Acceptance of Terms",
      content: [
        {
          text: "Welcome to CompeteHub! By accessing or using our platform, you agree to be bound by these Terms of Service and our Privacy Policy. If you don't agree with any part of these terms, please don't use our services."
        },
        {
          text: "These terms constitute a legally binding agreement between you and CompeteHub. We reserve the right to modify these terms at any time, and continued use of the platform after changes constitutes acceptance of the new terms."
        }
      ]
    },
    {
      icon: <Users size={28} />,
      title: "User Accounts & Eligibility",
      content: [
        {
          subtitle: "Account Creation",
          text: "To access certain features, you must create an account with a valid email address and username. You're responsible for maintaining the confidentiality of your account credentials and all activities under your account."
        },
        {
          subtitle: "Eligibility",
          text: "You must be at least 13 years old to use CompeteHub. Users under 18 should have parental or guardian consent. We reserve the right to refuse service to anyone for any reason."
        },
        {
          subtitle: "Account Responsibility",
          text: "You agree to provide accurate, current, and complete information during registration. You must notify us immediately of any unauthorized use of your account or security breaches."
        },
        {
          subtitle: "One Account Per User",
          text: "You may only create one account. Creating multiple accounts to manipulate rankings, leaderboards, or achievements is strictly prohibited and may result in permanent suspension."
        }
      ]
    },
    {
      icon: <Zap size={28} />,
      title: "Platform Services",
      content: [
        {
          subtitle: "What We Provide",
          text: "CompeteHub offers educational gaming services including:"
        },
        {
          text: "• Real-time multiplayer quiz battles (Team Battle mode)"
        },
        {
          text: "• Solo challenge modes with timed questions"
        },
        {
          text: "• Question banks for JEE, GATE, and other competitive exams"
        },
        {
          text: "• Ranked matchmaking with ELO rating system"
        },
        {
          text: "• Progression tracking (XP, levels, ranks, achievements)"
        },
        {
          text: "• Social features (friends, leaderboards, community posts)"
        },
        {
          text: "• Special game modes (Boss Mode, Equation Builder, etc.)"
        },
        {
          text: "• Daily challenges and streaks"
        },
        {
          subtitle: "Free & Guest Access",
          text: "Many features are available for free, including guest play. However, certain features like ranked matches, progression tracking, and social features require account creation."
        },
        {
          subtitle: "No Guarantees",
          text: "While we strive for accuracy in our questions and content, CompeteHub is a supplementary learning tool. We don't guarantee exam success or specific learning outcomes. Always verify important information with official exam resources."
        }
      ]
    },
    {
      icon: <Shield size={28} />,
      title: "User Conduct & Acceptable Use",
      content: [
        {
          subtitle: "You agree NOT to:",
          text: ""
        },
        {
          text: "• Cheat, exploit bugs, or use unauthorized tools to gain unfair advantages"
        },
        {
          text: "• Create multiple accounts to manipulate rankings or leaderboards"
        },
        {
          text: "• Harass, abuse, or send harmful content to other users"
        },
        {
          text: "• Share or distribute copyrighted content without permission"
        },
        {
          text: "• Attempt to hack, breach security, or disrupt the platform"
        },
        {
          text: "• Use automated scripts, bots, or scrapers without permission"
        },
        {
          text: "• Impersonate other users or CompeteHub staff"
        },
        {
          text: "• Spam, advertise, or promote external services without authorization"
        },
        {
          text: "• Use the platform for illegal activities or violate any laws"
        },
        {
          text: "Violation of these rules may result in warnings, temporary suspension, or permanent account termination without refund."
        }
      ]
    },
    {
      icon: <Trophy size={28} />,
      title: "Gaming Rules & Fair Play",
      content: [
        {
          subtitle: "Fair Competition",
          text: "CompeteHub relies on honest gameplay. Using answer keys, collaboration in solo modes, or any form of cheating undermines the community and will result in penalties."
        },
        {
          subtitle: "ELO & Rankings",
          text: "Rankings and ELO ratings are calculated using established algorithms. We reserve the right to adjust ratings if irregularities or abuse are detected."
        },
        {
          subtitle: "Leaderboard Integrity",
          text: "We monitor leaderboards for suspicious activity. Accounts found manipulating scores may be removed from leaderboards and face account suspension."
        },
        {
          subtitle: "Timeouts & Disconnections",
          text: "If you disconnect during a match, it may count as a loss or abandonment. We're not responsible for losses due to internet connectivity issues."
        }
      ]
    },
    {
      icon: <FileText size={28} />,
      title: "Intellectual Property",
      content: [
        {
          subtitle: "Our Content",
          text: "All content on CompeteHub including questions, graphics, logos, design elements, code, and the 'CompeteHub' name are owned by CompeteHub or licensed to us. You may not reproduce, distribute, or create derivative works without written permission."
        },
        {
          subtitle: "User-Generated Content",
          text: "If you submit content (forum posts, community contributions, etc.), you grant us a worldwide, royalty-free license to use, display, and distribute that content on our platform."
        },
        {
          subtitle: "Question Sources",
          text: "Our questions are either original or sourced from public domain materials. If you believe any content infringes your copyright, contact us immediately at contact.essolutions@gmail.com."
        },
        {
          subtitle: "Third-Party Content",
          text: "CompeteHub may include links or references to third-party websites and services. We're not responsible for their content or policies."
        }
      ]
    },
    {
      icon: <AlertTriangle size={28} />,
      title: "Disclaimers & Limitations",
      content: [
        {
          subtitle: "\"AS IS\" Service",
          text: "CompeteHub is provided \"as is\" and \"as available\" without warranties of any kind, express or implied. We don't guarantee uninterrupted, error-free, or secure service."
        },
        {
          subtitle: "Educational Tool",
          text: "CompeteHub is a supplementary learning platform. We don't guarantee exam results, admission outcomes, or mastery of subjects. Your exam success depends on various factors beyond our platform."
        },
        {
          subtitle: "Accuracy of Content",
          text: "While we strive for accuracy, we don't warrant that all questions, answers, or explanations are error-free. Always cross-verify with official exam resources."
        },
        {
          subtitle: "Limitation of Liability",
          text: "To the maximum extent permitted by law, CompeteHub and its team shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of data, revenue, or exam opportunities."
        },
        {
          subtitle: "Maximum Liability",
          text: "In any case, our total liability shall not exceed the amount you paid to CompeteHub in the past 12 months (or $100 if no payment was made)."
        }
      ]
    },
    {
      icon: <Ban size={28} />,
      title: "Termination & Suspension",
      content: [
        {
          subtitle: "Your Rights",
          text: "You may delete your account at any time through Settings. Upon deletion, your personal data will be removed within 30 days (see Privacy Policy)."
        },
        {
          subtitle: "Our Rights",
          text: "We reserve the right to suspend or terminate your account at any time for:"
        },
        {
          text: "• Violation of these Terms of Service"
        },
        {
          text: "• Fraudulent or suspicious activity"
        },
        {
          text: "• Prolonged inactivity"
        },
        {
          text: "• Legal or regulatory reasons"
        },
        {
          text: "• Any reason at our sole discretion"
        },
        {
          subtitle: "Effect of Termination",
          text: "Upon termination, your access to CompeteHub will be immediately revoked. Your data may be deleted, and you forfeit any achievements, XP, rankings, or virtual items."
        }
      ]
    },
    {
      icon: <Scale size={28} />,
      title: "Dispute Resolution & Governing Law",
      content: [
        {
          subtitle: "Informal Resolution",
          text: "If you have any disputes or concerns, please contact us first at support@competehub.app. We'll work in good faith to resolve the issue informally."
        },
        {
          subtitle: "Governing Law",
          text: "These Terms shall be governed by the laws of [Your Jurisdiction - e.g., India/United States], without regard to conflict of law principles."
        },
        {
          subtitle: "Arbitration",
          text: "Any disputes that cannot be resolved informally shall be settled through binding arbitration in [Your City], rather than in court, except where prohibited by law."
        },
        {
          subtitle: "Class Action Waiver",
          text: "You agree to resolve disputes individually and waive the right to participate in class action lawsuits or class-wide arbitration."
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
              <Scale size={40} color="#6c5ce7" />
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
                  Terms of Service
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
            Please read these terms carefully before using CompeteHub. By using our platform, you agree to these terms. 
            Let's keep the competition fair and fun for everyone! 🚀
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
                    bgcolor: 'var(--doodle-purple)',
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

          {/* Important Notice */}
          {/* <Box
            sx={{
              mt: 5,
              p: 3,
              bgcolor: 'var(--doodle-accent)',
              border: '3px solid var(--doodle-ink)',
              borderRadius: '12px',
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
              ⚠️ Important Notice
            </Typography>
            <Typography
              variant="body1"
              sx={{
                 
                fontSize: '1rem',
                lineHeight: 1.6
              }}
            >
              By continuing to use CompeteHub, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. 
              If you have questions or concerns, don't hesitate to reach out to our support team!
            </Typography>
          </Box> */}

          {/* Contact Section */}
          <Box
            sx={{
              mt: 4,
              p: 3,
              bgcolor: 'var(--doodle-blue)',
              border: '3px solid var(--doodle-ink)',
              borderRadius: '12px',
              transform: 'rotate(-1deg)',
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
              Questions or Concerns?
            </Typography>
            <Typography
              variant="body1"
              sx={{
                 
                fontSize: '1rem',
                mb: 2
              }}
            >
              We're here to help! Contact us for any questions about these terms:
            </Typography>
            <Typography
              variant="body1"
              sx={{
                 
                fontSize: '1rem',
                fontWeight: 600
              }}
            >
              📧 Email: <strong>contact.essolutions@gmail.com</strong>
              <br />
              ⚖️ Legal: <strong>contact.essolutions@gmail.com</strong>
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
              We may update these Terms of Service from time to time. Material changes will be communicated via email or platform notification. 
              Continued use after changes constitutes acceptance of the new terms.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default TermsOfService;

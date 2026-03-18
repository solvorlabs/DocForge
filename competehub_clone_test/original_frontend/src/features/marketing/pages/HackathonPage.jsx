import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button, Modal, Paper, Grid, Stack } from '@mui/material';
import {
    Zap,
    Brain,
    FlaskConical,
    Dna,
    Activity,
    Clock,
    Atom,
    TreePine,
    Trophy,
    Cpu,
    Sparkles,
    Code,
    Gamepad2,
    Lightbulb,
    Calendar,
    MapPin,
    ArrowRight,
    Eye
} from 'lucide-react';
import '../../../styles/themes/doodle.css';
import './HackathonPage.css';

function HackathonPage() {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);

    const handleLoginClick = () => {
        setShowModal(true);
    };

    const handleContinueWithGoogle = () => {
        navigate('/auth');
    };

    const tracks = [
        
        {
            id: 2,
            name: 'Escape Room: Lab Disaster',
            icon: FlaskConical,
            description: 'Build a puzzle-solving escape room where players must prevent a laboratory disaster by solving science riddles, chemical equations, and physics problems under time pressure. Cooperative or competitive multiplayer modes add urgency.',
            concepts: 'Chemistry, physics, problem-solving, time management'
        },
        
        {
            id: 4,
            name: 'Mind Readers\' Duel',
            icon: Brain,
            description: 'Develop a psychology-based strategy game where players predict opponent behaviors using game theory, cognitive biases, and psychological patterns. Bluffing, deception, and reading patterns become key mechanics.',
            concepts: 'Psychology, game theory, behavioral economics, pattern recognition'
        },
        {
            id: 5,
            name: 'Neuronetwork',
            icon: Activity,
            description: 'Create a game where players design and train simple neural networks to solve classification or prediction tasks. Visualize neurons, weights, and activation functions. Compete on accuracy, speed, or network efficiency.',
            concepts: 'Machine learning, neural networks, AI fundamentals, data science'
        },
        {
            id: 6,
            name: 'Time Loop Strategist',
            icon: Clock,
            description: 'Build a puzzle-strategy game where players relive the same scenario multiple times, learning from past loops to optimize their strategy. Incorporate physics concepts like causality, temporal paradoxes, and optimization.',
            concepts: 'Physics, logic, optimization, temporal reasoning, strategy'
        },
        
       
        
        {
            id: 10,
            name: 'AI Training Arena',
            icon: Cpu,
            description: 'Build a game where players train AI models on datasets and compete to achieve the highest accuracy. Teach concepts like overfitting, hyperparameter tuning, and model selection through gamified machine learning.',
            concepts: 'Machine learning, AI training, data science, model optimization'
        },
      
        {
            id: 12,
            name: 'Science Codenames',
            icon: Code,
            description: 'Adapt the popular Codenames format with science terminology. Players give one-word clues to help teammates identify science concepts while avoiding traps. Promotes scientific vocabulary and conceptual connections.',
            concepts: 'Scientific vocabulary, conceptual linking, team communication'
        },
        
        {
            id: 14,
            name: 'I have my own idea',
            icon: Lightbulb,
            description: 'Propose your unique browser-based learning game concept! It must focus on educational content (STEM preferred), be engaging and replayable, and ideally support multiplayer or competitive modes.',
            concepts: 'Your innovative educational game concept'
        },
    ];

    return (
        <Box className="doodle-container" sx={{ minHeight: '100vh', py: 4 }}>
            {/* Header */}
            <Box sx={{ py: 2, mb: 4 }}>
                <Container maxWidth="xl">
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {/* <Zap size={32} className="logo-icon" style={{ color: 'var(--doodle-blue)' }} /> */}
                            <Typography variant="h5" className="doodle-title" sx={{ fontWeight: 800, fontSize: { xs: '1.5rem', md: '2rem' } }}>
                                HACKATHON
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                            <Typography
                                component="a"
                                href="https://essolutions.dev/"
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{
                                     
                                    fontSize: { xs: '0.9rem', md: '1rem' },
                                    color: 'var(--doodle-ink)',
                                    textDecoration: 'none',
                                    '&:hover': { color: 'var(--doodle-blue)' }
                                }}
                            >
                                Powered by ES Solutions
                            </Typography>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* Hero Section */}
            <Container maxWidth="xl">
                <Grid container spacing={4} sx={{ mb: 4 }}>
                    {/* Left Side - Info */}
                    <Grid item xs={12} md={6}>
                        <Box className="doodle-paper" sx={{ p: { xs: 3, md: 4 }, height: '100%' }}>
                            <img
                                src="/doodie.png"
                                alt="CompeteHub Mascot"
                                style={{
                                    width: '100%',
                                    maxWidth: '150px',
                                    height: 'auto',
                                    marginBottom: '20px'
                                }}
                            />

                            <Typography
                                variant="h2"
                                className="doodle-title"
                                sx={{
                                    fontSize: { xs: '1.8rem', md: '2.5rem' },
                                    mb: 2
                                }}
                            >
                                CompeteHub Challenge Track
                            </Typography>

                           
                            <Typography
                                variant="h6"
                                className="doodle-subtitle"
                                sx={{
                                    mb: 3,
                                    fontSize: { xs: '1rem', md: '1.1rem' },
                                    color: 'var(--doodle-secondary)',
                                    lineHeight: 1.6
                                }}
                            >
                                An official sponsor track at <strong>HackwithMAIT 6.0</strong> by <strong>ES Solutions</strong>.
                                Build creative, browser-based multiplayer learning games that transform education into a competitive,
                                engaging, and fun experience powered by <strong>CompeteHub</strong>!
                            </Typography>

                            <Box sx={{
                                bgcolor: 'rgba(255, 193, 7, 0.2)',
                                p: 3,
                                borderRadius: '12px',
                                border: '3px solid var(--doodle-orange)',
                                mb: 3
                            }}>
                                <Typography sx={{
                                     
                                    fontSize: { xs: '1.1rem', md: '1.3rem' },
                                    fontWeight: 800,
                                    color: 'var(--doodle-ink)',
                                    textAlign: 'center',
                                    lineHeight: 1.5
                                }}>
                                    <strong>WE DON'T NEED COPIES - WE NEED GAMES THAT ARE ENGAGING, INNOVATIVE AND REPLAYABLE!</strong>
                                </Typography>
                            </Box>

                            <Typography
                                sx={{
                                     
                                    fontSize: { xs: '0.95rem', md: '1.05rem' },
                                    color: 'var(--doodle-secondary)',
                                    lineHeight: 1.7,
                                    mb: 3
                                }}
                            >
                                We want your innovation to work around new tracks and take inspiration from existing game formats, 
                                but come up with <strong>knowledge battle games</strong> that are either creative mixups or showcase 
                                your unique innovation. Think beyond traditional quiz formats - create games that blend learning 
                                with genuine entertainment, strategic thinking, and competitive elements that keep players coming back.
                                <br /><br />
                                The games should be <strong>engaging</strong> (hook players immediately), <strong>innovative</strong> 
                                (bring fresh mechanics to educational gaming), and <strong>replayable</strong> (provide lasting value 
                                through varied experiences). Focus on <strong>ease of traversing</strong> - players should intuitively 
                                understand how to play and navigate your game world.
                            </Typography>

                            <Stack spacing={2} sx={{ mb: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Trophy size={24} color="var(--doodle-blue)" />
                                    <Typography sx={{   fontSize: '1rem' }}>
                                        <strong>Prizes:</strong> ₹15,000 total prize pool — ₹8,000 (1st), ₹4,000 (2nd), ₹3,000 (3rd).
                                        Additional rewards include digital swags, internship opportunities,
                                        and a feature on CompeteHub’s community page.
                                        <br />
                                        <em>
                                            Cash prizes will be awarded only if the submitted solutions meet the quality and innovation standards
                                            set by the ES Solutions team.
                                        </em>
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Trophy size={24} color="var(--doodle-purple)" />
                                    <Typography sx={{   fontSize: '1rem' }}>
                                        <strong>Leaderboard:</strong> Scores and remarks will be publicly visible on the CompeteHub community page,
                                        ensuring transparency and fair evaluation for all participants.
                                    </Typography>
                                </Box>
                            </Stack>


                            

                            <Box sx={{
                                bgcolor: 'rgba(108, 92, 231, 0.1)',
                                p: 2,
                                borderRadius: '12px',
                                border: '2px dashed var(--doodle-purple)',
                                mb: 3
                            }}>
                                <Typography sx={{
                                     
                                    fontSize: '0.95rem',
                                    color: 'var(--doodle-ink)'
                                }}>
                                    <strong>Challenge:</strong> Design and develop a prototype for a browser-based
                                    multiplayer learning game. Create something that makes education addictive through 
                                    innovative mechanics, strategic depth, and competitive elements that inspire repeated play!
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>

                    {/* Right Side - Dashboard Preview */}
                    <Grid item xs={12} md={6}>
                        <Box className="doodle-paper" sx={{ p: { xs: 3, md: 4 }, height: '100%', position: 'relative' }}>
                            <Typography
                                variant="h4"
                                className="doodle-title"
                                sx={{
                                    fontSize: { xs: '1.5rem', md: '2rem' },
                                    mb: 2,
                                    textAlign: 'center',
                                    display: 'flex', justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: 1
                                }}
                            >
                                <Eye size={28} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                                Platform Preview
                            </Typography>

                            <Typography
                                sx={{
                                     
                                    fontSize: '1rem',
                                    color: 'var(--doodle-secondary)',
                                    textAlign: 'center',
                                    mb: 3
                                }}
                            >
                                Get inspired by CompeteHub's existing platform
                            </Typography>

                            {/* Placeholder for Dashboard Image */}
                            <Box
                                sx={{
                                    width: '100%',
                                    height: { xs: '250px', md: '350px' },
                                    bgcolor: 'rgba(0,0,0,0.05)',
                                    border: '3px dashed var(--doodle-sketch)',
                                    background: 'url(dashboard.png)',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 2,
                                    mb: 3,
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                {/* Overlay blur effect */}
                                <Box sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    bgcolor: 'rgba(255,255,255,0.8)',
                                    //   backdropFilter: 'blur(5px)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 2
                                }}>
                                    {/* <Zap size={48} color="var(--doodle-blue)" /> */}
                                    <Typography sx={{
                                         
                                        fontSize: '1.2rem',
                                        fontWeight: 700,
                                        color: 'var(--doodle-ink)',
                                        textAlign: 'center',
                                        px: 2
                                    }}>
                                        Explore the games here
                                    </Typography>
                                    <Typography sx={{
                                         
                                        fontSize: '0.9rem',
                                        color: 'var(--doodle-secondary)',
                                        textAlign: 'center',
                                        px: 2
                                    }}>
                                        Explore 10+ game modes, live battles, rankings & more!
                                    </Typography>
                                </Box>
                            </Box>

                            <Button
                                variant="contained"
                                size="large"
                                onClick={handleLoginClick}
                                fullWidth
                                endIcon={<ArrowRight />}
                                className="doodle-btn doodle-btn-primary"
                                sx={{
                                    py: 2,
                                    fontSize: '1.1rem',
                                     
                                    textTransform: 'none',
                                    fontWeight: 700
                                }}
                            >
                                Access Competehub Here
                            </Button>

                            <Typography
                                variant="body2"
                                sx={{
                                    mt: 2,
                                    color: 'var(--doodle-sketch)',
                                     
                                    textAlign: 'center'
                                }}
                            >
                                See how CompeteHub brings learning to life through games
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                {/* Evaluation Criteria Section */}
                <Box className="doodle-paper" sx={{ p: { xs: 3, md: 4 }, mb: 4, bgcolor: 'rgba(108, 92, 231, 0.05)' }}>
                    <Typography
                        variant="h4"
                        className="doodle-title"
                        sx={{
                            textAlign: 'center',
                            mb: 3,
                            fontSize: { xs: '1.5rem', md: '2rem' },
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            gap: 1
                        }}
                    >
                        <Trophy size={32} style={{ verticalAlign: 'middle', marginRight: '12px' }} />
                        Evaluation Criteria
                    </Typography>

                    <Typography
                        sx={{
                             
                            fontSize: { xs: '1rem', md: '1.1rem' },
                            color: 'var(--doodle-secondary)',
                            textAlign: 'center',
                            mb: 4,
                            maxWidth: 900,
                            mx: 'auto'
                        }}
                    >
                        Your project will be evaluated based on the following criteria. The prize distribution will 
                        reflect how well your game demonstrates these qualities:
                    </Typography>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Box sx={{
                                p: 3,
                                bgcolor: 'white',
                                borderRadius: '12px',
                                border: '3px solid var(--doodle-ink)',
                                height: '100%'
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <Box sx={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: '50%',
                                        bgcolor: 'var(--doodle-purple)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '2px solid var(--doodle-ink)'
                                    }}>
                                        <Lightbulb size={24} color="white" />
                                    </Box>
                                    <Typography sx={{   fontWeight: 700, fontSize: '1.3rem' }}>
                                        Creativity & Innovation
                                    </Typography>
                                </Box>
                                <Typography sx={{   color: 'var(--doodle-secondary)', lineHeight: 1.6 }}>
                                    How unique and original is your game concept? Does it present fresh mechanics or novel 
                                    ways to teach educational content? Creative use of technology and game design earns high marks.
                                </Typography>
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Box sx={{
                                p: 3,
                                bgcolor: 'white',
                                borderRadius: '12px',
                                border: '3px solid var(--doodle-ink)',
                                height: '100%'
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <Box sx={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: '50%',
                                        bgcolor: 'var(--doodle-green)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '2px solid var(--doodle-ink)'
                                    }}>
                                        <Gamepad2 size={24} color="white" />
                                    </Box>
                                    <Typography sx={{   fontWeight: 700, fontSize: '1.3rem' }}>
                                        Engagement & Fun Factor
                                    </Typography>
                                </Box>
                                <Typography sx={{   color: 'var(--doodle-secondary)', lineHeight: 1.6 }}>
                                    Is your game genuinely fun to play? Does it hook players and keep them engaged? 
                                    The best educational games make learning feel like entertainment, not work.
                                </Typography>
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Box sx={{
                                p: 3,
                                bgcolor: 'white',
                                borderRadius: '12px',
                                border: '3px solid var(--doodle-ink)',
                                height: '100%'
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <Box sx={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: '50%',
                                        bgcolor: 'var(--doodle-orange)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '2px solid var(--doodle-ink)'
                                    }}>
                                        <Activity size={24} color="white" />
                                    </Box>
                                    <Typography sx={{   fontWeight: 700, fontSize: '1.3rem' }}>
                                        Replayability
                                    </Typography>
                                </Box>
                                <Typography sx={{   color: 'var(--doodle-secondary)', lineHeight: 1.6 }}>
                                    Will players want to come back for more? Games with procedural generation, varied challenges, 
                                    high skill ceilings, or evolving difficulty keep players engaged long-term.
                                </Typography>
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Box sx={{
                                p: 3,
                                bgcolor: 'white',
                                borderRadius: '12px',
                                border: '3px solid var(--doodle-ink)',
                                height: '100%'
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <Box sx={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: '50%',
                                        bgcolor: 'var(--doodle-blue)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '2px solid var(--doodle-ink)'
                                    }}>
                                        <Zap size={24} color="white" />
                                    </Box>
                                    <Typography sx={{   fontWeight: 700, fontSize: '1.3rem' }}>
                                        Scalability & Improvement Scope
                                    </Typography>
                                </Box>
                                <Typography sx={{   color: 'var(--doodle-secondary)', lineHeight: 1.6 }}>
                                    How easily can your game be expanded or improved? Does the architecture support adding 
                                    new features, levels, or content? Clear potential for growth shows strong design thinking.
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>

                    <Box sx={{
                        mt: 4,
                        p: 3,
                        bgcolor: 'rgba(255, 255, 255, 0.7)',
                        borderRadius: '12px',
                        border: '2px dashed var(--doodle-ink)'
                    }}>
                        <Typography sx={{
                             
                            fontSize: '1.1rem',
                            color: 'var(--doodle-ink)',
                            textAlign: 'center',
                            lineHeight: 1.7
                        }}>
                            <strong>Multiplayer Support (Bonus):</strong> While not mandatory, implementing multiplayer or 
                            competitive features is highly encouraged! Competition is at the heart of CompeteHub—games that 
                            let players compete against or collaborate with others will receive additional consideration. 
                            Think head-to-head battles, team challenges, leaderboards, or cooperative puzzle-solving!
                        </Typography>
                    </Box>
                </Box>

                {/* What You'll Get Section */}
                <Box className="doodle-paper" sx={{ p: { xs: 3, md: 4 }, mb: 4 }}>
                    <Typography
                        variant="h4"
                        className="doodle-title"
                        sx={{
                            textAlign: 'center',
                            mb: 3,
                            fontSize: { xs: '1.5rem', md: '2rem' }
                        }}
                    >
                        What You'll Get
                    </Typography>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Box sx={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: '50%',
                                    bgcolor: 'var(--doodle-purple)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 16px',
                                    border: '3px solid var(--doodle-ink)'
                                }}>
                                    <Trophy size={40} color="white" />
                                </Box>
                                <Typography sx={{   fontWeight: 700, fontSize: '1.2rem', mb: 1 }}>
                                    Digital Swags
                                </Typography>
                                <Typography sx={{   color: 'var(--doodle-secondary)', fontSize: '0.95rem' }}>
                                    Exclusive digital badges and merchandise for winners
                                </Typography>
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Box sx={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: '50%',
                                    bgcolor: 'var(--doodle-green)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 16px',
                                    border: '3px solid var(--doodle-ink)'
                                }}>
                                    <Brain size={40} color="white" />
                                </Box>
                                <Typography sx={{   fontWeight: 700, fontSize: '1.2rem', mb: 1 }}>
                                    Career Opportunities
                                </Typography>
                                <Typography sx={{   color: 'var(--doodle-secondary)', fontSize: '0.95rem' }}>
                                    Interview opportunities with ES Solutions team
                                </Typography>
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Box sx={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: '50%',
                                    bgcolor: 'var(--doodle-orange)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 16px',
                                    border: '3px solid var(--doodle-ink)'
                                }}>
                                    <Sparkles size={40} color="white" />
                                </Box>
                                <Typography sx={{   fontWeight: 700, fontSize: '1.2rem', mb: 1 }}>
                                    Featured on CompeteHub
                                </Typography>
                                <Typography sx={{   color: 'var(--doodle-secondary)', fontSize: '0.95rem' }}>
                                    Selected projects featured on our community page
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

                {/* Inspiration Examples Section */}
                <Box sx={{ mb: 4 }}>
                    <Typography
                        variant="h3"
                        className="doodle-title"
                        sx={{
                            textAlign: 'center',
                            mb: 2,
                            fontSize: { xs: '1.8rem', md: '2.5rem' }
                        }}
                    >
                        Inspiration Examples
                    </Typography>

                    <Typography
                        sx={{
                             
                            fontSize: { xs: '1rem', md: '1.1rem' },
                            color: 'var(--doodle-secondary)',
                            textAlign: 'center',
                            mb: 4,
                            maxWidth: 900,
                            mx: 'auto'
                        }}
                    >
                        These are examples to spark your creativity - but remember, we want YOUR unique innovation!
                        Don't copy these concepts; instead, use them as stepping stones to create something entirely new.
                        Mix genres, blend mechanics, or invent completely fresh approaches to educational gaming.
                    </Typography>

                    <Grid container spacing={3}>
                        {tracks.map((track) => {
                            const IconComponent = track.icon;
                            return (
                                <Grid item xs={12} sm={6} md={6} lg={4} key={track.id}>
                                    <Box
                                        className="doodle-card game-card-hover"
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            p: 3,
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease', display: 'flex',
                                            justifyContent: 'flex-start',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 60,
                                                height: 60,
                                                borderRadius: '50%',
                                                bgcolor: track.id === 14 ? 'var(--doodle-yellow)' : 'var(--doodle-blue)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mb: 2,
                                                border: '3px solid var(--doodle-ink)',
                                            }}
                                        >
                                            <IconComponent size={30} color={track.id === 14 ? 'var(--doodle-ink)' : 'white'} />
                                        </Box>

                                        <Typography
                                            variant="h6"
                                            sx={{
                                                 
                                                fontWeight: 700,
                                                mb: 1,
                                                fontSize: '1.1rem'
                                            }}
                                        >
                                            {track.name}
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: 'var(--doodle-secondary)',
                                                 
                                                fontSize: '0.9rem',
                                                mb: 2,
                                                lineHeight: 1.5
                                            }}
                                        >
                                            {track.description}
                                        </Typography>

                                        <Box sx={{
                                            mt: 'auto',
                                            pt: 2,
                                            borderTop: '2px dashed var(--doodle-sketch)',
                                        }}>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                     
                                                    fontSize: '0.8rem',
                                                    color: 'var(--doodle-blue)',
                                                    fontWeight: 600,
                                                    fontStyle: 'italic'
                                                }}
                                            >
                                                {track.concepts}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Box>

                {/* Footer */}
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography
                        variant="h5"
                        className="doodle-title"
                        sx={{
                             
                            color: 'var(--doodle-ink)',
                            mb: 2,
                            fontSize: { xs: '1.3rem', md: '1.5rem' }
                        }}
                    >
                        Ready to innovate? Let's build amazing learning experiences together!
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                             
                            color: 'var(--doodle-secondary)',
                            mb: 2
                        }}
                    >
                        Official Sponsor Track at HackwithMAIT 6.0
                    </Typography>
                    <Typography
                        component="a"
                        href="https://essolutions.dev/"
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="body1"
                        sx={{
                             
                            color: 'var(--doodle-blue)',
                            textDecoration: 'none',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1,
                            '&:hover': { textDecoration: 'underline' }
                        }}
                    >
                        <Zap size={20} />
                        Powered by ES Solutions
                    </Typography>
                </Box>
            </Container>

            {/* Login Modal */}
            <Modal
                open={showModal}
                onClose={() => setShowModal(false)}
                aria-labelledby="login-modal"
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: { xs: '90%', sm: 500 },
                        maxWidth: '100%'
                    }}
                >
                    <Paper
                        className="doodle-paper"
                        sx={{
                            p: 4,
                            textAlign: 'center'
                        }}
                    >
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2
                        }}>
                            <Zap size={40} color="var(--doodle-blue)" />
                        </Box>

                        <Typography
                            variant="h4"
                            className="doodle-title"
                            sx={{ mb: 3, fontSize: { xs: '1.8rem', md: '2.2rem' } }}
                        >
                            Welcome to CompeteHub!
                        </Typography>

                        <Typography
                            variant="h6"
                            className="doodle-subtitle"
                            sx={{ mb: 4, fontSize: { xs: '1rem', md: '1.2rem' }, lineHeight: 1.6 }}
                        >
                            Login to explore our complete platform and see how we're revolutionizing
                            exam preparation through gamification. Get inspired for your HackwithMAIT 6.0 project!
                        </Typography>

                        <Button
                            variant="contained"
                            size="large"
                            onClick={handleContinueWithGoogle}
                            className="doodle-btn doodle-btn-primary"
                            endIcon={<ArrowRight />}
                            sx={{
                                py: 2,
                                px: 4,
                                fontSize: '1.1rem',
                                 
                                textTransform: 'none',
                                fontWeight: 700,
                                mb: 2,
                                width: '100%'
                            }}
                        >
                            Continue with Google
                        </Button>

                        <Button
                            variant="text"
                            onClick={() => setShowModal(false)}
                            sx={{
                                 
                                color: 'var(--doodle-sketch)',
                                textTransform: 'none'
                            }}
                        >
                            Maybe later
                        </Button>
                    </Paper>
                </Box>
            </Modal>
        </Box>
    );
}

export default HackathonPage;

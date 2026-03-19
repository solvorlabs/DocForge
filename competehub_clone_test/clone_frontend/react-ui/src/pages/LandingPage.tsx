import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap, Trophy, Users, BookOpen, Star, ArrowRight,
  Shield, Clock, TrendingUp, ChevronRight, Play
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ClickSpark } from '../components/reactbits/ClickSpark';
import { ElectricBorder } from '../components/reactbits/ElectricBorder';
import { ShinyText } from '../components/reactbits/ShinyText';
import { Noise } from '../components/reactbits/Noise';
import { StarBorder } from '../components/reactbits/StarBorder';
import { Aurora } from '../components/reactbits/Aurora';
import { Lightning } from '../components/reactbits/Lightning';
import { LetterGlitch } from '../components/reactbits/LetterGlitch';
import { BlurText } from '../components/reactbits/BlurText';
import { GradientText } from '../components/reactbits/GradientText';
import { CountUp } from '../components/reactbits/CountUp';
import { SpotlightCard } from '../components/reactbits/SpotlightCard';
import { ScrambledText } from '../components/reactbits/ScrambledText';
import { GlitchText } from '../components/reactbits/GlitchText';
import { TrueFocus } from '../components/reactbits/TrueFocus';

const features = [
  {
    icon: <Users className="h-6 w-6" />,
    title: '5v5 Team Battles',
    description: 'Compete in real-time multiplayer battles. Form teams, answer questions, and dominate the leaderboard.',
    color: 'text-primary',
    bg: 'bg-primary/10',
    spotlightColor: 'rgba(252, 238, 9, 0.12)',
  },
  {
    icon: <Trophy className="h-6 w-6" />,
    title: 'Ranked System',
    description: 'Climb from Bronze to Grandmaster. Every match matters in our ELO-based ranking system.',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    spotlightColor: 'rgba(251, 191, 36, 0.12)',
  },
  {
    icon: <BookOpen className="h-6 w-6" />,
    title: '10,000+ Questions',
    description: 'Curated question bank covering JEE, NEET, GATE, and more. Practice mode for self-improvement.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    spotlightColor: 'rgba(59, 130, 246, 0.12)',
  },
  {
    icon: <Star className="h-6 w-6" />,
    title: 'Game Modes',
    description: 'Dragon Out, Boss Mode, Speed Race, Crossword — 10+ unique games to keep learning fun.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    spotlightColor: 'rgba(16, 185, 129, 0.12)',
  },
];

const stats = [
  { value: 50000, display: '50K+', label: 'Active Players', suffix: '+' },
  { value: 10000, display: '10K+', label: 'Questions', suffix: '+' },
  { value: 1000000, display: '1M+', label: 'Games Played', suffix: '+' },
  { value: 4.9, display: '4.9★', label: 'Rating' },
];

const examBadges = ['JEE', 'NEET', 'GATE', 'CAT', 'UPSC', 'GRE', 'GMAT'];

export default function LandingPage() {
  const navigate = useNavigate();

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-bg-cyber min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Aurora background */}
        <Aurora
          colorStops={['#FCEE09', '#f59e0b', '#ef4444', '#78350f']}
          amplitude={1.2}
          speed={0.6}
          style={{ opacity: 0.7 }}
        />

        {/* Grid + scanlines */}
        <div className="absolute inset-0 grid-bg-intense opacity-30" />
        <div className="absolute inset-0 scanlines opacity-60" />

        {/* Film grain */}
        <Noise opacity={0.04} />

        {/* Lightning streaks in corners */}
        <div className="absolute top-0 left-0 w-64 h-full opacity-30 pointer-events-none">
          <Lightning hue={55} speed={0.4} intensity={0.5} size={0.8} />
        </div>
        <div className="absolute top-0 right-0 w-64 h-full opacity-25 pointer-events-none">
          <Lightning hue={10} speed={0.3} intensity={0.4} size={0.7} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-8 animate-border-flicker"
          >
            <Zap className="h-4 w-4" />
            <GlitchText speed={0.5} enableShadows={false} enableOnHover>
              The #1 Exam Prep Gaming Platform
            </GlitchText>
            <ChevronRight className="h-3.5 w-3.5" />
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold text-foreground mb-3 leading-tight tracking-tight"
          >
            Learn.{' '}
            <GradientText
              colors={['#FCEE09', '#f59e0b', '#ef4444', '#FCEE09']}
              animationSpeed={3}
              className="text-5xl md:text-7xl font-bold"
            >
              Compete.
            </GradientText>
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight tracking-tight"
          >
            <LetterGlitch
              text="CONQUER."
              className="text-glow-yellow"
              glitchColors={['#FCEE09', '#ef4444', '#06b6d4', '#ffffff']}
              glitchSpeed={60}
            />
          </motion.div>

          {/* Sub with blur-text animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-muted-foreground mb-4 max-w-2xl mx-auto leading-relaxed"
          >
            <BlurText
              text="Multiplayer knowledge battles for JEE, NEET & GATE aspirants."
              delay={0.25}
              animateBy="words"
              direction="bottom"
              className="text-xl text-muted-foreground"
            />
            <BlurText
              text="Turn exam prep into an exciting competitive sport."
              delay={0.55}
              animateBy="words"
              direction="bottom"
              className="text-xl text-muted-foreground"
            />
          </motion.div>

          {/* Exam badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-2 mb-10"
          >
            {examBadges.map((exam) => (
              <Badge key={exam} variant="outline" className="text-xs">{exam}</Badge>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <ClickSpark sparkColor="#FCEE09" sparkCount={14}>
              <ElectricBorder color="#FCEE09" speed={3} borderRadius={8}>
                <Button
                  size="lg"
                  className="gradient-primary border-0 gap-2 text-base h-12 px-8 glow-primary"
                  onClick={() => navigate('/auth?mode=register')}
                >
                  Start Playing Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </ElectricBorder>
            </ClickSpark>
            <ClickSpark sparkColor="#ef4444" sparkCount={10}>
              <Button
                variant="outline"
                size="lg"
                className="gap-2 text-base h-12 px-8"
                onClick={() => navigate('/auth')}
              >
                <Play className="h-4 w-4" />
                Watch Demo
              </Button>
            </ClickSpark>
          </motion.div>

          {/* Stats panel */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="relative max-w-4xl mx-auto"
          >
            <div className="rounded-2xl border border-border overflow-hidden shadow-2xl glass-strong">
              <div className="bg-gradient-to-r from-yellow-950/40 to-amber-950/30 p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {stats.map((s, idx) => (
                    <div key={s.label} className="text-center">
                      <div
                        className={`text-3xl font-bold ${idx === 0 ? 'animate-neon-pulse-red text-glow-red' : 'gradient-text'}`}
                        style={idx === 0 ? { color: 'oklch(0.72 0.28 20)' } : undefined}
                      >
                        {idx < 3
                          ? <CountUp
                              to={idx === 0 ? 50 : idx === 1 ? 10 : 1}
                              suffix={idx === 2 ? 'M+' : 'K+'}
                              duration={2}
                              delay={0.6 + idx * 0.2}
                            />
                          : s.display
                        }
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        <ScrambledText trigger="view" duration={600}>{s.label}</ScrambledText>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="relative">
                  <img
                    src="/doodierooms.png"
                    alt="Game preview"
                    className="w-full max-w-2xl mx-auto rounded-xl animate-float doodle-img"
                  />
                </div>
              </div>
            </div>
            <div className="absolute -inset-4 bg-primary/5 blur-2xl rounded-3xl -z-10" />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 max-w-6xl mx-auto relative">
        <div className="text-center mb-16">
          <Badge variant="purple" className="mb-4">Features</Badge>
          <h2 className="text-4xl font-bold text-foreground mb-4">
            <TrueFocus
              sentence="Everything you need to ace your exams"
              animationDuration={0.4}
              pauseBetweenAnimations={1.5}
              blurAmount={5}
              borderColor="#FCEE09"
              glowColor="rgba(252,238,9,0.5)"
            />
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Gamified learning that makes studying addictive. Compete, learn, and grow with thousands of students.
          </p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {features.map((feat) => (
            <motion.div key={feat.title} variants={item}>
              <SpotlightCard
                className="game-card p-6 group h-full"
                spotlightColor={feat.spotlightColor}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${feat.bg}`}>
                  <span className={feat.color}>{feat.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  <ScrambledText trigger="view" duration={500}>{feat.title}</ScrambledText>
                </h3>
                <p className="text-muted-foreground leading-relaxed">{feat.description}</p>
                <button
                  className={`mt-4 flex items-center gap-1.5 text-sm font-medium ${feat.color} group-hover:gap-2 transition-all`}
                  onClick={() => navigate('/auth')}
                >
                  Learn more <ChevronRight className="h-4 w-4" />
                </button>
              </SpotlightCard>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Game modes */}
      <section className="py-24 px-6 bg-muted/30 border-y border-border relative overflow-hidden">
        {/* Background lightning */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <Lightning hue={55} speed={0.2} intensity={0.3} size={0.5} />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <Badge variant="blue" className="mb-4">Game Modes</Badge>
            <h2 className="text-4xl font-bold text-foreground mb-4">
              <GradientText colors={['#FCEE09', '#ef4444', '#06b6d4', '#FCEE09']} animationSpeed={4}>
                10+ unique ways to learn
              </GradientText>
            </h2>
          </div>
          {/* VS divider */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-red-500/40" />
            <span
              className="text-2xl font-black tracking-widest animate-neon-pulse-red px-4 py-1 rounded-lg"
              style={{ color: 'oklch(0.72 0.28 20)', textShadow: '0 0 20px oklch(0.62 0.28 20 / 0.7)', background: 'oklch(0.62 0.28 20 / 0.08)', border: '1px solid oklch(0.62 0.28 20 / 0.3)' }}
            >
              <GlitchText speed={0.3} enableShadows={false}>VS</GlitchText>
            </span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-primary/40" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { icon: '⚔️', name: '5v5 Battle', color: 'from-yellow-500 to-amber-600', hot: true },
              { icon: '🏆', name: 'Ranked', color: 'from-yellow-500 to-orange-600', hot: false },
              { icon: '🧠', name: 'Solo Practice', color: 'from-green-500 to-teal-600', hot: false },
              { icon: '👹', name: 'Boss Mode', color: 'from-red-600 to-pink-700', hot: true },
              { icon: '🐉', name: 'Dragon Out', color: 'from-orange-500 to-red-600', hot: false },
              { icon: '⚡', name: 'Speed Race', color: 'from-yellow-400 to-amber-600', hot: false },
              { icon: '🔢', name: 'Equation', color: 'from-blue-500 to-cyan-600', hot: false },
              { icon: '📝', name: 'Crossword', color: 'from-cyan-500 to-teal-600', hot: false },
              { icon: '🏃', name: 'Runner', color: 'from-teal-500 to-green-600', hot: false },
              { icon: '♟️', name: 'Quantum', color: 'from-cyan-600 to-teal-700', hot: false },
            ].map((mode) => (
              <ClickSpark key={mode.name} sparkColor={mode.hot ? '#ef4444' : '#FCEE09'} sparkCount={8}>
                <motion.div
                  whileHover={{ y: -4, scale: 1.04 }}
                  className="game-card p-4 text-center cursor-pointer relative"
                  onClick={() => navigate('/auth')}
                  style={mode.hot ? { borderColor: 'oklch(0.62 0.28 20 / 0.5)' } : undefined}
                >
                  {mode.hot && (
                    <span
                      className="absolute -top-2 -right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-neon-pulse-red"
                      style={{ background: 'oklch(0.62 0.28 20)', color: 'white' }}
                    >
                      HOT
                    </span>
                  )}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mode.color} flex items-center justify-center mx-auto mb-2`}>
                    <span className="text-2xl">{mode.icon}</span>
                  </div>
                  <p className="text-sm font-medium text-foreground">{mode.name}</p>
                </motion.div>
              </ClickSpark>
            ))}
          </div>
        </div>
      </section>

      {/* Security / Trust */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          {[
            { icon: <Shield className="h-8 w-8 mx-auto" />, title: 'Secure & Safe', desc: 'Your data is encrypted and protected at all times.', color: 'text-emerald-400', spotlight: 'rgba(16, 185, 129, 0.12)' },
            { icon: <Clock className="h-8 w-8 mx-auto" />, title: 'Always Available', desc: '24/7 uptime so you can practice whenever inspiration strikes.', color: 'text-blue-400', spotlight: 'rgba(59, 130, 246, 0.12)' },
            { icon: <TrendingUp className="h-8 w-8 mx-auto" />, title: 'Track Progress', desc: 'Detailed analytics and progress tracking to measure your growth.', color: 'text-primary', spotlight: 'rgba(252, 238, 9, 0.12)' },
          ].map((it) => (
            <motion.div
              key={it.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <SpotlightCard className="game-card p-8 h-full" spotlightColor={it.spotlight}>
                <div className={`mb-4 ${it.color}`}>{it.icon}</div>
                <h3 className="text-lg font-bold text-foreground mb-2">{it.title}</h3>
                <p className="text-muted-foreground text-sm">{it.desc}</p>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative overflow-hidden">
        {/* Background lightning */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <Lightning hue={55} speed={0.3} intensity={0.5} size={0.8} />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-3xl p-12 gradient-border relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, oklch(0.93 0.21 103 / 0.08), oklch(0.62 0.28 20 / 0.06))' }}
          >
            <div className="absolute inset-0 grid-bg opacity-20" />
            <Noise opacity={0.03} />
            <div className="relative z-10">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Ready to start your{' '}
                <GradientText colors={['#FCEE09', '#ef4444', '#06b6d4', '#FCEE09']} animationSpeed={3}>
                  journey?
                </GradientText>
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
                Join <CountUp to={50000} separator="," suffix="+" duration={1.5} /> students already competing and learning on CompeteHub.
              </p>
              <ClickSpark sparkColor="#FCEE09" sparkCount={16}>
                <ElectricBorder color="#FCEE09" speed={2.5} borderRadius={8}>
                  <Button
                    size="lg"
                    className="gradient-primary border-0 gap-2 text-base h-12 px-10 glow-primary"
                    onClick={() => navigate('/auth?mode=register')}
                  >
                    Create Free Account
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </ElectricBorder>
              </ClickSpark>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

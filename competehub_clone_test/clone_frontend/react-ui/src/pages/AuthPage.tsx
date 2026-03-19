import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import OTPForm from '../components/auth/OTPForm';
import { useUser } from '../contexts/UserContext';
import { Button } from '../components/ui/button';
import { ElectricBorder } from '../components/reactbits/ElectricBorder';
import { Aurora } from '../components/reactbits/Aurora';
import { Noise } from '../components/reactbits/Noise';
import { Lightning } from '../components/reactbits/Lightning';
import { GlitchText } from '../components/reactbits/GlitchText';
import { BlurText } from '../components/reactbits/BlurText';
import { CountUp } from '../components/reactbits/CountUp';
import { LetterGlitch } from '../components/reactbits/LetterGlitch';
import { GradientText } from '../components/reactbits/GradientText';
import { ClickSpark } from '../components/reactbits/ClickSpark';

type AuthMode = 'login' | 'register' | 'otp' | 'forgot';

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loginAsGuest } = useUser();

  const [mode, setMode] = useState<AuthMode>(() => {
    const m = searchParams.get('mode');
    return (m === 'register' ? 'register' : 'login') as AuthMode;
  });
  const [pendingEmail, setPendingEmail] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/arena';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleRegisterSuccess = (email: string) => {
    setPendingEmail(email);
    setMode('otp');
  };

  const handleOTPSuccess = () => {
    navigate('/arena');
  };

  const leftCopy = {
    login: {
      title: 'Welcome back, warrior!',
      sub: 'Your rank, your XP, your battles await.',
    },
    register: {
      title: 'Join the battle!',
      sub: 'Compete with thousands of students. Rise through the ranks.',
    },
    otp: {
      title: 'Almost there!',
      sub: 'Verify your email to unlock the full CompeteHub experience.',
    },
    forgot: {
      title: 'Reset password',
      sub: 'Enter your email to receive a reset link.',
    },
  };

  return (
    <div className="min-h-screen bg-background flex relative overflow-hidden">
      {/* Global aurora background */}
      <Aurora
        colorStops={['#FCEE09', '#f59e0b', '#ef4444', '#78350f']}
        amplitude={0.9}
        speed={0.5}
        style={{ opacity: 0.45, zIndex: 0 }}
      />
      {/* Grid */}
      <div className="absolute inset-0 grid-bg-intense opacity-20 z-[1]" />
      <div className="absolute inset-0 scanlines opacity-40 z-[1]" />
      <Noise opacity={0.03} />

      {/* Left panel - decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 z-10">
        {/* Lightning corner accents */}
        <div className="absolute top-0 right-0 w-48 h-full opacity-20 pointer-events-none">
          <Lightning hue={55} speed={0.3} intensity={0.5} size={0.7} />
        </div>

        <div className="relative z-10 max-w-sm text-center">
          <motion.div
            key={mode}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8 animate-float"
          >
            <img
              src={mode === 'register' ? '/doodieregister.png' : mode === 'otp' ? '/doodieotp.png' : '/doodielogin.png'}
              alt="Auth illustration"
              className="w-64 h-64 object-contain mx-auto doodle-img"
            />
          </motion.div>

          <motion.div
            key={`copy-${mode}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <h2 className="text-2xl font-bold text-foreground mb-3">
              <LetterGlitch
                text={leftCopy[mode].title}
                glitchSpeed={80}
                glitchColors={['#FCEE09', '#ef4444', '#06b6d4', '#ffffff']}
              />
            </h2>
            <p className="text-muted-foreground">
              <BlurText text={leftCopy[mode].sub} animateBy="words" delay={0.2} stepDuration={0.3} />
            </p>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { to: 50, suffix: 'K+', label: 'Players' },
                { to: 10, suffix: 'K+', label: 'Questions' },
                { to: 10, suffix: '+',  label: 'Modes' },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-xl font-bold">
                    <GradientText colors={['#FCEE09', '#f59e0b', '#ef4444', '#FCEE09']} animationSpeed={3}>
                      <CountUp to={s.to} suffix={s.suffix} duration={1.2} />
                    </GradientText>
                  </div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right panel - auth form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 z-10">
        <ElectricBorder color="#FCEE09" speed={4} borderRadius={16} className="w-full max-w-md">
          <div className="w-full max-w-md">
            <AnimatePresence mode="wait">

              {mode === 'login' && (
                <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <LoginForm
                    onForgotPassword={() => setMode('forgot')}
                    onSwitchToRegister={() => setMode('register')}
                  />
                </motion.div>
              )}

              {mode === 'register' && (
                <motion.div key="register" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <RegisterForm
                    onSuccess={handleRegisterSuccess}
                    onSwitchToLogin={() => setMode('login')}
                  />
                </motion.div>
              )}

              {mode === 'otp' && (
                <motion.div key="otp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <OTPForm
                    email={pendingEmail}
                    onSuccess={handleOTPSuccess}
                    onBack={() => setMode('register')}
                  />
                </motion.div>
              )}

              {mode === 'forgot' && (
                <motion.div key="forgot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="text-center">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Reset password</h1>
                    <p className="text-muted-foreground mb-6">Enter your email to receive a reset code</p>
                    <button
                      onClick={() => setMode('login')}
                      className="text-sm text-primary hover:underline"
                    >
                      Back to login
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Guest mode */}
            {mode !== 'otp' && (
              <div className="mt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">or</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <ClickSpark sparkColor="#FCEE09" sparkCount={8}>
                  <Button
                    variant="outline"
                    className="w-full gap-2 border-border text-muted-foreground hover:text-foreground"
                    onClick={() => { loginAsGuest(); navigate('/arena'); }}
                  >
                    👤 Continue as Guest
                  </Button>
                </ClickSpark>
                <p className="text-center text-xs text-muted-foreground mt-2">
                  Browse the app without an account. Some features are limited.
                </p>
              </div>
            )}
          </div>
        </ElectricBorder>
      </div>
    </div>
  );
}

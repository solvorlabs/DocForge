import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { useUser } from '../../contexts/UserContext';

interface OTPFormProps {
  email: string;
  onSuccess: () => void;
  onBack: () => void;
}

export default function OTPForm({ email, onSuccess, onBack }: OTPFormProps) {
  const { verifyEmail, resendOTP } = useUser();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputs = useRef<HTMLInputElement[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputs.current[index + 1]?.focus();
    if (newOtp.every(d => d) && newOtp.join('').length === 6) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (code?: string) => {
    const otpCode = code || otp.join('');
    if (otpCode.length !== 6) { toast.error('Enter all 6 digits'); return; }
    setIsLoading(true);
    try {
      await verifyEmail(email, otpCode);
      toast.success('Email verified! Welcome to CompeteHub!');
      onSuccess();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendOTP(email);
      setCountdown(60);
      setCanResend(false);
      toast.success('OTP resent!');
    } catch {
      toast.error('Failed to resend OTP');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full text-center"
    >
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 mb-4">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Check your email</h1>
        <p className="text-muted-foreground">
          We sent a 6-digit code to<br />
          <span className="text-foreground font-medium">{email}</span>
        </p>
      </div>

      {/* OTP inputs */}
      <div className="flex justify-center gap-3 mb-6">
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { if (el) inputs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleInput(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 bg-input text-foreground
              border-border focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition-all"
          />
        ))}
      </div>

      <Button
        onClick={() => handleVerify()}
        className="w-full gradient-primary border-0 mb-4"
        size="lg"
        disabled={isLoading || otp.some(d => !d)}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            Verifying...
          </span>
        ) : 'Verify Email'}
      </Button>

      <div className="flex flex-col items-center gap-3">
        {canResend ? (
          <button onClick={handleResend} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
            <RefreshCw className="h-3.5 w-3.5" /> Resend OTP
          </button>
        ) : (
          <p className="text-sm text-muted-foreground">
            Resend in <span className="text-primary font-medium">{countdown}s</span>
          </p>
        )}
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
      </div>
    </motion.div>
  );
}

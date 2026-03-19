import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, CheckCircle, XCircle, Chrome, ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger } from '../ui/select';
import { useUser } from '../../contexts/UserContext';
import { EXAM_TYPES, AVATAR_OPTIONS, SOCKET_URL } from '../../lib/constants';

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  examTarget: string;
  avatar: string;
}

interface RegisterFormProps {
  onSuccess: (email: string) => void;
  onSwitchToLogin: () => void;
}

export default function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const { register: registerUser, checkUsername } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [selectedAvatar, setSelectedAvatar] = useState('🧑‍💻');
  const [examTarget, setExamTarget] = useState('JEE');

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<RegisterFormData>({
    defaultValues: { avatar: '🧑‍💻', examTarget: 'JEE' }
  });

  const usernameValue = watch('username');

  useEffect(() => {
    if (!usernameValue || usernameValue.length < 3) { setUsernameStatus('idle'); return; }
    setUsernameStatus('checking');
    const timer = setTimeout(async () => {
      try {
        const res = await checkUsername(usernameValue);
        setUsernameStatus(res.available ? 'available' : 'taken');
      } catch {
        setUsernameStatus('idle');
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [usernameValue, checkUsername]);

  const onSubmit = async (data: RegisterFormData) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      await registerUser({ ...data, avatar: selectedAvatar, examTarget });
      toast.success('Account created! Please verify your email.');
      onSuccess(data.email);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Create account</h1>
        <p className="text-muted-foreground">Join thousands of students competing for excellence</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Avatar selection */}
        <div className="space-y-2">
          <Label>Choose your avatar</Label>
          <div className="flex flex-wrap gap-2">
            {AVATAR_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => { setSelectedAvatar(emoji); setValue('avatar', emoji); }}
                className={`text-2xl p-2 rounded-xl transition-all ${
                  selectedAvatar === emoji
                    ? 'bg-primary/20 border-2 border-primary scale-110'
                    : 'bg-muted border-2 border-transparent hover:border-primary/30'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Username */}
        <div className="space-y-1.5">
          <Label htmlFor="username">Username</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="username"
              placeholder="your_username"
              className="pl-10 pr-10"
              {...register('username', {
                required: 'Username is required',
                minLength: { value: 3, message: 'Minimum 3 characters' },
                pattern: { value: /^[a-zA-Z0-9_]+$/, message: 'Letters, numbers, underscores only' },
              })}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              {usernameStatus === 'available' && <CheckCircle className="h-4 w-4 text-emerald-500" />}
              {usernameStatus === 'taken' && <XCircle className="h-4 w-4 text-destructive" />}
              {usernameStatus === 'checking' && <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin block" />}
            </span>
          </div>
          {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
          {usernameStatus === 'taken' && <p className="text-xs text-destructive">Username is taken</p>}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="reg-email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="reg-email"
              type="email"
              placeholder="you@example.com"
              className="pl-10"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' },
              })}
            />
          </div>
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        {/* Exam Target */}
        <div className="space-y-1.5">
          <Label>Exam Target</Label>
          <Select value={examTarget} onValueChange={(v) => { setExamTarget(v); setValue('examTarget', v); }}>
            <SelectTrigger />
            <SelectContent>
              {EXAM_TYPES.map((exam) => (
                <SelectItem key={exam} value={exam}>{exam}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="reg-password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 8 characters"
              className="pl-10 pr-10"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Min 8 characters' },
              })}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirm-password"
              type="password"
              placeholder="Repeat password"
              className="pl-10"
              {...register('confirmPassword', { required: 'Please confirm password' })}
            />
          </div>
          {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
        </div>

        <Button type="submit" className="w-full gradient-primary border-0 gap-2" size="lg" disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Creating account...
            </span>
          ) : (
            <span className="flex items-center gap-2">Create Account <ArrowRight className="h-4 w-4" /></span>
          )}
        </Button>
      </form>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-card px-2 text-muted-foreground">or</span>
        </div>
      </div>

      <Button type="button" variant="outline" className="w-full gap-2" onClick={() => window.location.href = `${SOCKET_URL}/api/auth/google`}>
        <Chrome className="h-4 w-4" /> Continue with Google
      </Button>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <button onClick={onSwitchToLogin} className="text-primary hover:underline font-medium">Sign in</button>
      </p>
    </motion.div>
  );
}

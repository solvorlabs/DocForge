import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, Palette, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Separator } from '../components/ui/separator';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { AVATAR_OPTIONS } from '../lib/constants';

export default function Settings() {
  const { user, updateProfile, logout } = useUser();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('profile');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || '🧑‍💻');
  const [notifications, setNotifications] = useState({ email: true, push: true, game: true });
  const [isSaving, setIsSaving] = useState(false);

  const sections = [
    { id: 'profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
    { id: 'privacy', label: 'Privacy', icon: <Shield className="h-4 w-4" /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="h-4 w-4" /> },
  ];

  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const fd = new FormData(e.currentTarget);
      await updateProfile({ avatar: selectedAvatar, firstName: fd.get('firstName'), lastName: fd.get('lastName') });
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out');
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-1">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences</p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar nav */}
          <nav className="md:w-48 shrink-0">
            <div className="game-card p-2 space-y-1">
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-all ${
                    activeSection === s.id
                      ? 'bg-primary/15 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {s.icon} {s.label}
                </button>
              ))}
              <Separator className="my-1" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-all"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </div>
          </nav>

          {/* Content */}
          <div className="flex-1">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="game-card p-6"
            >
              {activeSection === 'profile' && (
                <form onSubmit={handleSaveProfile} className="space-y-5">
                  <h2 className="text-lg font-semibold text-foreground">Profile Information</h2>

                  {/* Avatar */}
                  <div>
                    <Label className="mb-2 block">Avatar</Label>
                    <div className="flex items-center gap-4 mb-3">
                      <Avatar size="lg">
                        <AvatarFallback emoji={selectedAvatar} className="text-3xl" />
                      </Avatar>
                      <p className="text-sm text-muted-foreground">Choose your avatar</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {AVATAR_OPTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setSelectedAvatar(emoji)}
                          className={`text-2xl p-2 rounded-xl transition-all ${
                            selectedAvatar === emoji
                              ? 'bg-primary/20 border-2 border-primary'
                              : 'bg-muted border-2 border-transparent hover:border-primary/30'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>First Name</Label>
                      <Input name="firstName" defaultValue={user?.firstName} placeholder="First name" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Last Name</Label>
                      <Input name="lastName" defaultValue={user?.lastName} placeholder="Last name" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Username</Label>
                    <Input defaultValue={user?.username} disabled className="opacity-50" />
                    <p className="text-xs text-muted-foreground">Username cannot be changed</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Email</Label>
                    <Input defaultValue={user?.email} disabled className="opacity-50" />
                  </div>

                  <Button type="submit" className="gradient-primary border-0" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
              )}

              {activeSection === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-foreground">Notification Preferences</h2>
                  {[
                    { key: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
                    { key: 'push', label: 'Push Notifications', desc: 'Browser push notifications' },
                    { key: 'game', label: 'Game Alerts', desc: 'Friend challenges and game invites' },
                  ].map((n) => (
                    <div key={n.key} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{n.label}</p>
                        <p className="text-xs text-muted-foreground">{n.desc}</p>
                      </div>
                      <Switch
                        checked={notifications[n.key as keyof typeof notifications]}
                        onCheckedChange={(v) => setNotifications(prev => ({ ...prev, [n.key]: v }))}
                      />
                    </div>
                  ))}
                </div>
              )}

              {activeSection === 'privacy' && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-foreground">Privacy Settings</h2>
                  {[
                    { label: 'Public Profile', desc: 'Allow others to view your profile' },
                    { label: 'Show Online Status', desc: 'Show when you are online' },
                    { label: 'Allow Friend Requests', desc: 'Let others send you friend requests' },
                  ].map((p, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{p.label}</p>
                        <p className="text-xs text-muted-foreground">{p.desc}</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  ))}
                </div>
              )}

              {activeSection === 'appearance' && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-foreground">Appearance</h2>
                  <p className="text-sm text-muted-foreground">
                    CompeteHub uses a dark gaming theme for the best experience. Theme customization coming soon!
                  </p>
                  <div className="flex gap-3">
                    <div className="flex-1 p-4 rounded-xl border-2 border-primary bg-primary/10 text-center">
                      <div className="w-full h-12 rounded-lg bg-background mb-2" />
                      <p className="text-xs font-medium text-primary">Dark (Active)</p>
                    </div>
                    <div className="flex-1 p-4 rounded-xl border-2 border-border opacity-40 text-center cursor-not-allowed">
                      <div className="w-full h-12 rounded-lg bg-white mb-2" />
                      <p className="text-xs font-medium text-muted-foreground">Light (Soon)</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

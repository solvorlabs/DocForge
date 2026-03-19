import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Hash, Users, Zap, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useGame } from '../contexts/GameContext';
import { useUser } from '../contexts/UserContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export default function CustomRooms() {
  const navigate = useNavigate();
  const { createRoom, joinRoom } = useGame();
  const { user } = useUser();
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [username, setUsername] = useState(user?.username || '');
  const [roomCode, setRoomCode] = useState('');
  const [rounds, setRounds] = useState(5);

  const handleCreate = () => {
    if (!username.trim()) { toast.error('Enter your username'); return; }
    createRoom(username.trim(), rounds);
    toast.success('Room created!');
    // Will redirect after room_created event sets roomCode
    setTimeout(() => navigate('/arena'), 200); // fallback; ideally listen to event
  };

  const handleJoin = () => {
    if (!username.trim()) { toast.error('Enter your username'); return; }
    if (!roomCode.trim()) { toast.error('Enter room code'); return; }
    navigate(`/room/${roomCode.trim().toUpperCase()}`);
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-1">Group Play</h1>
          <p className="text-muted-foreground">Create or join a 5v5 multiplayer battle</p>
        </motion.div>

        {/* Tab switcher */}
        <div className="flex rounded-xl border border-border overflow-hidden mb-6">
          {(['create', 'join'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-sm font-medium transition-all capitalize ${
                tab === t
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              {t === 'create' ? '+ Create Room' : '# Join Room'}
            </button>
          ))}
        </div>

        {tab === 'create' ? (
          <motion.div key="create" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="game-card p-6 space-y-4">
            <div className="text-center mb-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 mb-3">
                <Plus className="h-7 w-7 text-violet-400" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Create New Room</h2>
              <p className="text-sm text-muted-foreground">You'll be the host and can start the game</p>
            </div>

            <div className="space-y-1.5">
              <Label>Your Username</Label>
              <Input
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <Label>Rounds</Label>
                <span className="text-primary font-semibold">{rounds}</span>
              </div>
              <input
                type="range" min={3} max={10} step={1}
                value={rounds}
                onChange={(e) => setRounds(Number(e.target.value))}
                className="w-full accent-violet-500"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>3</span><span>10</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 py-2 text-center text-xs text-muted-foreground">
              {[
                { label: 'Max Players', value: '10' },
                { label: 'Mode', value: '5v5' },
                { label: 'Rounds', value: `${rounds}` },
              ].map((s) => (
                <div key={s.label} className="game-card p-2">
                  <div className="font-bold text-foreground">{s.value}</div>
                  <div>{s.label}</div>
                </div>
              ))}
            </div>

            <Button className="w-full gradient-primary border-0 gap-2 h-11" onClick={handleCreate}>
              <Zap className="h-4 w-4" /> Create Room
            </Button>
          </motion.div>
        ) : (
          <motion.div key="join" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="game-card p-6 space-y-4">
            <div className="text-center mb-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-3">
                <Hash className="h-7 w-7 text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Join a Room</h2>
              <p className="text-sm text-muted-foreground">Enter the room code shared by your host</p>
            </div>

            <div className="space-y-1.5">
              <Label>Your Username</Label>
              <Input
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Room Code</Label>
              <Input
                placeholder="e.g. ABCD12"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="font-mono text-lg tracking-widest text-center"
                maxLength={8}
              />
            </div>

            <Button className="w-full gap-2 h-11" style={{ background: 'linear-gradient(135deg, oklch(0.58 0.24 255), oklch(0.56 0.22 230))', border: 'none', color: 'white' }} onClick={handleJoin}>
              <Users className="h-4 w-4" /> Join Battle
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        )}

        {/* Tips */}
        <div className="mt-6 p-4 rounded-xl bg-muted/30 border border-border">
          <h3 className="text-sm font-semibold text-foreground mb-2">💡 Tips</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Share your room code with friends to invite them</li>
            <li>• You need at least 2 players to start a game</li>
            <li>• Each round one player from each team faces off</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

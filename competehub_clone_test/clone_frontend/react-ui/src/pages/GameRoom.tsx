import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy, Check, Users, Play, Settings, Crown, X,
  Shield, Swords, Eye, MessageSquare, ChevronDown, ChevronUp
} from 'lucide-react';
import { toast } from 'sonner';
import { useGame } from '../contexts/GameContext';
import { useUser } from '../contexts/UserContext';
import ChatWindow from '../components/shared/ChatWindow';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { cn } from '../lib/utils';
import { ElectricBorder } from '../components/reactbits/ElectricBorder';
import { ClickSpark } from '../components/reactbits/ClickSpark';
import { GlitchText } from '../components/reactbits/GlitchText';
import { Noise } from '../components/reactbits/Noise';
import { SpotlightCard } from '../components/reactbits/SpotlightCard';

export default function GameRoom() {
  const { roomCode: urlCode } = useParams();
  const navigate = useNavigate();
  const {
    username, roomCode, gameData, isHost,
    joinRoom, startGame, joinTeam, spectate, kickUser,
    gameSettings, updateGameSettings, gamePhase, returnToLobby,
    setChatVisible,
  } = useGame();
  const { user } = useUser();
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [joinName, setJoinName] = useState(user?.username || '');
  const [hasJoined, setHasJoined] = useState(!!roomCode);

  // If navigated to a specific room via URL but not joined yet
  useEffect(() => {
    if (urlCode && !roomCode) {
      // Show join form
      setHasJoined(false);
    } else if (roomCode) {
      setHasJoined(true);
    }
  }, [urlCode, roomCode]);

  // Redirect to game board when game starts
  useEffect(() => {
    if (gamePhase === 'question' || gamePhase === 'faceoff') {
      navigate(`/game/${roomCode}`);
    }
  }, [gamePhase, roomCode, navigate]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Room code copied!');
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinName.trim()) return;
    if (urlCode) {
      joinRoom(joinName.trim(), urlCode);
    }
    setHasJoined(true);
  };

  // Join form if not in room yet
  if (!hasJoined && urlCode) {
    return (
      <div className="min-h-screen bg-background grid-bg flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="game-card p-8 text-center">
            <div className="text-4xl mb-4">⚔️</div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Join Room</h2>
            <p className="text-muted-foreground mb-6">Room code: <span className="text-primary font-mono font-bold">{urlCode}</span></p>
            <form onSubmit={handleJoin} className="space-y-4">
              <input
                type="text"
                placeholder="Your username"
                value={joinName}
                onChange={(e) => setJoinName(e.target.value)}
                className="w-full h-10 rounded-lg border border-border bg-input px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <Button type="submit" className="w-full gradient-primary border-0">
                Join Battle
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  const redTeam = gameData?.redTeam || [];
  const blueTeam = gameData?.blueTeam || [];
  const spectators = gameData?.spectators || [];
  const totalPlayers = redTeam.length + blueTeam.length;

  return (
    <div className="min-h-screen bg-background grid-bg p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Game Lobby</h1>
            <p className="text-muted-foreground text-sm">{totalPlayers} players joined</p>
          </div>
          {/* Room code */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-border">
            <span className="text-sm text-muted-foreground">Room:</span>
            <span className="font-mono font-bold text-primary text-lg tracking-wider">{roomCode}</span>
            <button onClick={handleCopyCode} className="ml-2 text-muted-foreground hover:text-foreground">
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Teams Panel */}
          <div className="md:col-span-2 space-y-4">
            {/* Team Red */}
            <div className="game-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center gap-2"
                style={{ background: 'oklch(0.6 0.24 20 / 0.1)' }}>
                <Shield className="h-4 w-4 text-red-400" />
                <span className="font-semibold text-red-400">Red Team</span>
                <Badge variant="red" className="ml-auto">{redTeam.length}</Badge>
              </div>
              <div className="p-4 min-h-24">
                {redTeam.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">No players yet</p>
                ) : (
                  <div className="space-y-2">
                    {redTeam.map((p) => (
                      <PlayerRow key={p.socketId} player={p} isHost={isHost} team="red" onKick={kickUser} currentUsername={username} />
                    ))}
                  </div>
                )}
                {username && !gameData?.redTeam.some(p => p.username === username) && !gameData?.blueTeam.some(p => p.username === username) && (
                  <Button variant="outline" size="sm" className="mt-2 w-full border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={() => joinTeam('red')}>
                    Join Red Team
                  </Button>
                )}
              </div>
            </div>

            {/* VS divider */}
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-3 px-6 py-2 rounded-full glass border border-border">
                <Swords className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-bold text-muted-foreground">VS</span>
              </div>
            </div>

            {/* Team Blue */}
            <div className="game-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center gap-2"
                style={{ background: 'oklch(0.6 0.22 255 / 0.1)' }}>
                <Shield className="h-4 w-4 text-blue-400" />
                <span className="font-semibold text-blue-400">Blue Team</span>
                <Badge variant="blue" className="ml-auto">{blueTeam.length}</Badge>
              </div>
              <div className="p-4 min-h-24">
                {blueTeam.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">No players yet</p>
                ) : (
                  <div className="space-y-2">
                    {blueTeam.map((p) => (
                      <PlayerRow key={p.socketId} player={p} isHost={isHost} team="blue" onKick={kickUser} currentUsername={username} />
                    ))}
                  </div>
                )}
                {username && !gameData?.redTeam.some(p => p.username === username) && !gameData?.blueTeam.some(p => p.username === username) && (
                  <Button variant="outline" size="sm" className="mt-2 w-full border-blue-500/30 text-blue-400 hover:bg-blue-500/10" onClick={() => joinTeam('blue')}>
                    Join Blue Team
                  </Button>
                )}
              </div>
            </div>

            {/* Spectators */}
            {spectators.length > 0 && (
              <div className="game-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Spectators ({spectators.length})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {spectators.map((s) => (
                    <span key={s.socketId} className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                      {s.username}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Join as spectator if not in a team */}
            {username && !gameData?.redTeam.some(p => p.username === username) && !gameData?.blueTeam.some(p => p.username === username) && !gameData?.spectators.some(p => p.username === username) && (
              <Button variant="ghost" size="sm" className="w-full" onClick={spectate}>
                <Eye className="h-4 w-4 mr-2" /> Join as Spectator
              </Button>
            )}
          </div>

          {/* Right Panel */}
          <div className="space-y-4">
            {/* Host Controls */}
            {isHost && (
              <div className="game-card p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Crown className="h-4 w-4 text-yellow-400" />
                  <span className="font-semibold text-foreground">Host Controls</span>
                </div>

                <Button
                  className="w-full gradient-primary border-0 gap-2 mb-3 glow-primary"
                  onClick={startGame}
                  disabled={totalPlayers < 2}
                >
                  <Play className="h-4 w-4" /> Start Game
                </Button>

                {totalPlayers < 2 && (
                  <p className="text-xs text-muted-foreground text-center mb-3">Need at least 2 players</p>
                )}

                {/* Settings toggle */}
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="flex items-center justify-between w-full text-sm text-muted-foreground hover:text-foreground py-2"
                >
                  <span className="flex items-center gap-2"><Settings className="h-4 w-4" /> Game Settings</span>
                  {showSettings ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                <AnimatePresence>
                  {showSettings && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden space-y-4 pt-3"
                    >
                      <div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-2">
                          <span>Question Timer</span>
                          <span className="text-foreground">{gameSettings.questionTimer}s</span>
                        </div>
                        <input
                          type="range" min={10} max={60} step={5}
                          value={gameSettings.questionTimer}
                          onChange={(e) => updateGameSettings({ questionTimer: Number(e.target.value) })}
                          className="w-full accent-violet-500"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-2">
                          <span>Break Timer</span>
                          <span className="text-foreground">{gameSettings.breakTimer}s</span>
                        </div>
                        <input
                          type="range" min={3} max={15} step={1}
                          value={gameSettings.breakTimer}
                          onChange={(e) => updateGameSettings({ breakTimer: Number(e.target.value) })}
                          className="w-full accent-violet-500"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Room Info */}
            <div className="game-card p-4">
              <h3 className="font-semibold text-foreground mb-3">Room Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mode</span>
                  <span className="text-foreground">5v5 Teams</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Players</span>
                  <span className="text-foreground">{totalPlayers} joined</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="success">Waiting</Badge>
                </div>
              </div>
            </div>

            {/* Game Rules */}
            <div className="game-card p-4">
              <h3 className="font-semibold text-foreground mb-3">How to Play</h3>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                <li className="flex gap-2"><span className="text-primary">•</span>Join a team (Red or Blue)</li>
                <li className="flex gap-2"><span className="text-primary">•</span>Players from each team face off 1v1</li>
                <li className="flex gap-2"><span className="text-primary">•</span>Answer questions faster to score points</li>
                <li className="flex gap-2"><span className="text-primary">•</span>Highest team score wins the game</li>
              </ul>
            </div>

            {/* Chat toggle */}
            <Button variant="outline" className="w-full gap-2" onClick={() => setChatVisible(true)}>
              <MessageSquare className="h-4 w-4" /> Open Chat
            </Button>
          </div>
        </div>
      </div>

      <ChatWindow />
    </div>
  );
}

function PlayerRow({ player, isHost, team, onKick, currentUsername }: {
  player: { socketId: string; username: string };
  isHost: boolean;
  team: 'red' | 'blue';
  onKick: (socketId: string) => void;
  currentUsername: string;
}) {
  const isMe = player.username === currentUsername;
  return (
    <div className={cn(
      "flex items-center gap-3 px-3 py-2 rounded-lg border",
      team === 'red' ? "bg-red-500/5 border-red-500/20" : "bg-blue-500/5 border-blue-500/20"
    )}>
      <Avatar size="sm">
        <AvatarFallback emoji="🧑‍💻" />
      </Avatar>
      <span className="text-sm font-medium text-foreground flex-1">{player.username}</span>
      {isMe && <Badge variant="purple" className="text-xs">You</Badge>}
      {isHost && !isMe && (
        <button onClick={() => onKick(player.socketId)} className="text-muted-foreground hover:text-destructive transition-colors">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}


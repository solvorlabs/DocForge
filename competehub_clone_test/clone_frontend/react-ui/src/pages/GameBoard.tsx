import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Trophy, Shield, Swords, ChevronRight } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import ChatWindow from '../components/shared/ChatWindow';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { cn } from '../lib/utils';
import { ClickSpark } from '../components/reactbits/ClickSpark';
import { GlitchText } from '../components/reactbits/GlitchText';
import { GradientText } from '../components/reactbits/GradientText';
import { Lightning } from '../components/reactbits/Lightning';
import { SpotlightCard } from '../components/reactbits/SpotlightCard';
import { Noise } from '../components/reactbits/Noise';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export default function GameBoard() {
  const { roomCode: urlCode } = useParams();
  const navigate = useNavigate();
  const {
    gameData, currentQuestion, selectedAnswer, confirmedAnswer,
    answerResult, currentFaceoff, gameSettings,
    gamePhase, selectAnswer, confirmAnswer,
    isMyTurn, isInRedTeam, isInBlueTeam, isSpectator,
    returnToLobby, username, roomCode,
  } = useGame();

  const [timeLeft, setTimeLeft] = useState(gameSettings.questionTimer);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer
  useEffect(() => {
    if (gamePhase === 'question' && currentQuestion) {
      setTimeLeft(gameSettings.questionTimer);
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) { clearInterval(timerRef.current!); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [currentQuestion, gamePhase, gameSettings.questionTimer]);

  const timerPercent = (timeLeft / gameSettings.questionTimer) * 100;
  const timerColor = timerPercent > 50 ? '#10b981' : timerPercent > 25 ? '#f59e0b' : '#ef4444';

  const myTeam = isInRedTeam() ? 'red' : isInBlueTeam() ? 'blue' : 'spectator';
  const canAnswer = isMyTurn() && !confirmedAnswer;

  // Game ended - show results
  if (gamePhase === 'ended' && gameData) {
    return (
      <div className="min-h-screen bg-background grid-bg-intense flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <Lightning hue={gameData.winner === 'red' ? 10 : 55} speed={0.5} intensity={1} size={1.2} />
        </div>
        <Noise opacity={0.03} />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg text-center relative z-10"
        >
          <SpotlightCard className="game-card p-8" spotlightColor={gameData.winner === 'red' ? 'rgba(239,68,68,0.15)' : 'rgba(252,238,9,0.12)'}>
            <div className="text-6xl mb-4">
              {gameData.winner === 'red' ? '🔴' : gameData.winner === 'blue' ? '🔵' : '🤝'}
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {gameData.winner === 'tie' ? "It's a Tie!" : `${gameData.winner === 'red' ? 'Red' : 'Blue'} Team Wins!`}
            </h1>

            {/* Score */}
            <div className="flex items-center justify-center gap-8 my-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-red-400">{gameData.scores.red}</div>
                <div className="text-sm text-muted-foreground">Red</div>
              </div>
              <div className="text-2xl text-muted-foreground">vs</div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-400">{gameData.scores.blue}</div>
                <div className="text-sm text-muted-foreground">Blue</div>
              </div>
            </div>

            {/* Winner highlight */}
            {gameData.winner && gameData.winner !== 'tie' && (
              <div className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6",
                myTeam === gameData.winner
                  ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                  : "border-red-500/50 bg-red-500/10 text-red-400"
              )}>
                {myTeam === gameData.winner ? <Trophy className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                {myTeam === gameData.winner ? 'Victory! +50 XP' : 'Defeat. Keep practicing!'}
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => navigate('/custom-rooms')}>
                Leave
              </Button>
              <ClickSpark sparkColor="#FCEE09" sparkCount={12}>
                <Button className="flex-1 gradient-primary border-0" onClick={returnToLobby}>
                  Play Again
                </Button>
              </ClickSpark>
            </div>
          </SpotlightCard>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background grid-bg-intense flex flex-col relative">
      <Noise opacity={0.025} />
      {/* Header with scores */}
      <div className="navbar sticky top-0 z-30 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          {/* Red Team Score */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: 'oklch(0.6 0.24 20 / 0.15)', border: '1px solid oklch(0.6 0.24 20 / 0.3)' }}>
              <Shield className="h-4 w-4 text-red-400" />
              <span className="text-red-400 font-bold text-xl">{gameData?.scores.red ?? 0}</span>
            </div>
          </div>

          {/* Timer */}
          <div className="relative">
            <svg width="56" height="56" className="timer-ring-svg">
              <circle cx="28" cy="28" r="24" fill="none" stroke="oklch(0.25 0.03 280)" strokeWidth="4" />
              <circle
                cx="28" cy="28" r="24" fill="none"
                stroke={timerColor}
                strokeWidth="4"
                strokeDasharray="150.8"
                strokeDashoffset={150.8 * (1 - timerPercent / 100)}
                className="timer-ring-circle"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">
              {timeLeft}
            </span>
          </div>

          {/* Blue Team Score */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: 'oklch(0.6 0.22 255 / 0.15)', border: '1px solid oklch(0.6 0.22 255 / 0.3)' }}>
              <span className="text-blue-400 font-bold text-xl">{gameData?.scores.blue ?? 0}</span>
              <Shield className="h-4 w-4 text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6">
        <div className="w-full max-w-2xl">

          {/* Face-off indicator */}
          {currentFaceoff && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-center justify-center gap-4"
            >
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'oklch(0.6 0.24 20 / 0.15)', border: '1px solid oklch(0.6 0.24 20 / 0.3)' }}>
                <Avatar size="sm"><AvatarFallback emoji="🧑‍💻" /></Avatar>
                <span className="text-sm font-semibold text-red-400">{currentFaceoff.redPlayer.username}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Swords className="h-4 w-4" />
                <span className="text-xs">vs</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'oklch(0.6 0.22 255 / 0.15)', border: '1px solid oklch(0.6 0.22 255 / 0.3)' }}>
                <span className="text-sm font-semibold text-blue-400">{currentFaceoff.bluePlayer.username}</span>
                <Avatar size="sm"><AvatarFallback emoji="🧑‍💻" /></Avatar>
              </div>
            </motion.div>
          )}

          {/* Question card */}
          {currentQuestion && (
            <motion.div
              key={currentQuestion._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="game-card p-6 mb-4"
            >
              {/* Meta */}
              <div className="flex items-center gap-2 mb-4">
                {currentQuestion.subject && (
                  <Badge variant="purple">{currentQuestion.subject}</Badge>
                )}
                {currentQuestion.difficulty && (
                  <Badge variant={currentQuestion.difficulty === 'Easy' ? 'success' : currentQuestion.difficulty === 'Medium' ? 'warning' : 'red'}>
                    {currentQuestion.difficulty}
                  </Badge>
                )}
                <Badge variant="outline" className="ml-auto">
                  Round {gameData?.currentRound || 1} / {gameData?.totalRounds || 5}
                </Badge>
              </div>

              {/* Question text */}
              <p className="text-lg font-medium text-foreground leading-relaxed mb-6">
                {currentQuestion.questionText}
              </p>

              {/* Answer options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentQuestion.options.map((opt, i) => {
                  const letter = OPTION_LABELS[i];
                  const isSelected = selectedAnswer === opt;
                  const isConfirmed = confirmedAnswer === opt;
                  const isCorrect = answerResult && opt === answerResult.correctAnswer;
                  const isWrong = answerResult && isConfirmed && !answerResult.correct;

                  return (
                    <motion.button
                      key={i}
                      whileHover={canAnswer ? { scale: 1.01 } : {}}
                      whileTap={canAnswer ? { scale: 0.99 } : {}}
                      className={cn(
                        "answer-option w-full",
                        isSelected && !confirmedAnswer && "selected",
                        isCorrect && "correct",
                        isWrong && "incorrect",
                        !canAnswer && !answerResult && "cursor-not-allowed opacity-70",
                      )}
                      onClick={() => canAnswer && selectAnswer(opt)}
                      disabled={!canAnswer}
                    >
                      <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                        style={{
                          background: isSelected ? 'oklch(0.93 0.21 103 / 0.2)' : 'oklch(0.1 0 0)',
                          color: isSelected ? 'oklch(0.93 0.21 103)' : 'oklch(0.6 0.01 270)',
                        }}>
                        {letter}
                      </span>
                      <span className="text-sm text-left">{opt}</span>
                      {isCorrect && <CheckCircle className="h-4 w-4 text-emerald-500 ml-auto" />}
                      {isWrong && <XCircle className="h-4 w-4 text-red-500 ml-auto" />}
                    </motion.button>
                  );
                })}
              </div>

              {/* Confirm button */}
              {canAnswer && selectedAnswer && !confirmedAnswer && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4"
                >
                  <Button
                    className="w-full gradient-primary border-0 gap-2"
                    onClick={confirmAnswer}
                  >
                    Lock in Answer <ChevronRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}

              {/* Result feedback */}
              <AnimatePresence>
                {answerResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={cn(
                      "mt-4 p-4 rounded-xl border",
                      answerResult.correct
                        ? "bg-emerald-500/10 border-emerald-500/30"
                        : "bg-red-500/10 border-red-500/30"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {answerResult.correct
                        ? <CheckCircle className="h-5 w-5 text-emerald-500" />
                        : <XCircle className="h-5 w-5 text-red-500" />}
                      <span className={cn("font-semibold", answerResult.correct ? "text-emerald-400" : "text-red-400")}>
                        {answerResult.correct ? `Correct! +${answerResult.pointsAwarded || 1} point` : 'Incorrect!'}
                      </span>
                    </div>
                    {!answerResult.correct && (
                      <p className="text-sm text-muted-foreground">
                        Correct: <span className="text-foreground font-medium">{answerResult.correctAnswer}</span>
                      </p>
                    )}
                    {answerResult.explanation && (
                      <p className="text-sm text-muted-foreground mt-1">{answerResult.explanation}</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Spectator / waiting notice */}
              {!isMyTurn() && !isSpectator() && (
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  Waiting for your faceoff...
                </div>
              )}
              {isSpectator() && (
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  👁️ You are spectating
                </div>
              )}
            </motion.div>
          )}

          {/* Waiting for question */}
          {!currentQuestion && gamePhase !== 'ended' && (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">
                {gamePhase === 'faceoff' ? 'Preparing next faceoff...' : 'Waiting for next question...'}
              </p>
            </div>
          )}
        </div>
      </div>

      <ChatWindow />
    </div>
  );
}

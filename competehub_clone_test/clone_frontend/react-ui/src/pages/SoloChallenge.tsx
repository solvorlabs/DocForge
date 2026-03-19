import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ChevronRight, BookOpen, Clock, SkipForward } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { gameApi } from '../lib/api';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger } from '../components/ui/select';
import { cn } from '../lib/utils';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];
const EXAM_TYPES = ['JEE', 'NEET', 'GATE', 'CAT'];
const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology'];

const mockQuestions = Array.from({ length: 10 }, (_, i) => ({
  _id: String(i),
  questionText: `Question ${i + 1}: ${['What is the derivative of sin(x)?', 'Calculate the speed of light in m/s.', 'What is Avogadro\'s number?', 'Find the roots of x² - 5x + 6 = 0'][i % 4]}`,
  options: [['cos(x)', '-cos(x)', 'sin(x)', 'tan(x)'], ['3×10⁸', '3×10⁶', '3×10¹⁰', '3×10⁴'], ['6.022×10²³', '6.022×10²⁶', '6.022×10²⁰', '6.022×10²²'], ['2,3', '1,4', '2,4', '1,3']][i % 4],
  correctAnswer: [['cos(x)', '3×10⁸', '6.022×10²³', '2,3']][0][i % 4],
  explanation: 'The derivative of sin(x) is cos(x) by standard trigonometric differentiation.',
  subject: SUBJECTS[i % 4],
  difficulty: (['Easy', 'Medium', 'Hard'] as const)[i % 3],
  examType: EXAM_TYPES[i % 4],
}));

export default function SoloChallenge() {
  const [started, setStarted] = useState(false);
  const [exam, setExam] = useState('JEE');
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState('All');
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState('');
  const [confirmed, setConfirmed] = useState('');
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [finished, setFinished] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const questions = mockQuestions;
  const current = questions[qIndex];
  const isAnswered = !!confirmed;
  const isCorrect = confirmed === current?.correctAnswer;

  const handleConfirm = () => {
    if (!selected) return;
    setConfirmed(selected);
    if (selected === current.correctAnswer) {
      setScore(s => s + 10);
      setCorrectCount(c => c + 1);
    }
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (qIndex + 1 >= questions.length) {
      setFinished(true);
    } else {
      setQIndex(q => q + 1);
      setSelected('');
      setConfirmed('');
      setShowExplanation(false);
    }
  };

  if (finished) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="game-card p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">{correctCount >= 7 ? '🏆' : correctCount >= 5 ? '⭐' : '💪'}</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Challenge Complete!</h2>
          <div className="text-5xl font-black gradient-text my-4">{score}</div>
          <p className="text-muted-foreground mb-6">{correctCount} / {questions.length} correct • {Math.round((correctCount / questions.length) * 100)}% accuracy</p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => { setStarted(false); setFinished(false); setQIndex(0); setScore(0); setCorrectCount(0); }}>
              Try Again
            </Button>
            <Button className="flex-1 gradient-primary border-0" onClick={() => { setQIndex(0); setStarted(true); setFinished(false); setScore(0); setCorrectCount(0); }}>
              New Round
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="min-h-screen p-4 md:p-6">
        <div className="max-w-lg mx-auto">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-1">Solo Challenge</h1>
            <p className="text-muted-foreground">Practice at your own pace</p>
          </motion.div>

          <div className="game-card p-6 space-y-4">
            <img src="/doodiesolo.png" alt="Solo" className="w-40 mx-auto animate-float doodle-img" />

            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">Exam Type</label>
              <Select value={exam} onValueChange={setExam}>
                <SelectTrigger />
                <SelectContent>
                  {EXAM_TYPES.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">Subject (optional)</label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger />
                <SelectContent>
                  <SelectItem value="">All Subjects</SelectItem>
                  {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {['Easy', 'Medium', 'Hard'].map(d => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={cn("py-2 rounded-lg text-sm border transition-all", difficulty === d ? "bg-primary/20 border-primary text-primary" : "border-border text-muted-foreground hover:border-primary/30")}
                >
                  {d}
                </button>
              ))}
            </div>

            <Button className="w-full gradient-primary border-0 gap-2 h-11" onClick={() => setStarted(true)}>
              <BookOpen className="h-4 w-4" /> Start Challenge
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">Question {qIndex + 1} / {questions.length}</span>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-emerald-400 font-semibold">{score} pts</span>
          </div>
        </div>
        <Progress value={((qIndex) / questions.length) * 100} className="mb-6 h-1.5" color="linear-gradient(90deg, oklch(0.56 0.28 292), oklch(0.58 0.24 255))" />

        {current && (
          <motion.div key={qIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="game-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant={current.difficulty === 'Easy' ? 'success' : current.difficulty === 'Medium' ? 'warning' : 'red'}>{current.difficulty}</Badge>
              <Badge variant="purple">{current.subject}</Badge>
              <Badge variant="outline">{current.examType}</Badge>
            </div>

            <p className="text-lg font-medium text-foreground leading-relaxed mb-6">{current.questionText}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {current.options.map((opt, i) => {
                const isRight = isAnswered && opt === current.correctAnswer;
                const isWrong = isAnswered && confirmed === opt && opt !== current.correctAnswer;
                return (
                  <button
                    key={i}
                    onClick={() => !isAnswered && setSelected(opt)}
                    className={cn(
                      "answer-option",
                      selected === opt && !isAnswered && "selected",
                      isRight && "correct",
                      isWrong && "incorrect",
                      isAnswered && "cursor-default",
                    )}
                  >
                    <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold bg-muted text-muted-foreground shrink-0">
                      {OPTION_LABELS[i]}
                    </span>
                    <span className="text-sm text-left">{opt}</span>
                    {isRight && <CheckCircle className="h-4 w-4 text-emerald-500 ml-auto" />}
                    {isWrong && <XCircle className="h-4 w-4 text-red-500 ml-auto" />}
                  </button>
                );
              })}
            </div>

            {!isAnswered && (
              <Button className="w-full gradient-primary border-0" onClick={handleConfirm} disabled={!selected}>
                Confirm Answer
              </Button>
            )}

            <AnimatePresence>
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className={cn("mt-4 p-4 rounded-xl border", isCorrect ? "bg-emerald-500/10 border-emerald-500/30" : "bg-red-500/10 border-red-500/30")}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {isCorrect ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                    <span className={cn("text-sm font-semibold", isCorrect ? "text-emerald-400" : "text-red-400")}>
                      {isCorrect ? 'Correct! +10 points' : `Wrong! Answer: ${current.correctAnswer}`}
                    </span>
                  </div>
                  {current.explanation && <p className="text-xs text-muted-foreground">{current.explanation}</p>}
                  <Button className="w-full mt-3 gradient-primary border-0 gap-2" onClick={handleNext}>
                    {qIndex + 1 >= questions.length ? 'See Results' : 'Next Question'}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}

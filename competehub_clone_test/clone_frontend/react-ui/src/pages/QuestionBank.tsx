import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, BookOpen, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { questionBankApi } from '../lib/api';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger } from '../components/ui/select';
import { Skeleton } from '../components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '../components/ui/dialog';
import { cn } from '../lib/utils';
import type { ExamQuestion } from '../types';

const EXAM_TYPES = ['All', 'JEE', 'NEET', 'GATE', 'CAT', 'UPSC'];
const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];

const mockQuestions: ExamQuestion[] = Array.from({ length: 20 }, (_, i) => ({
  _id: String(i),
  questionText: `Sample question ${i + 1}: What is the value of the integral of sin(x) from 0 to π?`,
  options: ['0', '2', '-2', 'π'],
  subject: ['Mathematics', 'Physics', 'Chemistry', 'Biology'][i % 4],
  topic: ['Integration', 'Kinematics', 'Organic', 'Cell Biology'][i % 4],
  difficulty: (['Easy', 'Medium', 'Hard'] as const)[i % 3],
  examType: ['JEE', 'NEET', 'GATE'][i % 3],
  year: 2020 + (i % 5),
}));

export default function QuestionBank() {
  const [search, setSearch] = useState('');
  const [examType, setExamType] = useState('All');
  const [difficulty, setDifficulty] = useState('All');
  const [subject, setSubject] = useState('');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState<ExamQuestion | null>(null);

  const questions = mockQuestions.filter(q => {
    if (search && !q.questionText.toLowerCase().includes(search.toLowerCase())) return false;
    if (examType !== 'All' && q.examType !== examType) return false;
    if (difficulty !== 'All' && q.difficulty !== difficulty) return false;
    if (subject && q.subject !== subject) return false;
    return true;
  });

  const diffColor: Record<string, Parameters<typeof Badge>[0]['variant']> = {
    Easy: 'success', Medium: 'warning', Hard: 'red',
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <BookOpen className="h-5 w-5 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Question Bank</h1>
          </div>
          <p className="text-muted-foreground">10,000+ curated exam questions</p>
        </motion.div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="game-card mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-foreground"
          >
            <span className="flex items-center gap-2"><Filter className="h-4 w-4 text-muted-foreground" /> Filters</span>
            {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showFilters && (
            <div className="px-4 pb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Exam Type */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Exam</label>
                <div className="flex flex-wrap gap-1">
                  {EXAM_TYPES.map((e) => (
                    <button
                      key={e}
                      onClick={() => setExamType(e)}
                      className={cn("px-2 py-0.5 rounded-full text-xs border transition-all", examType === e ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/30")}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Difficulty</label>
                <div className="flex flex-wrap gap-1">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={cn("px-2 py-0.5 rounded-full text-xs border transition-all", difficulty === d ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/30")}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground mb-4">{questions.length} questions found</p>

        {/* Questions list */}
        <div className="space-y-3">
          {questions.map((q, i) => (
            <motion.div
              key={q._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="game-card p-4 cursor-pointer hover:border-primary/30"
              onClick={() => setSelectedQuestion(q)}
            >
              <div className="flex items-start gap-3">
                <span className="text-sm text-muted-foreground font-mono w-6 shrink-0 pt-0.5">Q{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-relaxed line-clamp-2">{q.questionText}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge variant="outline">{q.examType}</Badge>
                    {q.difficulty && <Badge variant={diffColor[q.difficulty]}>{q.difficulty}</Badge>}
                    <span className="text-xs text-muted-foreground">{q.subject}</span>
                    {q.year && <span className="text-xs text-muted-foreground">• {q.year}</span>}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Question detail dialog */}
        <Dialog open={!!selectedQuestion} onOpenChange={(o) => !o && setSelectedQuestion(null)}>
          {selectedQuestion && (
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Question Details</DialogTitle>
                <DialogClose onClose={() => setSelectedQuestion(null)} />
              </DialogHeader>
              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline">{selectedQuestion.examType}</Badge>
                  {selectedQuestion.difficulty && <Badge variant={diffColor[selectedQuestion.difficulty]}>{selectedQuestion.difficulty}</Badge>}
                  <Badge variant="purple">{selectedQuestion.subject}</Badge>
                </div>
                <p className="text-foreground leading-relaxed mb-6">{selectedQuestion.questionText}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedQuestion.options.map((opt, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted border border-border"
                    >
                      <span className="w-6 h-6 rounded-md bg-background flex items-center justify-center text-xs font-bold text-muted-foreground">
                        {['A','B','C','D'][i]}
                      </span>
                      <span className="text-sm text-foreground">{opt}</span>
                    </div>
                  ))}
                </div>
                {selectedQuestion.solution && (
                  <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-xs font-semibold text-emerald-400 mb-1">Solution</p>
                    <p className="text-sm text-foreground">{selectedQuestion.solution}</p>
                  </div>
                )}
              </div>
            </DialogContent>
          )}
        </Dialog>
      </div>
    </div>
  );
}

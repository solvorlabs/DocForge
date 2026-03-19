import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, Star, Calendar, ArrowRight, Users } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

const posts = [
  {
    id: 'hackwithmait',
    title: 'HackWithMait 2024 — Winners Announced! 🏆',
    excerpt: 'Congratulations to all the brilliant minds who participated in HackWithMait 2024. Check out the winning projects!',
    author: 'CompeteHub Team',
    date: '2024-12-15',
    tags: ['Event', 'Hackathon'],
    emoji: '🏆',
    route: '/community/hackwithMait-winners-2024',
  },
  {
    id: 'welcome',
    title: 'Welcome to CompeteHub Community! 👋',
    excerpt: 'Everything you need to know to get started, make friends, and climb the leaderboard.',
    author: 'CompeteHub Team',
    date: '2024-11-01',
    tags: ['Guide', 'Welcome'],
    emoji: '👋',
    route: '/community/welcome-community',
  },
  {
    id: 'ranking',
    title: 'Ranking Strategies: From Bronze to Grandmaster',
    excerpt: 'Expert tips and strategies to help you climb through the competitive ranks faster.',
    author: 'Pro Player Guide',
    date: '2024-10-20',
    tags: ['Strategy', 'Ranked'],
    emoji: '📈',
    route: '/community/ranking-strategies-guide',
  },
];

export default function Community() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <Users className="h-5 w-5 text-emerald-400" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Community</h1>
          </div>
          <p className="text-muted-foreground">News, guides, and stories from the CompeteHub community</p>
        </motion.div>

        {/* Featured */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="game-card p-6 mb-6 relative overflow-hidden cursor-pointer"
          onClick={() => navigate(posts[0].route)}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 to-orange-500" />
          <Badge variant="gold" className="mb-3">Featured</Badge>
          <div className="flex gap-4">
            <span className="text-5xl">{posts[0].emoji}</span>
            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">{posts[0].title}</h2>
              <p className="text-muted-foreground text-sm mb-3">{posts[0].excerpt}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{posts[0].author}</span>
                <span>•</span>
                <span>{new Date(posts[0].date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Posts list */}
        <div className="space-y-4">
          {posts.slice(1).map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="game-card p-5 cursor-pointer hover:border-primary/30"
              onClick={() => navigate(post.route)}
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl">{post.emoji}</span>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground mb-1">{post.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{post.excerpt}</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex gap-1.5">
                      {post.tags.map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}
                    </div>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(post.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Join CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center p-8 rounded-2xl"
          style={{ background: 'linear-gradient(135deg, oklch(0.56 0.28 292 / 0.1), oklch(0.58 0.24 255 / 0.1))', border: '1px solid oklch(0.35 0.04 280 / 0.4)' }}
        >
          <MessageSquare className="h-10 w-10 text-primary mx-auto mb-3" />
          <h3 className="text-xl font-bold text-foreground mb-2">Join the Conversation</h3>
          <p className="text-muted-foreground mb-4">Connect with thousands of students on our Discord community</p>
          <Button className="gradient-primary border-0 gap-2">
            Join Discord <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background grid-bg flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <img src="/doodie.png" alt="Not Found" className="w-48 mx-auto mb-6 animate-float doodle-img" />
        <h1 className="text-6xl font-black gradient-text mb-4">404</h1>
        <h2 className="text-2xl font-bold text-foreground mb-3">Page Not Found</h2>
        <p className="text-muted-foreground mb-8">
          This page doesn't exist or has been moved. Let's get you back to the arena!
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Go Back
          </Button>
          <Button onClick={() => navigate('/arena')} className="gradient-primary border-0 gap-2">
            <Home className="h-4 w-4" /> Arena
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { useGame } from '../../contexts/GameContext';
import { cn } from '../../lib/utils';

export default function ChatWindow() {
  const { chatMessages, sendMessage, chatVisible, setChatVisible, username } = useGame();
  const [message, setMessage] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessage(message.trim());
    setMessage('');
  };

  return (
    <>
      {/* Toggle button */}
      {!chatVisible && (
        <button
          onClick={() => setChatVisible(true)}
          className="fixed bottom-6 right-6 z-30 flex items-center justify-center w-12 h-12 rounded-full gradient-primary text-white shadow-lg glow-primary"
        >
          <MessageSquare className="h-5 w-5" />
          {chatMessages.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
              {Math.min(chatMessages.length, 9)}
            </span>
          )}
        </button>
      )}

      {/* Chat panel */}
      <AnimatePresence>
        {chatVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-30 w-80 rounded-2xl glass-strong border border-border shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Game Chat</span>
              </div>
              <button onClick={() => setChatVisible(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <ScrollArea className="p-3 space-y-2" maxHeight="300px">
              {chatMessages.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No messages yet</p>
              ) : (
                chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex flex-col",
                      msg.username === username ? "items-end" : "items-start"
                    )}
                  >
                    <span className="text-xs text-muted-foreground mb-0.5">{msg.username}</span>
                    <div
                      className={cn(
                        "max-w-[80%] rounded-xl px-3 py-1.5 text-sm",
                        msg.username === username
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      )}
                    >
                      {msg.message}
                    </div>
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </ScrollArea>

            {/* Input */}
            <div className="p-3 border-t border-border flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                placeholder="Type a message..."
                className="text-sm"
              />
              <Button size="icon" className="gradient-primary border-0 shrink-0" onClick={handleSend}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

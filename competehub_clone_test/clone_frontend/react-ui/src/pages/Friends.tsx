import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, UserPlus, Check, X, Sword } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '../contexts/UserContext';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import type { Friend } from '../types';

export default function Friends() {
  const { friends, friendRequests, getFriends, sendFriendRequest, acceptFriendRequest, declineFriendRequest, removeFriend, searchUsers } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    getFriends().catch(() => {});
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const results = await searchUsers(searchQuery) as Friend[];
      setSearchResults(results);
    } catch {
      toast.error('Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendRequest = async (username: string) => {
    try {
      await sendFriendRequest(username);
      toast.success(`Friend request sent to ${username}!`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Users className="h-5 w-5 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Friends</h1>
          </div>
          <p className="text-muted-foreground">Connect and compete with friends</p>
        </motion.div>

        {/* Search */}
        <div className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} disabled={isSearching} className="gradient-primary border-0">
            {isSearching ? '...' : 'Search'}
          </Button>
        </div>

        {/* Search results */}
        {searchResults.length > 0 && (
          <div className="game-card p-4 mb-6">
            <p className="text-xs text-muted-foreground mb-3">Search Results</p>
            <div className="space-y-2">
              {searchResults.map((u) => (
                <div key={u._id} className="flex items-center gap-3">
                  <Avatar><AvatarFallback emoji={u.avatar || '🧑‍💻'} /></Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{u.username}</p>
                    <p className="text-xs text-muted-foreground">Level {u.level || 1}</p>
                  </div>
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => handleSendRequest(u.username)}>
                    <UserPlus className="h-3.5 w-3.5" /> Add
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <Tabs defaultValue="friends">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="friends" className="flex-1">
              Friends <Badge variant="outline" className="ml-2">{friends.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex-1">
              Requests
              {friendRequests.length > 0 && <Badge variant="purple" className="ml-2">{friendRequests.length}</Badge>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends">
            {friends.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No friends yet. Search for players above!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {friends.map((f) => (
                  <motion.div
                    key={f._id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="game-card p-4 flex items-center gap-3"
                  >
                    <div className="relative">
                      <Avatar><AvatarFallback emoji={f.avatar || '🧑‍💻'} /></Avatar>
                      {f.online && <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{f.username}</p>
                      <p className="text-xs text-muted-foreground">{f.online ? 'Online' : 'Offline'} • Level {f.level || 1}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="gap-1 border-violet-500/30 text-violet-400">
                        <Sword className="h-3.5 w-3.5" /> Challenge
                      </Button>
                      <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => removeFriend(f._id)}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="requests">
            {friendRequests.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No pending friend requests</p>
              </div>
            ) : (
              <div className="space-y-2">
                {friendRequests.map((req) => (
                  <div key={req._id} className="game-card p-4 flex items-center gap-3">
                    <Avatar><AvatarFallback emoji="🧑‍💻" /></Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{req.from.username}</p>
                      <p className="text-xs text-muted-foreground">Wants to be your friend</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="gap-1 bg-emerald-600 text-white border-0 hover:bg-emerald-700" onClick={() => acceptFriendRequest(req.from._id)}>
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1 border-red-500/30 text-red-400" onClick={() => declineFriendRequest(req.from._id)}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import { Bell, User, Moon, Sun, Search, LogOut, X } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export function TopNavbar() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { announcements } = useAnnouncements();
  const navigate = useNavigate();
  const displayName = user?.email?.split('@')[0] || 'Student';

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const recentAnnouncements = announcements.slice(0, 5);

  const searchPages = [
    { name: 'Dashboard', path: '/' },
    { name: 'Assignments', path: '/assignments' },
    { name: 'Notes', path: '/notes' },
    { name: 'Timetable', path: '/timetable' },
    { name: 'Announcements', path: '/announcements' },
    { name: 'Lost & Found', path: '/lost-found' },
    { name: 'Chat', path: '/chat' },
  ];

  const filteredPages = searchQuery
    ? searchPages.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <header className="glass-strong sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/50 px-4 md:px-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <div className="hidden sm:block">
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          <p className="text-sm font-semibold text-foreground capitalize">{displayName}</p>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        {/* Search */}
        <div className="relative">
          <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setShowSearch(!showSearch)}>
            {showSearch ? <X className="h-5 w-5 text-muted-foreground" /> : <Search className="h-5 w-5 text-muted-foreground" />}
          </Button>
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 top-12 w-64 sm:w-80 glass rounded-2xl p-3 shadow-glow z-50"
              >
                <Input
                  autoFocus
                  placeholder="Search pages..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="rounded-xl bg-muted/50 border-border/50"
                />
                {filteredPages.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {filteredPages.map(p => (
                      <button
                        key={p.path}
                        onClick={() => { navigate(p.path); setShowSearch(false); setSearchQuery(''); }}
                        className="w-full text-left px-3 py-2 rounded-xl text-sm text-foreground hover:bg-primary/10 transition-colors"
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dark mode */}
        <Button variant="ghost" size="icon" className="rounded-xl" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun className="h-5 w-5 text-warning" /> : <Moon className="h-5 w-5 text-muted-foreground" />}
        </Button>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <Button variant="ghost" size="icon" className="relative rounded-xl" onClick={() => setShowNotifications(!showNotifications)}>
            <Bell className="h-5 w-5 text-muted-foreground" />
            {recentAnnouncements.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full gradient-primary border-2 border-background" />
            )}
          </Button>
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 top-12 w-72 sm:w-80 glass rounded-2xl p-4 shadow-glow z-50"
              >
                <h4 className="text-sm font-semibold text-foreground mb-3">Notifications</h4>
                {recentAnnouncements.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No new notifications</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {recentAnnouncements.map(a => (
                      <div key={a.id} className="rounded-xl bg-muted/50 p-3">
                        <p className="text-sm font-medium text-foreground line-clamp-1">{a.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{a.content}</p>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => { navigate('/announcements'); setShowNotifications(false); }}
                  className="mt-3 w-full text-center text-xs font-semibold text-primary hover:underline"
                >
                  View all announcements
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setShowProfile(!showProfile)}>
            <div className="gradient-primary rounded-full p-1.5">
              <User className="h-4 w-4 text-primary-foreground" />
            </div>
          </Button>
          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 top-12 w-64 glass rounded-2xl p-4 shadow-glow z-50"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="gradient-primary rounded-full p-2.5">
                    <User className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground capitalize truncate">{displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => { signOut(); setShowProfile(false); }}
                  className="w-full justify-start gap-2 text-destructive hover:text-destructive rounded-xl"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

import { Bell, User } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export function TopNavbar() {
  const { user } = useAuth();
  const displayName = user?.email?.split('@')[0] || 'Student';

  return (
    <header className="glass-strong sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/50 px-4 md:px-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <div className="hidden sm:block">
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          <p className="text-sm font-semibold text-foreground capitalize">{displayName}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative rounded-xl">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full gradient-primary border-2 border-background" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-xl">
          <div className="gradient-primary rounded-full p-1.5">
            <User className="h-4 w-4 text-primary-foreground" />
          </div>
        </Button>
      </div>
    </header>
  );
}

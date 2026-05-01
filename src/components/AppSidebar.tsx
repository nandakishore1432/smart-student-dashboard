import {
  LayoutDashboard, BookOpen, FileText, Calendar,
  Megaphone, Search, LogOut, GraduationCap, ShieldCheck, MessageCircle,
  Lightbulb, Users
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarFooter, useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { prefetchRoute, pathToKey } from '@/routes/registry';

const navItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Assignments', url: '/assignments', icon: BookOpen },
  { title: 'Notes', url: '/notes', icon: FileText },
  { title: 'Timetable', url: '/timetable', icon: Calendar },
  { title: 'Announcements', url: '/announcements', icon: Megaphone },
  { title: 'Lost & Found', url: '/lost-found', icon: Search },
  { title: 'Chat', url: '/chat', icon: MessageCircle },
  { title: 'Tutorials', url: '/tutorials', icon: Lightbulb },
  { title: 'Skill Exchange', url: '/skill-exchange', icon: Users },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { signOut } = useAuth();
  const { isAdmin } = useIsAdmin();

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarContent className="glass-strong">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-6">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 12, scale: 1.1 }}
                className="gradient-primary rounded-xl p-2 shadow-glow"
              >
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </motion.div>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-lg font-extrabold gradient-text tracking-tight"
                >
                  Smart Hub
                </motion.span>
              )}
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              {navItems.map((item, index) => {
                const key = pathToKey[item.url];
                const prefetch = () => key && prefetchRoute(key);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === '/'}
                        onMouseEnter={prefetch}
                        onFocus={prefetch}
                        onTouchStart={prefetch}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-muted-foreground transition-all duration-200 hover:bg-primary/10 hover:text-primary group"
                        activeClassName="bg-primary/10 text-primary font-semibold shadow-sm border-gradient"
                      >
                        <item.icon className="h-5 w-5 shrink-0 group-hover:scale-110 transition-transform" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              {/* Admin Link */}
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/admin"
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-warning transition-all duration-200 hover:bg-warning/10 hover:text-warning group"
                      activeClassName="bg-warning/10 text-warning font-semibold shadow-sm"
                    >
                      <ShieldCheck className="h-5 w-5 shrink-0 group-hover:scale-110 transition-transform" />
                      {!collapsed && <span>Admin Panel</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="glass-strong p-3">
        <Button
          variant="ghost"
          onClick={signOut}
          className="w-full justify-start gap-3 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

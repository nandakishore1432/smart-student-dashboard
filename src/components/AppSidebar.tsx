import {
  LayoutDashboard, BookOpen, FileText, Calendar,
  Megaphone, Search, LogOut, GraduationCap
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarFooter, useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

const navItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Assignments', url: '/assignments', icon: BookOpen },
  { title: 'Notes', url: '/notes', icon: FileText },
  { title: 'Timetable', url: '/timetable', icon: Calendar },
  { title: 'Announcements', url: '/announcements', icon: Megaphone },
  { title: 'Lost & Found', url: '/lost-found', icon: Search },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { signOut } = useAuth();

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarContent className="glass-strong">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-6">
            <div className="flex items-center gap-3">
              <div className="gradient-primary rounded-xl p-2">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              {!collapsed && (
                <span className="text-lg font-bold gradient-text">Smart Hub</span>
              )}
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/'}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-muted-foreground transition-all duration-200 hover:bg-primary/10 hover:text-primary"
                      activeClassName="bg-primary/10 text-primary font-semibold shadow-sm"
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="glass-strong p-3">
        <Button variant="ghost" onClick={signOut} className="w-full justify-start gap-3 rounded-xl text-muted-foreground hover:text-destructive">
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

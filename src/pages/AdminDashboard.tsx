import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { GlassCard } from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Users, Megaphone, Shield, BarChart3,
  Plus, Trash2, X, UserPlus, Crown
} from 'lucide-react';
import { StatCard } from '@/components/StatCard';

type Tab = 'overview' | 'users' | 'announcements' | 'roles';

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('overview');
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profiles = [] } = useQuery({
    queryKey: ['admin-profiles'],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: async () => {
      const { data } = await supabase.from('user_roles').select('*');
      return data || [];
    },
  });

  const { data: announcements = [] } = useQuery({
    queryKey: ['admin-announcements'],
    queryFn: async () => {
      const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'users', label: 'Users', icon: Users },
    { key: 'announcements', label: 'Announcements', icon: Megaphone },
    { key: 'roles', label: 'Roles', icon: Shield },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm">Manage users, content, and settings</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(t => (
          <Button
            key={t.key}
            variant={tab === t.key ? 'default' : 'glass'}
            onClick={() => setTab(t.key)}
            className="rounded-xl gap-2 shrink-0"
            size="sm"
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </Button>
        ))}
      </div>

      {tab === 'overview' && <OverviewTab profiles={profiles} announcements={announcements} roles={roles} />}
      {tab === 'users' && <UsersTab profiles={profiles} roles={roles} />}
      {tab === 'announcements' && <AnnouncementsTab announcements={announcements} userId={user?.id} />}
      {tab === 'roles' && <RolesTab profiles={profiles} roles={roles} />}
    </div>
  );
}

function OverviewTab({ profiles, announcements, roles }: any) {
  const adminCount = roles.filter((r: any) => r.role === 'admin').length;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Total Users" value={profiles.length} icon={Users} color="primary" delay={0.1} />
      <StatCard title="Announcements" value={announcements.length} icon={Megaphone} color="accent" delay={0.2} />
      <StatCard title="Admins" value={adminCount} icon={Shield} color="warning" delay={0.3} />
      <StatCard title="Active Today" value={profiles.length} icon={BarChart3} color="success" delay={0.4} />
    </div>
  );
}

function UsersTab({ profiles, roles }: any) {
  const getRoles = (userId: string) =>
    roles.filter((r: any) => r.user_id === userId).map((r: any) => r.role);

  return (
    <div className="space-y-3">
      {profiles.map((p: any, i: number) => (
        <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
          <GlassCard hover={false} className="flex items-center gap-4 p-4">
            <div className="gradient-primary rounded-full p-2.5 shrink-0">
              <Users className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{p.display_name || 'Unknown'}</p>
              <p className="text-xs text-muted-foreground truncate">{p.email}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              {getRoles(p.user_id).map((role: string) => (
                <span key={role} className="text-xs font-medium px-2 py-0.5 rounded-md bg-warning/10 text-warning capitalize">
                  {role}
                </span>
              ))}
              {getRoles(p.user_id).length === 0 && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground">student</span>
              )}
            </div>
          </GlassCard>
        </motion.div>
      ))}
      {profiles.length === 0 && (
        <GlassCard hover={false} className="text-center py-8 text-muted-foreground">No users yet</GlassCard>
      )}
    </div>
  );
}

function AnnouncementsTab({ announcements, userId }: { announcements: any[]; userId?: string }) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('low');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('announcements').insert({
        title, content, priority, created_by: userId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      setTitle(''); setContent(''); setPriority('low'); setShowForm(false);
      toast({ title: 'Announcement created!' });
    },
    onError: (e: any) => toast({ title: e.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('announcements').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      toast({ title: 'Announcement deleted' });
    },
    onError: (e: any) => toast({ title: e.message, variant: 'destructive' }),
  });

  return (
    <div className="space-y-4">
      <Button variant="gradient" onClick={() => setShowForm(!showForm)} className="rounded-xl gap-2">
        <Plus className="h-4 w-4" /> New Announcement
      </Button>

      {showForm && (
        <GlassCard hover={false} className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-foreground">Create Announcement</h3>
            <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></Button>
          </div>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="rounded-xl bg-muted/50" />
          <Textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Content..." className="rounded-xl bg-muted/50" />
          <div className="flex gap-2">
            {(['low', 'medium', 'high'] as const).map(p => (
              <Button key={p} variant={priority === p ? 'default' : 'glass'} size="sm" onClick={() => setPriority(p)} className="rounded-xl capitalize">{p}</Button>
            ))}
          </div>
          <Button variant="gradient" onClick={() => createMutation.mutate()} disabled={!title.trim() || !content.trim()} className="rounded-xl">Publish</Button>
        </GlassCard>
      )}

      {announcements.map((a: any, i: number) => (
        <motion.div key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
          <GlassCard hover={false} className="flex items-start gap-3 p-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground">{a.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${a.priority === 'high' ? 'bg-destructive/10 text-destructive' : a.priority === 'medium' ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'}`}>
                  {a.priority}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{a.content}</p>
              <p className="text-xs text-muted-foreground mt-1">{new Date(a.created_at).toLocaleDateString()}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(a.id)} className="shrink-0 text-muted-foreground hover:text-destructive rounded-xl">
              <Trash2 className="h-4 w-4" />
            </Button>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );
}

function RolesTab({ profiles, roles }: any) {
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'moderator' | 'user'>('admin');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const assignMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('user_roles').insert({
        user_id: selectedUser, role: selectedRole,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      setSelectedUser('');
      toast({ title: 'Role assigned!' });
    },
    onError: (e: any) => toast({ title: e.message, variant: 'destructive' }),
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('user_roles').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      toast({ title: 'Role removed' });
    },
    onError: (e: any) => toast({ title: e.message, variant: 'destructive' }),
  });

  const getProfile = (userId: string) => profiles.find((p: any) => p.user_id === userId);

  return (
    <div className="space-y-4">
      <GlassCard hover={false} className="space-y-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2"><UserPlus className="h-5 w-5" /> Assign Role</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select
            value={selectedUser}
            onChange={e => setSelectedUser(e.target.value)}
            className="rounded-xl bg-muted/50 border border-border px-3 py-2 text-sm text-foreground"
          >
            <option value="">Select user...</option>
            {profiles.map((p: any) => (
              <option key={p.user_id} value={p.user_id}>{p.display_name || p.email}</option>
            ))}
          </select>
          <select
            value={selectedRole}
            onChange={e => setSelectedRole(e.target.value as any)}
            className="rounded-xl bg-muted/50 border border-border px-3 py-2 text-sm text-foreground"
          >
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
            <option value="user">User</option>
          </select>
          <Button variant="gradient" onClick={() => assignMutation.mutate()} disabled={!selectedUser} className="rounded-xl">
            Assign
          </Button>
        </div>
      </GlassCard>

      <h3 className="font-semibold text-foreground">Current Role Assignments</h3>
      <div className="space-y-3">
        {roles.map((r: any, i: number) => {
          const profile = getProfile(r.user_id);
          return (
            <motion.div key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
              <GlassCard hover={false} className="flex items-center gap-4 p-4">
                <Crown className="h-5 w-5 text-warning shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{profile?.display_name || profile?.email || r.user_id}</p>
                  <p className="text-xs text-muted-foreground">{profile?.email}</p>
                </div>
                <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-warning/10 text-warning capitalize shrink-0">{r.role}</span>
                <Button variant="ghost" size="icon" onClick={() => removeMutation.mutate(r.id)} className="shrink-0 text-muted-foreground hover:text-destructive rounded-xl">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </GlassCard>
            </motion.div>
          );
        })}
        {roles.length === 0 && (
          <GlassCard hover={false} className="text-center py-8 text-muted-foreground">No roles assigned yet</GlassCard>
        )}
      </div>
    </div>
  );
}

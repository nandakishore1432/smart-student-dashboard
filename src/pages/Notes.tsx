import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FileText, Trash2, X, Upload, Download, Loader2 } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { SkeletonCard } from '@/components/SkeletonCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useNotes } from '@/hooks/useNotes';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const colors = [
  'from-primary/20 to-primary/5',
  'from-accent/20 to-accent/5',
  'from-success/20 to-success/5',
  'from-warning/20 to-warning/5',
  'from-info/20 to-info/5',
];

export default function Notes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { notes, isLoading, add, remove, isAdding } = useNotes();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleAdd = async () => {
    if (!title.trim() || !content.trim()) return;

    let fileUrl: string | null = null;
    let fileName: string | null = null;

    if (file && user) {
      setUploading(true);
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('note-files').upload(path, file);
      if (error) {
        toast({ title: 'File upload failed', description: error.message, variant: 'destructive' });
        setUploading(false);
        return;
      }
      fileUrl = path; // Store the path, not a public URL (bucket is now private)
      fileName = file.name;
      setUploading(false);
    }

    await add({ title: title.trim(), content: content.trim(), subject: subject.trim() || 'General', file_url: fileUrl, file_name: fileName });
    setTitle(''); setContent(''); setSubject(''); setFile(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Notes</h1>
          <p className="text-muted-foreground text-sm">{notes.length} notes saved</p>
        </div>
        <Button variant="gradient" onClick={() => setShowForm(!showForm)} className="rounded-xl gap-2">
          <Plus className="h-4 w-4" /> New Note
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <GlassCard hover={false} className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-foreground">New Note</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Note title" className="rounded-xl bg-muted/50" />
                <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" className="rounded-xl bg-muted/50" />
              </div>
              <Textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Write your notes..." className="rounded-xl bg-muted/50 min-h-[120px]" />

              {/* File Upload */}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/50 border border-border/50 cursor-pointer hover:bg-muted transition-colors text-sm text-muted-foreground">
                  <Upload className="h-4 w-4" />
                  {file ? file.name : 'Attach file'}
                  <input type="file" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
                </label>
                {file && (
                  <Button variant="ghost" size="sm" onClick={() => setFile(null)} className="text-xs text-muted-foreground">
                    Remove
                  </Button>
                )}
              </div>

              <Button variant="gradient" onClick={handleAdd} disabled={isAdding || uploading || !title.trim() || !content.trim()} className="rounded-xl">
                {(isAdding || uploading) ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Note'}
              </Button>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} lines={4} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note, i) => (
            <motion.div key={note.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <GlassCard className={`space-y-3 bg-gradient-to-br ${colors[i % colors.length]}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md">{note.subject}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => remove(note.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <h3 className="font-semibold text-foreground">{note.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-3">{note.content}</p>
                {note.file_url && (
                  <button
                    onClick={async () => {
                      const { data, error } = await supabase.storage.from('note-files').createSignedUrl(note.file_url!, 60);
                      if (data?.signedUrl) window.open(data.signedUrl, '_blank');
                      else toast({ title: 'Could not generate download link', variant: 'destructive' });
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                  >
                    <Download className="h-3.5 w-3.5" />
                    {note.file_name || 'Download file'}
                  </button>
                )}
                <p className="text-xs text-muted-foreground">{new Date(note.created_at).toLocaleDateString()}</p>
              </GlassCard>
            </motion.div>
          ))}
          {notes.length === 0 && (
            <GlassCard hover={false} className="col-span-full text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">No notes yet. Create your first one!</p>
            </GlassCard>
          )}
        </div>
      )}
    </div>
  );
}

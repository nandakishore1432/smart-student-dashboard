import { motion } from 'framer-motion';
import { Megaphone, Clock } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';

const announcements = [
  { id: 1, title: 'Mid-Term Exam Schedule Released', content: 'The mid-term examination schedule has been published. Please check the notice board for your exam timings and venues. Make sure to carry your student ID.', time: '2 hours ago', priority: 'high' as const },
  { id: 2, title: 'Library Extended Hours', content: 'The library will remain open until 10 PM during the exam period. Additional study rooms have been made available on the 3rd floor.', time: '5 hours ago', priority: 'medium' as const },
  { id: 3, title: 'New Course Materials Available', content: 'Updated study materials for Physics and Mathematics have been uploaded to the portal. Please download them before the next class.', time: '1 day ago', priority: 'low' as const },
  { id: 4, title: 'Sports Day Registration Open', content: 'Registration for the annual sports day is now open. Interested students can sign up at the sports office or through the student portal.', time: '2 days ago', priority: 'low' as const },
  { id: 5, title: 'Guest Lecture: AI in Education', content: 'A guest lecture on "AI in Modern Education" will be held this Friday at 3 PM in the auditorium. All students are welcome.', time: '3 days ago', priority: 'medium' as const },
];

const priorityStyles = {
  high: 'border-l-destructive bg-destructive/5',
  medium: 'border-l-warning bg-warning/5',
  low: 'border-l-primary bg-primary/5',
};

export default function Announcements() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Announcements</h1>
        <p className="text-muted-foreground text-sm">Latest updates and notices</p>
      </div>

      <div className="space-y-4">
        {announcements.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <GlassCard hover={false} className={`border-l-4 ${priorityStyles[a.priority]}`}>
              <div className="flex items-start gap-3">
                <div className="gradient-primary rounded-xl p-2 shrink-0 mt-0.5">
                  <Megaphone className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="space-y-2 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-foreground">{a.title}</h3>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                      <Clock className="h-3 w-3" /> {a.time}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{a.content}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

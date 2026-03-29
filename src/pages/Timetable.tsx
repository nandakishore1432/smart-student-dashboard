import { motion } from 'framer-motion';
import { GlassCard } from '@/components/GlassCard';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const times = ['9:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'];

const subjects: Record<string, { name: string; color: string }> = {
  math: { name: 'Mathematics', color: 'bg-primary/20 text-primary border-primary/30' },
  physics: { name: 'Physics', color: 'bg-accent/20 text-accent border-accent/30' },
  english: { name: 'English', color: 'bg-success/20 text-success border-success/30' },
  cs: { name: 'Comp. Sci', color: 'bg-info/20 text-info border-info/30' },
  chem: { name: 'Chemistry', color: 'bg-warning/20 text-warning border-warning/30' },
};

const schedule: Record<string, Record<string, string>> = {
  Monday: { '9:00': 'math', '10:00': 'physics', '11:00': 'english', '14:00': 'cs' },
  Tuesday: { '9:00': 'chem', '10:00': 'math', '11:00': 'cs', '15:00': 'physics' },
  Wednesday: { '9:00': 'english', '10:00': 'chem', '14:00': 'math', '16:00': 'cs' },
  Thursday: { '9:00': 'physics', '10:00': 'english', '11:00': 'math', '14:00': 'chem' },
  Friday: { '9:00': 'cs', '10:00': 'math', '11:00': 'physics', '14:00': 'english' },
};

export default function Timetable() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Timetable</h1>
        <p className="text-muted-foreground text-sm">Weekly class schedule</p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {Object.values(subjects).map(s => (
          <span key={s.name} className={`text-xs font-medium px-3 py-1.5 rounded-lg border ${s.color}`}>
            {s.name}
          </span>
        ))}
      </div>

      {/* Desktop Grid */}
      <GlassCard hover={false} className="hidden md:block overflow-x-auto">
        <div className="grid grid-cols-6 gap-px min-w-[700px]">
          <div className="p-3 font-semibold text-sm text-muted-foreground">Time</div>
          {days.map(d => (
            <div key={d} className="p-3 font-semibold text-sm text-foreground text-center">{d}</div>
          ))}
          {times.map(t => (
            <>
              <div key={`t-${t}`} className="p-3 text-sm text-muted-foreground font-medium border-t border-border/50">{t}</div>
              {days.map(d => {
                const sub = schedule[d]?.[t];
                const info = sub ? subjects[sub] : null;
                return (
                  <div key={`${d}-${t}`} className="p-2 border-t border-border/50">
                    {info && (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className={`rounded-xl border px-3 py-2 text-xs font-semibold text-center ${info.color}`}
                      >
                        {info.name}
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </GlassCard>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {days.map((day, di) => (
          <GlassCard key={day} delay={di * 0.1} hover={false}>
            <h3 className="font-semibold text-foreground mb-3">{day}</h3>
            <div className="space-y-2">
              {times.filter(t => schedule[day]?.[t]).map(t => {
                const info = subjects[schedule[day][t]];
                return (
                  <div key={t} className={`flex items-center gap-3 rounded-xl border px-3 py-2 ${info.color}`}>
                    <span className="text-xs font-mono">{t}</span>
                    <span className="text-sm font-semibold">{info.name}</span>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

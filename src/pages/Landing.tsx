import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  Bell,
  Calendar,
  MessageSquare,
  Search,
  Users,
  Brain,
  ArrowRight,
  Star,
  Zap,
  Shield,
} from 'lucide-react';

function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute w-[700px] h-[700px] rounded-full opacity-25 blur-[140px]"
        style={{ background: 'var(--gradient-primary)', top: '-15%', left: '-10%' }}
        animate={{ x: [0, 40, -20, 0], y: [0, -30, 15, 0], scale: [1, 1.15, 0.95, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-[140px]"
        style={{ background: 'var(--gradient-accent)', bottom: '-15%', right: '-10%' }}
        animate={{ x: [0, -30, 40, 0], y: [0, 25, -15, 0], scale: [1, 0.95, 1.1, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full opacity-15 blur-[120px]"
        style={{ background: 'var(--gradient-neon)', top: '40%', left: '50%', marginLeft: '-200px' }}
        animate={{ scale: [0.8, 1.3, 0.8], rotate: [0, 180, 360] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

const features = [
  { icon: BookOpen, title: 'Smart Assignments', desc: 'Track, prioritize, and never miss a deadline with AI-powered organization.' },
  { icon: Brain, title: 'AI Study Assistant', desc: 'Get instant answers, study tips, and personalized help 24/7.' },
  { icon: Calendar, title: 'Dynamic Timetable', desc: 'Beautiful schedules that adapt to your learning rhythm.' },
  { icon: MessageSquare, title: 'Real-time Chat', desc: 'Connect with classmates instantly for collaboration.' },
  { icon: Bell, title: 'Live Announcements', desc: 'Stay in the loop with campus-wide updates as they happen.' },
  { icon: Search, title: 'Lost & Found', desc: 'Reunite with lost items through our community board.' },
  { icon: Users, title: 'Skill Exchange', desc: 'Trade knowledge with peers — teach what you know, learn what you need.' },
  { icon: Sparkles, title: 'Curated Tutorials', desc: 'Hand-picked learning resources tailored to your subjects.' },
];

const stats = [
  { value: '10k+', label: 'Students' },
  { value: '500+', label: 'Tutorials' },
  { value: '99%', label: 'Uptime' },
  { value: '24/7', label: 'AI Support' },
];

export default function Landing() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <FloatingOrbs />

      {/* Nav */}
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="gradient-primary rounded-xl p-2 shadow-glow">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-extrabold tracking-tight">Smart Student Hub</span>
          </div>
          <Button variant="gradient" size="sm" onClick={() => navigate('/auth')} className="rounded-xl">
            Get Started <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </motion.nav>

      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-4 pt-16">
        <motion.div style={{ y, opacity }} className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
            className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full border-gradient"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Powered by AI</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.05]"
          >
            Your campus.
            <br />
            <span className="gradient-text animate-gradient">Reimagined.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Assignments, notes, schedules, AI tutoring, and a thriving student community —
            all in one beautifully crafted experience.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Button
              variant="gradient"
              size="lg"
              onClick={() => navigate('/auth')}
              className="rounded-2xl h-14 px-8 text-base font-semibold shadow-glow-lg group"
            >
              Start Learning Free
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="glass"
              size="lg"
              onClick={() => navigate('/auth')}
              className="rounded-2xl h-14 px-8 text-base font-semibold"
            >
              Sign In
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.7 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 max-w-3xl mx-auto"
          >
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                whileHover={{ y: -4, scale: 1.03 }}
                className="glass rounded-2xl p-4 md:p-6"
              >
                <div className="text-2xl md:text-4xl font-extrabold gradient-text">{s.value}</div>
                <div className="text-xs md:text-sm text-muted-foreground mt-1">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-muted-foreground/40 flex items-start justify-center p-1.5"
          >
            <div className="w-1 h-2 rounded-full bg-primary" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4 mb-16"
          >
            <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-sm">
              <Zap className="h-4 w-4 text-primary" />
              Everything you need
            </div>
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight">
              Built for <span className="gradient-text">modern students</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every tool you need to learn, organize, and connect — designed with care.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: (i % 4) * 0.1 }}
                whileHover={{ y: -6 }}
                className="glass rounded-2xl p-6 group hover:shadow-glow transition-all duration-300"
              >
                <div className="gradient-primary rounded-xl w-12 h-12 flex items-center justify-center mb-4 shadow-glow group-hover:scale-110 transition-transform">
                  <f.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="relative py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'Secure by design', desc: 'Bank-grade security and privacy controls protect your data.' },
              { icon: Zap, title: 'Lightning fast', desc: 'Optimized for instant interactions and smooth animations.' },
              { icon: Star, title: 'Loved by students', desc: 'Crafted with feedback from thousands of learners.' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="glass rounded-2xl p-8 text-center border-gradient"
              >
                <div className="inline-flex gradient-accent rounded-2xl p-3 mb-4 shadow-glow">
                  <item.icon className="h-6 w-6 text-accent-foreground" />
                </div>
                <h3 className="font-bold text-xl mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto glass-strong rounded-3xl p-10 md:p-16 text-center border-gradient relative overflow-hidden"
        >
          <div className="absolute inset-0 gradient-primary opacity-10" />
          <div className="relative z-10 space-y-6">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Ready to transform your <span className="gradient-text">student life?</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Join thousands of students already learning smarter.
            </p>
            <Button
              variant="gradient"
              size="lg"
              onClick={() => navigate('/auth')}
              className="rounded-2xl h-14 px-10 text-base font-semibold shadow-glow-lg animate-pulse-glow"
            >
              Get Started — It's Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative py-8 px-4 border-t border-border/30">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Smart Student Hub. Built with ❤️ for students.
        </div>
      </footer>
    </div>
  );
}

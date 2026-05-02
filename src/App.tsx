import { Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AIChatbot } from "@/components/AIChatbot";
import { PageTransition } from "@/components/PageTransition";
import { SplashScreen } from "@/components/SplashScreen";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import DebugChat from "./pages/DebugChat";
import {
  LazyAuth,
  LazyDashboard,
  LazyAssignments,
  LazyNotes,
  LazyTimetable,
  LazyAnnouncements,
  LazyLostFound,
  LazyChat,
  LazyTutorials,
  LazySkillExchange,
  LazyAdmin,
  prefetchRoute,
} from "@/routes/registry";

const queryClient = new QueryClient();

// Warm up the most-used route as soon as the bundle boots.
if (typeof window !== "undefined") {
  const idle = (cb: () => void) =>
    "requestIdleCallback" in window
      ? (window as any).requestIdleCallback(cb)
      : setTimeout(cb, 200);
  idle(() => prefetchRoute("dashboard"));
  idle(() => prefetchRoute("auth"));
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <SplashScreen label="Securing your session…" />;
  if (!user) return <Navigate to="/auth" replace />;
  return (
    <DashboardLayout>
      <PageTransition>{children}</PageTransition>
      <AIChatbot />
    </DashboardLayout>
  );
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useIsAdmin();
  if (authLoading || roleLoading) return <SplashScreen label="Verifying access…" />;
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return (
    <DashboardLayout>
      <PageTransition>{children}</PageTransition>
      <AIChatbot />
    </DashboardLayout>
  );
}

function AuthRoute() {
  const { user, loading } = useAuth();
  if (loading) return <SplashScreen label="Loading…" />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <LazyAuth />;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Suspense fallback={<SplashScreen label="Loading page…" />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<AuthRoute />} />
          <Route path="/dashboard" element={<ProtectedRoute><LazyDashboard /></ProtectedRoute>} />
          <Route path="/assignments" element={<ProtectedRoute><LazyAssignments /></ProtectedRoute>} />
          <Route path="/notes" element={<ProtectedRoute><LazyNotes /></ProtectedRoute>} />
          <Route path="/timetable" element={<ProtectedRoute><LazyTimetable /></ProtectedRoute>} />
          <Route path="/announcements" element={<ProtectedRoute><LazyAnnouncements /></ProtectedRoute>} />
          <Route path="/lost-found" element={<ProtectedRoute><LazyLostFound /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><LazyChat /></ProtectedRoute>} />
          <Route path="/tutorials" element={<ProtectedRoute><LazyTutorials /></ProtectedRoute>} />
          <Route path="/skill-exchange" element={<ProtectedRoute><LazySkillExchange /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><LazyAdmin /></AdminRoute>} />
          <Route path="/debug-chat" element={<ProtectedRoute><DebugChat /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { lazy } from 'react';

/**
 * Each route loader is exported so we can both render lazily AND
 * prefetch the chunk on hover/focus for instant navigation.
 */
export const loaders = {
  dashboard: () => import('@/pages/Dashboard'),
  assignments: () => import('@/pages/Assignments'),
  notes: () => import('@/pages/Notes'),
  timetable: () => import('@/pages/Timetable'),
  announcements: () => import('@/pages/Announcements'),
  lostFound: () => import('@/pages/LostFound'),
  chat: () => import('@/pages/Chat'),
  tutorials: () => import('@/pages/Tutorials'),
  skillExchange: () => import('@/pages/SkillExchange'),
  admin: () => import('@/pages/AdminDashboard'),
  auth: () => import('@/pages/Auth'),
} as const;

export type RouteKey = keyof typeof loaders;

const prefetched = new Set<RouteKey>();
export function prefetchRoute(key: RouteKey) {
  if (prefetched.has(key)) return;
  prefetched.add(key);
  // Fire and forget — Vite will cache the chunk.
  loaders[key]().catch(() => prefetched.delete(key));
}

// Map URL path → route key for sidebar prefetching.
export const pathToKey: Record<string, RouteKey> = {
  '/dashboard': 'dashboard',
  '/assignments': 'assignments',
  '/notes': 'notes',
  '/timetable': 'timetable',
  '/announcements': 'announcements',
  '/lost-found': 'lostFound',
  '/chat': 'chat',
  '/tutorials': 'tutorials',
  '/skill-exchange': 'skillExchange',
  '/admin': 'admin',
  '/auth': 'auth',
};

export const LazyDashboard = lazy(loaders.dashboard);
export const LazyAssignments = lazy(loaders.assignments);
export const LazyNotes = lazy(loaders.notes);
export const LazyTimetable = lazy(loaders.timetable);
export const LazyAnnouncements = lazy(loaders.announcements);
export const LazyLostFound = lazy(loaders.lostFound);
export const LazyChat = lazy(loaders.chat);
export const LazyTutorials = lazy(loaders.tutorials);
export const LazySkillExchange = lazy(loaders.skillExchange);
export const LazyAdmin = lazy(loaders.admin);
export const LazyAuth = lazy(loaders.auth);

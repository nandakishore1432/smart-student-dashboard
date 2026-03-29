import { useState, useEffect } from 'react';

export function useTheme() {
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    return (localStorage.getItem('theme') as 'light' | 'dark') || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setThemeState(t => t === 'dark' ? 'light' : 'dark');

  return { theme, toggleTheme };
}

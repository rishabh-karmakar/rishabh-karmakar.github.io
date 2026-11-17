import { useEffect, useState } from 'react';

// Browser storage can be missing (on the server) or blocked (cookies disabled),
// and touching it then throws. The theme still works; it just is not remembered.
const saved = () => {
  try {
    return localStorage.getItem('theme');
  } catch {
    return null;
  }
};

export function useTheme() {
  const [theme, setTheme] = useState(() => saved() || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('theme', theme);
    } catch {
      /* not remembered */
    }
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return [theme, toggle];
}

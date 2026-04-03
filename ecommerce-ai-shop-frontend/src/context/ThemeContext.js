import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  const applyThemeToDOM = (t) => {
    if (t === 'dark') {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      document.body.classList.remove('dark');
      document.body.classList.add('light');
    }
  };

  const setTheme = (newTheme) => {
    let resolved = newTheme;
    if (newTheme === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    applyThemeToDOM(resolved);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    let resolved = theme;
    if (theme === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    applyThemeToDOM(resolved);
  }, [theme]);

  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => applyThemeToDOM(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Fallback so it works even without ThemeProvider wrapping the tree
const fallbackApply = (t) => {
  let resolved = t;
  if (t === 'system') {
    resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  if (resolved === 'dark') {
    document.body.classList.add('dark');
    document.body.classList.remove('light');
  } else {
    document.body.classList.remove('dark');
    document.body.classList.add('light');
  }
  localStorage.setItem('theme', t);
};

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context) return context;

  // Fallback when ThemeProvider is not in the tree
  const stored = localStorage.getItem('theme') || 'dark';
  return {
    theme: stored,
    setTheme: (t) => {
      fallbackApply(t);
      window.location.reload();
    },
    toggleTheme: () => {
      const next = stored === 'dark' ? 'light' : 'dark';
      fallbackApply(next);
      window.location.reload();
    },
    isDark: stored === 'dark',
  };
}

export default ThemeContext;
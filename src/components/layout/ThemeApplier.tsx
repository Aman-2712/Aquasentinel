'use client';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

const THEME_CLASSES = ['theme-citizen', 'theme-farmer', 'theme-authority'] as const;

/**
 * ThemeApplier — zero UI, just syncs user.role → body class.
 * Citizen  → body.theme-citizen  (blue/cyan)
 * Farmer   → body.theme-farmer   (emerald green)
 * Authority→ body.theme-authority (amber/red-orange)
 */
export default function ThemeApplier() {
  const { user } = useAuth();

  useEffect(() => {
    const body = document.body;

    // Remove all existing theme classes
    THEME_CLASSES.forEach(cls => body.classList.remove(cls));

    if (user?.role) {
      body.classList.add(`theme-${user.role}`);
    }
  }, [user?.role]);

  return null;
}

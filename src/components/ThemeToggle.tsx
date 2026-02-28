'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import './ThemeToggle.css';

export default function ThemeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch by only rendering after mount
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="theme-toggle-placeholder" />;
    }

    const isLight = resolvedTheme === 'light';

    return (
        <button
            className="theme-toggle"
            onClick={() => setTheme(isLight ? 'dark' : 'light')}
            aria-label="Toggle Theme"
        >
            {isLight ? <Moon size={18} /> : <Sun size={18} />}
        </button>
    );
}

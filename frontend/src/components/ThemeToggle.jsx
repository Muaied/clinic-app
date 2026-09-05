import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-theme text-slate-400 hover:text-white transition-all duration-300 relative overflow-hidden group"
            title={theme === 'dark' ? 'تفعيل الثيم الفاتح' : 'تفعيل الثيم الغامق'}
        >
            <div className={`transform transition-transform duration-500 ${theme === 'dark' ? 'rotate-0' : 'rotate-[360deg]'}`}>
                {theme === 'dark' ? (
                    <Sun className="w-5 h-5 text-amber-400" />
                ) : (
                    <Moon className="w-5 h-5 text-indigo-500" />
                )}
            </div>
            
            {/* Subtle glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-tr from-accent1/20 to-accent2/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl" />
        </button>
    );
};

export default ThemeToggle;

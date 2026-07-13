import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, MonitorSmartphone, Globe, LogOut, Trash2, Target } from 'lucide-react';
import { GlassCard } from '@/components/ui/Card';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useAuthStore } from '@/store/useAuthStore';
import { getDailyGoalMinutes, setDailyGoalMinutes } from '@/lib/learning';
import { cn } from '@/utils/cn';

const themeOptions = [
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'system', label: 'System', icon: MonitorSmartphone },
] as const;

const goalOptions = [15, 30, 45, 60];

export const SettingsPage = () => {
  const { theme, setTheme } = useTheme();
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [goal, setGoal] = useState(getDailyGoalMinutes());
  const [language, setLanguage] = useState(() => localStorage.getItem('getease-language') || 'en');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary tracking-tight mb-1">Settings</h1>
        <p className="text-secondary">Make GetEase feel like yours</p>
      </div>

      <div className="space-y-6">
        {/* Theme */}
        <GlassCard className="p-7">
          <h3 className="font-bold text-primary mb-5">Appearance</h3>
          <div className="grid grid-cols-3 gap-3">
            {themeOptions.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={cn(
                  'flex flex-col items-center gap-2 py-5 rounded-2xl border transition-all duration-150',
                  theme === value
                    ? 'bg-white/[0.08] border-white/[0.2] text-primary'
                    : 'bg-white/[0.02] border-white/[0.06] text-secondary hover:bg-white/[0.05] hover:text-primary'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Daily goal */}
        <GlassCard className="p-7">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-primary/80" />
            <h3 className="font-bold text-primary">Daily Learning Goal</h3>
          </div>
          <p className="text-sm text-secondary mb-5">How many minutes do you want to learn each day?</p>
          <div className="flex flex-wrap gap-3">
            {goalOptions.map((m) => (
              <button
                key={m}
                onClick={() => { setGoal(m); setDailyGoalMinutes(m); }}
                className={cn(
                  'h-11 px-6 rounded-full border text-sm font-semibold transition-all',
                  goal === m
                    ? 'bg-primary text-background border-transparent'
                    : 'bg-white/[0.03] border-white/[0.08] text-secondary hover:text-primary'
                )}
              >
                {m} min
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Language */}
        <GlassCard className="p-7">
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-4 h-4 text-primary/80" />
            <h3 className="font-bold text-primary">Language</h3>
          </div>
          <p className="text-sm text-secondary mb-5">Interface language (more languages coming soon)</p>
          <select
            value={language}
            onChange={(e) => { setLanguage(e.target.value); localStorage.setItem('getease-language', e.target.value); }}
            className="admin-input max-w-xs"
          >
            <option value="en">English</option>
            <option value="hi" disabled>हिन्दी — coming soon</option>
            <option value="ta" disabled>தமிழ் — coming soon</option>
          </select>
        </GlassCard>

        {/* Account */}
        <GlassCard className="p-7">
          <h3 className="font-bold text-primary mb-5">Account</h3>
          <div className="space-y-3">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm font-medium text-primary hover:bg-white/[0.06] transition-colors"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
            <button
              disabled
              title="Coming soon"
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-red-500/[0.04] border border-red-500/[0.15] text-sm font-medium text-red-400/60 cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" /> Delete Account
              <span className="ml-auto text-xs text-secondary">Coming soon</span>
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

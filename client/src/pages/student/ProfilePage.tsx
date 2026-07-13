import React, { useEffect, useRef, useState } from 'react';
import { Camera, Check } from 'lucide-react';
import { GlassCard } from '@/components/ui/Card';
import { studentApi } from '@/lib/studentApi';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/utils/cn';

const NOTIF_KEY = 'getease-notification-prefs';
const defaultPrefs = {
  newCourses: true,
  courseUpdates: true,
  discounts: true,
  announcements: true,
};

const Toggle = ({ on, onClick }: { on: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    role="switch"
    aria-checked={on}
    className={cn(
      'w-11 h-6.5 rounded-full relative transition-colors duration-200 shrink-0',
      on ? 'bg-primary' : 'bg-white/[0.1]'
    )}
  >
    <span
      className={cn(
        'absolute top-0.5 w-5.5 h-5.5 rounded-full bg-background shadow transition-all duration-200',
        on ? 'left-[calc(100%-1.5rem)] bg-background' : 'left-0.5 bg-white/70'
      )}
    />
  </button>
);

export const ProfilePage = () => {
  const { user, accessToken, setAuth } = useAuthStore();

  const [profile, setProfile] = useState<any>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const [curPw, setCurPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pwSaving, setPwSaving] = useState(false);

  const [prefs, setPrefs] = useState(() => {
    try { return { ...defaultPrefs, ...JSON.parse(localStorage.getItem(NOTIF_KEY) || '{}') }; }
    catch { return defaultPrefs; }
  });

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    studentApi.getProfile().then(({ data }) => {
      if (data.success) {
        setProfile(data.data);
        setName(data.data.name || '');
        setPhone(data.data.phone || '');
        setAvatar(data.data.avatar || null);
      }
    }).catch(console.error);
  }, []);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Store as a compact data URL (dev storage; swaps to R2 in a later phase)
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 160;
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        const min = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - min) / 2, (img.height - min) / 2, min, min, 0, 0, size, size);
        setAvatar(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    setSaving(true);
    setSavedMsg('');
    try {
      const { data } = await studentApi.updateProfile({ name, phone: phone || null, avatar });
      if (data.success) {
        setSavedMsg('Profile updated');
        if (user && accessToken) setAuth({ ...user, name: data.data.name }, accessToken);
        setTimeout(() => setSavedMsg(''), 2500);
      }
    } catch (e: any) {
      setSavedMsg(e.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async () => {
    setPwSaving(true);
    setPwMsg(null);
    try {
      await studentApi.changePassword({ currentPassword: curPw, newPassword: newPw });
      setPwMsg({ ok: true, text: 'Password changed successfully' });
      setCurPw(''); setNewPw('');
    } catch (e: any) {
      setPwMsg({ ok: false, text: e.response?.data?.message || 'Failed to change password' });
    } finally {
      setPwSaving(false);
    }
  };

  const togglePref = (key: keyof typeof defaultPrefs) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    localStorage.setItem(NOTIF_KEY, JSON.stringify(next));
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary tracking-tight mb-1">Profile</h1>
        <p className="text-secondary">Manage your personal information</p>
      </div>

      <div className="space-y-6">
        {/* Identity */}
        <GlassCard className="p-7">
          <div className="flex items-center gap-5 mb-7">
            <button
              onClick={() => fileRef.current?.click()}
              className="relative group w-20 h-20 rounded-full overflow-hidden bg-white/10 border border-white/10 flex items-center justify-center shrink-0"
              aria-label="Change profile photo"
            >
              {avatar ? (
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-primary">
                  {name?.[0]?.toUpperCase() || 'S'}
                </span>
              )}
              <span className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </span>
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            <div>
              <p className="font-bold text-primary">{profile?.name}</p>
              <p className="text-sm text-secondary">{profile?.email}</p>
              <button
                onClick={() => fileRef.current?.click()}
                className="text-xs text-secondary hover:text-primary mt-1 underline underline-offset-2 transition-colors"
              >
                Change photo
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-primary">Full name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="admin-input" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-primary">Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="admin-input"
              />
            </div>
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={saveProfile}
                disabled={saving || name.trim().length < 2}
                className="h-11 px-6 rounded-full bg-primary text-background text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
              {savedMsg && (
                <span className="text-sm text-green-400 flex items-center gap-1">
                  <Check className="w-4 h-4" /> {savedMsg}
                </span>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Password */}
        <GlassCard className="p-7">
          <h3 className="font-bold text-primary mb-5">Change Password</h3>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-primary">Current password</label>
              <input type="password" value={curPw} onChange={(e) => setCurPw(e.target.value)} className="admin-input" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-primary">New password</label>
              <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} className="admin-input" placeholder="At least 6 characters" />
            </div>
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={savePassword}
                disabled={pwSaving || !curPw || newPw.length < 6}
                className="h-11 px-6 rounded-full bg-white/[0.08] border border-white/[0.1] text-primary text-sm font-semibold hover:bg-white/[0.12] transition-colors disabled:opacity-50"
              >
                {pwSaving ? 'Updating…' : 'Update password'}
              </button>
              {pwMsg && (
                <span className={cn('text-sm', pwMsg.ok ? 'text-green-400' : 'text-red-400')}>
                  {pwMsg.text}
                </span>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Notification preferences */}
        <GlassCard className="p-7">
          <h3 className="font-bold text-primary mb-1">Notification Preferences</h3>
          <p className="text-sm text-secondary mb-5">Choose what you want to hear about</p>
          <div className="space-y-4">
            {([
              ['newCourses', 'New courses', 'Be first to know when a course launches'],
              ['courseUpdates', 'Course updates', 'New lessons and content in courses you own'],
              ['discounts', 'Discounts & offers', 'Limited-time deals on premium courses'],
              ['announcements', 'Announcements', 'Platform news and important updates'],
            ] as const).map(([key, label, desc]) => (
              <div key={key} className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-primary">{label}</p>
                  <p className="text-xs text-secondary">{desc}</p>
                </div>
                <Toggle on={prefs[key]} onClick={() => togglePref(key)} />
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

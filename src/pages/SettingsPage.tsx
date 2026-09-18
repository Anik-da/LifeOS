import { useState } from 'react';
import { User, Bell, Plug, Lock, Eye, Check, Globe, Mail, Cloud } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { useToast } from '@/components/ui/Toast';

const sections = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'sources', label: 'Connected sources', icon: Plug },
  { id: 'privacy', label: 'Privacy', icon: Eye },
  { id: 'security', label: 'Security', icon: Lock },
] as const;

type SectionId = (typeof sections)[number]['id'];

export function SettingsPage() {
  const { showToast } = useToast();
  const [active, setActive] = useState<SectionId>('profile');

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
      <PageHeader title="Settings" subtitle="Manage your account, connected sources, and preferences." />

      <div className="flex flex-col sm:flex-row gap-6">
        <div className="sm:w-48 shrink-0">
          <div className="flex sm:flex-col gap-1 overflow-x-auto sm:overflow-visible">
            {sections.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                    active === s.id ? 'bg-accent-soft text-accent' : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                  }`}
                >
                  <Icon size={16} /> {s.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {active === 'profile' && (
            <div className="card p-6 animate-fadeIn space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 text-xl font-bold text-white">
                  DU
                </div>
                <div>
                  <div className="text-sm font-semibold text-text-primary">Demo User</div>
                  <div className="text-xs text-text-tertiary">demo@lifeos.app</div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">Full name</label>
                  <input defaultValue="Demo User" className="input-field w-full px-3 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">Email</label>
                  <input defaultValue="demo@lifeos.app" className="input-field w-full px-3 py-2.5 text-sm" />
                </div>
              </div>

              <button onClick={() => showToast('Profile saved', 'success')} className="btn-primary px-4 py-2 text-sm">
                Save changes
              </button>
            </div>
          )}

          {active === 'notifications' && (
            <div className="card p-6 animate-fadeIn space-y-4">
              {[
                { label: 'Deadline changes', desc: 'When LifeOS detects a deadline has moved' },
                { label: 'New actions', desc: 'When a new action is extracted from your documents' },
                { label: 'Email detection', desc: 'When LifeOS detects important emails' },
                { label: 'Warranty expiry', desc: 'Before warranties expire' },
              ].map((n, i) => (
                <div key={i} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                  <div>
                    <div className="text-sm font-medium text-text-primary">{n.label}</div>
                    <div className="text-xs text-text-tertiary mt-0.5">{n.desc}</div>
                  </div>
                  <Toggle defaultOn onChange={() => showToast('Notification preference updated', 'info')} />
                </div>
              ))}
            </div>
          )}

          {active === 'sources' && (
            <div className="card p-6 animate-fadeIn">
              <div className="space-y-3">
                {[
                  { name: 'Google Drive', icon: Cloud, desc: 'Connect to scan documents in your Drive', status: 'coming' },
                  { name: 'Gmail', icon: Mail, desc: 'Connect to detect important emails', status: 'coming' },
                  { name: 'Cloud Storage', icon: Globe, desc: 'Connect Dropbox, OneDrive, or other storage', status: 'coming' },
                ].map((src, i) => {
                  const Icon = src.icon;
                  return (
                    <div key={i} className="flex items-center gap-3 rounded-xl border border-border p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-bg-tertiary text-text-secondary">
                        <Icon size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-text-primary">{src.name}</div>
                        <div className="text-xs text-text-tertiary mt-0.5">{src.desc}</div>
                      </div>
                      <span className="shrink-0 rounded-full border border-border bg-bg-tertiary px-2.5 py-1 text-xs font-medium text-text-tertiary">
                        Coming soon
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-text-tertiary mt-4 leading-relaxed">
                Connected sources are not yet available. Integrations will be added in a future release.
              </p>
            </div>
          )}

          {active === 'privacy' && (
            <div className="card p-6 animate-fadeIn space-y-4">
              {[
                { label: 'Local processing', desc: 'Process documents on-device when possible' },
                { label: 'Data retention', desc: 'Automatically delete data older than 12 months' },
                { label: 'Anonymous analytics', desc: 'Help improve LifeOS with anonymous usage data' },
              ].map((p, i) => (
                <div key={i} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                  <div>
                    <div className="text-sm font-medium text-text-primary">{p.label}</div>
                    <div className="text-xs text-text-tertiary mt-0.5">{p.desc}</div>
                  </div>
                  <Toggle defaultOn={i === 0} onChange={() => showToast('Privacy setting updated', 'info')} />
                </div>
              ))}
            </div>
          )}

          {active === 'security' && (
            <div className="card p-6 animate-fadeIn space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Current password</label>
                <input type="password" placeholder="••••••••" className="input-field w-full px-3 py-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">New password</label>
                <input type="password" placeholder="••••••••" className="input-field w-full px-3 py-2.5 text-sm" />
              </div>
              <button onClick={() => showToast('Password updated', 'success')} className="btn-primary px-4 py-2 text-sm">
                Update password
              </button>

              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-text-primary">Two-factor authentication</div>
                    <div className="text-xs text-text-tertiary mt-0.5">Add an extra layer of security</div>
                  </div>
                  <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400">
                    Coming soon
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Toggle({ defaultOn, onChange }: { defaultOn?: boolean; onChange?: () => void }) {
  const [on, setOn] = useState(!!defaultOn);
  return (
    <button
      onClick={() => { setOn(!on); onChange?.(); }}
      className={`relative h-6 w-11 rounded-full transition-colors ${on ? 'bg-accent' : 'bg-bg-tertiary border border-border'}`}
      role="switch"
      aria-checked={on}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${on ? 'translate-x-5' : 'translate-x-0.5'}`}>
        {on && <Check size={12} className="absolute inset-0 m-auto text-accent" />}
      </span>
    </button>
  );
}

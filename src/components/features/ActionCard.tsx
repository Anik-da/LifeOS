import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, FileText, Check, AlertTriangle, Bell, X, Calendar, Loader2 } from 'lucide-react';
import type { Action } from '@/types';
import { api } from '@/services/api';
import { useToast } from '@/components/ui/Toast';

const priorityStyles: Record<string, { dot: string; border: string; bg: string; badge: string }> = {
  urgent: { dot: 'bg-rose-500', border: 'border-l-rose-500', bg: 'hover:border-rose-500/40', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
  warning: { dot: 'bg-amber-400', border: 'border-l-amber-500', bg: 'hover:border-amber-500/40', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  info: { dot: 'bg-blue-400', border: 'border-l-blue-500', bg: 'hover:border-blue-500/40', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  success: { dot: 'bg-emerald-400', border: 'border-l-emerald-500', bg: 'hover:border-emerald-500/40', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
};

export function ActionCard({
  action: initialAction,
  onComplete,
  compact,
}: {
  action: Action;
  onComplete?: (id: string) => void;
  compact?: boolean;
}) {
  const { showToast } = useToast();
  const [action, setAction] = useState<Action>(initialAction);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<'preset' | 'custom'>('preset');
  const [presetOffset, setPresetOffset] = useState<string>('24h');
  const [customDateTime, setCustomDateTime] = useState<string>('');

  const style = priorityStyles[action.priority] || priorityStyles.info;

  const handleScheduleReminder = async (targetIsoTime: string) => {
    setLoading(true);
    try {
      const res = await api.actions.setReminder(action.id, targetIsoTime);
      setAction((prev) => ({
        ...prev,
        reminderEnabled: true,
        reminderAt: targetIsoTime,
        reminderStatus: 'SCHEDULED',
        reminderScheduleId: res.scheduleId,
      }));
      showToast(`Reminder scheduled for ${new Date(targetIsoTime).toLocaleString()}`, 'success');
      setShowModal(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to schedule reminder', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePresetSelect = (offset: string) => {
    const now = new Date();
    let target = new Date();

    if (offset === '10m') {
      // 10 minutes in future for instant testing/demo!
      target = new Date(now.getTime() + 10 * 60 * 1000);
    } else if (offset === '24h') {
      target = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    } else if (offset === '3d') {
      target = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    } else if (offset === '1w') {
      target = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    }

    handleScheduleReminder(target.toISOString());
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDateTime) {
      showToast('Please select a custom date and time', 'info');
      return;
    }
    handleScheduleReminder(new Date(customDateTime).toISOString());
  };

  const handleCancelReminder = async () => {
    setLoading(true);
    try {
      await api.actions.cancelReminder(action.id);
      setAction((prev) => ({
        ...prev,
        reminderEnabled: false,
        reminderStatus: 'CANCELLED',
      }));
      showToast('Reminder cancelled', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel reminder', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatReminderTime = (iso?: string) => {
    if (!iso) return '';
    const date = new Date(iso);
    return date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (compact) {
    return (
      <div className={`card card-hover p-4 border-l-4 ${style.border} ${style.bg} flex items-start justify-between gap-3 animate-slideUp`}>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${style.badge}`}>
              {action.priority}
            </span>
            <span className="text-[11px] text-text-tertiary flex items-center gap-1 font-mono">
              <Clock size={11} /> {action.daysLeft > 0 ? `${action.daysLeft}d left` : 'Due today'}
            </span>
          </div>
          <div className="text-xs font-semibold text-text-primary truncate">{action.title}</div>
          <div className="text-[11px] text-text-secondary mt-0.5 line-clamp-1">{action.description}</div>
          
          {action.reminderStatus === 'SCHEDULED' && action.reminderAt && (
            <div className="mt-2 text-[10px] font-medium text-blue-400 flex items-center gap-1">
              <Bell size={10} /> Reminder: {formatReminderTime(action.reminderAt)}
            </div>
          )}
        </div>

        {action.status !== 'completed' && onComplete && (
          <button
            onClick={() => onComplete(action.id)}
            className="shrink-0 p-2 rounded-lg bg-bg-tertiary border border-border hover:bg-emerald-500/20 hover:border-emerald-500/30 hover:text-emerald-300 text-text-tertiary transition-all"
            title="Mark Complete"
          >
            <Check size={14} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`card p-5 border-l-4 ${style.border} animate-slideUp relative`}>
      <div className="flex items-start gap-3">
        <div className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${style.dot} ${action.status === 'completed' ? 'opacity-40' : ''}`} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${style.badge} mb-1 inline-block`}>
                {action.priority}
              </span>
              <h3 className={`text-sm font-bold ${action.status === 'completed' ? 'text-text-tertiary line-through' : 'text-text-primary'}`}>
                {action.title}
              </h3>
            </div>
            {action.status === 'completed' ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                <Check size={12} /> Completed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-text-tertiary bg-bg-tertiary px-2 py-1 rounded border border-border">
                <Clock size={12} /> {action.daysLeft}d left
              </span>
            )}
          </div>

          <p className="text-xs text-text-secondary mt-2 leading-relaxed">{action.description}</p>

          <div className="flex flex-wrap items-center justify-between gap-3 mt-3 text-xs text-text-tertiary border-t border-border pt-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5 text-xs text-text-secondary font-medium">
                <FileText size={13} className="text-accent" /> Source Evidence: <span className="text-text-primary">{action.source}</span>
              </span>
              <span className="flex items-center gap-1 text-xs text-amber-500">
                <AlertTriangle size={13} /> Deadline: {new Date(action.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            {/* Reminder Status Badge */}
            {action.reminderStatus === 'SCHEDULED' && action.reminderAt ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
                <Bell size={12} className="animate-pulse" />
                <span>Scheduled: {formatReminderTime(action.reminderAt)}</span>
                <button
                  onClick={handleCancelReminder}
                  disabled={loading}
                  className="ml-1 text-text-tertiary hover:text-rose-400 transition-colors"
                  title="Cancel Reminder"
                >
                  <X size={12} />
                </button>
              </div>
            ) : action.reminderStatus === 'SENT' ? (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                <Check size={12} /> Email Reminder Sent
              </div>
            ) : null}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            {action.status !== 'completed' && onComplete && (
              <button
                onClick={() => onComplete(action.id)}
                className="btn-primary inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold"
              >
                <Check size={14} /> Mark complete
              </button>
            )}

            {/* Remind Me Button */}
            {action.status !== 'completed' && (
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg border border-accent/40 bg-accent-soft text-accent hover:bg-accent/20 transition-all shadow-sm"
              >
                <Bell size={14} />
                {action.reminderStatus === 'SCHEDULED' ? 'Edit Reminder' : '🔔 Remind me'}
              </button>
            )}

            <Link
              to={action.sourceId ? `/documents/${action.sourceId}` : '/documents'}
              className="btn-secondary inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium"
            >
              <FileText size={14} /> View source document
            </Link>
          </div>
        </div>
      </div>

      {/* Reminder Scheduling Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md card p-6 border-border bg-bg-secondary shadow-2xl space-y-5 animate-slideUp relative">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-accent" />
                <h3 className="text-base font-bold text-text-primary">Set AWS Email Reminder</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-text-tertiary hover:bg-bg-tertiary hover:text-text-primary transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="text-xs text-text-secondary leading-relaxed bg-bg-tertiary p-3 rounded-lg border border-border">
              <span className="font-semibold text-text-primary">Action:</span> {action.title}<br/>
              <span className="font-semibold text-text-primary">Target:</span> Real email via Amazon EventBridge Scheduler & SES.
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                Select Reminder Option
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handlePresetSelect('10m')}
                  disabled={loading}
                  className="p-3 rounded-lg border border-accent/30 bg-accent-soft hover:bg-accent/20 text-accent text-left transition-all"
                >
                  <div className="text-xs font-bold flex items-center gap-1">⚡ Quick Test</div>
                  <div className="text-[10px] text-text-tertiary mt-0.5">In 10 Minutes</div>
                </button>

                <button
                  type="button"
                  onClick={() => handlePresetSelect('24h')}
                  disabled={loading}
                  className="p-3 rounded-lg border border-border bg-bg-tertiary hover:border-accent text-text-primary text-left transition-all"
                >
                  <div className="text-xs font-bold">1 Day Before</div>
                  <div className="text-[10px] text-text-tertiary mt-0.5">Tomorrow at 9:00 AM</div>
                </button>

                <button
                  type="button"
                  onClick={() => handlePresetSelect('3d')}
                  disabled={loading}
                  className="p-3 rounded-lg border border-border bg-bg-tertiary hover:border-accent text-text-primary text-left transition-all"
                >
                  <div className="text-xs font-bold">3 Days Before</div>
                  <div className="text-[10px] text-text-tertiary mt-0.5">In 3 Days</div>
                </button>

                <button
                  type="button"
                  onClick={() => handlePresetSelect('1w')}
                  disabled={loading}
                  className="p-3 rounded-lg border border-border bg-bg-tertiary hover:border-accent text-text-primary text-left transition-all"
                >
                  <div className="text-xs font-bold">1 Week Before</div>
                  <div className="text-[10px] text-text-tertiary mt-0.5">In 7 Days</div>
                </button>
              </div>

              {/* Custom Date & Time option */}
              <div className="pt-2 border-t border-border">
                <form onSubmit={handleCustomSubmit} className="space-y-3">
                  <label className="block text-xs font-medium text-text-secondary">Or Custom Date & Time</label>
                  <div className="flex gap-2">
                    <input
                      type="datetime-local"
                      value={customDateTime}
                      onChange={(e) => setCustomDateTime(e.target.value)}
                      className="input-field flex-1 text-xs py-2 px-3"
                    />
                    <button
                      type="submit"
                      disabled={loading || !customDateTime}
                      className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 shrink-0"
                    >
                      {loading ? <Loader2 size={14} className="animate-spin" /> : <Calendar size={14} />}
                      Set Custom
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {loading && (
              <div className="flex items-center justify-center gap-2 text-xs text-accent">
                <Loader2 size={16} className="animate-spin" />
                <span>Scheduling in EventBridge Scheduler...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

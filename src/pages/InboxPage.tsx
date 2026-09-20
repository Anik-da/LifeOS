import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, AlertCircle, Briefcase, TrendingUp, Shield, Clock, CheckCircle2, ArrowRight, Filter, FileText } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/Badge';
import { api } from '@/services/api';

export interface InboxItem {
  id: string;
  title: string;
  description: string;
  category: 'Important' | 'Action required' | 'Information' | 'Career' | 'Finance' | 'Security';
  timestamp: string;
  source: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  priority: 'urgent' | 'warning' | 'info';
}

const mockInboxItems: InboxItem[] = [
  {
    id: 'inbox-1',
    title: 'Interview invitation detected',
    description: 'Invitation for Software Engineer Intern position at Acme Corp. Response required to confirm slot.',
    category: 'Career',
    timestamp: '10 minutes ago',
    source: 'Email: interview@acme.com',
    read: false,
    actionUrl: '/career',
    actionLabel: 'View in Career',
    priority: 'urgent',
  },
  {
    id: 'inbox-2',
    title: 'Scholarship requirement changed',
    description: 'Deadline updated from 30 June to 15 October 2026. Income Certificate added as mandatory document.',
    category: 'Finance',
    timestamp: '2 hours ago',
    source: 'Scholarship_Rules_v2.pdf',
    read: false,
    actionUrl: '/changes',
    actionLabel: 'View Changes',
    priority: 'warning',
  },
  {
    id: 'inbox-3',
    title: 'Laptop warranty expiration reminder',
    description: 'Warranty for MacBook Pro 16" expires in 23 days (12 October 2026). Consider extended coverage.',
    category: 'Information',
    timestamp: 'Yesterday',
    source: 'Apple_Store_Receipt.pdf',
    read: true,
    actionUrl: '/documents',
    actionLabel: 'View Receipt',
    priority: 'info',
  },
  {
    id: 'inbox-4',
    title: 'Potential security concern detected',
    description: 'Suspicious SMS containing urgent account suspension threat and unverified payment link.',
    category: 'Security',
    timestamp: '2 days ago',
    source: 'SMS Paste',
    read: true,
    actionUrl: '/security',
    actionLabel: 'Check Security',
    priority: 'urgent',
  },
];

const categoryIcons = {
  Important: AlertCircle,
  'Action required': CheckCircle2,
  Information: FileText,
  Career: Briefcase,
  Finance: TrendingUp,
  Security: Shield,
};

const filterTabs = [
  'All',
  'Important',
  'Action required',
  'Career',
  'Finance',
  'Security',
] as const;

export function InboxPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('All');

  useEffect(() => {
    // Load inbox items or fallback
    setItems(mockInboxItems);
    setLoading(false);
  }, []);

  const markAsRead = (id: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)));
  };

  const filteredItems = items.filter((item) => {
    if (activeTab === 'All') return true;
    return item.category === activeTab;
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
      <PageHeader
        title="Intelligent Inbox"
        subtitle="LifeOS automatically classifies and highlights incoming information across your documents, emails, and alerts."
      />

      <div className="flex items-center gap-1 mb-6 border-b border-border overflow-x-auto pb-1">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors rounded-lg ${
              activeTab === tab
                ? 'bg-accent-soft text-accent'
                : 'text-text-tertiary hover:text-text-secondary hover:bg-bg-tertiary'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSkeleton variant="list" />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={<Mail size={28} />}
          title="Inbox is empty"
          description="LifeOS will automatically post updates here as it detects changes, deadlines, or actionable events in your files."
        />
      ) : (
        <div className="space-y-3 animate-fadeIn">
          {filteredItems.map((item) => {
            const IconComponent = categoryIcons[item.category] || FileText;
            return (
              <div
                key={item.id}
                onClick={() => markAsRead(item.id)}
                className={`card card-hover p-4 border transition-all ${
                  item.read ? 'opacity-85 border-border bg-bg-secondary' : 'border-accent/30 bg-bg-secondary/90 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent mt-0.5">
                      <IconComponent size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`text-sm font-semibold ${item.read ? 'text-text-secondary' : 'text-text-primary'}`}>
                          {item.title}
                        </h3>
                        <StatusBadge priority={item.priority}>{item.category}</StatusBadge>
                        {!item.read && (
                          <span className="h-2 w-2 rounded-full bg-accent animate-pulse" title="Unread" />
                        )}
                      </div>
                      <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-text-tertiary mt-2">
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> {item.timestamp}
                        </span>
                        <span>•</span>
                        <span className="truncate max-w-[200px]">Source: {item.source}</span>
                      </div>
                    </div>
                  </div>

                  {item.actionUrl && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(item.id);
                        navigate(item.actionUrl!);
                      }}
                      className="btn-secondary text-xs px-3 py-1.5 shrink-0 flex items-center gap-1 self-center hover:text-accent"
                    >
                      {item.actionLabel || 'View'}
                      <ArrowRight size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


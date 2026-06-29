import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import type { CrmNotification, PaginatedResponse } from '@/types';
import { Bell, Check, ExternalLink, Loader2 } from 'lucide-react';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<CrmNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const response = await api.get<PaginatedResponse<CrmNotification>>('/notifications?per_page=5&unread_only=true');
      setNotifications(response.data.data.data);
      setUnreadCount(response.data.data.total);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    setIsLoading(true);
    try {
      await api.post('/notifications/read-all');
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkSingleRead = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.post(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = (n: CrmNotification) => {
    setIsOpen(false);
    // Automatically mark as read when clicking
    api.post(`/notifications/${n.id}/read`).then(() => fetchNotifications());

    // Redirect based on type
    if (n.type === 'lead_assigned') {
      navigate('/crm/leads');
    } else if (n.type === 'document_uploaded' || n.type === 'document_verified' || n.type === 'deal_approval') {
      if (n.data && n.data.deal_id) {
        navigate(`/crm/deals/${n.data.deal_id}`);
      } else {
        navigate('/crm/deals');
      }
    } else {
      navigate('/notifications');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
      >
        <Bell size={20} className="text-neutral-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger-500 text-[9px] font-bold text-white shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-neutral-200 bg-white shadow-xl z-50 overflow-hidden animate-scale-in">
          <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50 px-4 py-3">
            <h3 className="text-xs font-bold text-neutral-800">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={isLoading}
                className="text-[10px] font-semibold text-primary-600 hover:text-primary-700 disabled:opacity-50 flex items-center gap-1 cursor-pointer"
              >
                {isLoading ? <Loader2 className="animate-spin" size={10} /> : <Check size={12} />}
                Mark all read
              </button>
            )}
          </div>

          <div className="divide-y divide-neutral-100 max-h-80 overflow-y-auto">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className="flex items-start gap-3 p-4 hover:bg-neutral-50 cursor-pointer transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-neutral-900">{n.title}</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-2 leading-relaxed">
                    {n.message}
                  </p>
                  <p className="text-[9px] text-neutral-400 mt-1">
                    {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <button
                  onClick={(e) => handleMarkSingleRead(n.id, e)}
                  className="p-1 hover:bg-neutral-200 rounded text-neutral-400 hover:text-success-600 transition-colors"
                  title="Mark as read"
                >
                  <Check size={14} />
                </button>
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="py-8 text-center text-xs text-neutral-500 italic">
                No new notifications.
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setIsOpen(false);
              navigate('/notifications');
            }}
            className="w-full border-t border-neutral-100 bg-neutral-50 py-2.5 text-center text-xs font-bold text-primary-600 hover:text-primary-750 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            View all notifications
            <ExternalLink size={12} />
          </button>
        </div>
      )}
    </div>
  );
}

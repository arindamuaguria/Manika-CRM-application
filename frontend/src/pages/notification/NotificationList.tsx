import { useState, useEffect } from 'react';
import { useNavigate as useAppNavigate } from 'react-router-dom';
import api from '@/services/api';
import type { CrmNotification, PaginatedResponse } from '@/types';
import { Bell, Check, CheckSquare, Loader2 } from 'lucide-react';

export default function NotificationList() {
  const [notifications, setNotifications] = useState<CrmNotification[]>([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const navigate = useAppNavigate();

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        unread_only: unreadOnly || undefined,
      };
      const response = await api.get<PaginatedResponse<CrmNotification>>('/notifications', { params });
      setNotifications(response.data.data.data);
      setLastPage(response.data.data.last_page);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [currentPage, unreadOnly]);

  const handleMarkSingleRead = async (id: number) => {
    try {
      await api.post(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    setIsMarkingAll(true);
    try {
      await api.post('/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      console.error(err);
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleNotificationClick = (n: CrmNotification) => {
    if (!n.is_read) {
      api.post(`/notifications/${n.id}/read`);
    }

    if (n.type === 'lead_assigned') {
      navigate('/crm/leads');
    } else if (n.type === 'document_uploaded' || n.type === 'document_verified' || n.type === 'deal_approval') {
      if (n.data && n.data.deal_id) {
        navigate(`/crm/deals/${n.data.deal_id}`);
      } else {
        navigate('/crm/deals');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <Bell size={24} className="text-primary-600" />
            Notifications
          </h1>
          <p className="text-neutral-500 text-sm">View and manage all system-generated alerts.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setUnreadOnly(!unreadOnly)}
            className={`px-4 py-2 border rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
              unreadOnly
                ? 'bg-primary-50 border-primary-200 text-primary-700'
                : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            Unread Only
          </button>
          <button
            onClick={handleMarkAllRead}
            disabled={isMarkingAll}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 disabled:opacity-50 text-neutral-800 font-semibold rounded-lg transition-colors cursor-pointer text-sm"
          >
            <CheckSquare size={16} />
            {isMarkingAll ? 'Marking...' : 'Mark all read'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden divide-y divide-neutral-100">
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="animate-spin text-primary-600" size={32} />
          </div>
        ) : (
          <>
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`flex items-start justify-between p-5 hover:bg-neutral-50/50 transition-colors cursor-pointer ${
                  !n.is_read ? 'bg-primary-50/10 font-medium' : ''
                }`}
              >
                <div className="flex gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      !n.is_read
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-neutral-100 text-neutral-500'
                    }`}
                  >
                    <Bell size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className={`text-sm ${!n.is_read ? 'font-bold text-neutral-950' : 'text-neutral-700'}`}>
                        {n.title}
                      </p>
                      {!n.is_read && (
                        <span className="w-1.5 h-1.5 bg-primary-600 rounded-full" />
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 mt-1 leading-relaxed max-w-2xl">
                      {n.message}
                    </p>
                    <p className="text-[10px] text-neutral-400 mt-2">
                      {new Date(n.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {!n.is_read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkSingleRead(n.id);
                    }}
                    className="flex items-center gap-1 px-3 py-1 hover:bg-success-50 border border-transparent hover:border-success-200 text-neutral-500 hover:text-success-700 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                    title="Mark as read"
                  >
                    <Check size={14} />
                    Mark read
                  </button>
                )}
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="py-16 text-center text-neutral-500 italic">
                No notifications to display.
              </div>
            )}
          </>
        )}

        {lastPage > 1 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-neutral-200 bg-neutral-50">
            <p className="text-xs text-neutral-500">
              Page {currentPage} of {lastPage}
            </p>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="px-3 py-1 bg-white border border-neutral-200 rounded text-xs font-semibold hover:bg-neutral-50 disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              <button
                disabled={currentPage === lastPage}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-3 py-1 bg-white border border-neutral-200 rounded text-xs font-semibold hover:bg-neutral-50 disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

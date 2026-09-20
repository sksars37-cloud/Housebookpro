import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, collection, query, where, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from '../lib/firebase';
import { Bell, Check, Trash2, X, Sparkles, MessageSquare, ShieldCheck, Heart } from 'lucide-react';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'chat' | 'kyc' | 'reward' | 'property' | 'system';
  read: boolean;
  createdAt: number;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose
}) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: AppNotification[] = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() } as AppNotification);
      });
      setNotifications(list);
    }, (error) => {
      console.warn('Notifications listener notice:', error);
    });
    return () => unsubscribe();
  }, [user]);

  if (!isOpen) return null;

  const handleMarkAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    for (const notif of notifications) {
      if (!notif.read) {
        try {
          await updateDoc(doc(db, 'notifications', notif.id), { read: true });
        } catch (e) {
          // graceful fallback
        }
      }
    }
  };

  const handleDelete = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
      await deleteDoc(doc(db, 'notifications', id));
    } catch (e) {
      // graceful fallback
    }
  };

  return (
    <div
      id="modal-notifications-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in"
    >
      <div
        id="modal-notifications-container"
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600" />
            <h3 className="font-extrabold text-base text-slate-900">Notifications</h3>
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-black text-[10px]">
                {notifications.filter(n => !n.read).length} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1 bg-slate-50/50">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <Bell className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs font-semibold text-slate-600">No notifications yet</p>
              <p className="text-[11px] text-slate-400">
                You will receive alerts for chat inquiries, KYC approvals, and coin rewards here.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                  notif.read ? 'bg-white border-slate-200' : 'bg-indigo-50/60 border-indigo-200 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    notif.type === 'chat' ? 'bg-indigo-100 text-indigo-700' :
                    notif.type === 'reward' ? 'bg-amber-100 text-amber-700' :
                    notif.type === 'kyc' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {notif.type === 'chat' ? <MessageSquare className="w-4 h-4" /> :
                     notif.type === 'reward' ? <Sparkles className="w-4 h-4" /> :
                     <ShieldCheck className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-slate-900 truncate">{notif.title}</h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{notif.message}</p>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(notif.id)}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

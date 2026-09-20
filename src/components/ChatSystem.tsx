import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  db,
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot
} from '../lib/firebase';
import { Conversation, Message, Property } from '../types';
import {
  MessageSquare,
  Send,
  Building,
  Check,
  CheckCheck,
  Sparkles,
  ArrowLeft,
  User,
  Phone,
  Image as ImageIcon,
  Clock,
  ExternalLink
} from 'lucide-react';

interface ChatSystemProps {
  initialPropertyForChat?: Property | null;
  onClearInitialProperty?: () => void;
  onViewPropertyDetails?: (propertyId: string) => void;
  onViewOwnerProfile?: (owner: {
    id: string;
    name: string;
    avatar?: string;
    phone?: string;
    email?: string;
    role?: string;
    bio?: string;
  }) => void;
  currencySymbol: string;
}

const QUICK_INQUIRIES = [
  'Hi, is this property still available?',
  'Can we schedule a physical visit this Saturday?',
  'Is the price slightly negotiable?',
  'Does the property include covered parking?'
];

export const ChatSystem: React.FC<ChatSystemProps> = ({
  initialPropertyForChat,
  onClearInitialProperty,
  onViewPropertyDetails,
  onViewOwnerProfile,
  currencySymbol
}) => {
  const { user, profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen to user conversations
  useEffect(() => {
    if (!user) {
      setConversations([]);
      return;
    }
    const convsRef = collection(db, 'conversations');
    const q = query(convsRef, where('participantIds', 'array-contains', user.uid), orderBy('updatedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convList: Conversation[] = [];
      snapshot.forEach((docSnap) => {
        convList.push({ id: docSnap.id, ...docSnap.data() } as Conversation);
      });
      setConversations(convList);

      // If active conversation is in list, update it
      if (activeConversation) {
        const updated = convList.find(c => c.id === activeConversation.id);
        if (updated) {
          setActiveConversation(updated);
        }
      } else if (convList.length > 0 && !initialPropertyForChat) {
        setActiveConversation(convList[0]);
      }
    }, (error) => {
      console.warn('Conversations listener notice:', error);
    });
    return () => unsubscribe();
  }, [user]);

  // Handle initial property chat trigger (e.g. user clicked "Chat with Owner" on a property card)
  useEffect(() => {
    if (!initialPropertyForChat || !user || !profile) return;

    const startOrOpenChat = async () => {
      // Check if conversation already exists for this property and user
      const existing = conversations.find(
        c => c.propertyId === initialPropertyForChat.id && c.participantIds.includes(initialPropertyForChat.ownerId)
      );

      if (existing) {
        setActiveConversation(existing);
      } else {
        // Create new conversation
        const newConvData: Omit<Conversation, 'id'> = {
          participantIds: [user.uid, initialPropertyForChat.ownerId],
          participantNames: {
            [user.uid]: profile.displayName || 'Buyer',
            [initialPropertyForChat.ownerId]: initialPropertyForChat.ownerName
          },
          participantAvatars: {
            [user.uid]: profile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
            [initialPropertyForChat.ownerId]: initialPropertyForChat.ownerAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${initialPropertyForChat.ownerId}`
          },
          propertyId: initialPropertyForChat.id,
          propertyTitle: initialPropertyForChat.title,
          propertyPrice: initialPropertyForChat.price,
          propertyImage: initialPropertyForChat.images[0] || '',
          lastMessage: `Inquired about ${initialPropertyForChat.title}`,
          lastMessageSenderId: user.uid,
          lastMessageTimestamp: Date.now(),
          updatedAt: Date.now()
        };

        const docRef = await addDoc(collection(db, 'conversations'), newConvData);
        const createdConv: Conversation = { ...newConvData, id: docRef.id };
        setActiveConversation(createdConv);

        // Send initial auto-inquiry message
        await addDoc(collection(db, `conversations/${docRef.id}/messages`), {
          conversationId: docRef.id,
          senderId: user.uid,
          senderName: profile.displayName || 'Buyer',
          senderAvatar: profile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
          receiverId: initialPropertyForChat.ownerId,
          text: `Hello ${initialPropertyForChat.ownerName}, I am interested in your property "${initialPropertyForChat.title}". Is it available?`,
          timestamp: Date.now(),
          isRead: false
        });
      }

      if (onClearInitialProperty) {
        onClearInitialProperty();
      }
    };

    startOrOpenChat();
  }, [initialPropertyForChat, user, profile, conversations]);

  // Listen to messages for active conversation
  useEffect(() => {
    if (!activeConversation) {
      setMessages([]);
      return;
    }
    const messagesRef = collection(db, `conversations/${activeConversation.id}/messages`);
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgList: Message[] = [];
      snapshot.forEach((docSnap) => {
        msgList.push({ id: docSnap.id, ...docSnap.data() } as Message);
      });
      setMessages(msgList);
    }, (error) => {
      console.warn('Messages listener error:', error);
    });
    return () => unsubscribe();
  }, [activeConversation?.id]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || !activeConversation || !user || !profile || isSending) return;

    setIsSending(true);
    setInputText('');
    try {
      const otherParticipantId = activeConversation.participantIds.find(id => id !== user.uid) || 'owner';
      const now = Date.now();

      // Add message document
      await addDoc(collection(db, `conversations/${activeConversation.id}/messages`), {
        conversationId: activeConversation.id,
        senderId: user.uid,
        senderName: profile.displayName || 'User',
        senderAvatar: profile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
        receiverId: otherParticipantId,
        text: text.trim(),
        timestamp: now,
        isRead: false
      });

      // Update parent conversation
      const convRef = doc(db, 'conversations', activeConversation.id);
      await updateDoc(convRef, {
        lastMessage: text.trim(),
        lastMessageSenderId: user.uid,
        lastMessageTimestamp: now,
        updatedAt: now
      });

      // Also create a notification for the receiver
      await addDoc(collection(db, 'notifications'), {
        userId: otherParticipantId,
        title: `New message from ${profile.displayName}`,
        message: text.trim().slice(0, 80),
        type: 'chat',
        read: false,
        createdAt: now
      });

      // Simulated auto-reply from Agent/Owner after 3 seconds for realistic experience!
      if (otherParticipantId.startsWith('agent') || otherParticipantId.startsWith('owner')) {
        setTimeout(async () => {
          const replies = [
            `Hi ${profile.displayName}! Yes, this property is available and we can schedule a tour this week.`,
            `Thank you for reaching out! Let me know if you would like the full brochure and floor plan.`,
            `Hello! The documents are 100% verified. What day works best for a walkthrough?`
          ];
          const autoText = replies[Math.floor(Math.random() * replies.length)];
          const replyTime = Date.now();

          await addDoc(collection(db, `conversations/${activeConversation.id}/messages`), {
            conversationId: activeConversation.id,
            senderId: otherParticipantId,
            senderName: activeConversation.participantNames[otherParticipantId] || 'Host',
            senderAvatar: activeConversation.participantAvatars?.[otherParticipantId] || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherParticipantId}`,
            receiverId: user.uid,
            text: autoText,
            timestamp: replyTime,
            isRead: false
          });

          await updateDoc(convRef, {
            lastMessage: autoText,
            lastMessageSenderId: otherParticipantId,
            lastMessageTimestamp: replyTime,
            updatedAt: replyTime
          });
        }, 2200);
      }
    } catch (err) {
      console.error('Send message error:', err);
    } finally {
      setIsSending(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto my-8 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4">
        <MessageSquare className="w-12 h-12 text-indigo-400 mx-auto" />
        <h3 className="font-bold text-lg text-slate-900">Sign in to Access Housing Chat</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Connect directly with property owners, real estate agents, and verify inquiries in real time.
        </p>
      </div>
    );
  }

  const getOtherParticipantName = (conv: Conversation) => {
    const otherId = conv.participantIds.find(id => id !== user.uid);
    return (otherId && conv.participantNames[otherId]) || 'Property Host';
  };

  const getOtherParticipantAvatar = (conv: Conversation) => {
    const otherId = conv.participantIds.find(id => id !== user.uid);
    return (otherId && conv.participantAvatars?.[otherId]) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherId}`;
  };

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[620px] max-h-[82vh]">
        
        {/* Left: Conversation List (Hidden on mobile if active conversation selected) */}
        <div className={`md:col-span-4 border-r border-slate-200 flex flex-col bg-slate-50/50 ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
          
          <div className="p-4 border-b border-slate-200 bg-white">
            <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              <span>Inquiries & Chats</span>
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Real-time owner & broker messaging</p>
          </div>

          {/* Conversations Scrollable List */}
          <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <Building className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-semibold text-slate-600">No active chats yet</p>
                <p className="text-[11px] text-slate-400">Click &quot;Chat with Owner&quot; on any property card to initiate an inquiry.</p>
              </div>
            ) : (
              conversations.map((conv) => {
                const isSelected = activeConversation?.id === conv.id;
                const otherName = getOtherParticipantName(conv);
                const otherAvatar = getOtherParticipantAvatar(conv);

                return (
                  <button
                    key={conv.id}
                    id={`conversation-item-${conv.id}`}
                    onClick={() => setActiveConversation(conv)}
                    className={`w-full p-3.5 text-left flex items-start gap-3 transition-colors ${
                      isSelected ? 'bg-indigo-50/80 border-l-4 border-indigo-600' : 'hover:bg-white'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={otherAvatar}
                        alt={otherName}
                        className="w-10 h-10 rounded-2xl object-cover border border-slate-200"
                      />
                      {conv.propertyImage && (
                        <img
                          src={conv.propertyImage}
                          alt="prop"
                          className="w-4 h-4 rounded-md object-cover absolute -bottom-1 -right-1 border border-white shadow-xs"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs text-slate-900 truncate">
                          {otherName}
                        </h4>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-indigo-700 truncate">
                        {conv.propertyTitle}
                      </p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {conv.lastMessage}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Active Chat Area */}
        <div className={`md:col-span-8 flex flex-col bg-white ${!activeConversation ? 'hidden md:flex' : 'flex'}`}>
          {activeConversation ? (
            <>
              {/* Chat Header with Property Info Card */}
              <div className="p-3.5 sm:p-4 border-b border-slate-200 bg-white flex items-center justify-between gap-3 shadow-xs">
                
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => setActiveConversation(null)}
                    className="md:hidden p-1 rounded-lg text-slate-500 hover:bg-slate-100"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div
                    onClick={() => {
                      const otherId = activeConversation.participantIds.find(id => id !== user.uid);
                      if (otherId && onViewOwnerProfile) {
                        onViewOwnerProfile({
                          id: otherId,
                          name: getOtherParticipantName(activeConversation),
                          avatar: getOtherParticipantAvatar(activeConversation)
                        });
                      }
                    }}
                    className="flex items-center gap-3 min-w-0 cursor-pointer group/header hover:opacity-90 transition-opacity"
                    title="Click to view host profile & listings"
                  >
                    <img
                      src={getOtherParticipantAvatar(activeConversation)}
                      alt="participant"
                      className="w-10 h-10 rounded-2xl object-cover border border-slate-200 shrink-0 group-hover/header:ring-2 group-hover/header:ring-indigo-500 transition-all"
                    />
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-slate-900 truncate flex items-center gap-1 group-hover/header:text-indigo-600 transition-colors">
                        <span>{getOtherParticipantName(activeConversation)}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400 group-hover/header:text-indigo-600 shrink-0" />
                      </h3>
                      <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>Online • Verified Partner</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Property banner chip inside chat */}
                {activeConversation.propertyTitle && (
                  <div
                    onClick={() => onViewPropertyDetails && onViewPropertyDetails(activeConversation.propertyId)}
                    className="flex items-center gap-2 p-1.5 pr-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 cursor-pointer transition-colors max-w-[240px] truncate"
                  >
                    {activeConversation.propertyImage && (
                      <img
                        src={activeConversation.propertyImage}
                        alt="prop"
                        className="w-7 h-7 rounded-lg object-cover shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-slate-800 truncate">
                        {activeConversation.propertyTitle}
                      </p>
                      <p className="text-[10px] text-indigo-600 font-semibold">
                        {currencySymbol}{activeConversation.propertyPrice?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Messages Thread Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/40">
                {messages.map((msg) => {
                  const isMine = msg.senderId === user.uid;
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isMine && (
                        <img
                          src={msg.senderAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.senderId}`}
                          alt="sender"
                          className="w-6 h-6 rounded-full object-cover shrink-0 border border-slate-200 mb-1"
                        />
                      )}
                      <div
                        className={`max-w-[75%] sm:max-w-md rounded-2xl px-4 py-2.5 text-xs sm:text-sm shadow-xs ${
                          isMine
                            ? 'bg-indigo-600 text-white rounded-br-xs'
                            : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                        }`}
                      >
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        <div
                          className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                            isMine ? 'text-indigo-200' : 'text-slate-400 font-semibold'
                          }`}
                        >
                          <span>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMine && <CheckCheck className="w-3.5 h-3.5 text-indigo-300" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Suggestions Chips */}
              <div className="px-3 pt-2 pb-1 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto scrollbar-none">
                {QUICK_INQUIRIES.map((inq, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(inq)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors"
                  >
                    {inq}
                  </button>
                ))}
              </div>

              {/* Message Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
              >
                <input
                  id="input-chat-message"
                  type="text"
                  placeholder="Type your message or inquiry..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
                <button
                  id="btn-send-message"
                  type="submit"
                  disabled={!inputText.trim() || isSending}
                  className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-2xl shadow-sm transition-all flex items-center justify-center shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-base text-slate-800">Select a Conversation</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Choose an inquiry from the left list or open any property listing to chat directly with verified hosts.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

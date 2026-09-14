import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ChatModal = ({ isOpen, onClose, recipientName = 'Vikram Joshi', recipientId = 2, productId = 1 }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadMessages();
    }
  }, [isOpen, recipientId, productId]);

  const loadMessages = async () => {
    try {
      const data = await api.getMessages(recipientId, productId);
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Failed to load messages', err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const content = inputText.trim();
    setInputText('');
    setLoading(true);

    try {
      const data = await api.sendMessage(recipientId, productId, content);
      if (data.success) {
        setMessages(prev => [...prev, data.message]);
      }
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-primary/60 backdrop-blur-xs">
      <div className="bg-surface-container-lowest rounded-xl max-w-lg w-full h-[85vh] max-h-[520px] shadow-2xl border border-outline-variant flex flex-col justify-between overflow-hidden">
        {/* Chat Header */}
        <div className="p-space-12 px-space-16 bg-primary text-on-primary flex items-center justify-between">
          <div className="flex items-center gap-space-8">
            <div className="relative">
              <span className="w-9 h-9 rounded-full bg-surface-container-highest text-primary font-bold flex items-center justify-center text-badge">
                {recipientName.split(' ').map(n => n[0]).join('')}
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-secondary-fixed absolute bottom-0 right-0 ring-2 ring-primary"></span>
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-label-bold text-label-bold text-on-primary">{recipientName}</span>
                <span className="material-symbols-outlined text-[14px] text-secondary-fixed">verified</span>
              </div>
              <span className="text-[11px] text-secondary-fixed">Aadhaar Verified Lender · Typically replies in &lt;15 mins</span>
            </div>
          </div>
          <button onClick={onClose} className="text-on-primary/70 hover:text-on-primary p-1">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Reassurance Banner */}
        <div className="bg-surface-container-low px-space-12 py-space-6 text-xs text-on-surface-variant flex items-center gap-space-6 border-b border-outline-variant/50">
          <span className="material-symbols-outlined text-[16px] text-secondary">shield</span>
          <span>Contact details are shared automatically upon booking verification.</span>
        </div>

        {/* Message History */}
        <div className="flex-1 p-space-16 overflow-y-auto flex flex-col gap-space-8 bg-surface">
          {messages.map((m) => {
            const isMe = m.sender_id === (user?.id || 1);
            return (
              <div key={m.id} className={`flex flex-col max-w-[80%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                <div className={`p-space-8 px-space-12 rounded-lg text-body-sm shadow-xs ${
                  isMe 
                    ? 'bg-secondary text-on-secondary rounded-br-none' 
                    : 'bg-surface-container-lowest text-on-surface border border-outline-variant/60 rounded-bl-none'
                }`}>
                  <p>{m.content}</p>
                </div>
                <span className="text-[10px] text-on-surface-variant mt-0.5">
                  {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-space-12 bg-surface-container-lowest border-t border-outline-variant flex items-center gap-space-8">
          <input
            type="text"
            placeholder={`Message ${recipientName}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-surface-container-low border border-outline-variant rounded-lg px-space-12 py-space-8 text-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary"
          />
          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className="bg-secondary text-on-secondary px-space-16 py-space-8 rounded-lg font-label-bold flex items-center justify-center hover:bg-secondary/90 disabled:opacity-50 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

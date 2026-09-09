import React from 'react';

export const Toast = ({ message, type = 'success', onClose }) => {
  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-space-12 bg-primary text-on-primary px-space-16 py-space-12 rounded-lg shadow-xl border border-outline/30 animate-bounce-short">
      <span className={`material-symbols-outlined text-[20px] ${isSuccess ? 'text-secondary-fixed' : 'text-error'}`}>
        {isSuccess ? 'check_circle' : 'error'}
      </span>
      <span className="text-body-sm font-label-bold">{message}</span>
      <button 
        onClick={onClose}
        className="text-on-surface-variant hover:text-on-primary ml-space-8"
      >
        <span className="material-symbols-outlined text-[16px]">close</span>
      </button>
    </div>
  );
};

import React from 'react';
import { MessageSquareShare } from 'lucide-react';

interface WhatsAppButtonProps {
  phone?: string;
  message?: string;
  label?: string;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  phone,
  message,
  label = 'Envoyer via WhatsApp',
  onClick,
  size = 'md',
  className = ''
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick();
      return;
    }

    if (phone) {
      // Clean phone number (e.g. remove spaces, plus, parentheses)
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const encodedMsg = message ? encodeURIComponent(message) : '';
      const url = `https://wa.me/${cleanPhone}${encodedMsg ? `?text=${encodedMsg}` : ''}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3.5 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5'
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      style={{ backgroundColor: '#25D366' }}
      className={`inline-flex items-center justify-center font-medium text-white rounded-lg shadow-sm hover:opacity-95 active:scale-[0.98] transition-all duration-150 cursor-pointer whitespace-nowrap ${sizeClasses[size]} ${className}`}
    >
      <MessageSquareShare className="w-4 h-4 shrink-0" />
      <span>{label}</span>
    </button>
  );
};

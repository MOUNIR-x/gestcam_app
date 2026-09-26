import React from 'react';

interface BadgeIAProps {
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const BadgeIA: React.FC<BadgeIAProps> = ({
  label = 'IA GestCam',
  size = 'md',
  className = ''
}) => {
  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-md text-white shadow-xs select-none whitespace-nowrap ${sizeClasses} ${className}`}
      style={{ backgroundColor: '#7C3AED' }}
    >
      <span className="text-[1.1em] leading-none" aria-hidden="true">✦</span>
      <span>{label}</span>
    </span>
  );
};

import React from 'react';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const colorPairs = [
  { bg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 border-blue-200 dark:border-blue-800' },
  { bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800' },
  { bg: 'bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200 border-amber-200 dark:border-amber-800' },
  { bg: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200 border-purple-200 dark:border-purple-800' },
  { bg: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200 border-rose-200 dark:border-rose-800' },
  { bg: 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-200 border-teal-200 dark:border-teal-800' },
  { bg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800' }
];

export const Avatar: React.FC<AvatarProps> = ({ name, size = 'md', className = '' }) => {
  // Deterministic color hash based on the name string
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % colorPairs.length;
  const colorStyle = colorPairs[colorIndex].bg;

  // Extract initials (up to 2 letters)
  const parts = (name || 'GC').trim().split(/\s+/);
  const initials = parts.length > 1
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs font-semibold',
    md: 'w-9 h-9 text-sm font-semibold',
    lg: 'w-11 h-11 text-base font-bold',
    xl: 'w-14 h-14 text-lg font-bold'
  };

  return (
    <div
      title={name}
      className={`inline-flex items-center justify-center rounded-full border select-none shrink-0 tracking-tight transition-transform hover:scale-105 ${sizeClasses[size]} ${colorStyle} ${className}`}
    >
      {initials}
    </div>
  );
};

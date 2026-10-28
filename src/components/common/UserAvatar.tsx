import React, { useState } from 'react';

interface UserAvatarProps {
  src?: string | null;
  name?: string;
  user?: { name: string; avatar?: string | null; id?: string; [key: string]: any };
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showOnlineStatus?: boolean;
}

export const getInitials = (fullName: string): string => {
  if (!fullName || typeof fullName !== 'string') return 'U';
  const parts = fullName.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const isDefaultAvatar = (src?: string | null): boolean => {
  if (!src || typeof src !== 'string') return true;
  const trimmed = src.trim();
  if (trimmed.length === 0) return true;
  // Stock placeholders from Unsplash or placeholder services are considered default
  if (trimmed.includes('images.unsplash.com') || trimmed.includes('ui-avatars.com')) {
    return true;
  }
  return false;
};

const AVATAR_PALETTES = [
  'bg-linear-to-br from-blue-600 to-indigo-700 text-white',
  'bg-linear-to-br from-emerald-600 to-teal-700 text-white',
  'bg-linear-to-br from-violet-600 to-purple-800 text-white',
  'bg-linear-to-br from-amber-500 to-orange-600 text-white',
  'bg-linear-to-br from-rose-500 to-pink-700 text-white',
  'bg-linear-to-br from-sky-500 to-blue-700 text-white',
  'bg-linear-to-br from-indigo-500 to-violet-700 text-white',
  'bg-linear-to-br from-teal-500 to-emerald-700 text-white',
];

const getPaletteForName = (name: string): string => {
  if (!name) return AVATAR_PALETTES[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_PALETTES.length;
  return AVATAR_PALETTES[index];
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name,
  user,
  className = '',
  size = 'md',
  showOnlineStatus = false
}) => {
  const [hasError, setHasError] = useState(false);

  const resolvedName = name || user?.name || 'User';
  const resolvedSrc = src !== undefined ? src : user?.avatar;

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-7 h-7 text-[11px]',
    md: 'w-9 h-9 text-xs',
    lg: 'w-11 h-11 text-sm',
    xl: 'w-16 h-16 text-lg',
  };

  const initials = getInitials(resolvedName);
  const isDefault = isDefaultAvatar(resolvedSrc);
  const palette = getPaletteForName(resolvedName);

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      {!isDefault && !hasError && resolvedSrc ? (
        <img
          src={resolvedSrc}
          alt={resolvedName}
          onError={() => setHasError(true)}
          className={`${sizeClasses[size]} rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-xs`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-full ${palette} font-bold flex items-center justify-center border border-white/20 shadow-xs select-none tracking-tight shrink-0`}
          title={resolvedName}
        >
          <span>{initials}</span>
        </div>
      )}

      {showOnlineStatus && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
      )}
    </div>
  );
};

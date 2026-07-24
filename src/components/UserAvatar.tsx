import React, { useState } from 'react';
import { User } from 'lucide-react';

interface UserAvatarProps {
  src?: string;
  name: string;
  className?: string;
  sizeClass?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name,
  className = '',
  sizeClass = 'w-9 h-9 text-xs',
}) => {
  const [imgError, setImgError] = useState(false);

  // Get initials from name (e.g. Geraldo Vance -> GV)
  const getInitials = (str: string) => {
    if (!str) return 'SG';
    const parts = str.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0] ? parts[0].substring(0, 2).toUpperCase() : 'SG';
  };

  const hasPhoto = Boolean(src && src.trim() && src.startsWith('http') && !imgError);

  if (hasPhoto) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setImgError(true)}
        className={`${sizeClass} rounded-xl object-cover border border-[#27272A] shrink-0 bg-[#18181B] ${className}`}
      />
    );
  }

  // Fallback Lightweight Initial Avatar Badge
  return (
    <div
      className={`${sizeClass} rounded-xl bg-gradient-to-br from-[#27272A] to-[#18181B] border border-[#3F3F46] text-amber-400 font-bold font-mono flex items-center justify-center shrink-0 uppercase tracking-wider select-none shadow-inner ${className}`}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
};

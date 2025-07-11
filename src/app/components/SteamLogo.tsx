interface SteamLogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const SteamLogo: React.FC<SteamLogoProps> = ({ 
  size = 'medium', 
  className = '' 
}) => {
  const sizeClasses = {
    small: 'w-24 h-24',
    medium: 'w-48 h-48',
    large: 'w-96 h-96'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg
        viewBox="0 0 256 256"
        className="w-full h-full"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="128" cy="128" r="128" fill="#171a21" />
        <path
          d="M128 32C71.78 32 26 77.78 26 134c0 56.22 45.78 102 102 102 56.22 0 102-45.78 102-102C230 77.78 184.22 32 128 32zm-24 152c-13.25 0-24-10.75-24-24s10.75-24 24-24 24 10.75 24 24-10.75 24-24 24zm56-32c-17.67 0-32-14.33-32-32s14.33-32 32-32 32 14.33 32 32-14.33 32-32 32z"
          fill="#66c0f4"
        />
        <circle cx="104" cy="160" r="16" fill="#171a21" />
        <circle cx="160" cy="120" r="20" fill="#171a21" />
      </svg>
    </div>
  );
}; 
interface SteamLogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const SteamLogo: React.FC<SteamLogoProps> = ({ 
  size = 'medium', 
  className = '' 
}) => {
  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-32 h-32',
    large: 'w-[400px] h-[400px]'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} flex items-center justify-center`}>
      <svg
        viewBox="0 0 256 256"
        className="w-full h-full drop-shadow-lg"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background Circle with Gradient */}
        <defs>
          <linearGradient id="steamGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1b2838" />
            <stop offset="50%" stopColor="#2a475e" />
            <stop offset="100%" stopColor="#66c0f4" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <circle 
          cx="128" 
          cy="128" 
          r="128" 
          fill="url(#steamGradient)"
          filter="url(#glow)"
        />
        
        {/* Steam Logo Elements */}
        <g opacity="0.9">
          {/* Large gear/circle */}
          <circle 
            cx="160" 
            cy="120" 
            r="32" 
            fill="#66c0f4" 
            stroke="#ffffff" 
            strokeWidth="2"
            opacity="0.8"
          />
          <circle 
            cx="160" 
            cy="120" 
            r="20" 
            fill="#1b2838"
          />
          
          {/* Small gear/circle */}
          <circle 
            cx="104" 
            cy="160" 
            r="24" 
            fill="#66c0f4" 
            stroke="#ffffff" 
            strokeWidth="2"
            opacity="0.8"
          />
          <circle 
            cx="104" 
            cy="160" 
            r="16" 
            fill="#1b2838"
          />
          
          {/* Connecting elements */}
          <path
            d="M132 144 L136 136"
            stroke="#66c0f4"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.7"
          />
        </g>
      </svg>
    </div>
  );
}; 
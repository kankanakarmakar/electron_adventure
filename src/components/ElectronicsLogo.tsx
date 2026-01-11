import React from 'react';

interface ElectronicsLogoProps {
  size?: number;
  className?: string;
  animated?: boolean;
}

const ElectronicsLogo: React.FC<ElectronicsLogoProps> = ({ 
  size = 400, 
  className = '',
  animated = true 
}) => {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Intense glow effect backdrop */}
      <div 
        className="absolute inset-0 blur-[80px] opacity-60"
        style={{
          background: 'radial-gradient(circle, hsl(270, 100%, 70%) 0%, hsl(280, 80%, 50%) 30%, transparent 60%)',
        }}
      />
      
      <svg
        viewBox="0 0 400 400"
        width={size}
        height={size}
        className="relative z-10"
        style={{ filter: 'drop-shadow(0 0 40px hsla(270, 100%, 70%, 0.8))' }}
      >
        <defs>
          {/* Neon Purple Gradient */}
          <linearGradient id="neonPurple" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(290, 100%, 85%)" />
            <stop offset="50%" stopColor="hsl(270, 100%, 70%)" />
            <stop offset="100%" stopColor="hsl(250, 100%, 60%)" />
          </linearGradient>

          {/* White Core Gradient */}
          <linearGradient id="whiteCore" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(0, 0%, 100%)" />
            <stop offset="50%" stopColor="hsl(270, 50%, 95%)" />
            <stop offset="100%" stopColor="hsl(280, 100%, 90%)" />
          </linearGradient>

          {/* Metallic Silver Gradient */}
          <linearGradient id="metalSilver" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(270, 20%, 85%)" />
            <stop offset="30%" stopColor="hsl(0, 0%, 98%)" />
            <stop offset="50%" stopColor="hsl(270, 15%, 75%)" />
            <stop offset="70%" stopColor="hsl(0, 0%, 90%)" />
            <stop offset="100%" stopColor="hsl(270, 20%, 65%)" />
          </linearGradient>

          {/* Metallic Copper with Purple tint */}
          <linearGradient id="metalCopper" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(280, 50%, 60%)" />
            <stop offset="30%" stopColor="hsl(25, 70%, 70%)" />
            <stop offset="50%" stopColor="hsl(280, 40%, 50%)" />
            <stop offset="70%" stopColor="hsl(30, 65%, 60%)" />
            <stop offset="100%" stopColor="hsl(270, 40%, 45%)" />
          </linearGradient>

          {/* Hexagon Frame with glass effect */}
          <linearGradient id="hexFrame" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsla(270, 50%, 30%, 0.9)" />
            <stop offset="25%" stopColor="hsla(280, 40%, 20%, 0.95)" />
            <stop offset="50%" stopColor="hsla(270, 60%, 35%, 0.85)" />
            <stop offset="75%" stopColor="hsla(260, 40%, 18%, 0.95)" />
            <stop offset="100%" stopColor="hsla(270, 50%, 15%, 0.9)" />
          </linearGradient>

          {/* Resistor Body */}
          <linearGradient id="resistorBody" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(35, 50%, 55%)" />
            <stop offset="50%" stopColor="hsl(35, 60%, 40%)" />
            <stop offset="100%" stopColor="hsl(35, 50%, 50%)" />
          </linearGradient>

          {/* Capacitor Gradient */}
          <linearGradient id="capacitorBody" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(270, 40%, 25%)" />
            <stop offset="30%" stopColor="hsl(280, 45%, 35%)" />
            <stop offset="70%" stopColor="hsl(270, 45%, 32%)" />
            <stop offset="100%" stopColor="hsl(260, 40%, 22%)" />
          </linearGradient>

          {/* Intense Glow Filter */}
          <filter id="neonGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Super Strong Glow */}
          <filter id="strongGlow" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Pulse Animation for traces */}
          <filter id="pulseGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="5" result="blur">
              {animated && (
                <animate attributeName="stdDeviation" values="3;6;3" dur="2s" repeatCount="indefinite" />
              )}
            </feGaussianBlur>
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* 3D Shadow */}
          <filter id="shadow3d" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="hsl(270, 50%, 10%)" floodOpacity="0.6" />
          </filter>
        </defs>

        {/* Hexagon Frame - No circular background */}
        <polygon
          points="200,25 350,95 350,225 200,295 50,225 50,95"
          fill="url(#hexFrame)"
          stroke="url(#neonPurple)"
          strokeWidth="5"
          filter="url(#shadow3d)"
        />

        {/* Inner Hexagon glow line */}
        <polygon
          points="200,45 330,105 330,215 200,275 70,215 70,105"
          fill="hsla(260, 50%, 8%, 0.6)"
          stroke="url(#neonPurple)"
          strokeWidth="1.5"
          opacity="0.7"
        />

        {/* Circuit Traces - Animated Neon Lines */}
        <g filter="url(#pulseGlow)">
          {/* Horizontal center trace */}
          <path
            d="M 90 160 L 175 160 L 200 135 L 225 160 L 310 160"
            fill="none"
            stroke="url(#neonPurple)"
            strokeWidth="3"
            strokeLinecap="round"
          >
            {animated && (
              <animate attributeName="stroke-opacity" values="0.7;1;0.7" dur="1.5s" repeatCount="indefinite" />
            )}
          </path>
          {/* Vertical traces */}
          <line x1="140" y1="95" x2="140" y2="225" stroke="url(#neonPurple)" strokeWidth="3" strokeLinecap="round">
            {animated && (
              <animate attributeName="stroke-opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
            )}
          </line>
          <line x1="260" y1="95" x2="260" y2="225" stroke="url(#neonPurple)" strokeWidth="3" strokeLinecap="round">
            {animated && (
              <animate attributeName="stroke-opacity" values="0.6;1;0.6" dur="2s" begin="0.5s" repeatCount="indefinite" />
            )}
          </line>
          {/* Curved traces */}
          <path
            d="M 140 95 Q 170 70 200 70 Q 230 70 260 95"
            fill="none"
            stroke="url(#neonPurple)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M 140 225 Q 170 250 200 250 Q 230 250 260 225"
            fill="none"
            stroke="url(#neonPurple)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>

        {/* RESISTOR - Top Left */}
        <g transform="translate(102, 112)" filter="url(#shadow3d)">
          {/* Leads */}
          <rect x="-18" y="8" width="18" height="4" fill="url(#metalSilver)" />
          <rect x="50" y="8" width="18" height="4" fill="url(#metalSilver)" />
          
          {/* Body */}
          <rect x="0" y="0" width="50" height="20" rx="4" fill="url(#resistorBody)" />
          
          {/* Color Bands */}
          <rect x="7" y="0" width="6" height="20" fill="hsl(30, 80%, 45%)" rx="1" />
          <rect x="16" y="0" width="6" height="20" fill="hsl(0, 0%, 10%)" rx="1" />
          <rect x="25" y="0" width="6" height="20" fill="hsl(50, 90%, 55%)" rx="1" />
          <rect x="36" y="0" width="6" height="20" fill="hsl(35, 70%, 60%)" rx="1" />
          
          {/* 3D Highlight */}
          <rect x="0" y="0" width="50" height="6" rx="4" fill="hsla(0, 0%, 100%, 0.25)" />
          
          {/* Neon outline glow */}
          <rect x="-3" y="-3" width="56" height="26" rx="6" fill="none" stroke="url(#neonPurple)" strokeWidth="2" filter="url(#neonGlow)" />
        </g>

        {/* INDUCTOR - Top Right */}
        <g transform="translate(248, 102)" filter="url(#shadow3d)">
          {/* Leads */}
          <rect x="-12" y="16" width="12" height="4" fill="url(#metalSilver)" />
          <rect x="50" y="16" width="12" height="4" fill="url(#metalSilver)" />
          
          {/* Coil */}
          <g fill="none" stroke="url(#metalCopper)" strokeWidth="5" strokeLinecap="round">
            <path d="M 0 18 Q 6 4, 12 18 Q 18 32, 24 18 Q 30 4, 36 18 Q 42 32, 48 18" />
          </g>
          
          {/* Coil Highlights */}
          <g fill="none" stroke="hsla(280, 60%, 85%, 0.5)" strokeWidth="2" strokeLinecap="round">
            <path d="M 2 14 Q 7 6, 12 14" />
            <path d="M 14 14 Q 19 6, 24 14" />
            <path d="M 26 14 Q 31 6, 36 14" />
            <path d="M 38 14 Q 43 6, 48 14" />
          </g>
          
          {/* Neon glow */}
          <ellipse cx="25" cy="18" rx="32" ry="18" fill="none" stroke="url(#neonPurple)" strokeWidth="2" filter="url(#neonGlow)" />
        </g>

        {/* CAPACITOR - Bottom Left */}
        <g transform="translate(102, 185)" filter="url(#shadow3d)">
          {/* Leads */}
          <rect x="-12" y="13" width="14" height="4" fill="url(#metalSilver)" />
          <rect x="48" y="13" width="14" height="4" fill="url(#metalSilver)" />
          
          {/* Capacitor Body - Cylindrical */}
          <ellipse cx="5" cy="15" rx="5" ry="15" fill="url(#capacitorBody)" />
          <rect x="5" y="0" width="40" height="30" fill="url(#capacitorBody)" />
          <ellipse cx="45" cy="15" rx="5" ry="15" fill="hsl(270, 40%, 40%)" />
          
          {/* Stripe */}
          <rect x="38" y="0" width="5" height="30" fill="hsl(270, 30%, 85%)" />
          
          {/* Minus sign */}
          <rect x="10" y="13" width="9" height="3" fill="hsl(0, 0%, 85%)" />
          
          {/* Plus sign */}
          <rect x="22" y="13" width="9" height="3" fill="hsl(0, 0%, 85%)" />
          <rect x="25" y="10" width="3" height="9" fill="hsl(0, 0%, 85%)" />
          
          {/* 3D Highlight */}
          <rect x="5" y="0" width="40" height="7" fill="hsla(0, 0%, 100%, 0.2)" />
          
          {/* Neon glow */}
          <rect x="-2" y="-3" width="54" height="36" rx="6" fill="none" stroke="url(#neonPurple)" strokeWidth="2" filter="url(#neonGlow)" />
        </g>

        {/* PN JUNCTION DIODE - Bottom Right */}
        <g transform="translate(248, 188)" filter="url(#shadow3d)">
          {/* Leads */}
          <rect x="-18" y="11" width="20" height="5" fill="url(#metalSilver)" />
          <rect x="48" y="11" width="20" height="5" fill="url(#metalSilver)" />
          
          {/* Diode Body */}
          <rect x="2" y="3" width="46" height="20" rx="3" fill="hsl(260, 35%, 18%)" />
          
          {/* Triangle (Anode) */}
          <polygon points="10,13 32,3 32,23" fill="url(#metalSilver)" />
          
          {/* Bar (Cathode) */}
          <rect x="34" y="3" width="10" height="20" fill="url(#metalSilver)" />
          <rect x="38" y="3" width="4" height="20" fill="hsl(270, 20%, 70%)" />
          
          {/* Junction Glow - Intense Neon Purple */}
          <line x1="32" y1="3" x2="32" y2="23" stroke="hsl(280, 100%, 75%)" strokeWidth="5" filter="url(#strongGlow)">
            {animated && (
              <animate attributeName="stroke-opacity" values="0.8;1;0.8" dur="1s" repeatCount="indefinite" />
            )}
          </line>
          
          {/* 3D Highlight */}
          <rect x="2" y="3" width="46" height="5" rx="3" fill="hsla(0, 0%, 100%, 0.15)" />
          
          {/* Neon outline */}
          <rect x="-2" y="0" width="54" height="26" rx="5" fill="none" stroke="url(#neonPurple)" strokeWidth="2" filter="url(#neonGlow)" />
        </g>

        {/* Center Connection Node - Pulsing */}
        <g filter="url(#strongGlow)">
          <circle cx="200" cy="160" r="12" fill="hsl(270, 100%, 70%)">
            {animated && (
              <animate attributeName="r" values="10;14;10" dur="2s" repeatCount="indefinite" />
            )}
          </circle>
          <circle cx="200" cy="160" r="6" fill="url(#whiteCore)">
            {animated && (
              <animate attributeName="r" values="5;7;5" dur="2s" repeatCount="indefinite" />
            )}
          </circle>
        </g>

        {/* Corner accent dots - Pulsing */}
        <g filter="url(#strongGlow)">
          <circle cx="200" cy="55" r="6" fill="url(#neonPurple)">
            {animated && <animate attributeName="opacity" values="0.7;1;0.7" dur="1.5s" repeatCount="indefinite" />}
          </circle>
          <circle cx="200" cy="265" r="6" fill="url(#neonPurple)">
            {animated && <animate attributeName="opacity" values="0.7;1;0.7" dur="1.5s" begin="0.3s" repeatCount="indefinite" />}
          </circle>
          <circle cx="80" cy="160" r="6" fill="url(#neonPurple)">
            {animated && <animate attributeName="opacity" values="0.7;1;0.7" dur="1.5s" begin="0.6s" repeatCount="indefinite" />}
          </circle>
          <circle cx="320" cy="160" r="6" fill="url(#neonPurple)">
            {animated && <animate attributeName="opacity" values="0.7;1;0.7" dur="1.5s" begin="0.9s" repeatCount="indefinite" />}
          </circle>
        </g>

        {/* Rotating outer particles */}
        <g filter="url(#neonGlow)">
          <circle cx="200" cy="15" r="3" fill="hsl(280, 100%, 80%)">
            {animated && (
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 200 160"
                to="360 200 160"
                dur="15s"
                repeatCount="indefinite"
              />
            )}
          </circle>
          <circle cx="200" cy="305" r="3" fill="hsl(260, 100%, 80%)">
            {animated && (
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="180 200 160"
                to="540 200 160"
                dur="20s"
                repeatCount="indefinite"
              />
            )}
          </circle>
        </g>

      </svg>
    </div>
  );
};

export default ElectronicsLogo;

import React from 'react';

function Logo({ className = '', size = 40 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer ring */}
      <circle cx="50" cy="50" r="46" stroke="url(#logoGrad)" strokeWidth="6" />
      {/* Inner ring */}
      <circle cx="50" cy="50" r="32" stroke="url(#logoGrad)" strokeWidth="3" opacity="0.6" />
      {/* Center dot */}
      <circle cx="50" cy="50" r="12" fill="url(#logoGrad)" />
      {/* Crosshair lines */}
      <line x1="50" y1="18" x2="50" y2="36" stroke="url(#logoGrad)" strokeWidth="3" strokeLinecap="round" />
      <line x1="50" y1="64" x2="50" y2="82" stroke="url(#logoGrad)" strokeWidth="3" strokeLinecap="round" />
      <line x1="18" y1="50" x2="36" y2="50" stroke="url(#logoGrad)" strokeWidth="3" strokeLinecap="round" />
      <line x1="64" y1="50" x2="82" y2="50" stroke="url(#logoGrad)" strokeWidth="3" strokeLinecap="round" />
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="100" y2="100">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#F7931A" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default Logo;

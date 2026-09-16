/**
 * Brand assets and emblems for Shree Swami Samarth Seva Marg - Swayamrojgar Vibhag
 */

// Official Circular Seal SVG (Emblem with golden halo, sacred sun rays and seva marg insignia)
export const LOGO_SEAL = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <radialGradient id="sealBg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFFDF7" />
      <stop offset="70%" stop-color="#FFF5E5" />
      <stop offset="100%" stop-color="#FFE7BA" />
    </radialGradient>
    <linearGradient id="goldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFB020" />
      <stop offset="50%" stop-color="#E23E77" />
      <stop offset="100%" stop-color="#6D4AFF" />
    </linearGradient>
    <linearGradient id="sunGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FF6B4A" />
      <stop offset="100%" stop-color="#FFB020" />
    </linearGradient>
  </defs>

  <!-- Outer Ring -->
  <circle cx="60" cy="60" r="57" fill="url(#sealBg)" stroke="url(#goldBorder)" stroke-width="3.5" />
  <circle cx="60" cy="60" r="51" fill="none" stroke="#6D4AFF" stroke-width="1" stroke-dasharray="2,2" opacity="0.6" />

  <!-- Sun Rays Radiance -->
  <g transform="translate(60,60)">
    <g opacity="0.85">
      ${Array.from({ length: 16 }).map((_, i) => `<line x1="0" y1="-44" x2="0" y2="-49" stroke="#FFB020" stroke-width="2" stroke-linecap="round" transform="rotate(${i * 22.5})" />`).join('')}
    </g>
  </g>

  <!-- Inner Sacred Ring -->
  <circle cx="60" cy="60" r="38" fill="#FFFFFF" stroke="#FFB020" stroke-width="1.8" filter="drop-shadow(0 2px 4px rgba(27,17,80,0.1))" />

  <!-- Sacred Saffron Paduka / Lotus Base -->
  <path d="M44 68 C44 58, 52 50, 60 50 C68 50, 76 58, 76 68 C76 74, 69 77, 60 77 C51 77, 44 74, 44 68 Z" fill="url(#sunGrad)" opacity="0.15" />

  <!-- Aum (ॐ) Emblem in Center -->
  <text x="60" y="65" font-family="'Plus Jakarta Sans', serif" font-size="24" font-weight="bold" fill="#6D4AFF" text-anchor="middle" dominant-baseline="central">ॐ</text>

  <!-- Divine Ray Petals -->
  <circle cx="60" cy="42" r="3" fill="#FF6B4A" />
  <circle cx="43" cy="53" r="2.5" fill="#FFB020" />
  <circle cx="77" cy="53" r="2.5" fill="#FFB020" />

  <!-- Banner Arc Indicator -->
  <path d="M30 84 Q60 96 90 84" fill="none" stroke="#1B1150" stroke-width="2" stroke-linecap="round" />
  <text x="60" y="93" font-family="'Plus Jakarta Sans', sans-serif" font-size="7.5" font-weight="800" fill="#1B1150" text-anchor="middle">श्री स्वामी समर्थ</text>
  <text x="60" y="102" font-family="'Plus Jakarta Sans', sans-serif" font-size="6" font-weight="700" fill="#6D4AFF" text-anchor="middle" letter-spacing="0.5">दिंडोरी प्रणीत</text>
</svg>
`)}`;

export const KRISHIDHAN_LOGO = '';
export const SATVIK_MART_LOGO = '';

"use client";

/**
 * Premium SVG Chess Pieces
 * High-quality vector chess pieces with gradients and shadows
 */

const SVG_PIECES = {
  // White King
  wk: (
    <svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wk-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="100%" stopColor="#e8dcc8" />
        </linearGradient>
      </defs>
      <g fill="url(#wk-grad)" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M 22.5,11.63 L 22.5,6" strokeLinejoin="miter" />
        <path d="M 20,8 L 25,8" strokeLinejoin="miter" />
        <path d="M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 25.5,14.5 24.5,12 22.5,12 C 20.5,12 19.5,14.5 19.5,14.5 C 18,17.5 22.5,25 22.5,25" fill="url(#wk-grad)" stroke="#333" />
        <path d="M 12.5,37 C 18,40.5 27,40.5 32.5,37 L 32.5,30 C 32.5,30 41.5,25.5 38.5,19.5 C 34.5,13 25,16 22.5,23.5 L 22.5,27 L 22.5,23.5 C 19,16 9.5,13 6.5,19.5 C 3.5,25.5 12.5,30 12.5,30 L 12.5,37" fill="url(#wk-grad)" stroke="#333" />
        <path d="M 12.5,30 C 18,27 27,27 32.5,30" fill="none" stroke="#333" />
        <path d="M 12.5,33.5 C 18,30.5 27,30.5 32.5,33.5" fill="none" stroke="#333" />
        <path d="M 12.5,37 C 18,34 27,34 32.5,37" fill="none" stroke="#333" />
      </g>
    </svg>
  ),

  // White Queen
  wq: (
    <svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wq-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="100%" stopColor="#e8dcc8" />
        </linearGradient>
      </defs>
      <g fill="url(#wq-grad)" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="12" r="2.75" />
        <circle cx="14" cy="9" r="2.75" />
        <circle cx="22.5" cy="8" r="2.75" />
        <circle cx="31" cy="9" r="2.75" />
        <circle cx="39" cy="12" r="2.75" />
        <path d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38.5,13.5 L 31,25 L 30.7,10.9 L 25.5,24.5 L 22.5,10 L 19.5,24.5 L 14.3,10.9 L 14,25 L 6.5,13.5 L 9,26 z" strokeLinecap="butt" />
        <path d="M 9,26 C 9,28 10.5,28.5 12.5,30 C 14.5,31.5 16.5,31 16.5,30.5 C 16.5,30 12.5,30 12.5,31 C 12.5,31.5 20.5,32 22.5,32 C 24.5,32 32.5,31.5 32.5,31 C 32.5,30 28.5,30 28.5,30.5 C 28.5,31 30.5,31.5 32.5,30 C 34.5,28.5 36,28 36,26" strokeLinecap="butt" />
        <path d="M 12.5,37 C 18,40.5 27,40.5 32.5,37 L 32.5,30 C 32.5,30 28.5,30 28.5,30.5 C 28.5,31 30.5,31.5 32.5,30 C 34.5,28.5 36,28 36,26 C 27,24 18,24.5 9,26 C 9,28 10.5,28.5 12.5,30 C 14.5,31.5 16.5,31 16.5,30.5 C 16.5,30 12.5,30 12.5,30 L 12.5,37" fill="none" stroke="#333" />
        <path d="M 12.5,33.5 C 18,30.5 27,30.5 32.5,33.5" fill="none" stroke="#333" />
        <path d="M 12.5,37 C 18,34 27,34 32.5,37" fill="none" stroke="#333" />
      </g>
    </svg>
  ),

  // White Rook
  wr: (
    <svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wr-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="100%" stopColor="#e8dcc8" />
        </linearGradient>
      </defs>
      <g fill="url(#wr-grad)" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M 9,39 L 36,39 L 36,36 L 9,36 L 9,39 z" />
        <path d="M 12.5,32 L 14,29.5 L 31,29.5 L 32.5,32 L 12.5,32 z" />
        <path d="M 12,36 L 12,32 L 33,32 L 33,36 L 12,36 z" />
        <path d="M 14,29.5 L 14,16.5 L 31,16.5 L 31,29.5 L 14,29.5 z" />
        <path d="M 14,16.5 L 11,14 L 34,14 L 31,16.5 L 14,16.5 z" />
        <path d="M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14 L 11,14 z" />
        <path d="M 12,35.5 L 33,35.5 L 33,35.5" fill="none" stroke="#333" strokeLinejoin="miter" />
        <path d="M 13,31.5 L 32,31.5" fill="none" stroke="#333" strokeLinejoin="miter" />
        <path d="M 14,29.5 L 31,29.5" fill="none" stroke="#333" strokeLinejoin="miter" />
        <path d="M 14,16.5 L 31,16.5" fill="none" stroke="#333" />
        <path d="M 11,14 L 34,14" fill="none" stroke="#333" />
      </g>
    </svg>
  ),

  // White Bishop
  wb: (
    <svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wb-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="100%" stopColor="#e8dcc8" />
        </linearGradient>
      </defs>
      <g fill="url(#wb-grad)" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <g fill="none" strokeLinecap="butt">
          <path d="M 9,36 C 12.39,35.03 19.11,36.43 22.5,34 C 25.89,36.43 32.61,35.03 36,36" />
          <path d="M 15,32 C 17.5,34.5 27.5,34.5 30,32" />
          <path d="M 25,8 a 2.5,2.5 0 1 1 -5,0 a 2.5,2.5 0 1 1 5,0" fill="url(#wb-grad)" />
        </g>
        <path d="M 15,32 C 17,28 19,22 22.5,16 C 26,22 28,28 30,32 C 25.5,34.5 19.5,34.5 15,32 z" fill="url(#wb-grad)" stroke="#333" />
        <path d="M 9,36 L 36,36 C 36,36 37.5,38.5 34,38.5 C 30.5,38.5 14.5,38.5 11,38.5 C 7.5,38.5 9,36 9,36 z" fill="url(#wb-grad)" stroke="#333" />
        <path d="M 17.5,26 L 27.5,26 M 15,30 L 30,30 M 22.5,15.5 L 22.5,20.5" fill="none" stroke="#333" strokeLinejoin="miter" />
      </g>
    </svg>
  ),

  // White Knight
  wn: (
    <svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wn-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="100%" stopColor="#e8dcc8" />
        </linearGradient>
      </defs>
      <g fill="url(#wn-grad)" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18" fill="url(#wn-grad)" stroke="#333" />
        <path d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,7.5 C 14.5,6.5 16.5,10 16.5,10 L 18.5,10 C 18.5,10 19.28,8.008 21,7 C 22,7 22,10 22,10" fill="url(#wn-grad)" stroke="#333" />
        <circle cx="12" cy="25" r="1" fill="#333" stroke="none" />
        <path d="M 9.5,25.5 A 0.5,1.5 0 0 0 8.5,26.5 A 0.5,1.5 0 0 0 9.5,27.5 A 0.5,1.5 0 0 0 10.5,26.5 A 0.5,1.5 0 0 0 9.5,25.5 z" fill="#333" stroke="#333" />
      </g>
    </svg>
  ),

  // White Pawn
  wp: (
    <svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wp-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="100%" stopColor="#e8dcc8" />
        </linearGradient>
      </defs>
      <path d="M 22.5,9 C 19.79,9 17.609,11.209 17.609,13.883 C 17.609,15.193 18.153,16.362 19.02,17.209 C 16.109,18.291 14,21.014 14,24.258 C 14,25.668 14.403,26.988 15.098,28.121 C 13.173,29.395 10.5,31.02 10.5,33.258 C 10.5,36.062 16.09,38.227 22.5,38.227 C 28.91,38.227 34.5,36.062 34.5,33.258 C 34.5,31.02 31.827,29.395 29.902,28.121 C 30.597,26.988 31,25.668 31,24.258 C 31,21.014 28.891,18.291 25.98,17.209 C 26.847,16.362 27.391,15.193 27.391,13.883 C 27.391,11.209 25.21,9 22.5,9 z" fill="url(#wp-grad)" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),

  // Black King
  bk: (
    <svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bk-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#555" />
          <stop offset="100%" stopColor="#1a1a1a" />
        </linearGradient>
      </defs>
      <g fill="url(#bk-grad)" stroke="#c8a84e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M 22.5,11.63 L 22.5,6" stroke="#c8a84e" strokeLinejoin="miter" />
        <path d="M 20,8 L 25,8" stroke="#c8a84e" strokeLinejoin="miter" />
        <path d="M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 25.5,14.5 24.5,12 22.5,12 C 20.5,12 19.5,14.5 19.5,14.5 C 18,17.5 22.5,25 22.5,25" />
        <path d="M 12.5,37 C 18,40.5 27,40.5 32.5,37 L 32.5,30 C 32.5,30 41.5,25.5 38.5,19.5 C 34.5,13 25,16 22.5,23.5 L 22.5,27 L 22.5,23.5 C 19,16 9.5,13 6.5,19.5 C 3.5,25.5 12.5,30 12.5,30 L 12.5,37" />
        <path d="M 12.5,30 C 18,27 27,27 32.5,30" fill="none" stroke="#c8a84e" />
        <path d="M 12.5,33.5 C 18,30.5 27,30.5 32.5,33.5" fill="none" stroke="#c8a84e" />
        <path d="M 12.5,37 C 18,34 27,34 32.5,37" fill="none" stroke="#c8a84e" />
      </g>
    </svg>
  ),

  // Black Queen
  bq: (
    <svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bq-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#555" />
          <stop offset="100%" stopColor="#1a1a1a" />
        </linearGradient>
      </defs>
      <g fill="url(#bq-grad)" stroke="#c8a84e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="12" r="2.75" stroke="#c8a84e" />
        <circle cx="14" cy="9" r="2.75" stroke="#c8a84e" />
        <circle cx="22.5" cy="8" r="2.75" stroke="#c8a84e" />
        <circle cx="31" cy="9" r="2.75" stroke="#c8a84e" />
        <circle cx="39" cy="12" r="2.75" stroke="#c8a84e" />
        <path d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38.5,13.5 L 31,25 L 30.7,10.9 L 25.5,24.5 L 22.5,10 L 19.5,24.5 L 14.3,10.9 L 14,25 L 6.5,13.5 L 9,26 z" strokeLinecap="butt" />
        <path d="M 9,26 C 9,28 10.5,28.5 12.5,30 C 14.5,31.5 16.5,31 16.5,30.5 C 16.5,30 12.5,30 12.5,31 C 12.5,31.5 20.5,32 22.5,32 C 24.5,32 32.5,31.5 32.5,31 C 32.5,30 28.5,30 28.5,30.5 C 28.5,31 30.5,31.5 32.5,30 C 34.5,28.5 36,28 36,26" strokeLinecap="butt" />
        <path d="M 12.5,37 C 18,40.5 27,40.5 32.5,37 L 32.5,30 C 32.5,30 28.5,30 28.5,30.5 C 28.5,31 30.5,31.5 32.5,30 C 34.5,28.5 36,28 36,26 C 27,24 18,24.5 9,26 C 9,28 10.5,28.5 12.5,30 C 14.5,31.5 16.5,31 16.5,30.5 C 16.5,30 12.5,30 12.5,30 L 12.5,37" fill="none" stroke="#c8a84e" />
        <path d="M 12.5,33.5 C 18,30.5 27,30.5 32.5,33.5" fill="none" stroke="#c8a84e" />
        <path d="M 12.5,37 C 18,34 27,34 32.5,37" fill="none" stroke="#c8a84e" />
      </g>
    </svg>
  ),

  // Black Rook
  br: (
    <svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="br-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#555" />
          <stop offset="100%" stopColor="#1a1a1a" />
        </linearGradient>
      </defs>
      <g fill="url(#br-grad)" stroke="#c8a84e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M 9,39 L 36,39 L 36,36 L 9,36 L 9,39 z" />
        <path d="M 12.5,32 L 14,29.5 L 31,29.5 L 32.5,32 L 12.5,32 z" />
        <path d="M 12,36 L 12,32 L 33,32 L 33,36 L 12,36 z" />
        <path d="M 14,29.5 L 14,16.5 L 31,16.5 L 31,29.5 L 14,29.5 z" />
        <path d="M 14,16.5 L 11,14 L 34,14 L 31,16.5 L 14,16.5 z" />
        <path d="M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14 L 11,14 z" />
        <path d="M 12,35.5 L 33,35.5" fill="none" stroke="#c8a84e" strokeLinejoin="miter" />
        <path d="M 13,31.5 L 32,31.5" fill="none" stroke="#c8a84e" strokeLinejoin="miter" />
        <path d="M 14,29.5 L 31,29.5" fill="none" stroke="#c8a84e" strokeLinejoin="miter" />
        <path d="M 14,16.5 L 31,16.5" fill="none" stroke="#c8a84e" />
        <path d="M 11,14 L 34,14" fill="none" stroke="#c8a84e" />
      </g>
    </svg>
  ),

  // Black Bishop
  bb: (
    <svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bb-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#555" />
          <stop offset="100%" stopColor="#1a1a1a" />
        </linearGradient>
      </defs>
      <g fill="url(#bb-grad)" stroke="#c8a84e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <g fill="none" strokeLinecap="butt">
          <path d="M 9,36 C 12.39,35.03 19.11,36.43 22.5,34 C 25.89,36.43 32.61,35.03 36,36" stroke="#c8a84e" />
          <path d="M 15,32 C 17.5,34.5 27.5,34.5 30,32" stroke="#c8a84e" />
          <path d="M 25,8 a 2.5,2.5 0 1 1 -5,0 a 2.5,2.5 0 1 1 5,0" fill="url(#bb-grad)" stroke="#c8a84e" />
        </g>
        <path d="M 15,32 C 17,28 19,22 22.5,16 C 26,22 28,28 30,32 C 25.5,34.5 19.5,34.5 15,32 z" />
        <path d="M 9,36 L 36,36 C 36,36 37.5,38.5 34,38.5 C 30.5,38.5 14.5,38.5 11,38.5 C 7.5,38.5 9,36 9,36 z" />
        <path d="M 17.5,26 L 27.5,26 M 15,30 L 30,30 M 22.5,15.5 L 22.5,20.5" fill="none" stroke="#c8a84e" strokeLinejoin="miter" />
      </g>
    </svg>
  ),

  // Black Knight
  bn: (
    <svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bn-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#555" />
          <stop offset="100%" stopColor="#1a1a1a" />
        </linearGradient>
      </defs>
      <g fill="url(#bn-grad)" stroke="#c8a84e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18" />
        <path d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,7.5 C 14.5,6.5 16.5,10 16.5,10 L 18.5,10 C 18.5,10 19.28,8.008 21,7 C 22,7 22,10 22,10" />
        <circle cx="12" cy="25" r="1" fill="#c8a84e" stroke="none" />
        <path d="M 9.5,25.5 A 0.5,1.5 0 0 0 8.5,26.5 A 0.5,1.5 0 0 0 9.5,27.5 A 0.5,1.5 0 0 0 10.5,26.5 A 0.5,1.5 0 0 0 9.5,25.5 z" fill="#c8a84e" stroke="#c8a84e" />
      </g>
    </svg>
  ),

  // Black Pawn
  bp: (
    <svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bp-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#555" />
          <stop offset="100%" stopColor="#1a1a1a" />
        </linearGradient>
      </defs>
      <path d="M 22.5,9 C 19.79,9 17.609,11.209 17.609,13.883 C 17.609,15.193 18.153,16.362 19.02,17.209 C 16.109,18.291 14,21.014 14,24.258 C 14,25.668 14.403,26.988 15.098,28.121 C 13.173,29.395 10.5,31.02 10.5,33.258 C 10.5,36.062 16.09,38.227 22.5,38.227 C 28.91,38.227 34.5,36.062 34.5,33.258 C 34.5,31.02 31.827,29.395 29.902,28.121 C 30.597,26.988 31,25.668 31,24.258 C 31,21.014 28.891,18.291 25.98,17.209 C 26.847,16.362 27.391,15.193 27.391,13.883 C 27.391,11.209 25.21,9 22.5,9 z" fill="url(#bp-grad)" stroke="#c8a84e" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
};

export function getPieceSVG(color, type) {
  return SVG_PIECES[color + type] || null;
}

export default SVG_PIECES;

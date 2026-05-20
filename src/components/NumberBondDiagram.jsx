import React from 'react';

export default function NumberBondDiagram({ whole, part1, part2, missing, animated }) {
  return (
    <svg viewBox="0 0 200 140" style={{ width: '100%', maxWidth: 200 }}>
      {/* Whole circle (top) */}
      <circle cx="100" cy="30" r="28"
        fill={missing === 'whole' ? '#FFF9C4' : '#4A90D9'}
        stroke="#2E6DB4" strokeWidth="3"
        style={{ transition: animated ? 'all 0.3s ease' : 'none' }}
      />
      <text x="100" y="36" textAnchor="middle"
        fill={missing === 'whole' ? '#999' : '#FFF'}
        fontSize="20" fontWeight="bold">
        {missing === 'whole' ? '?' : whole}
      </text>

      {/* Left branch line */}
      <line x1="78" y1="50" x2="55" y2="80"
        stroke="#888" strokeWidth="2.5" />
      {/* Right branch line */}
      <line x1="122" y1="50" x2="145" y2="80"
        stroke="#888" strokeWidth="2.5" />

      {/* Part 1 circle (bottom-left) */}
      <circle cx="45" cy="100" r="24"
        fill={missing === 'part1' ? '#FFF9C4' : '#FF8A50'}
        stroke={missing === 'part1' ? '#FFB300' : '#E65C00'}
        strokeWidth="3"
        strokeDasharray={missing === 'part1' ? '6,3' : '0'}
        style={{ transition: animated ? 'all 0.3s ease' : 'none' }}
      />
      <text x="45" y="106" textAnchor="middle"
        fill={missing === 'part1' ? '#999' : '#FFF'}
        fontSize="18" fontWeight="bold">
        {missing === 'part1' ? '?' : part1}
      </text>

      {/* Part 2 circle (bottom-right) */}
      <circle cx="155" cy="100" r="24"
        fill={missing === 'part2' ? '#FFF9C4' : '#FF8A50'}
        stroke={missing === 'part2' ? '#FFB300' : '#E65C00'}
        strokeWidth="3"
        strokeDasharray={missing === 'part2' ? '6,3' : '0'}
        style={{ transition: animated ? 'all 0.3s ease' : 'none' }}
      />
      <text x="155" y="106" textAnchor="middle"
        fill={missing === 'part2' ? '#999' : '#FFF'}
        fontSize="18" fontWeight="bold">
        {missing === 'part2' ? '?' : part2}
      </text>
    </svg>
  );
}

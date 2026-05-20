import { useMemo } from 'react';

const COUNT = 20;
export default function FloatingNumbers() {
  const numbers = useMemo(() =>
    Array.from({ length: COUNT }, (_, i) => ({
      value: Math.floor(Math.random() * 100),
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 20}s`,
      duration: `${15 + Math.random() * 15}s`,
      size: `${2 + Math.random() * 3}rem`,
    })), []);

  return (
    <div className="floating-numbers">
      {numbers.map((n, i) => (
        <span key={i} className="floating-number" style={{
          left: n.left,
          animationDelay: n.delay,
          animationDuration: n.duration,
          fontSize: n.size,
        }}>
          {n.value}
        </span>
      ))}
    </div>
  );
}

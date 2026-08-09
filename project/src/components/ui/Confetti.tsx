import { useEffect, useState } from 'react';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vr: number;
  color: string;
  size: number;
}

const colors = ['#16a34a', '#22c55e', '#f97316', '#fb923c', '#facc15', '#0891b2'];

export function Confetti({ trigger }: { trigger: number }) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (trigger === 0) return;
    const newPieces: ConfettiPiece[] = Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: window.innerWidth / 2,
      y: window.innerHeight / 3,
      vx: (Math.random() - 0.5) * 16,
      vy: Math.random() * -12 - 4,
      rotation: Math.random() * 360,
      vr: (Math.random() - 0.5) * 20,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 6,
    }));
    setPieces(newPieces);
    const timeout = setTimeout(() => setPieces([]), 3000);
    return () => clearTimeout(timeout);
  }, [trigger]);

  if (pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: '2px',
            transform: `rotate(${p.rotation}deg)`,
            animation: `confetti-fall 3s ease-out forwards`,
            '--vx': `${p.vx}px`,
            '--vy': `${p.vy}px`,
            '--vr': `${p.vr}deg`,
          } as React.CSSProperties}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
          100% { transform: translate(var(--vx), 120vh) rotate(var(--vr)); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

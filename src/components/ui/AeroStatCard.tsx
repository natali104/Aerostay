'use client';

import React, { useEffect, useRef, useState } from 'react';

interface AeroStatCardProps {
  label: string;
  value: string | number;
  trend?: number;
  color?: string;
  icon?: React.ReactNode;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export default function AeroStatCard({
  label,
  value,
  trend,
  color = '#0369A1',
  icon,
}: AeroStatCardProps) {
  const numericValue = typeof value === 'number' ? value : parseFloat(value);
  const isNumeric = !isNaN(numericValue);
  const [displayValue, setDisplayValue] = useState<string | number>(
    isNumeric ? 0 : value
  );
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!isNumeric) return;

    const duration = 1200;
    const start = performance.now();
    const isInteger = Number.isInteger(numericValue);

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const current = eased * numericValue;

      setDisplayValue(isInteger ? Math.round(current) : +current.toFixed(1));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, numericValue, isNumeric]);

  const rendered = isNumeric ? displayValue : value;

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: 12,
        padding: '16px 20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {icon && (
        <div
          style={{
            position: 'absolute',
            top: 16,
            right: 20,
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: '#E0F2FE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0EA5E9',
          }}
        >
          {icon}
        </div>
      )}

      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: '#64748B',
          marginBottom: 6,
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 28,
          fontWeight: 700,
          color,
          lineHeight: 1.2,
          animation: 'countUp 0.5s ease-out',
        }}
      >
        {rendered}
      </div>

      {trend !== undefined && trend !== 0 && (
        <span
          style={{
            display: 'inline-block',
            marginTop: 8,
            fontSize: 11,
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: 20,
            background:
              trend > 0
                ? 'rgba(16,185,129,0.12)'
                : 'rgba(239,68,68,0.12)',
            color: trend > 0 ? '#065F46' : '#991B1B',
          }}
        >
          {trend > 0 ? `↑ +${trend}%` : `↓ ${trend}%`}
        </span>
      )}
    </div>
  );
}

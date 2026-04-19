import React from 'react';

interface StatusBadgeProps {
  status: string;
}

const statusStyles: Record<
  string,
  { bg: string; border: string; text: string }
> = {
  pending: {
    bg: 'rgba(245,162,35,0.12)',
    border: 'rgba(245,162,35,0.3)',
    text: '#92400E',
  },
  confirmed: {
    bg: 'rgba(16,185,129,0.12)',
    border: 'rgba(16,185,129,0.3)',
    text: '#065F46',
  },
  booking_in_progress: {
    bg: 'rgba(14,165,233,0.12)',
    border: 'rgba(14,165,233,0.3)',
    text: '#0369A1',
  },
  cancelled: {
    bg: 'rgba(239,68,68,0.12)',
    border: 'rgba(239,68,68,0.3)',
    text: '#991B1B',
  },
  detected: {
    bg: 'rgba(100,116,139,0.12)',
    border: 'rgba(100,116,139,0.3)',
    text: '#475569',
  },
};

function formatLabel(status: string): string {
  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const key = status.toLowerCase();
  const style = statusStyles[key] ?? statusStyles.detected;

  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: 11,
        fontWeight: 500,
        padding: '3px 10px',
        borderRadius: 20,
        background: style.bg,
        border: `1px solid ${style.border}`,
        color: style.text,
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
      }}
    >
      {formatLabel(status)}
    </span>
  );
}

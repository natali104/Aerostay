'use client';

import React from 'react';

interface ToggleProps {
  value: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}

export default function Toggle({ value, onChange, label }: ToggleProps) {
  const track: React.CSSProperties = {
    position: 'relative',
    width: 36,
    height: 20,
    borderRadius: 10,
    background: value ? '#0EA5E9' : '#CBD5E1',
    cursor: 'pointer',
    transition: 'background 0.2s ease',
    flexShrink: 0,
    border: 'none',
    padding: 0,
  };

  const thumb: React.CSSProperties = {
    position: 'absolute',
    top: 2,
    left: value ? 18 : 2,
    width: 16,
    height: 16,
    borderRadius: '50%',
    background: '#FFFFFF',
    transition: 'left 0.2s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
    pointerEvents: 'none',
  };

  const toggle = (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-label={label}
      onClick={() => onChange(!value)}
      style={track}
    >
      <span style={thumb} />
    </button>
  );

  if (!label) return toggle;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}
    >
      <span
        style={{
          fontSize: 14,
          color: '#0F172A',
          fontWeight: 500,
          userSelect: 'none',
        }}
      >
        {label}
      </span>
      {toggle}
    </div>
  );
}

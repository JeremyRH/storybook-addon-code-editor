import * as React from 'react';

export interface CardProps {
  title: string;
  children?: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
}

export function Card({ title, children, variant = 'default' }: CardProps) {
  const baseStyles: React.CSSProperties = {
    padding: '1rem',
    borderRadius: '8px',
    fontFamily: 'system-ui, sans-serif',
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    default: {
      backgroundColor: '#f5f5f5',
      border: '1px solid #e0e0e0',
    },
    outlined: {
      backgroundColor: 'transparent',
      border: '2px solid #1976d2',
    },
    elevated: {
      backgroundColor: '#fff',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      border: 'none',
    },
  };

  return (
    <div style={{ ...baseStyles, ...variantStyles[variant] }}>
      <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>{title}</h3>
      <div style={{ color: '#666' }}>{children}</div>
    </div>
  );
}

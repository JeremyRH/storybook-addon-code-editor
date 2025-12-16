import { setupCompositionImports } from 'storybook-addon-code-editor/manager';

// Import the same libraries that are used in the composed Storybook.
// For this example, we're creating a mock of the composed library
// to demonstrate the composition feature.

// In a real-world scenario, you would import the actual library:
// import * as ComposedLibrary from 'composed-library';

// For this example, we'll create a simple Card component that matches
// the one in the composed Storybook.
const Card = ({
  title,
  children,
  variant = 'default',
}: {
  title: string;
  children?: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
}) => {
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

  const React = (window as any).React;

  return React.createElement(
    'div',
    { style: { ...baseStyles, ...variantStyles[variant] } },
    React.createElement('h3', { style: { margin: '0 0 0.5rem 0', color: '#333' } }, title),
    React.createElement('div', { style: { color: '#666' } }, children),
  );
};

// Register imports for composed stories.
// These imports will be available when viewing stories from composed Storybooks.
setupCompositionImports({
  'composed-library': { Card },
});

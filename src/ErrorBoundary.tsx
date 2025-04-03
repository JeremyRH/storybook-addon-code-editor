import * as React from 'react';

interface ErrorBoundaryProps {
  resetRef: React.MutableRefObject<(() => void) | undefined>;
  children: React.ReactNode;
}

export const errorStyle = {
  backgroundColor: '#f8d7da',
  borderRadius: '5px',
  color: '#721c24',
  fontFamily: 'monospace',
  margin: '0',
  padding: '20px',
};

class ErrorBoundary extends React.Component<ErrorBoundaryProps> {
  state = { error: undefined };

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props.resetRef.current = this.setState.bind(this, this.state);
  }

  static getDerivedStateFromError(error: unknown) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return <pre style={errorStyle}>{String(this.state.error)}</pre>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

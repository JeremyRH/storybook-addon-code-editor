import * as React from 'react';
import { errorStyle } from './ErrorBoundary';
import { EsModules, evalModule } from './evalModule';

interface PreviewProps {
  availableImports: EsModules;
  code: string;
  componentProps?: any;
}

export default function Preview({ availableImports, code, componentProps }: PreviewProps) {
  // Memoize on `code` only — intentionally excluding `availableImports` because
  // callers (e.g. LivePreview) spread a fresh object on every render. Including it
  // would bust the memo every render and re-introduce the remount bug.
  const DefaultExport = React.useMemo<React.ComponentType<any>>(() => {
    try {
      const exp = code ? evalModule(code, availableImports).default : undefined;
      const isObject = exp && typeof exp === 'object';
      const isFunction = typeof exp === 'function';
      if (!isObject && !isFunction) {
        throw new TypeError('Default export is not a React component');
      }
      // Cast is safe: runtime guards above ensure exp is an object or function,
      // which are the only valid React component types (class or function).
      return exp as React.ComponentType<any>;
    } catch (error) {
      return () => <pre style={errorStyle}>{String(error)}</pre>;
    }
  }, [code]); // Intentionally omits `availableImports` — see block comment above.

  return <DefaultExport {...componentProps} />;
}

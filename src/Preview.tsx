import * as React from 'react';
import { EsModules, evalModule } from './evalModule';
import { errorStyle } from './ErrorBoundary';

interface PreviewProps {
  availableImports: EsModules;
  code: string;
  componentProps?: any;
}

export default function Preview({ availableImports, code, componentProps }: PreviewProps) {
  let DefaultExport: any;

  try {
    DefaultExport = code ? evalModule(code, availableImports).default : undefined;
    const isObject = DefaultExport && typeof DefaultExport === 'object';
    const isFunction = typeof DefaultExport === 'function';
    if (!isObject && !isFunction) {
      throw new TypeError('Default export is not a React component');
    }
  } catch (error) {
    return <pre style={errorStyle}>{String(error)}</pre>;
  }

  return <DefaultExport {...componentProps} />;
}

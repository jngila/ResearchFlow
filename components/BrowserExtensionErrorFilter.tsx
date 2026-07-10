'use client';

import { useEffect } from 'react';

export default function BrowserExtensionErrorFilter() {
  useEffect(() => {
    function isExtensionError(message: string | Event): boolean {
      const msg = typeof message === 'string' ? message : (message as ErrorEvent).message ?? '';
      return (
        msg.includes('MetaMask') ||
        msg.includes('chrome-extension://') ||
        msg.includes('moz-extension://') ||
        msg.includes('safari-extension://')
      );
    }

    function onError(event: ErrorEvent) {
      const source = event.filename ?? '';
      if (
        source.startsWith('chrome-extension://') ||
        source.startsWith('moz-extension://') ||
        source.startsWith('safari-extension://') ||
        isExtensionError(event.message ?? '')
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }

    function onUnhandledRejection(event: PromiseRejectionEvent) {
      const reason = event.reason;
      const msg =
        reason instanceof Error ? reason.message :
        typeof reason === 'string' ? reason : '';
      if (isExtensionError(msg)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }

    window.addEventListener('error', onError, true);
    window.addEventListener('unhandledrejection', onUnhandledRejection, true);
    return () => {
      window.removeEventListener('error', onError, true);
      window.removeEventListener('unhandledrejection', onUnhandledRejection, true);
    };
  }, []);

  return null;
}

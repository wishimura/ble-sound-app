'use client';

import { useEffect } from 'react';

/**
 * Pops a native "leave site?" confirm when the user tries to close the tab,
 * reload, or navigate away (browser-level navigation only — Next.js
 * client-side router navigation is not interceptable from here).
 */
export function useUnsavedWarning(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = '';
    }
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [enabled]);
}

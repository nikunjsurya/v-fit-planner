import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Reset the DOM between tests and wipe localStorage so each test sees a
// clean fixture without bleed from prior runs.
afterEach(() => {
  cleanup();
  try {
    window.localStorage.clear();
  } catch {
    /* jsdom may not always expose storage; ignore */
  }
});

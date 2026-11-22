import React from 'react';

(globalThis as any).React = React;

// Polyfill React 19 internals for @react-three/fiber running in React 18 Node test environment
if (!(React as any).__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE) {
  (React as any).__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = {
    S: null,
    H: null,
  };
}

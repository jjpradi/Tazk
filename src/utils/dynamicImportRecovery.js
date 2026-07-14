const RELOAD_STATE_KEY = 'dynamic-import-reload-state';
const RETRY_QUERY_PARAM = '__di_retry';
const RECOVERY_WINDOW_MS = 15000;
const RECOVERABLE_PATTERNS = [
  'Failed to fetch dynamically imported module',
  'Importing a module script failed',
  'ChunkLoadError',
  'Loading chunk',
];

const readReloadState = () => {
  try {
    const rawValue = sessionStorage.getItem(RELOAD_STATE_KEY);
    return rawValue ? JSON.parse(rawValue) : null;
  } catch (_) {
    return null;
  }
};

const clearReloadState = () => {
  try {
    sessionStorage.removeItem(RELOAD_STATE_KEY);
  } catch (_) {
    // Ignore storage access issues and continue recovery flow.
  }
};

const writeReloadState = () => {
  try {
    sessionStorage.setItem(
      RELOAD_STATE_KEY,
      JSON.stringify({
        attemptedAt: Date.now(),
        path: `${window.location.pathname}${window.location.search}`,
      }),
    );
  } catch (_) {
    // Ignore storage access issues and continue recovery flow.
  }
};

const buildRecoveryUrl = () => {
  const url = new URL(window.location.href);
  url.searchParams.set(RETRY_QUERY_PARAM, Date.now().toString());
  return url.toString();
};

const cleanupRecoveryQueryParam = () => {
  try {
    const url = new URL(window.location.href);
    if (!url.searchParams.has(RETRY_QUERY_PARAM)) {
      return;
    }

    url.searchParams.delete(RETRY_QUERY_PARAM);
    window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);
  } catch (_) {
    // Ignore history access issues and continue recovery flow.
  }
};

export const isRecoverableDynamicImportError = (errorLike) => {
  const message = String(
    errorLike?.message ||
      errorLike?.reason?.message ||
      errorLike?.toString?.() ||
      ''
  );

  return RECOVERABLE_PATTERNS.some((pattern) => message.includes(pattern));
};

export const reloadOnceForDynamicImportError = () => {
  const reloadState = readReloadState();
  const isRecentAttempt =
    reloadState?.attemptedAt && Date.now() - reloadState.attemptedAt < RECOVERY_WINDOW_MS;

  if (isRecentAttempt) {
    clearReloadState();
    return false;
  }

  writeReloadState();
  window.location.replace(buildRecoveryUrl());
  return true;
};

export const recoverDynamicImportError = (errorLike) => {
  if (!isRecoverableDynamicImportError(errorLike)) {
    return false;
  }

  return reloadOnceForDynamicImportError();
};

export const installDynamicImportRecovery = () => {
  const reloadState = readReloadState();
  if (reloadState && Date.now() - reloadState.attemptedAt >= RECOVERY_WINDOW_MS) {
    clearReloadState();
  }

  window.addEventListener('load', () => {
    cleanupRecoveryQueryParam();
    clearReloadState();
  });

  window.addEventListener('error', (event) => {
    if (recoverDynamicImportError(event?.error || event?.message)) {
      event.preventDefault?.();
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    if (recoverDynamicImportError(event?.reason)) {
      event.preventDefault();
    }
  });
};

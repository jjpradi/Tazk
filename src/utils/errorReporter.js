import http from '../http-common';

/**
 * Reports frontend errors to the backend error dashboard.
 * Silently fails if the user is not logged in or the request fails.
 */
export function reportFrontendError(error, componentStack) {
  try {
    const loginData = JSON.parse(sessionStorage.getItem('login') || '{}');
    if (!loginData?.accessToken) return; // not logged in, skip

    const errorData = {
      level: 'error',
      meta: 'frontend_error',
      message: `${error?.message || String(error)} | Page: ${window.location.pathname}${componentStack ? ' | Stack: ' + componentStack.slice(0, 500) : ''}`,
      exact_location: window.location.pathname,
      company_type: loginData?.company_type || '',
    };

    http.post('/errorDashboard/createlog', errorData).catch(() => {});
  } catch (e) {
    // Silently fail — error reporting should never break the app
  }
}

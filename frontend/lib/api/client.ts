const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

interface FetchOptions extends RequestInit {
  isFormData?: boolean; // For file uploads (cheque images)
}

/**
 * Get user-friendly error messages based on HTTP status codes
 */
function getUserFriendlyErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return 'Invalid request. Please check your input and try again.';
    case 401:
      return 'Your session has expired. Please login again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'This record already exists. Please check and try again.';
    case 500:
      return 'Server error. Please try again later.';
    case 502:
    case 503:
    case 504:
      return 'Service temporarily unavailable. Please try again in a moment.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Generalized API client for ALL backend requests
 * Automatically handles:
 * - JSON serialization
 * - Cookie authentication
 * - Error responses
 * - File uploads (FormData)
 */
export async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { isFormData = false, ...fetchOptions } = options;

  const config: RequestInit = {
    ...fetchOptions,
    headers: {
      // Only set Content-Type for JSON, not for FormData
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...fetchOptions.headers,
    },
    credentials: 'include', // Always send cookies (for JWT auth)
  };

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  } catch (error) {
    // Network error or server not reachable
    throw new Error('Unable to connect to server. Please check your internet connection or try again later.');
  }

  // Handle different response scenarios
  if (!response.ok) {
    // Try to parse error message from backend
    const error = await response.json().catch(() => ({
      message: getUserFriendlyErrorMessage(response.status),
    }));
    throw new Error(error.message || getUserFriendlyErrorMessage(response.status));
  }

  // Handle 204 No Content (e.g., DELETE requests)
  if (response.status === 204) {
    return {} as T;
  }

  // Parse and return JSON response
  return response.json();
}

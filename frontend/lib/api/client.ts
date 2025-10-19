const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

interface FetchOptions extends RequestInit {
  isFormData?: boolean; // For file uploads (cheque images)
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

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  // Handle different response scenarios
  if (!response.ok) {
    // Try to parse error message from backend
    const error = await response.json().catch(() => ({
      message: `Request failed with status ${response.status}`,
    }));
    throw new Error(error.message || 'Request failed');
  }

  // Handle 204 No Content (e.g., DELETE requests)
  if (response.status === 204) {
    return {} as T;
  }

  // Parse and return JSON response
  return response.json();
}

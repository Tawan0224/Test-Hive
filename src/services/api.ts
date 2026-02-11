const API_URL = 'http://localhost:5001/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('testhive_token');

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Unable to connect to server. Please try again.',
      },
    };
  }
}

// Auth API calls
export const authAPI = {
  signup: (email: string, password: string, username: string) =>
    request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, username }),
    }),

  login: (email: string, password: string) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getMe: () => request('/auth/me'),

  updateProfile: (data: { displayName: string; username: string; email: string }) =>
    request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  googleAuth: (data: { email: string; googleId: string; displayName: string; profilePicture: string }) =>
    request('/auth/google', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  facebookAuth: (data: { email: string; facebookId: string; displayName: string; profilePicture: string }) =>
    request('/auth/facebook', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export default request;
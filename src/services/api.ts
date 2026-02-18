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

// ── Auth API ──
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

// ── Quiz API ──
export const quizAPI = {
  create: (quizData: {
    title: string;
    description?: string;
    type: 'multiple-choice' | 'matching' | 'flashcard';
    difficulty?: string;
    questions?: any[];
    matchingQuestions?: any[];
    flashcards?: any[];
    tags?: string[];
    aiGenerated?: boolean;
    aiParameters?: any;
  }) =>
    request('/quizzes', {
      method: 'POST',
      body: JSON.stringify(quizData),
    }),

  getMine: () => request('/quizzes/mine'),
  getById: (id: string) => request(`/quizzes/${id}`),
  getByShareCode: (code: string) => request(`/quizzes/share/${code}`),
  delete: (id: string) => request(`/quizzes/${id}`, { method: 'DELETE' }),

  submitAttempt: (quizId: string, attemptData: {
    answers?: any[];
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    accuracy: number;
    timeSpentSeconds?: number;
    weakTopics?: string[];
  }) =>
    request(`/quizzes/${quizId}/attempts`, {
      method: 'POST',
      body: JSON.stringify(attemptData),
    }),
};

// ── AI API ──
export const aiAPI = {
  /**
   * Generate a quiz from a PDF file using Gemini AI.
   * Uses FormData (multipart) so we bypass the JSON request helper.
   */
  generateFromPDF: async (params: {
    file: File;
    quizType: 'multiple-choice' | 'flashcard' | 'matching';
    count: 10 | 15 | 20;
    customInstructions?: string;
    difficulty?: string;
  }): Promise<ApiResponse> => {
    const token = localStorage.getItem('testhive_token');

    const formData = new FormData();
    formData.append('pdf', params.file);
    formData.append('quizType', params.quizType);
    formData.append('count', String(params.count));
    formData.append('customInstructions', params.customInstructions || '');
    formData.append('difficulty', params.difficulty || 'medium');

    try {
      const response = await fetch(`${API_URL}/ai/generate`, {
        method: 'POST',
        headers: {
          // DO NOT set Content-Type here — browser sets it automatically with boundary for FormData
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });
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
  },
};

// ── Attempts API ──
export const attemptsAPI = {
  getMine: () => request('/attempts/mine'),
};

export default request;
import { useState, useCallback } from 'react'

const API_BASE_URL = "https://merry-courage-production.up.railway.app"

export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

export async function dataFetch(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers
    },
    credentials: 'include', // Include cookies automatically
    ...options
  }

  try {
    const response = await fetch(url, config)
    
    // Handle different response types
    const contentType = response.headers.get('content-type')
    let data
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
    } else {
      data = await response.text()
    }

    if (!response.ok) {
      const errorMessage = data?.message || data?.detail || data || `HTTP error! status: ${response.status}`
      throw new ApiError(errorMessage, response.status, data)
    }

    return {
      data,
      status: response.status,
      headers: response.headers,
      ok: response.ok
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    
    // Network or other errors
    throw new ApiError(
      error.message || 'Network error occurred',
      0,
      null
    )
  }
}

// Convenience methods for different HTTP verbs
export const api = {
  get: (endpoint, options = {}) => {
    return dataFetch(endpoint, { ...options, method: 'GET' })
  },

  post: (endpoint, data, options = {}) => {
    return dataFetch(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    })
  },

  put: (endpoint, data, options = {}) => {
    return dataFetch(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    })
  },

  patch: (endpoint, data, options = {}) => {
    return dataFetch(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined
    })
  },

  delete: (endpoint, options = {}) => {
    return dataFetch(endpoint, { ...options, method: 'DELETE' })
  }
}

// Hook for handling API calls in React components
export function useApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const call = useCallback(async (apiCall) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await apiCall()
      return result
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return { call, loading, error, clearError }
}

// Example usage functions for common operations
export const dataApiExamples = {
  // Get user profile
  getUserProfile: () => api.get('/user/profile'),
  
  // Get survey data
  getSurveyData: (surveyId) => api.get(`/surveys/${surveyId}`),
  
  // Submit form data
  submitForm: (formData) => api.post('/forms/submit', formData),
  
  // Get dashboard analytics
  getDashboardData: () => api.get('/dashboard/analytics')
}
import axios from 'axios'

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''
export const API_VERSION = 'v1'

// Remove trailing slash from base URL to avoid double slashes
const cleanBaseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL

// Debug: Log the URL construction
console.log('🔍 Debug - Raw API_BASE_URL:', API_BASE_URL)
console.log('🔍 Debug - Clean base URL:', cleanBaseUrl)
console.log('🔍 Debug - Final baseURL:', `${cleanBaseUrl}/api/${API_VERSION}`)

export const apiClient = axios.create({
  baseURL: `${cleanBaseUrl}/api/${API_VERSION}`,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// Add request interceptor to automatically include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear tokens
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Add these missing exports:
export const handleApiResponse = <T>(response: any): T => {
  if (response.data.error) {
    throw new Error(response.data.message)
  }
  return response.data
}

export const handleApiError = (error: any): never => {
  let errorMessage = 'An unexpected error occurred'
  
  if (error?.response?.data?.message) {
    errorMessage = error.response.data.message
  } else if (error?.message) {
    errorMessage = error.message
  }
  
  throw new Error(errorMessage)
}
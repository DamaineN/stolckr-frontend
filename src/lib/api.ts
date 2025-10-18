import axios from 'axios'

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''
export const API_VERSION = 'v1'

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/${API_VERSION}`,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

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
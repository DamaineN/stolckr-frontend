import axios from 'axios'
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''
export const API_VERSION = 'v1'
export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/${API_VERSION}`,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})
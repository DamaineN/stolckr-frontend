import { apiClient, handleApiResponse, handleApiError } from '../api'

// Authentication types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  full_name: string
  role?: 'beginner' | 'casual' | 'paper_trader' | 'admin'
  quiz_answers?: Record<number, number> // Optional quiz answers
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type?: string
}

export interface User {
  id: string
  email: string
  full_name: string
  role: string
  is_verified: boolean
  status: string
  created_at: string
  updated_at: string
  last_login?: string
  profile_picture?: string
}

export interface VerifyTokenResponse {
  valid: boolean
  user_id?: string
  email?: string
  role?: string
}

// Auth API service
export class AuthService {
  static async login(credentials: LoginRequest): Promise<TokenResponse> {
    try {
      // Debug: Log the exact URL being called
      console.log('🔍 Debug - API Base URL:', process.env.NEXT_PUBLIC_API_URL)
      console.log('🔍 Debug - Full login URL:', `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`)
      console.log('🔍 Debug - Credentials:', { email: credentials.email, password: '***' })
      
      const response = await apiClient.post('/auth/login', credentials)
      const tokens = handleApiResponse<TokenResponse>(response)
      
      // Store tokens in localStorage
      localStorage.setItem('access_token', tokens.access_token)
      localStorage.setItem('refresh_token', tokens.refresh_token)
      
      return tokens
    } catch (error) {
      throw handleApiError(error)
    }
  }

  static async register(userData: RegisterRequest): Promise<TokenResponse> {
    try {
      const response = await apiClient.post('/auth/register', {
        ...userData,
        role: userData.role || 'beginner'
      })
      const tokens = handleApiResponse<TokenResponse>(response)
      
      // Store tokens in localStorage
      localStorage.setItem('access_token', tokens.access_token)
      localStorage.setItem('refresh_token', tokens.refresh_token)
      
      return tokens
    } catch (error) {
      throw handleApiError(error)
    }
  }

  static async getProfile(): Promise<User> {
    try {
      const response = await apiClient.get('/auth/profile')
      return handleApiResponse<User>(response)
    } catch (error) {
      throw handleApiError(error)
    }
  }

  static async verifyToken(): Promise<VerifyTokenResponse> {
    try {
      const response = await apiClient.get('/auth/verify-token')
      return handleApiResponse<VerifyTokenResponse>(response)
    } catch (error) {
      // Don't throw error for token verification, just return invalid
      return { valid: false }
    }
  }

  static async refreshToken(): Promise<TokenResponse> {
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await apiClient.post('/auth/refresh', {
        refresh_token: refreshToken
      })
      const tokens = handleApiResponse<TokenResponse>(response)
      
      // Update stored tokens
      localStorage.setItem('access_token', tokens.access_token)
      localStorage.setItem('refresh_token', tokens.refresh_token)
      
      return tokens
    } catch (error) {
      // Clear tokens on refresh failure
      this.logout()
      throw handleApiError(error)
    }
  }

  static logout(): void {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  static isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token')
    return !!token
  }

  static getToken(): string | null {
    return localStorage.getItem('access_token')
  }
}

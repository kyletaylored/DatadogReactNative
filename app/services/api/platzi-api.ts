/**
 * Platzi Fake Store API Service
 * Documentation: https://fakeapi.platzi.com/
 */
import type {
  Product,
  User,
  LoginRequest,
  LoginResponse,
  UserProfile,
  ApiError,
} from "./platzi-api.types"

const API_BASE_URL = "https://api.escuelajs.co/api/v1"

/**
 * Fetch products with optional pagination
 */
export async function fetchProducts(
  offset: number = 0,
  limit: number = 10,
): Promise<Product[]> {
  const response = await fetch(`${API_BASE_URL}/products?offset=${offset}&limit=${limit}`)

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Fetch a single product by ID
 */
export async function fetchProduct(id: number): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/products/${id}`)

  if (!response.ok) {
    throw new Error(`Failed to fetch product: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Fetch all users (for demo purposes - getting login credentials)
 */
export async function fetchUsers(): Promise<User[]> {
  const response = await fetch(`${API_BASE_URL}/users`)

  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Login with email and password
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    const error: ApiError = {
      message: response.status === 401 ? "Invalid credentials" : "Login failed",
      statusCode: response.status,
    }
    throw error
  }

  return response.json()
}

/**
 * Fetch user profile with access token
 */
export async function fetchUserProfile(accessToken: string): Promise<UserProfile> {
  const response = await fetch(`${API_BASE_URL}/auth/profile`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    const error: ApiError = {
      message:
        response.status === 401
          ? "Unauthorized - token may be expired"
          : "Failed to fetch profile",
      statusCode: response.status,
    }
    throw error
  }

  return response.json()
}


/**
 * Platzi Fake Store API Types
 * Based on https://fakeapi.platzi.com/
 */

export interface Category {
  id: number
  name: string
  slug: string
  image: string
  creationAt: string
  updatedAt: string
}

export interface Product {
  id: number
  title: string
  slug: string
  price: number
  description: string
  category: Category
  images: string[]
  creationAt: string
  updatedAt: string
}

export interface User {
  id: number
  email: string
  password: string
  name: string
  role: string
  avatar: string
  creationAt: string
  updatedAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
}

export interface UserProfile {
  id: number
  email: string
  password: string
  name: string
  role: string
  avatar: string
}

export interface ApiError {
  message: string
  statusCode: number
}


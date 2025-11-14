# Datadog RUM Example Screens

This document describes the example screens that demonstrate Datadog RUM view loading time tracking with real API calls.

## 🎯 Overview

Three new example screens have been added to demonstrate different loading patterns with Datadog RUM tracking:

1. **Products List Screen** - Paginated product listing with infinite scroll
2. **Product Detail Screen** - Single product detail view with image gallery
3. **Auth Example Screen** - Login flow with profile fetch

All screens use the [Platzi Fake Store API](https://fakeapi.platzi.com/) and implement proper loading states, error handling, and Datadog RUM tracking.

## 📱 Accessing the Screens

From the Welcome screen, you'll see two new buttons in the "Datadog RUM Examples" section:

- **🛍️ Products (Pagination)** - Opens the Products List screen
- **🔐 Auth Example (Login Flow)** - Opens the Auth Example screen

## 🛍️ Products List Screen

**Location**: `app/screens/ProductsListScreen.tsx`

**Features**:

- Fetches products from the Platzi API with pagination
- Displays products in cards with images, descriptions, and prices
- Infinite scroll - loads more products as you scroll down
- Pull-to-refresh functionality
- Tap any product to view details

**API Endpoint**: `GET https://api.escuelajs.co/api/v1/products?offset=0&limit=10`

**Datadog Tracking**:

```typescript
useDatadogViewLoadingComplete(!isLoading && !error)
```

The view is marked as loaded once the initial products are fetched successfully.

**What to Watch For**:

- Initial load time from navigation to data display
- Smooth infinite scroll without blocking
- Error handling if API is unavailable

## 🔍 Product Detail Screen

**Location**: `app/screens/ProductDetailScreen.tsx`

**Features**:

- Displays detailed information for a single product
- Image gallery with previous/next navigation
- Product metadata (SKU, category, dates)
- Formatted price display
- Back navigation to products list

**API Endpoint**: `GET https://api.escuelajs.co/api/v1/products/{id}`

**Datadog Tracking**:

```typescript
useDatadogViewLoadingComplete(!isLoading && !!product && !error)
```

The view is marked as loaded once the product data is fetched and verified.

**What to Watch For**:

- Time from tap to full product display
- Image loading performance
- Navigation flow from list to detail

## 🔐 Auth Example Screen

**Location**: `app/screens/AuthExampleScreen.tsx`

**Features**:

- Pre-filled login credentials from API
- Login with email and password
- Fetches and displays user profile after login
- Avatar display with user information
- Error handling for invalid credentials (401)
- Test button for bad credentials

**API Endpoints**:

- **Get Users**: `GET https://api.escuelajs.co/api/v1/users`
- **Login**: `POST https://api.escuelajs.co/api/v1/auth/login`
- **Profile**: `GET https://api.escuelajs.co/api/v1/auth/profile`

**Datadog Tracking**:

```typescript
useDatadogViewLoadingComplete(!isLoadingUsers)
```

The view is marked as loaded once the demo user credentials are fetched.

**Demo Credentials** (pre-filled):

- Email: `john@mail.com`
- Password: `changeme`

**What to Watch For**:

- Initial credential loading time
- Login flow duration (login + profile fetch)
- Error state handling for bad credentials
- Multi-step loading (2 API calls in sequence)

## 🔧 API Service

**Location**: `app/services/api/platzi-api.ts`

All API calls are centralized in this service file with proper TypeScript types.

**Available Functions**:

```typescript
fetchProducts(offset?: number, limit?: number): Promise<Product[]>
fetchProduct(id: number): Promise<Product>
fetchUsers(): Promise<User[]>
login(credentials: LoginRequest): Promise<LoginResponse>
fetchUserProfile(accessToken: string): Promise<UserProfile>
```

**Type Definitions**: `app/services/api/platzi-api.types.ts`

## 📊 Datadog RUM Metrics

When you navigate through these screens, Datadog will track:

### View Loading Times

- **ProductsList**: Time from navigation to products displayed
- **ProductDetail**: Time from tap to product details loaded
- **AuthExample**: Time from navigation to credentials loaded

### User Interactions

- Button taps (navigation, login, refresh)
- Product card taps
- Form submissions

### Resource Timing

- API call durations
- Image loading times
- Network request waterfall

### Error Tracking

- Failed API calls (network errors)
- Authentication failures (401)
- Invalid product IDs (404)

## 🎨 UI Components Used

All screens use the existing component library:

- **Screen** - Base screen wrapper with scroll/fixed presets
- **Card** - Content cards with headers
- **Button** - Buttons with different presets (reversed, default)
- **Text** - Styled text with presets (heading, bold, default)
- **TextField** - Form inputs with labels and accessories
- **ActivityIndicator** - Loading spinners

## 🔄 Loading States

Each screen implements proper loading states:

1. **Initial Loading**: Shows spinner with "Loading..." text
2. **Content Loaded**: Displays data with Datadog tracking
3. **Loading More**: Shows footer spinner (Products List only)
4. **Error State**: Shows error message with retry button
5. **Empty State**: Handled gracefully (though API always returns data)

## 🚨 Error Handling

All screens handle these error scenarios:

### Network Errors

```typescript
catch (err) {
  setError(err instanceof Error ? err.message : "Failed to load")
}
```

### HTTP Errors

- **401 Unauthorized**: Invalid credentials
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource doesn't exist
- **400 Bad Request**: Malformed request

### Specific Error Messages

The Auth screen provides user-friendly error messages:

- "Invalid credentials. Please try again." (401)
- "Access forbidden. Insufficient permissions." (403)
- "Bad request. Please check your input." (400)

## 🧪 Testing Scenarios

### Products List

1. Navigate to screen → Watch initial load
2. Scroll to bottom → Triggers pagination
3. Pull down → Refreshes list
4. Tap any product → Navigates to detail

### Product Detail

1. Tap product from list → Watch detail load
2. Swipe images left/right → Image navigation
3. Tap back → Returns to list
4. Try invalid product ID in URL → Error handling

### Auth Example

1. Screen loads → Pre-fills credentials
2. Tap "Login" → Watch two-step process (login → profile)
3. Tap "Test Bad Credentials" → Sets invalid credentials
4. Tap "Login" again → Shows 401 error
5. After successful login → Tap "Logout" → Resets form

## 📈 Expected Datadog Results

In your Datadog RUM dashboard, you should see:

### Performance

- **ProductsList**: ~500-1500ms view loading time
- **ProductDetail**: ~300-800ms view loading time
- **AuthExample**: ~200-600ms initial load, ~1000-2000ms login flow

### User Flow

```
Welcome → ProductsList → ProductDetail → Back
Welcome → AuthExample → Login → Profile Display → Logout
```

### Common Patterns

- Multiple views of the same product (cached vs. uncached)
- Pagination impact on performance
- Sequential API calls in auth flow

## 🎓 Learning Points

These examples demonstrate:

1. **Async Data Loading**: Proper `useEffect` hooks with cleanup
2. **State Management**: Loading, error, and success states
3. **Navigation**: Deep linking with parameters
4. **API Integration**: Typed API calls with error handling
5. **UX Patterns**: Loading indicators, error messages, retry actions
6. **Datadog Integration**: View loading time tracking at the right moments

## 🔗 API Documentation

Full Platzi Fake Store API documentation: [https://fakeapi.platzi.com/](https://fakeapi.platzi.com/)

Base URL: `https://api.escuelajs.co/api/v1`

**Note**: This is a public demo API with no authentication required (except for the auth demo endpoints). Data may be reset periodically.

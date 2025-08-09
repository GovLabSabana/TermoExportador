# Authentication System Documentation

## Overview
This authentication system provides secure JWT-based authentication with production-ready security practices for the TermoExportador Next.js application.

## Features
- ✅ JWT-based authentication
- ✅ Secure cookie management
- ✅ Route protection with Next.js middleware
- ✅ Email verification flow
- ✅ Automatic token refresh
- ✅ Global state management with Zustand
- ✅ Proper error handling
- ✅ Production-ready security headers
- ✅ SSR and CSR compatibility

## Architecture

### Core Components

#### 1. Authentication Store (`src/store/authStore.js`)
- Global state management using Zustand
- Manages user data, authentication status, and loading states
- Provides actions for login, logout, and user updates

#### 2. API Client (`src/lib/api.js`)
- Centralized API communication
- Automatic JWT token handling
- Error handling and token refresh logic
- Validation utilities

#### 3. Cookie Management (`src/lib/cookies.js`)
- Secure cookie utilities for token storage
- JWT token validation and expiration checking
- Production-ready security configurations

#### 4. Custom Hooks
- `useAuth`: Main authentication hook with auto-refresh
- `useLogin`: Login form handling with validation
- `useRegister`: Registration form handling with verification modal

#### 5. Middleware (`middleware.js`)
- Route protection at the edge
- Automatic redirects for unauthorized access
- Security headers injection

#### 6. Context Provider (`src/contexts/AuthContext.js`)
- React context for app-wide authentication state
- Initialization and hydration logic

## API Integration

### Endpoints
- **Register**: `POST /auth/register`
- **Login**: `POST /auth/login`
- **Token Refresh**: `POST /auth/refresh` (if available)
- **Token Verify**: `GET /auth/verify` (if available)

### Request/Response Format

#### Register Request
```json
{
  "email": "user@example.com",
  "contraseña": "password123"
}
```

#### Register Response
```json
{
  "success": true,
  "message": "Usuario registrado. Revisa tu correo electrónico para confirmar la cuenta.",
  "usuario": {
    "id": "uuid",
    "email": "user@example.com",
    "created_at": "2025-08-09T03:00:38.564202+00:00"
  },
  "access_token": null
}
```

#### Login Request
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Login Response
```json
{
  "success": true,
  "message": "Login exitoso",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "created_at": "2025-08-09T03:00:38.564202+00:00"
  },
  "access_token": "jwt_token_here"
}
```

## Route Protection

### Public Routes
- `/` - Home page
- `/login` - Login page
- `/register` - Registration page

### Protected Routes
All other routes require authentication. Unauthorized access redirects to `/unauthorized`.

### Middleware Configuration
The middleware automatically:
1. Checks JWT token validity
2. Redirects unauthenticated users to `/unauthorized`
3. Redirects authenticated users away from auth pages
4. Adds security headers

## Usage Examples

### Using the Authentication Hooks

```javascript
import { useAuthContext } from '@/contexts/AuthContext'
import { useLogin } from '@/hooks/useLogin'

function LoginForm() {
  const { login, isSubmitting, formErrors } = useLogin()
  
  const handleSubmit = async (email, password) => {
    const result = await login(email, password)
    if (result.success) {
      // User is automatically redirected
    }
  }
}

function ProtectedComponent() {
  const { user, isAuthenticated, logout } = useAuthContext()
  
  if (!isAuthenticated) {
    return <div>Loading...</div>
  }
  
  return (
    <div>
      <h1>Welcome, {user.email}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

### Custom Route Protection
```javascript
'use client'

import { useAuthContext } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ProtectedPage() {
  const { isAuthenticated, isLoading } = useAuthContext()
  const router = useRouter()
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])
  
  if (isLoading) return <div>Loading...</div>
  if (!isAuthenticated) return null
  
  return <div>Protected content</div>
}
```

## Security Features

### 1. Secure Cookie Configuration
- `httpOnly`: Prevents XSS attacks (handled by server)
- `secure`: HTTPS only in production
- `sameSite: 'strict'`: CSRF protection
- `path: '/'`: Application-wide access

### 2. JWT Token Validation
- Automatic expiration checking
- Payload extraction and validation
- Token refresh mechanism

### 3. Security Headers
- Content Security Policy preparation
- XSS Protection
- CSRF Protection
- Referrer Policy

### 4. Input Validation
- Email format validation
- Password strength requirements
- Form sanitization

## Error Handling

### Client-Side Errors
- Network errors
- Invalid credentials
- Token expiration
- Form validation errors

### Server-Side Errors
- API endpoint errors
- Authentication failures
- Token verification failures

### Error States
All hooks provide error states that can be displayed to users:
```javascript
const { formErrors, error } = useLogin()

// Field-specific errors
if (formErrors.email) {
  // Show email error
}

// General errors
if (formErrors.general) {
  // Show general error
}
```

## Development Setup

### Environment Variables
Create a `.env.local` file:
```env
API_BASE_URL=https://merry-courage-production.up.railway.app
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

### Dependencies
The system uses these packages:
- `zustand`: State management
- `js-cookie`: Cookie utilities
- `jose`: JWT verification (for middleware)
- `next`: Framework

## Testing

### Manual Testing Checklist
- [ ] Registration with email verification modal
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Access protected routes without authentication
- [ ] Access protected routes with authentication
- [ ] Token expiration and refresh
- [ ] Logout functionality
- [ ] Registration validation (email format, password confirmation)

### Test Accounts
Use the registration flow to create test accounts, or test with the provided API endpoints.

## Deployment

### Railway Deployment
The system is configured for Railway deployment with:
- Standalone output mode
- Environment variable configuration
- Security headers
- Production optimizations

### Environment Variables for Production
```env
API_BASE_URL=https://your-api-domain.com
JWT_SECRET=your-production-secret-key
NODE_ENV=production
```

## Troubleshooting

### Common Issues

#### 1. "Invalid token" errors
- Check if JWT_SECRET matches between frontend and backend
- Verify token format and expiration
- Clear cookies and re-authenticate

#### 2. Infinite redirect loops
- Check middleware configuration
- Verify route protection logic
- Check authentication state initialization

#### 3. CORS errors
- Verify API base URL configuration
- Check server CORS settings
- Ensure proper headers are sent

#### 4. Cookie not persisting
- Verify secure/sameSite settings
- Check domain configuration
- Ensure HTTPS in production

### Debug Mode
Enable debug logging by adding to your component:
```javascript
console.log('Auth State:', { user, isAuthenticated, isLoading })
```

## Security Considerations

### Production Checklist
- [ ] Use strong JWT secrets
- [ ] Enable HTTPS
- [ ] Configure CSP headers
- [ ] Regular security audits
- [ ] Token rotation strategy
- [ ] Rate limiting on auth endpoints
- [ ] Monitor for suspicious activity

### Best Practices Implemented
1. **Token Storage**: Secure cookies instead of localStorage
2. **CSRF Protection**: SameSite cookie policy
3. **XSS Prevention**: Security headers and input validation
4. **Token Expiration**: Automatic refresh and validation
5. **Route Protection**: Middleware-level security
6. **Error Handling**: Secure error messages without information leakage

## Maintenance

### Regular Tasks
1. Monitor authentication errors and patterns
2. Update dependencies for security patches  
3. Review and rotate JWT secrets
4. Audit access patterns and anomalies
5. Test authentication flow after updates

### Scaling Considerations
- Consider Redis for session storage at scale
- Implement rate limiting for auth endpoints
- Add monitoring and alerting for auth failures
- Consider multi-factor authentication
- Plan for token blacklisting if needed
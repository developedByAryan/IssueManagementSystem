# Authentication System - Complete Implementation

## Overview
Complete JWT-based authentication system with role-based access control (RBAC) for your Issue Management System.

## Features Implemented

### 1. **Token Generation & Verification**
   - JWT token generation with configurable expiration
   - Secure token decoding and validation
   - Password hashing using bcrypt

### 2. **Role-Based Access Control**
   - **ADMIN**: Full system access
   - **DEPARTMENT_STAFF**: Can manage issues and assign them
   - **USER**: Can create and view their own issues

### 3. **Protected Routes**
   
   #### Public Endpoints (No Authentication Required)
   - `POST /api/v1/users/register` - Register new user
   - `POST /api/v1/users/login` - Login and get JWT token
   
   #### Authenticated Endpoints (Requires Login)
   - `GET /api/v1/users/me` - Get current user info
   - `POST /api/v1/issues/` - Create new issue
   - `GET /api/v1/issues/` - Get all issues (filtered by role)
   - `GET /api/v1/issues/{issue_id}` - Get specific issue
   - `PUT /api/v1/issues/{issue_id}` - Update issue
   - `DELETE /api/v1/issues/{issue_id}` - Delete issue (admin or reporter)
   - `GET /api/v1/departments/` - List all departments
   - `GET /api/v1/departments/{department_id}` - Get department details
   
   #### Staff/Admin Only Endpoints
   - `POST /api/v1/issues/{issue_id}/assign/{assignee_id}` - Assign issue to user
   
   #### Admin Only Endpoints
   - `GET /api/v1/users/` - List all users
   - `GET /api/v1/users/{user_id}` - Get user details
   - `DELETE /api/v1/users/{user_id}` - Delete user
   - `POST /api/v1/departments/` - Create department
   - `PUT /api/v1/departments/{department_id}` - Update department
   - `DELETE /api/v1/departments/{department_id}` - Delete department

## Files Created/Modified

### Core Authentication
- `backend/core/security.py` - JWT token utilities and password hashing
- `backend/api/deps.py` - Authentication dependencies

### Application Layer
- `backend/application/user_usecase.py` - Updated to use new security module
- `backend/application/issue_usecase.py` - Business logic with permission checks

### API Routes
- `backend/api/v1/routes/user.py` - User endpoints with protected routes
- `backend/api/v1/routes/issue.py` - Issue management with RBAC
- `backend/api/v1/routes/department.py` - Department management (admin only)

### Schemas
- `backend/schemas/issue.py` - Issue, comment, and department schemas

## Usage Examples

### 1. Register a New User
```bash
curl -X POST "http://localhost:8000/api/v1/users/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123",
    "username": "johndoe",
    "full_name": "John Doe"
  }'
```

### 2. Login and Get Token
```bash
curl -X POST "http://localhost:8000/api/v1/users/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### 3. Access Protected Endpoint
```bash
curl -X GET "http://localhost:8000/api/v1/users/me" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Create an Issue (Authenticated)
```bash
curl -X POST "http://localhost:8000/api/v1/issues/" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Login button not working",
    "description": "The login button on the homepage is not responding to clicks",
    "department_id": "uuid-here",
    "priority": "HIGH"
  }'
```

### 5. Assign Issue (Staff/Admin Only)
```bash
curl -X POST "http://localhost:8000/api/v1/issues/{issue_id}/assign/{user_id}" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/ims_db
JWT_SECRET_KEY=your-secret-key-here-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

## Security Features

1. **Password Security**
   - Passwords hashed using bcrypt
   - Never stored in plain text

2. **Token Security**
   - JWT tokens with expiration
   - Configurable token lifetime
   - Secure token validation

3. **Permission Checks**
   - Role-based access control
   - Resource-level permissions (e.g., users can only modify their own issues)
   - Admin override for all operations

4. **Input Validation**
   - Pydantic models for request validation
   - Email validation
   - Field length constraints

## Permission Matrix

| Action | User | Staff | Admin |
|--------|------|-------|-------|
| Register/Login | ✅ | ✅ | ✅ |
| View own profile | ✅ | ✅ | ✅ |
| Create issue | ✅ | ✅ | ✅ |
| View own issues | ✅ | ✅ | ✅ |
| View all issues | ❌ | ❌ | ✅ |
| Update own issue | ✅ | ✅ | ✅ |
| Update any issue | ❌ | ✅ | ✅ |
| Delete own issue | ✅ | ✅ | ✅ |
| Delete any issue | ❌ | ❌ | ✅ |
| Assign issues | ❌ | ✅ | ✅ |
| Manage departments | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |

## Testing the Authentication

1. Start the server:
```bash
cd backend
uvicorn main:app --reload
```

2. Access API documentation:
   - Swagger UI: http://localhost:8000/api-test
   - Use the "Authorize" button to add your JWT token

3. Test the flow:
   - Register a user
   - Login to get token
   - Use token to access protected endpoints
   - Try accessing admin endpoints (should fail for regular users)

## Error Handling

The system returns appropriate HTTP status codes:
- `200/201` - Success
- `400` - Bad request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Resource not found
- `500` - Internal server error

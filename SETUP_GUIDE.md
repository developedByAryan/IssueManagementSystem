# Issue Management System - Complete Setup Guide

## 🚀 Quick Start Guide

### Backend Setup

1. **Navigate to backend**:
   ```bash
   cd backend
   ```

2. **Create virtual environment** (optional but recommended):
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # Unix/Mac
   source venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**:
   Create `.env` file in backend directory:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/ims_db
   JWT_SECRET_KEY=your-super-secret-key-change-this
   JWT_ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=60
   ```

5. **Run database migrations**:
   ```bash
   alembic upgrade head
   ```

6. **Start backend server**:
   ```bash
   uvicorn main:app --reload
   ```
   Backend will run on http://localhost:8000

### Frontend Setup

1. **Navigate to frontend** (new terminal):
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment is pre-configured**:
   `.env.local` already points to http://localhost:8000

4. **Start frontend server**:
   ```bash
   npm run dev
   ```
   Frontend will run on http://localhost:3000

## 📝 First-Time Usage

1. **Open browser**: Go to http://localhost:3000

2. **Register account**:
   - Click "Register here"
   - Fill in your details
   - You'll be automatically logged in

3. **Create a department** (if you're admin):
   - Go to "Departments" in navigation
   - Click "Create Department"
   - Add IT, HR, Finance, etc.

4. **Create your first issue**:
   - Go to "Issues"
   - Click "Create Issue"
   - Fill in title, description, select department
   - Choose priority level

5. **Explore features**:
   - Dashboard shows statistics
   - Issues page for full CRUD
   - Staff/Admin can change status
   - Admin can manage users and departments

## 🔑 User Roles

### Default User (after registration)
- ✅ Create issues
- ✅ View own issues
- ✅ Edit own issues
- ✅ Delete own issues
- ✅ View departments

### Department Staff
To make a user staff, update in database:
```sql
UPDATE users SET role = 'DEPARTMENT_STAFF' WHERE email = 'user@example.com';
```
Additional permissions:
- ✅ View all issues
- ✅ Update issue status
- ✅ Assign issues to users

### Admin
To make a user admin:
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@example.com';
```
Full permissions:
- ✅ All staff permissions
- ✅ Manage users
- ✅ Create/edit/delete departments
- ✅ Delete any issue

## 🧪 Testing the System

### Test Authentication
```bash
# Register
curl -X POST http://localhost:8000/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "username": "testuser",
    "full_name": "Test User"
  }'

# Login
curl -X POST http://localhost:8000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

### Access API Documentation
Visit http://localhost:8000/api-test for interactive Swagger documentation

## 📁 Project Structure

```
Project/
├── backend/
│   ├── api/                    # API routes
│   ├── application/           # Use cases/business logic
│   ├── core/                  # Config, security, exceptions
│   ├── domain/                # Entities, repositories, services
│   ├── infrastructure/        # Database, implementations
│   ├── schemas/               # Pydantic models
│   ├── alembic/              # Database migrations
│   ├── main.py               # FastAPI app
│   └── requirements.txt      # Python dependencies
│
└── frontend/
    ├── app/                   # Next.js pages
    │   ├── dashboard/        # Protected routes
    │   ├── login/           # Auth pages
    │   └── register/
    ├── contexts/             # React contexts
    ├── lib/                  # API client, types
    └── package.json         # Node dependencies
```

## 🔧 Troubleshooting

### Backend Issues

**Database connection error**:
- Ensure PostgreSQL is running
- Check DATABASE_URL in `.env`
- Create database: `createdb ims_db`

**Import errors**:
- Verify all dependencies installed
- Check Python version (3.11+)

**Migration errors**:
- Delete alembic/versions/*.py (except __init__.py)
- Run: `alembic revision --autogenerate -m "init"`
- Then: `alembic upgrade head`

### Frontend Issues

**Cannot connect to backend**:
- Ensure backend is running on port 8000
- Check NEXT_PUBLIC_API_URL in `.env.local`

**Type errors**:
- Delete `.next` folder
- Run `npm install` again

**Authentication not working**:
- Clear browser localStorage
- Check browser console for errors

## 🎯 Common Tasks

### Add admin user via database
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';
```

### Reset user password
User must use forgot password feature (if implemented) or update in database:
```python
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
new_hash = pwd_context.hash("newpassword123")
# Update in database with this hash
```

### View all API endpoints
Backend: http://localhost:8000/api-test
Or check `backend/api/v1/routes/` files

## 📚 Key Features

### Backend
✅ JWT authentication with role-based access
✅ Clean architecture (Domain-driven design)
✅ SQLAlchemy ORM with Alembic migrations
✅ FastAPI with automatic OpenAPI docs
✅ Repository pattern for data access
✅ Comprehensive error handling

### Frontend
✅ Modern React 19 with Next.js 16
✅ TypeScript for type safety
✅ Tailwind CSS for responsive design
✅ Context API for state management
✅ Protected routes with automatic redirect
✅ Role-based UI rendering

## 🚢 Production Deployment

### Backend
1. Use production database (PostgreSQL)
2. Set secure JWT_SECRET_KEY
3. Configure CORS for frontend domain
4. Use gunicorn or similar WSGI server
5. Enable HTTPS

### Frontend
1. Build: `npm run build`
2. Deploy to Vercel/Netlify
3. Set NEXT_PUBLIC_API_URL to production backend
4. Enable HTTPS

## 📞 Support

For issues or questions:
- Check documentation in backend/AUTH_README.md
- Review API docs at /api-test
- Check browser console for frontend errors
- Review backend logs for API errors

## 🎉 You're All Set!

The system is now ready to use. Start by creating departments, then issues, and explore the full functionality. Admins can manage users and departments, while staff can handle issue workflow.

# Employee Management System (EMS)

A full-stack Employee Management System built with **Next.js 14** (frontend) and **Django REST Framework** (backend), featuring JWT authentication, dynamic form builder with drag-and-drop, and employee CRUD with dynamic fields.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| State Management | Zustand |
| Form Handling | React Hook Form + Zod |
| Drag & Drop | @dnd-kit |
| HTTP Client | Axios |
| Backend | Django 4.2, Django REST Framework |
| Authentication | JWT (SimpleJWT) |
| Database | SQLite (dev) / PostgreSQL (prod) |
| API Filtering | django-filter |

---

## Project Structure

```
emp-management/
├── backend/                    # Django REST Framework
│   ├── apps/
│   │   ├── accounts/           # Auth: login, register, profile, change-password
│   │   ├── employees/          # Employee CRUD with dynamic data
│   │   └── forms/              # Dynamic form builder
│   ├── config/
│   │   ├── settings.py
│   │   └── urls.py
│   ├── manage.py
│   └── requirements.txt
├── frontend/                   # Next.js 14
│   └── src/
│       ├── app/
│       │   ├── login/          # Login page
│       │   ├── register/       # Registration page
│       │   ├── dashboard/      # Dashboard with stats
│       │   ├── employees/      # Employee list, create, edit
│       │   ├── forms/          # Form builder, list
│       │   └── profile/        # User profile + change password
│       ├── components/
│       │   └── layout/         # Sidebar navigation
│       ├── lib/
│       │   ├── api.ts          # Axios client + all API calls
│       │   └── utils.ts        # Helpers
│       ├── store/
│       │   └── authStore.ts    # Zustand auth state
│       └── types/
│           └── index.ts        # TypeScript types
└── EMS_API.postman_collection.json
```

---

## Quick Start

### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Linux/macOS
venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

Backend runs at: `http://localhost:8000`  
Admin panel: `http://localhost:8000/admin`

---

### 2. Frontend Setup

```bash
cd frontend

copy .env.local.example .env.local

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at: `http://localhost:3000`

---

## Environment Variables

### Frontend — `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

---

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register/` | Register new user | No |
| POST | `/api/auth/login/` | Login (returns JWT) | No |
| POST | `/api/auth/logout/` | Logout (blacklists refresh token) | Yes |
| POST | `/api/auth/token/refresh/` | Refresh access token | No |
| GET | `/api/auth/profile/` | Get own profile | Yes |
| PATCH | `/api/auth/profile/` | Update profile | Yes |
| POST | `/api/auth/change-password/` | Change password | Yes |

### Employee Forms (Dynamic Form Builder)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/forms/` | List all forms | Yes |
| POST | `/api/forms/` | Create form with fields | Yes |
| GET | `/api/forms/{id}/` | Get form | Yes |
| PUT | `/api/forms/{id}/` | Full update form | Yes |
| PATCH | `/api/forms/{id}/` | Partial update | Yes |
| DELETE | `/api/forms/{id}/` | Delete form | Yes |
| GET | `/api/forms/{id}/with_fields/` | Get form with all fields | Yes |
| GET | `/api/forms/active/` | List active forms | Yes |

### Employees

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/employees/` | List employees (paginated, filterable) | Yes |
| POST | `/api/employees/` | Create employee | Yes |
| GET | `/api/employees/{id}/` | Get employee | Yes |
| PUT | `/api/employees/{id}/` | Full update | Yes |
| PATCH | `/api/employees/{id}/` | Partial update | Yes |
| DELETE | `/api/employees/{id}/` | Delete employee | Yes |
| GET | `/api/employees/stats/` | Stats summary | Yes |

### Employee Filtering Query Params

```
GET /api/employees/?search=John           # Full-text search
GET /api/employees/?status=active         # Filter by status
GET /api/employees/?department=Eng        # Filter by department
GET /api/employees/?position=Developer    # Filter by position
GET /api/employees/?name=Alice            # Filter by name
GET /api/employees/?date_joined_from=2024-01-01&date_joined_to=2024-12-31
GET /api/employees/?dynamic_field=employment_type&dynamic_value=Full-time
GET /api/employees/?ordering=-created_at  # Sort (prefix - for desc)
GET /api/employees/?page=1               # Pagination
```

---

## Features

### Authentication & Profile
- ✅ Register with email + username
- ✅ Login with JWT access + refresh tokens
- ✅ Auto token refresh via Axios interceptor
- ✅ Logout with token blacklisting
- ✅ View & update profile
- ✅ Change password

### Dynamic Form Builder
- ✅ Create named forms with description
- ✅ Add fields: Text, Number, Email, Password, Date, DateTime, Textarea, Select, Checkbox, Radio, Phone, URL
- ✅ Configure each field: label, field name (slug), placeholder, help text, required toggle
- ✅ Add options for Select / Radio / Checkbox fields
- ✅ **Drag-and-drop** reordering with @dnd-kit
- ✅ Edit existing forms
- ✅ Delete forms

### Employee Management
- ✅ Create employees using a selected dynamic form
- ✅ All dynamic form fields rendered at employee creation time
- ✅ Dynamic field data stored as JSON in `dynamic_data`
- ✅ Employee list with search + filters (name, status, department, dynamic fields)
- ✅ View/edit individual employee
- ✅ Delete employees
- ✅ Dashboard with statistics (total, active, inactive, on-leave, terminated)

---

## Postman Collection

Import `EMS_API.postman_collection.json` into Postman.

The collection includes:
- Pre-request scripts that auto-save tokens on login/register
- All endpoints grouped by module
- Example request bodies
- Bearer token auth pre-configured

**Usage:**
1. Open Postman → Import → Select `EMS_API.postman_collection.json`
2. Run **Register** or **Login** — tokens are saved automatically as collection variables
3. All other requests use `{{access_token}}` automatically

---

## Supported Field Types

| Type | Input | Use Case |
|------|-------|----------|
| `text` | `<input type="text">` | Names, descriptions |
| `number` | `<input type="number">` | Salary, age |
| `email` | `<input type="email">` | Contact email |
| `password` | `<input type="password">` | Sensitive data |
| `date` | `<input type="date">` | DOB, join date |
| `datetime` | `<input type="datetime-local">` | Events |
| `textarea` | `<textarea>` | Long text, skills |
| `select` | `<select>` | Employment type, grade |
| `checkbox` | `<input type="checkbox">` | Multi-select options |
| `radio` | `<input type="radio">` | Single-select options |
| `phone` | `<input type="tel">` | Phone numbers |
| `url` | `<input type="url">` | LinkedIn, portfolio |

---

## JWT Token Handling

- **Access token**: 60 minutes (stored in cookie)
- **Refresh token**: 7 days (stored in cookie)
- **Auto-refresh**: Axios interceptor automatically retries requests after refreshing
- **Blacklisting**: Refresh tokens are blacklisted on logout

---

## License

MIT

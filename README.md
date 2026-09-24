# Event Registration System

A full-stack Event Registration System built with Django REST Framework and React.

Users can register, log in, browse events, register for events, view their tickets, and cancel registrations.

## Technologies

- Python
- Django
- Django REST Framework
- SQLite
- JWT Authentication
- React + Vite
- Postman
- Git & GitHub

## Features

- User registration and login
- JWT authentication
- View all events
- View event details
- Search and filter events
- Register for events
- View personal registrations
- Cancel registrations
- Prevent duplicate registrations
- Event capacity checking
- Django Admin panel
- Responsive React frontend

## API Endpoints

```text
GET    /api/events/
GET    /api/events/<id>/

POST   /api/auth/register/
POST   /api/auth/login/
POST   /api/auth/token/refresh/

POST   /api/registrations/
GET    /api/my-registrations/
DELETE /api/registrations/<id>/cancel/
```

## Example Registration Request

```json
{
    "event": 1
}
```

Authenticated requests use:

```text
Authorization: Bearer <access_token>
```

## Validation

Duplicate registration:

```json
{
    "error": "You are already registered for this event."
}
```

Event full:

```json
{
    "error": "This event is full."
}
```

## Run the Backend

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run migrations:

```bash
python manage.py migrate
```

Create an admin user:

```bash
python manage.py createsuperuser
```

Start the Django server:

```bash
python manage.py runserver
```

Backend:

```text
http://127.0.0.1:8000/
```

Admin panel:

```text
http://127.0.0.1:8000/admin/
```

## Frontend

The `frontend/` folder contains **Admit One**, a responsive React frontend built with Vite.

The frontend includes:

- Events dashboard
- Upcoming, All, Past, and My Events filters
- Event search
- Event details
- User registration
- User login
- My Tickets
- Event registration
- Registration cancellation
- JWT authentication
- Success and error notifications
- Protected routes

## Run the Frontend

First, make sure the Django backend is running.

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Then open:

```text
http://localhost:5173/
```

The Vite development server proxies `/api` requests to:

```text
http://127.0.0.1:8000
```

## Production Build

To create a production frontend build:

```bash
cd frontend
npm run build
```

The generated files will be placed inside:

```text
frontend/dist/
```

## Testing

The REST APIs were tested using **Postman** with JWT Bearer Token authentication.
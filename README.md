# Event Registration System

A backend Event Registration System developed for the **CodeAlpha Backend Development**.

Users can register, log in, view events, register for events, view their registrations, and cancel them.

## Technologies

- Python
- Django
- Django REST Framework
- SQLite
- JWT Authentication
- Postman
- Git & GitHub

## Features

- User registration and login
- JWT authentication
- View all events
- View event details
- Register for events
- View personal registrations
- Cancel registrations
- Prevent duplicate registrations
- Event capacity checking
- Django Admin panel

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
Authorization → Bearer Token
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

## Run the Project

Create virtual environment:

```bash
python -m venv venv
```

Activate on Windows:

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

Create admin user:

```bash
python manage.py createsuperuser
```

Start server:

```bash
python manage.py runserver
```

Open:

```text
http://127.0.0.1:8000/
```

Admin panel:

```text
http://127.0.0.1:8000/admin/
```

## Testing

APIs were tested using **Postman** with JWT Bearer Token authentication.

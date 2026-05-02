# Backend Documentation

## Overview

This backend is a Django REST API for a chess coaching application.
It includes:

- `apps.User` for user registration, authentication, and profile retrieval
- `apps.Games` for saving and listing chess games
- `apps.Coach` for chess analysis using the Anthropic Claude API
- `apps.LeaderBoard` for city-based leaderboard ranking

The backend is configured with JWT authentication, CORS support for localhost, and optional deployment settings.

## Setup

1. Create and activate a Python virtual environment:

```bash
cd /Users/kana/Desktop/ChessFactorial/backend
python3 -m venv venv
source venv/bin/activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Run database migrations:

```bash
./venv/bin/python manage.py migrate
```

4. Create a superuser if needed:

```bash
./venv/bin/python manage.py createsuperuser
```

5. Start the development server:

```bash
./venv/bin/python manage.py runserver
```

## Environment Variables

Create a `.env` file in `backend/` or set these environment variables directly.

- `SECRET_KEY` - Django secret key.
- `DEBUG` - `True` or `False`.
- `ALLOWED_HOSTS` - comma-separated allowed hosts.
- `DATABASE_URL` - optional production database URL.
- `ANTHROPIC_API_KEY` - required for the coach analysis endpoint.
- `CORS_VERCEL_ORIGIN` - optional allowed origin for production frontend on Vercel.

Example:

```env
SECRET_KEY=supersecret
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
ANTHROPIC_API_KEY=your-anthropic-api-key
CORS_VERCEL_ORIGIN=https://your-production-frontend.vercel.app
```

## Dependencies

- Django
- djangorestframework
- djangorestframework-simplejwt
- django-cors-headers
- dj-database-url
- python-decouple
- whitenoise
- anthropic
- gunicorn
- psycopg2-binary

## Key Configuration

### Authentication

The backend uses JWT authentication with `djangorestframework-simplejwt`.
The default permission class requires authentication on all endpoints unless explicitly overridden.

### CORS

Configured origins:

- `http://localhost:4200`
- `http://127.0.0.1:4200`
- optional `CORS_VERCEL_ORIGIN`

### Static Files

Static files are served via `whitenoise` with compressed manifest storage for deployment.

## API Endpoints

### Authentication

- `POST /api/auth/register/` - create a new user
  - expected payload: `first_name`, `last_name`, `username`, `email`, `password`
  - returns a new user object plus `access`/`refresh` tokens
  - the user object includes `rating`, `games_won`, and `games_played`
- `POST /api/auth/token/` - obtain JWT access and refresh tokens
- `POST /api/auth/token/login/` - alias for token obtain; accepts either `username` or `email` with `password`
- `POST /api/auth/token/refresh/` - refresh access token
- `GET /api/auth/me/` - current authenticated user profile

### Games

- `POST /api/games/save/` - save a new game
- `GET /api/games/list/` - list authenticated user's games
- `GET /api/games/<id>/single/` - retrieve a specific game
- `GET /api/games/<id>/` - retrieve a specific game (alternate path)
- `DELETE /api/games/<id>/delete/` - delete a game

### Coach Analysis

- `POST /api/games/<id>/analyse/` - analyze a saved game using Anthropic Claude

This endpoint requires authentication and an `ANTHROPIC_API_KEY`.
If analysis already exists, it returns the cached result.

### Leaderboard

- `GET /api/leaderboard/top/` - top users ordered by `games_won` and `games_played`
- optional query parameter: `?city=<city>` to filter leaderboard by city

## Data Models

### User

The custom user model extends `AbstractUser` and adds:

- `city`
- `games_won`
- `games_played`

### Game

- `user` - ForeignKey to custom user
- `pgn` - saved PGN string
- `result` - `win`, `loss`, `draw`, `resigned`
- `mode` - `human` or `ai`
- `ai_level` - optional AI difficulty
- `created_at` - automatic timestamp
- `analysis` - JSONField containing coach analysis

## Fixed Issues

- Fixed route ordering so `api/leaderboard/` resolves before the broad `api/` coach route
- Improved analysis caching logic to avoid retriggering analysis when saved value is an empty JSON structure
- Hardened Anthropic response parsing for string or block-based content
- Removed duplicate `STATIC_URL` configuration
- Added explicit localhost CORS support for `127.0.0.1:4200`
- Made the Vercel origin optional instead of including a placeholder URL by default

## Troubleshooting

- If authentication fails, verify that the access token is sent in the `Authorization: Bearer <token>` header.
- If analysis fails, ensure `ANTHROPIC_API_KEY` is set and valid.
- If CORS errors occur, confirm the frontend is loading from `http://localhost:4200` or a configured production origin.

## Notes

The backend is designed to support a separate Angular frontend running on `localhost:4200`.
Keep backend logic focused on REST operations while the frontend handles UI and chess visualization.

# AdminHub21 Backend Rules

## Stack
- Laravel 13 (PHP 8.3)
- PostgreSQL 17
- Laravel Sanctum (token auth)
- Fruitcake CORS
- Route versioning under `/api/v1`

## Directory Conventions
- `app/Http/Controllers/Api/V1/` - All API controllers
- `routes/api/v1/*.php` - Versioned route files
- `app/Models/` - Eloquent models
- `database/migrations/` - Database migrations
- `config/` - Application configuration

## API Standards
- All API routes MUST be under `/api/v1/` prefix
- Use resource controllers for CRUD operations
- Return JSON responses with proper HTTP status codes
- Use Laravel validation for all incoming requests
- Use Sanctum tokens for authentication
- Use `auth:sanctum` middleware for protected routes
- Use `admin` middleware for admin-only routes

## Code Style
- PSR-4 autoloading
- Strict types where applicable
- No `dd()` or `dump()` in production code
- Use Laravel Pint for code formatting
- Use meaningful variable and method names

## Database
- PostgreSQL 17
- Use migrations for all schema changes
- Use factories and seeders for test data
- Soft deletes where appropriate
- Indexes on frequently queried columns

## Security
- All inputs must be validated
- Use Laravel's built-in CSRF protection (exempt API routes)
- Sanitize all user inputs
- Use HTTPS in production
- Rate limiting on all public endpoints

## Git
- Commit messages must be clear and descriptive
- Never commit `.env` files or secrets
- Use feature branches for new features

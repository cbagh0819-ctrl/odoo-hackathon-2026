# API Specification & Data Contract

> **Single Source of Truth** for Member 2 (Backend) and Member 3 (Frontend).
> Managed and owned by Member 1 (Team Lead).

## 1. Authentication
* `POST /api/auth/register` - Create user account
* `POST /api/auth/login` - Obtain JWT or session token
* `GET /api/auth/me` - Current logged-in user profile

## 2. Core Resource Endpoints
*(Team Lead will define specific endpoints once the problem statement is chosen)*

### Template Format:
```json
// GET /api/items
// Response:
{
  "status": "success",
  "data": [
    {
      "id": "item_123",
      "title": "Sample Title",
      "status": "active",
      "created_at": "2026-10-31T10:00:00Z"
    }
  ]
}
```

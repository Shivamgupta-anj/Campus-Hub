# CampusHub — API Documentation & Contract Reference

All API routes are served under Next.js App Router Route Handlers (`src/app/api/`). Authentication uses signed JWT tokens transmitted via `HttpOnly` cookie (`campushub_token`) or `Authorization: Bearer <token>` header.

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Creates a new verified student account.
- **Access:** Public
- **Request Body:**
  ```json
  {
    "name": "Aarav Sharma",
    "email": "aarav.sharma@iitd.ac.in",
    "password": "Password@123",
    "college": "Indian Institute of Technology (IIT) Delhi",
    "course": "B.Tech",
    "branch": "Computer Science & Engineering",
    "academicYear": "3rd Year (Junior)"
  }
  ```
- **Responses:**
  - `201 Created`: Returns user object and sets `campushub_token` cookie.
  - `400 Bad Request`: Zod validation failure.
  - `409 Conflict`: Email already exists.

### `POST /api/auth/login`
Authenticates user credentials.
- **Access:** Public
- **Request Body:**
  ```json
  {
    "email": "aarav.sharma@iitd.ac.in",
    "password": "Password@123"
  }
  ```
- **Responses:**
  - `200 OK`: Returns authenticated user info and sets session cookie.
  - `401 Unauthorized`: Invalid credentials.
  - `403 Forbidden`: Account suspended.

### `POST /api/auth/logout`
Clears session cookies.
- **Access:** Public

### `GET /api/auth/me`
Retrieves currently logged-in user profile.
- **Access:** Authenticated User
- **Response:**
  - `200 OK`: User profile object.
  - `401 Unauthorized`: No active session.

---

## 2. User Profile Endpoints

### `GET /api/users/me`
Fetches authenticated user's profile details.
- **Access:** Authenticated User

### `PATCH /api/users/me`
Updates allowed student profile fields (bio, phone, college, course, branch, academic year, name). Role and status cannot be modified.
- **Access:** Authenticated User

### `GET /api/users/:id`
Retrieves public profile of another student, along with their active and sold listing counts.
- **Access:** Public

---

## 3. Marketplace Listings Endpoints

### `GET /api/listings`
Browses, filters, searches, and paginates marketplace listings.
- **Access:** Public
- **Query Parameters:**
  - `q`: String search keyword
  - `category`: Category slug
  - `condition`: `Brand New`, `Like New`, `Good`, `Fair`
  - `college`: Filter by campus
  - `sellerId`: Filter by seller ID
  - `minPrice`: Minimum price filter
  - `maxPrice`: Maximum price filter
  - `status`: `active` (default), `sold`, `removed`, or `all`
  - `sort`: `newest`, `price-asc`, `price-desc`, `popular`
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 12)
- **Response:**
  ```json
  {
    "success": true,
    "listings": [...],
    "pagination": { "page": 1, "limit": 12, "total": 45, "totalPages": 4 }
  }
  ```

### `POST /api/listings`
Publishes a new listing on the marketplace.
- **Access:** Authenticated User
- **Request Body:**
  ```json
  {
    "title": "Casio FX-991EX Scientific Calculator",
    "description": "Used for two semesters in Engineering Maths. Pristine condition.",
    "price": 850,
    "category": "calculators",
    "condition": "Like New",
    "college": "IIT Delhi",
    "images": ["/uploads/item-123.jpg"]
  }
  ```

### `GET /api/listings/:id`
Retrieves full listing detail with seller info, increments view count atomically, and returns up to 4 related items.
- **Access:** Public

### `PATCH /api/listings/:id`
Modifies listing details (title, description, price, condition, category, images).
- **Access:** Listing Owner or Admin

### `DELETE /api/listings/:id`
Permanently deletes a listing.
- **Access:** Listing Owner or Admin

### `PATCH /api/listings/:id/status`
Updates status of a listing (`active` or `sold`).
- **Access:** Listing Owner or Admin
- **Request Body:** `{ "status": "sold" }`

---

## 4. Wishlist / Saved Listings Endpoints

### `GET /api/listings/:id/save`
Checks whether the current user has bookmarked the listing.
- **Access:** Authenticated User

### `POST /api/listings/:id/save`
Toggles saving/unsaving the listing.
- **Access:** Authenticated User
- **Response:** `{ "success": true, "saved": true, "message": "Added to saved listings" }`

### `GET /api/saved`
Retrieves all listings saved by the authenticated student.
- **Access:** Authenticated User

---

## 5. Conversations & Messaging Endpoints

### `GET /api/chats`
Lists all conversations involving the authenticated user, sorted by latest message.
- **Access:** Authenticated User

### `POST /api/chats`
Initiates or retrieves an existing conversation thread for a listing.
- **Access:** Authenticated User (Buyer)
- **Request Body:** `{ "listingId": "65123...", "initialMessage": "Hi, is this available?" }`

### `GET /api/chats/:id/messages`
Retrieves message thread history. Automatically marks unread messages from the other participant as read.
- **Access:** Conversation Participant Only

### `POST /api/chats/:id/messages`
Sends a message in the conversation thread.
- **Access:** Conversation Participant Only
- **Request Body:** `{ "text": "Can we meet near the central library?" }`

---

## 6. Community Reports & Moderation Endpoints

### `POST /api/reports`
Submits a flag on an inappropriate or suspicious listing or user.
- **Access:** Authenticated User
- **Request Body:**
  ```json
  {
    "targetType": "listing",
    "targetId": "65123...",
    "reason": "Suspected fraudulent / scam price",
    "description": "Seller is offering a ₹80,000 laptop for ₹2,000."
  }
  ```

### `GET /api/admin/stats`
Retrieves platform counts (users, active/sold listings, pending reports, chats).
- **Access:** Administrator Only

### `GET /api/admin/listings`
Lists all listings across all statuses with moderator actions.
- **Access:** Administrator Only

### `PATCH /api/admin/listings`
Updates listing status (e.g., suspend or restore item).
- **Access:** Administrator Only

### `GET /api/admin/users`
Lists all registered users with filter by status and role.
- **Access:** Administrator Only

### `PATCH /api/admin/users`
Suspends or reactivates a student account.
- **Access:** Administrator Only

### `GET /api/admin/reports`
Lists all submitted reports with status filtering.
- **Access:** Administrator Only

### `PATCH /api/admin/reports`
Updates report status (`reviewed`, `resolved`, `dismissed`) with admin review notes.
- **Access:** Administrator Only

---

## 7. File Upload Endpoint

### `POST /api/upload`
Accepts `multipart/form-data` or JSON with base64 `dataUrl`. Validates MIME types (JPG, PNG, WEBP, GIF) and limits file size to 5MB. Stores file safely with randomized names.
- **Access:** Authenticated User
- **Response:** `{ "success": true, "url": "/uploads/item-1718000000-abcdef.jpg" }`

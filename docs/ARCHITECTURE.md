# CampusHub — Architecture & Design Document

## 1. System Overview

CampusHub is a full-stack college marketplace application designed specifically for students to buy, sell, and trade course textbooks, electronics, scientific calculators, stationery, cycles, and hostel room essentials within verified campus communities.

The application is architected as a unified Next.js (App Router) project with clean boundaries separating UI components, backend route handlers, Mongoose ODM database models, and authentication services.

## 2. Architectural Principles

- **Unified Single-Stack Application:** Combines modern React 19 / Next.js frontend with robust TypeScript Route Handlers. Eliminates unnecessary inter-service latency and distributed service complexity.
- **Strict Separation of Concerns:**
  - `src/app/` — Presentation and App Router page layouts.
  - `src/app/api/` — RESTful Route Handlers enforcing HTTP semantics, validation, and authorization.
  - `src/models/` — Mongoose ODM models with field-level constraints and database indexing.
  - `src/lib/` — Database connection pooling, cryptographic password hashing, JWT signing, and Zod schemas.
  - `src/components/` — Modular, accessible, and responsive UI components.
  - `src/types/` — Shared TypeScript domain types.
- **Strict Server-Side Authorization:** Every mutation (creating/updating/deleting listings, sending messages, resolving reports, and modifying user accounts) rigorously verifies caller identity and role on the server. Browser-supplied user IDs or roles are never trusted.
- **No Unused Complexity:** Specifically pruned of artificial AI/ML or RAG dependencies in accordance with strict scope specifications, maintaining maximum performance, reliability, and code clarity.

## 3. High-Level Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                  Client Browser                                   |
|   (Next.js App Router: Landing, Marketplace, Details, Chat, Dashboard, Admin)    |
+-----------------------------------------------------------------------------------+
                                         │  ▲
                         HTTPS / JSON    │  │  HttpOnly Session Cookie (campushub_token)
                                         ▼  │
+-----------------------------------------------------------------------------------+
|                        Next.js Server & Route Handlers                            |
|                                                                                   |
|   /api/auth/*       /api/listings/*       /api/chats/*       /api/admin/*         |
|   Authentication    Catalog & CRUD        Peer Messaging     Moderation & Stats   |
+-----------------------------------------------------------------------------------+
                                         │  ▲
                              Mongoose   │  │  Connection Caching
                                         ▼  │
+-----------------------------------------------------------------------------------+
|                                 MongoDB Database                                  |
|   Users  •  Listings  •  Categories  •  SavedListings  •  Conversations  •  Reports|
+-----------------------------------------------------------------------------------+
```

## 4. Key Security Controls

1. **Password Hashing:** Passwords hashed with `bcryptjs` (salt rounds: 12). Plaintext passwords are never persisted or logged.
2. **Session Cookies:** Signed JWT issued into an `HttpOnly`, `SameSite=Lax`, `Secure` (in production) cookie (`campushub_token`).
3. **Privilege Escalation Prevention:** User registration and profile updates cannot modify account role or status. Admin status can only be granted directly through verified administrative setup scripts.
4. **Ownership Verification:** Listing modifications, deletions, and chat message retrieval require participant/owner equality checks.
5. **Image Upload Restrictions:** Strict MIME type checking (JPG, PNG, WEBP, GIF), maximum 5MB file size limit, and randomized filenames preventing file-override attacks.

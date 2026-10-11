# CampusHub — MongoDB Database Models & Schemas

CampusHub utilizes MongoDB with Mongoose ODM. This document outlines every persistent collection, schema structure, data types, and index optimizations.

---

## 1. User Model (`src/models/User.ts`)

Represents student and administrative users registered on CampusHub.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `_id` | ObjectId | Auto-generated PK | Unique identifier |
| `name` | String | Required, Trim | Full name of the student |
| `email` | String | Required, Unique, Lowercase, Indexed | College email address |
| `passwordHash` | String | Required | Bcrypt salted hash (salt rounds: 12) |
| `college` | String | Required, Indexed | College name |
| `course` | String | Required | Degree program (e.g., B.Tech, M.Tech) |
| `branch` | String | Required | Department / Specialization |
| `academicYear` | String | Required | Academic year standing (e.g., 3rd Year) |
| `profileImage` | String | Optional | URL to avatar |
| `bio` | String | Max 500 chars | Student bio |
| `phoneNumber` | String | Optional | Contact number |
| `role` | String | Enum: `student`, `admin`, Indexed | Default: `student` |
| `status` | String | Enum: `active`, `suspended`, Indexed | Default: `active` |
| `createdAt` | Date | Timestamp | Registration timestamp |
| `updatedAt` | Date | Timestamp | Last update timestamp |

**Indexes:**
- Unique index: `{ email: 1 }`
- Lookup index: `{ college: 1 }`
- Moderation filter index: `{ role: 1, status: 1 }`

---

## 2. Listing Model (`src/models/Listing.ts`)

Represents items posted for sale on the campus marketplace.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `_id` | ObjectId | Auto-generated PK | Unique identifier |
| `sellerId` | ObjectId | Ref: `User`, Required, Indexed | User who created the listing |
| `title` | String | Required, Min 3, Max 150 | Product title |
| `description` | String | Required, Min 10, Max 3000 | Detailed condition and description |
| `price` | Number | Required, Min 0 | Price in INR (₹) |
| `category` | String | Required, Indexed | Product category slug |
| `condition` | String | Enum: `Brand New`, `Like New`, `Good`, `Fair` | Item physical condition |
| `images` | [String] | Array of URLs (Max 8) | Photos uploaded by seller |
| `college` | String | Required, Indexed | Campus location for exchange |
| `status` | String | Enum: `active`, `sold`, `removed`, Indexed | Default: `active` |
| `views` | Number | Min 0, Default: 0 | Total views counter |
| `createdAt` | Date | Timestamp | Publication timestamp |
| `updatedAt` | Date | Timestamp | Last modification timestamp |

**Indexes:**
- Text index: `{ title: "text", description: "text" }`
- Catalog filter index: `{ status: 1, createdAt: -1 }`
- Campus filter index: `{ college: 1, status: 1 }`
- Category & price compound index: `{ category: 1, status: 1, price: 1 }`

---

## 3. Category Model (`src/models/Category.ts`)

Controlled categories for structuring items across departments.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `_id` | ObjectId | Auto-generated PK | Unique identifier |
| `slug` | String | Required, Unique, Lowercase | Category URL slug |
| `name` | String | Required | Display name |
| `icon` | String | Lucide icon identifier | Icon name |
| `description` | String | Optional | Category overview |
| `status` | String | Enum: `active`, `inactive` | Availability |
| `order` | Number | Integer | Display sort ordering |

---

## 4. SavedListing Model (`src/models/SavedListing.ts`)

Stores student bookmarks / wishlist relations.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `_id` | ObjectId | Auto-generated PK | Unique identifier |
| `userId` | ObjectId | Ref: `User`, Required, Indexed | Student bookmarking the item |
| `listingId` | ObjectId | Ref: `Listing`, Required, Indexed | Bookmarked listing |
| `createdAt` | Date | Timestamp | Time saved |

**Indexes:**
- Compound unique index: `{ userId: 1, listingId: 1 }` (Prevents duplicate bookmarks)

---

## 5. Conversation Model (`src/models/Conversation.ts`)

Connects a buyer and seller regarding a specific listing.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `_id` | ObjectId | Auto-generated PK | Unique identifier |
| `participants` | [ObjectId] | Ref: `User`, Array of 2 Users | Buyer and Seller IDs |
| `listingId` | ObjectId | Ref: `Listing`, Required, Indexed | Related listing |
| `lastMessage` | String | Optional | Preview of latest message |
| `lastMessageAt` | Date | Indexed | Timestamp of latest message |
| `createdAt` | Date | Timestamp | Thread creation time |

---

## 6. Message Model (`src/models/Message.ts`)

Individual chat message within a conversation.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `_id` | ObjectId | Auto-generated PK | Unique identifier |
| `conversationId` | ObjectId | Ref: `Conversation`, Required, Indexed | Parent conversation thread |
| `senderId` | ObjectId | Ref: `User`, Required | Sender of the message |
| `text` | String | Required, Max 2000 chars | Message text content |
| `readAt` | Date | Optional | Read receipt timestamp |
| `createdAt` | Date | Timestamp | Message send time |

---

## 7. Report Model (`src/models/Report.ts`)

Stores submitted community flags for administrative review.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `_id` | ObjectId | Auto-generated PK | Unique identifier |
| `reporterId` | ObjectId | Ref: `User`, Required, Indexed | Reporting student |
| `targetType` | String | Enum: `listing`, `user`, Indexed | Type of entity reported |
| `targetId` | String | Required, Indexed | ID of reported listing or user |
| `reason` | String | Required | Flag reason |
| `description` | String | Optional | Detailed explanation |
| `status` | String | Enum: `pending`, `reviewed`, `resolved`, `dismissed` | Moderation status |
| `adminNotes` | String | Optional | Notes added by admin |
| `createdAt` | Date | Timestamp | Submission time |

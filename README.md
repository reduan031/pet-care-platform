# Pet Marketplace + Pet Social Platform

Hybrid platform with two major sections:
- **Marketplace**: sell/rent/adopt listings with location-based search, advanced filters, free-adoption mode, ratings/reviews, and payment-intent API.
- **Pet Social**: feed, comments, likes, reactions, follow, chat, groups, events, stories (24h), and notifications.

## Tech Stack
- Frontend: React
- Backend: Node.js + Express + MongoDB (Mongoose)
- Auth: JWT Bearer

> Note: Your request mentioned MySQL/PostgreSQL. This implementation is production-structured in the current project stack (MongoDB) to integrate with your existing codebase immediately.

## Features Implemented

### Marketplace
- Location-based listing search:
  - query by `lat`, `lng`, `radiusKm`, plus keyword and standard filters
- Listing modes:
  - `sell`, `rent`, `adopt`
  - free adoption auto-tagged with `isFreeAdoption`
- Advanced filters:
  - pet type, breed, age range, price range, keyword
- Seller ratings/reviews per listing
- `Message Owner` flow starts a conversation
- Payment intent endpoint stub for Stripe/PayPal integration

### Pet Social
- Feed with pagination ("load more" / infinite-scroll-ready)
- Create posts with text/media metadata
- Likes, comments, shares
- Pet reactions: `love`, `funny`, `cute`
- Follow user
- 1:1 chat data model + messaging endpoint
- Groups: create/join/list
- Events: create/list/RSVP
- Stories with 24h auto-expiry (TTL index)
- Notifications
- Socket.IO real-time notification delivery
- Basic spam filtering on posts/comments/reviews

### Admin Dashboard
- Protected admin API routes
- Platform stats endpoint
- Manage users (suspend/activate)
- Listing moderation view
- Social content moderation view

## New Backend Routes
- `/api/marketplace/*`
- `/api/pet-social/*`
- `/api/admin/*` (admin-only)

## Setup Instructions

### 1) Backend
```bash
cd backend
npm install
```

Create `.env` in `backend`:
```env
MONGODB_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>
PORT=5000
# Optional (for production integrations)
STRIPE_SECRET_KEY=<stripe_secret_key>
PAYPAL_CLIENT_ID=<paypal_client_id>
PAYPAL_CLIENT_SECRET=<paypal_client_secret>
```

Run backend:
```bash
npm start
```

### 2) Frontend
```bash
cd frontend
npm install
```

Create `.env` in `frontend`:
```env
REACT_APP_API_URL=http://localhost:5000/api
# Optional (UI map integration)
REACT_APP_GOOGLE_MAPS_API_KEY=<google_maps_api_key>
# Optional (Socket.IO endpoint)
REACT_APP_SOCKET_URL=http://localhost:5000
```

Run frontend:
```bash
npm start
```

## Main Frontend Pages
- `/marketplace-pro` -> Hybrid marketplace page
- `/pet-social` -> social community section
- `/admin` -> admin dashboard (admin role required)

## Live Payment Integration (Next Step)
- Stripe:
  - install stripe server SDK
  - replace payment intent stub in `backend/controllers/marketplaceController.js`
- PayPal:
  - add REST SDK + capture flow
  - verify payments before order/listing completion


# 🐾 PawVerse — Pet Care Platform

## Comprehensive Project Report

---

## 1. Project Overview

**Project Name:** PawVerse — AI-Powered Pet Care Platform

**Goal:** A full-stack web application that serves as a comprehensive pet ecosystem — enabling pet owners to manage their pets' health records, shop for pet products, book veterinary appointments, list pets for sale/adoption/boarding, socialize with other pet lovers, and get instant AI-powered veterinary advice — all in one unified platform.

**Target Users:**
- **Pet Owners (Users)** — Manage pets, shop products, book appointments, use AI vet
- **Sellers** — List and sell pet products in the shop
- **Doctors/Vets** — Accept appointments, provide consultations, prescribe treatments
- **Admins** — Full platform management, user moderation, analytics

**Key Benefits:**
- 🐾 All-in-one pet management — no need for multiple apps
- 🤖 Built-in AI Veterinarian with real-time access to user's pet data, orders, and marketplace
- 🏪 Location-aware marketplace for pet adoption, sale, and boarding
- 📅 Seamless appointment booking with vet doctors
- 🛒 Full e-commerce with cart, checkout, and order tracking
- 📱 Pet social network — posts, groups, events, stories, and chat
- 🔐 Role-based access control with secure JWT authentication

---

## 2. User Roles & Permissions

| Feature | User (Pet Parent) | Seller | Doctor | Admin |
|---------|:--:|:--:|:--:|:--:|
| Register/Login | ✅ | ✅ | ✅ | ✅ |
| Add/Edit/Delete own pets | ✅ | ✅ | ✅ | ✅ |
| View all pets | ✅ | ✅ | ✅ | ✅ |
| Browse & buy products | ✅ | ✅ | ✅ | ✅ |
| Add products to shop | ❌ | ✅ | ❌ | ✅ |
| Edit/Delete own products | ❌ | ✅ | ❌ | ✅ |
| Book appointments | ✅ | ✅ | ✅ | ✅ |
| Accept/Complete appointments | ❌ | ❌ | ✅ | ✅ |
| Add diagnosis & prescription | ❌ | ❌ | ✅ | ✅ |
| Create marketplace listings | ✅ | ✅ | ✅ | ✅ |
| Manage marketplace listings | Own only | Own only | Own only | ✅ All |
| Post on Pet Social | ✅ | ✅ | ✅ | ✅ |
| Access Admin Panel | ❌ | ❌ | ❌ | ✅ |
| Manage users (activate/deactivate) | ❌ | ❌ | ❌ | ✅ |
| View platform statistics | ❌ | ❌ | ❌ | ✅ |
| Use AI Vet Assistant | ✅ | ✅ | ✅ | ✅ |
| AI Vet with personalized data | ✅ | ✅ | ✅ | ✅ |

---

## 3. Core Functionalities

### 3.1 Pet Management
- **Add a new pet** — Name, species (cat/dog/bird/pigeon/rabbit/fish/other), breed, age (years + months), birth date, gender, weight + unit (kg/lbs), color, microchip number, photos (base64 uploaded)
- **Edit pet details** — Only the pet owner or admin can edit
- **Delete pet** — Only the pet owner or admin can delete
- **View all pets** — Filter by type, breed, price range; populated with owner info
- **Vaccination records** — Per pet: vaccine name, date administered, next due date, certificate URL
- **Medical history** — Text field for past conditions; auto-populated from completed appointments (diagnosis, treatment, doctor)
- **Allergies** — Array of allergy strings per pet
- **Documents** — Array of document URLs per pet
- **Reminders** — Linked to Reminder model (vaccination, medication, custom reminders)
- **For Sale flag** — Mark pet as for sale with price

### 3.2 User / Owner Management
- **Register** — Name, email, password (bcrypt hashed), phone, address, role selection (Pet Parent / Seller / Doctor / Admin)
- **Login** — Email + password, returns JWT token (30-day expiry)
- **OTP verification** — Placeholder for Twilio/email OTP (send + verify endpoints)
- **Forgot/Reset password** — Placeholder endpoints
- **Profile** — View own profile, notification preferences (email/push/sms), language (en/bn/hi), profile photo, bio
- **Multiple addresses** — Home/Work/Other with city, area, zipCode, lat/lng, default flag
- **Follow system** — Followers/following arrays (for Pet Social)
- **Account status** — Active/Inactive toggle (admin controlled)

### 3.3 Medical Records & Appointments
- **Book appointment** — Select pet, doctor (ObjectId or free-text name), appointment type (consultation/vaccination/checkup/surgery/emergency), date, time slot, symptoms, fee
- **Scheduling conflict detection** — Same doctor + same date + same time slot = rejected
- **Pet ownership validation** — Only the pet's owner can book appointments for that pet
- **View appointments** — Filtered by role: doctor sees their appointments, user sees their bookings
- **Update appointment** — Doctor/admin can: change status (pending→confirmed→completed→cancelled), add diagnosis, add prescription (medicine, dosage, duration, instructions), add notes
- **Auto-medical history** — When appointment status → "completed", the pet's medicalHistory is auto-updated with condition, diagnosis, treatment, date, and doctor
- **Payment tracking** — Fee + payment status (pending/paid) per appointment

### 3.4 Product / Shop Management
- **Create product** — Name, description, category, petType (dog/cat/bird/fish/rabbit/hamster/reptile/horse/all), subCategory, brand, price, discountPrice, stock, images, specifications (key-value map), tags, subscription availability flag
- **Browse products** — Filter by category, petType, price range, full-text search; only active products shown
- **Product detail** — Full info with seller details, ratings, reviews
- **Add review** — Authenticated users can rate (1-5) and comment; average rating auto-calculated
- **Update/Delete product** — Only seller who created it or admin
- **Product categories** — CRUD with name, displayName, icon, description, petType, active flag

### 3.5 Marketplace (Sell / Adopt / Boarding)
- **Create listing** — Title, description, listingType (sell/boarding/adopt), petType (cat/dog/bird/pigeon/rabbit/fish/other), breed, ageMonths, price, isFreeAdoption flag, locationText, geo-coordinates, media (up to 8 images via device upload or URL)
- **Location-aware search** — Geo-spatial queries with radius filter (2dsphere index); filter by type, petType, breed, price range, age range, keyword
- **Listing ratings** — Users can rate and review listings; average rating calculated
- **Status management** — Active/Paused/Closed
- **Dashboard integration** — "Add Product" button visible when accessed from Dashboard (from=dashboard URL param)

### 3.6 Pet Hub
- **Pet type selection** — Choose from Dog, Cat, Bird, Rabbit, Fish, Hamster, etc.
- **Category-based browsing** — Food, Accessories, Pharmacy, Grooming, Housing, Toys, Training, Health & Wellness
- **Product listing per category per pet type** — Filtered products from the shop
- **Add Product form** — Available from Dashboard for sellers/admins; fields: Name, Description, Price, Stock, Image upload
- **Fallback categories** — If API returns empty, shows default categories for the selected pet type

### 3.7 Order & Cart System
- **Cart** — Add/remove products, quantity management, persisted via CartContext
- **Checkout** — Shipping address (street, city, state, zipCode, phone), payment method (cash/bkash/nagad/card)
- **Order creation** — Items with product ref + quantity + price, totalAmount, deliveryCharge, discount, finalAmount
- **Order tracking** — Status flow: pending → confirmed → processing → shipped → delivered / cancelled
- **Payment tracking** — Status: pending/paid/failed
- **Delivery info** — Delivery date, tracking number, notes
- **Order history** — View past orders in My Orders page

### 3.8 AI Veterinary Assistant (PawVerse AI)
- **Built-in chat widget** — Floating button on every page, opens chat overlay
- **Personalized AI** — When user is logged in, the AI receives real-time data from the database:
  - User profile (name, email, role, phone)
  - Owned pets (name, type, breed, age, gender, weight, vaccination records)
  - Marketplace listings (title, type, petType, price, location)
  - Shop products (name, petType, price, stock, category)
  - Recent orders (items, total, status)
  - Product categories
- **Data-driven responses** — AI answers with actual numbers, names, and details from the database
- **Streaming responses** — Server-Sent Events (SSE) for real-time token-by-token output
- **Non-streaming fallback** — Standard JSON response if streaming fails
- **OpenRouter API** — Uses NVIDIA Nemotron model via OpenRouter
- **Optional auth** — Works for both logged-in (personalized) and anonymous (general vet advice) users
- **Quick replies** — "What pets do I own?", "How many products are in the shop?", "Any cats for adoption?", "My dog is not eating"

### 3.9 Pet Social Network
- **Social posts** — Text + media (image/video/mixed), likes, comments, shares, pet reactions (love/funny/cute), spam flagging
- **Pet Groups** — Create/join groups with name, description, owner, members list
- **Pet Events** — Create events with title, description, date, location, RSVP (going/interested/not_going)
- **Stories** — Ephemeral content with media URL, caption, auto-expire (TTL index on expiresAt)
- **Follow system** — Follow/unfollow users
- **Direct messaging** — Conversations between users with real-time chat via Socket.io, image sharing
- **Notifications** — Type-based notifications with read status, delivered via Socket.io

### 3.10 Lost & Found Pets
- **Report lost pet** — Type (lost/found), location (geo-point + address), date, description, photos, contact info (phone/email)
- **Report found pet** — Same form, type = "found"
- **Location-based search** — 2dsphere geo-spatial index for proximity queries
- **Status tracking** — Active/Resolved

### 3.11 Service Bookings
- **Book services** — Service types: vet, care, walking, grooming, training, other
- **Booking details** — Provider (vet/walker/sitter), pet, date, time slot, amount, payment status
- **Status flow** — Pending → Confirmed → Completed / Cancelled
- **Payment tracking** — Pending/Paid/Refunded

### 3.12 Subscriptions
- **Subscribe to products** — Auto-delivery with frequency (weekly/biweekly/monthly)
- **Manage subscription** — Active/Paused/Cancelled status
- **Next delivery tracking** — nextDeliveryDate field
- **Payment method** — Stripe payment method ID or token

### 3.13 Consultations (Video/Online)
- **Video consultation** — Linked to a Booking, with roomId (Daily.co/Twilio)
- **Consultation tracking** — Scheduled → Active → Completed / Cancelled
- **Prescription** — URL to PDF prescription
- **Recording** — URL to video recording
- **Notes** — Vet notes

### 3.14 Reminders
- **Create reminders** — Types: system, booking, vaccination, medication, custom
- **Due date tracking** — When the system should trigger the notification
- **Status** — Pending/Sent/Cancelled
- **Read status** — IsRead boolean
- **Linked to pet** — Optional petId reference
- **Background scheduler** — Cron-based service checks due reminders and sends notifications

### 3.15 Admin Panel
- **Platform statistics** — Total users, pets, listings, social posts, groups, events
- **User management** — View all users, activate/deactivate accounts
- **Listing management** — View all marketplace listings
- **Social post management** — View all posts, spam flagging
- **Role-based access** — Only admin role can access

### 3.16 Search & Filter
- **Product search** — Full-text search on name + description, filter by category, petType, price range
- **Pet search** — Filter by type, breed, price range
- **Marketplace search** — Filter by listing type, petType, breed, price range, age range, location radius
- **Lost & Found search** — Location-based proximity search

---

## 4. System Workflow

### Workflow 1: New User Journey
```
User visits PawVerse → Registers (selects role: Pet Parent/Seller/Doctor/Admin)
→ Receives JWT token → Redirected to Dashboard
→ Sees quick links: My Pets, Pet Hub, Marketplace, Shop, Appointments, etc.
```

### Workflow 2: Pet Owner — Pet Management + Vet Visit
```
Owner logs in → Dashboard → My Pets → "Add Pet" (fills name, species, breed, age, weight, photo)
→ Pet appears in list → Goes to Appointments → "Book Appointment"
→ Selects pet, chooses doctor, picks date & time slot, describes symptoms
→ Appointment created (status: pending) → Doctor sees appointment → Confirms it
→ After visit, Doctor updates: status=completed, adds diagnosis + prescription
→ Pet's medicalHistory auto-updated with visit details
→ Owner views updated medical history in pet profile
```

### Workflow 3: Seller — Product Listing
```
Seller logs in → Dashboard → Pet Hub → Selects pet type → Selects category
→ Clicks "Add Product" (visible because from=dashboard & user is logged in)
→ Fills name, description, price, stock, uploads image → Product created
→ Product appears in shop for all users to browse and buy
```

### Workflow 4: AI Vet Consultation
```
User clicks 🤖 AI Vet button → Chat widget opens
→ Types "How many pets do I own?" → Frontend sends message + auth token to backend
→ Backend optionalAuth middleware decodes token → fetchUserData() queries DB
→ System prompt built with real user data (pets, orders, products, listings)
→ OpenRouter AI responds with actual pet names, breeds, ages from database
→ Streaming response displayed token-by-token in chat widget
```

### Workflow 5: Marketplace — Pet Adoption
```
User goes to Marketplace → Filters by type="adopt", petType="cat"
→ Sees available cats with photos, breed, age, location
→ Clicks listing → Views details + contact info
→ (From Dashboard) Can also create own listing: "Create Listing" form
→ Fills title, description, type=adopt, petType, breed, age, location, photos
→ Listing goes live and appears in search results
```

### Workflow 6: Shopping & Ordering
```
User browses Products → Filters by petType="cat", category="Food"
→ Adds items to cart → Views cart → Proceeds to checkout
→ Enters shipping address, selects payment method (cash/bkash/nagad/card)
→ Order created (status: pending) → Seller/Admin confirms → Processing → Shipped → Delivered
→ User tracks order in "My Orders" page
```

---

## 5. Technical Details

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 18** | UI framework (functional components, hooks) |
| **React Router v6** | Client-side routing with protected routes |
| **Axios** | HTTP client with interceptors (auth token, 401 handling) |
| **Socket.io Client** | Real-time chat, notifications |
| **CSS3** | Custom styling with CSS variables, glassmorphism, animations |
| **React Context API** | State management (AuthContext, CartContext, ChatContext) |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | REST API framework |
| **Socket.io** | WebSocket server for real-time features |
| **Mongoose** | MongoDB ODM with schema validation |
| **bcryptjs** | Password hashing (12 salt rounds) |
| **jsonwebtoken** | JWT authentication (30-day expiry) |
| **axios** | HTTP client for OpenRouter AI API calls |
| **node-cron** | Background scheduler for reminders |

### Database
| Technology | Purpose |
|-----------|---------|
| **MongoDB** | NoSQL database (local + MongoDB Atlas for production) |
| **Mongoose Schemas** | 14 models with validation, indexes, and middleware |

### Authentication
- **JWT-based** — Token generated on login/register, stored in localStorage
- **Password hashing** — bcrypt with 12 salt rounds (pre-save hook)
- **Auth middleware** — `protect` (required auth), `authorize` (role-based), `optionalAuth` (AI endpoint)
- **Token flow** — Frontend Axios interceptor adds `Authorization: Bearer <token>` to every request
- **401 handling** — Auto-redirect to login on expired/invalid token

### Hosting / Deployment
| Component | Platform |
|-----------|---------|
| **Frontend** | Vercel (React SPA, auto-deploy from GitHub `main` branch) |
| **Backend** | Render (Node.js web service, auto-deploy from GitHub) |
| **Database** | MongoDB Atlas (cloud) + localhost (development) |
| **AI API** | OpenRouter (NVIDIA Nemotron model) |

### Project Structure
```
pet-care-platform/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # 13 controllers (auth, pet, product, appointment, etc.)
│   ├── middleware/       # auth.js (protect, authorize)
│   ├── models/          # 14 Mongoose models
│   ├── routes/          # 16 route files
│   ├── services/        # scheduler.js (cron jobs)
│   ├── utils/           # socket.js (Socket.io helper)
│   ├── server.js        # Express + Socket.io entry point
│   └── .env             # Environment variables (NOT committed)
├── frontend/
│   ├── public/          # Static assets
│   ├── src/
│   │   ├── components/  # Navbar, AIChatWidget, ChatButton, ChatWindow, etc.
│   │   ├── config/      # api.js (Axios instance), socket.js
│   │   ├── context/     # AuthContext, CartContext, ChatContext
│   │   ├── pages/       # 21 page components
│   │   ├── utils/       # file.js (base64 conversion)
│   │   ├── App.js       # Router + providers + global UI
│   │   └── App.css      # Global styles
│   └── package.json
├── vercel.json          # Vercel deployment config
└── README.md
```

---

## 6. Database Design

### 6.1 Users Collection
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| _id | ObjectId | PK | Auto-generated |
| name | String | Required, trimmed | Full name |
| email | String | Required, unique, lowercase, regex validated | Email address |
| password | String | Required, min 6 chars, select:false | bcrypt hashed |
| phone | String | Required | Phone number |
| role | String | Enum: [user, seller, doctor, admin], default: user | User role |
| addresses | [Object] | Nested array | Multiple addresses (type, street, city, area, zipCode, lat/lng, isDefault) |
| location | Object | lat, lng | User's geo-location |
| notificationPreferences | Object | email/push/sms booleans | Notification settings |
| language | String | Enum: [en, bn, hi], default: en | Preferred language |
| isActive | Boolean | Default: true | Account status |
| isAdmin | Boolean | Default: false | Admin flag |
| profilePhoto | String | Default: 'default-avatar.png' | Profile image URL |
| bio | String | Default: '' | User bio |
| followers | [ObjectId→User] | Ref array | Followers list |
| following | [ObjectId→User] | Ref array | Following list |
| isVerified | Boolean | Default: false | Email/phone verified |
| createdAt | Date | Default: Date.now | Registration date |

### 6.2 Pets Collection
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| _id | ObjectId | PK | Auto-generated |
| userId | ObjectId→User | Required, FK | Pet owner |
| name | String | Required | Pet name |
| type | String | Enum: [cat, dog, bird, pigeon, other, rabbit, fish], Required | Species |
| breed | String | Optional | Breed name |
| age | Object | years (Number), months (Number) | Age breakdown |
| birthDate | Date | Optional | Date of birth |
| gender | String | Enum: [male, female] | Gender |
| weight | Number | Optional | Weight value |
| weightUnit | String | Enum: [kg, lbs], default: kg | Weight unit |
| color | String | Optional | Coat color |
| microchip | String | Optional | Microchip ID |
| photos | [String] | Array of base64/URLs | Pet photos |
| vaccinationRecords | [Object] | name, date, nextDue, certificate | Vaccination history |
| medicalHistory | String | Optional | Past conditions text |
| allergies | [String] | Array | Known allergies |
| documents | [String] | URLs | Medical documents |
| reminders | [ObjectId→Reminder] | Ref array | Linked reminders |
| forSale | Boolean | Default: false | Listed for sale |
| price | Number | Optional | Sale price |
| createdAt | Date | Default: Date.now | Created date |
| updatedAt | Date | Auto-updated on save | Last modified |

### 6.3 Appointments Collection
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| _id | ObjectId | PK | Auto-generated |
| user | ObjectId→User | Required, FK | Pet owner |
| pet | ObjectId→Pet | Required, FK | Pet being treated |
| doctor | ObjectId→User | FK, default: null | Assigned vet (ObjectId) |
| doctorName | String | Default: null | Vet name (free text) |
| appointmentType | String | Enum: [consultation, vaccination, checkup, surgery, emergency], Required | Type |
| date | Date | Required | Appointment date |
| timeSlot | String | Required | Time slot |
| status | String | Enum: [pending, confirmed, completed, cancelled], default: pending | Status |
| symptoms | String | Optional | Reported symptoms |
| diagnosis | String | Optional | Doctor's diagnosis |
| prescription | [Object] | medicine, dosage, duration, instructions | Prescribed medicines |
| fee | Number | Required | Consultation fee |
| paymentStatus | String | Enum: [pending, paid], default: pending | Payment status |
| notes | String | Optional | Additional notes |
| createdAt | Date | Default: Date.now | Created date |

### 6.4 Products Collection
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| _id | ObjectId | PK | Auto-generated |
| name | String | Required, trimmed | Product name |
| description | String | Required | Product description |
| category | String | Required | Category name |
| petType | String | Enum: [dog, cat, bird, fish, rabbit, hamster, reptile, horse, all], Required | Target pet type |
| subCategory | String | Optional | Sub-category |
| brand | String | Optional | Brand name |
| price | Number | Required, min: 0 | Regular price |
| discountPrice | Number | min: 0 | Discounted price |
| stock | Number | Required, min: 0, default: 0 | Available stock |
| images | [String] | Default: [] | Product images |
| specifications | Map<String> | Key-value pairs | Technical specs |
| sellerId | ObjectId→User | Required, FK | Seller who listed |
| rating | Object | average (0-5), count | Aggregate rating |
| reviews | [Object] | user, rating (1-5), comment, createdAt | User reviews |
| isActive | Boolean | Default: true | Active flag |
| tags | [String] | Searchable tags | Product tags |
| isSubscriptionAvailable | Boolean | Default: false | Subscription eligible |
| createdAt | Date | Default: Date.now | Created date |

**Index:** Text index on `name` and `description` for full-text search

### 6.5 Listings Collection (Marketplace)
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| _id | ObjectId | PK | Auto-generated |
| ownerId | ObjectId→User | Required, FK | Listing creator |
| petId | ObjectId→Pet | FK, optional | Linked pet |
| title | String | Required, trimmed | Listing title |
| description | String | Required | Details |
| listingType | String | Enum: [sell, boarding, adopt], Required | Type of listing |
| petType | String | Enum: [cat, dog, bird, pigeon, rabbit, fish, other], Required | Pet species |
| breed | String | Optional | Breed |
| ageMonths | Number | min: 0, default: 0 | Age in months |
| price | Number | min: 0, default: 0 | Price |
| isFreeAdoption | Boolean | Default: false | Free adoption flag |
| locationText | String | Required, trimmed | Location description |
| location | GeoJSON Point | 2dsphere index | [lng, lat] coordinates |
| media | [String] | Array | Photos/URLs (max 8) |
| status | String | Enum: [active, paused, closed], default: active | Listing status |
| ratings | [Object] | userId, rating (1-5), review, createdAt | User ratings |
| avgRating | Number | 0-5, default: 0 | Average rating |

**Index:** 2dsphere on `location` for geo queries

### 6.6 Orders Collection
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| _id | ObjectId | PK | Auto-generated |
| user | ObjectId→User | Required, FK | Buyer |
| items | [Object] | product (FK→Product), quantity (min:1), price | Order items |
| shippingAddress | Object | street, city, state, zipCode, phone (all required) | Delivery address |
| paymentMethod | String | Enum: [cash, bkash, nagad, card], Required | Payment type |
| paymentStatus | String | Enum: [pending, paid, failed], default: pending | Payment state |
| orderStatus | String | Enum: [pending, confirmed, processing, shipped, delivered, cancelled], default: pending | Order state |
| totalAmount | Number | Required | Subtotal |
| deliveryCharge | Number | Default: 0 | Shipping cost |
| discount | Number | Default: 0 | Discount amount |
| finalAmount | Number | Required | Total after discount + delivery |
| orderDate | Date | Default: Date.now | Order placed |
| deliveryDate | Date | Optional | Expected/actual delivery |
| trackingNumber | String | Optional | Tracking code |
| notes | String | Optional | Order notes |

### 6.7 Categories Collection
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| _id | ObjectId | PK | Auto-generated |
| name | String | Required, unique, trimmed | Category slug |
| displayName | String | Required, trimmed | Display name |
| icon | String | Default: '📦' | Emoji icon |
| description | String | Optional | Category description |
| petType | String | Enum: [dog, cat, bird, fish, rabbit, hamster, reptile, horse, all], default: all | Target pet type |
| isActive | Boolean | Default: true | Active flag |
| createdAt | Date | Default: Date.now | Created date |

### 6.8 Bookings Collection (Services)
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| _id | ObjectId | PK | Auto-generated |
| userId | ObjectId→User | Required, FK | Pet owner |
| providerId | ObjectId→User | Required, FK | Service provider |
| petId | ObjectId→Pet | FK, optional | Pet being serviced |
| serviceType | String | Enum: [vet, care, walking, grooming, training, other], Required | Service type |
| date | Date | Required | Booking date |
| timeSlot | String | Required | Time slot |
| status | String | Enum: [pending, confirmed, completed, cancelled], default: pending | Status |
| amount | Number | Required | Service fee |
| paymentStatus | String | Enum: [pending, paid, refunded], default: pending | Payment state |
| notes | String | Optional | Notes |
| createdAt/updatedAt | Date | Auto | Timestamps |

### 6.9 Consultations Collection
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| _id | ObjectId | PK | Auto-generated |
| bookingId | ObjectId→Booking | Required, FK | Linked booking |
| vetId | ObjectId→User | Required, FK | Veterinarian |
| userId | ObjectId→User | Required, FK | Pet owner |
| petId | ObjectId→Pet | Required, FK | Pet |
| roomId | String | Required | Video room ID (Daily.co/Twilio) |
| status | String | Enum: [scheduled, active, completed, cancelled], default: scheduled | Status |
| prescription | String | URL to PDF | Prescription document |
| recording | String | URL | Video recording |
| notes | String | Optional | Vet notes |
| createdAt | Date | Default: Date.now | Created date |

### 6.10 Subscriptions Collection
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| _id | ObjectId | PK | Auto-generated |
| userId | ObjectId→User | Required, FK | Subscriber |
| productId | ObjectId→Product | Required, FK | Subscribed product |
| frequency | String | Enum: [weekly, biweekly, monthly], Required | Delivery frequency |
| quantity | Number | Required, min: 1, default: 1 | Quantity per delivery |
| status | String | Enum: [active, paused, cancelled], default: active | Subscription state |
| nextDeliveryDate | Date | Required | Next auto-delivery |
| paymentMethodId | String | Optional | Stripe payment method |
| shippingAddress | Object | street, city, zipCode | Delivery address |
| createdAt/updatedAt | Date | Auto | Timestamps |

### 6.11 LostFound Collection
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| _id | ObjectId | PK | Auto-generated |
| userId | ObjectId→User | Required, FK | Reporter |
| petId | ObjectId→Pet | FK, optional | Linked pet |
| type | String | Enum: [lost, found], Required | Report type |
| location | GeoJSON Point | 2dsphere index | [lng, lat] |
| address | String | Required | Address text |
| date | Date | Required | Date lost/found |
| description | String | Required | Details |
| status | String | Enum: [active, resolved], default: active | Status |
| photos | [String] | Array | Evidence photos |
| contactInfo | Object | phone, email | Contact details |
| createdAt | Date | Default: Date.now | Created date |

**Index:** 2dsphere on `location`

### 6.12 Reminders Collection
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| _id | ObjectId | PK | Auto-generated |
| userId | ObjectId→User | Required, FK | Reminder owner |
| petId | ObjectId→Pet | FK, optional | Linked pet |
| title | String | Required | Reminder title |
| message | String | Required | Reminder message |
| type | String | Enum: [system, booking, vaccination, medication, custom], default: system | Type |
| dueDate | Date | Required | Trigger date |
| status | String | Enum: [pending, sent, cancelled], default: pending | Status |
| isRead | Boolean | Default: false | Read status |
| createdAt | Date | Default: Date.now | Created date |

### 6.13 SocialPost Collection
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| _id | ObjectId | PK | Auto-generated |
| authorId | ObjectId→User | Required, FK | Post author |
| petId | ObjectId→Pet | FK, optional | Tagged pet |
| groupId | ObjectId→PetGroup | FK, optional | Group post |
| text | String | Default: '' | Post content |
| media | [String] | Array | Media URLs |
| mediaType | String | Enum: [none, image, video, mixed], default: none | Media type |
| likes | [ObjectId→User] | Ref array | Liked by |
| shares | Number | Default: 0 | Share count |
| comments | [Object] | userId, text, createdAt | Comments |
| petReactions | Object | love/funny/cute arrays | Emoji reactions |
| isSpamFlagged | Boolean | Default: false | Spam flag |
| timestamps | Date | Auto | createdAt + updatedAt |

### 6.14 PetSocial Collection (Multiple Models)
| Model | Key Fields | Description |
|-------|-----------|-------------|
| **Follow** | followerId→User, followingId→User | Follow relationships (unique compound index) |
| **Conversation** | participants[User], lastMessageAt | DM conversations |
| **ChatMessage** | conversationId→Conversation, senderId→User, text, images[] | Chat messages |
| **PetGroup** | name, description, ownerId→User, members[User] | Pet interest groups |
| **PetEvent** | title, description, createdBy→User, date, location, rsvps[] | Pet meetups/events |
| **PetStory** | authorId→User, mediaUrl, caption, expiresAt (TTL) | Ephemeral stories |
| **Notification** | userId→User, type, text, data, isRead | User notifications |

### Entity Relationships
```
User ──< Pet (1:N, via userId)
User ──< Appointment (1:N, via user; 1:N via doctor)
User ──< Product (1:N, via sellerId)
User ──< Listing (1:N, via ownerId)
User ──< Order (1:N, via user)
User ──< Booking (1:N, via userId; 1:N via providerId)
User ──< LostFound (1:N, via userId)
User ──< Reminder (1:N, via userId)
User ──< SocialPost (1:N, via authorId)
User ──<> User (M:N, followers/following)

Pet ──< Appointment (1:N, via pet)
Pet ──< Booking (1:N, via petId)
Pet ──< Consultation (1:N, via petId)
Pet ──< LostFound (1:N, via petId)
Pet ──< Reminder (1:N, via petId)
Pet ──< SocialPost (1:N, via petId)
Pet ──< Listing (1:N, via petId)

Product ──< Order.items (1:N, via product)
Product ──< Subscription (1:N, via productId)
Category ──< Product (1:N, via category name)

Booking ──< Consultation (1:1, via bookingId)
Conversation ──< ChatMessage (1:N, via conversationId)
PetGroup ──< SocialPost (1:N, via groupId)
PetGroup ──< PetEvent (1:N, via group context)
```

---

## 7. Non-Functional Requirements

### Security
- **Password hashing** — bcrypt with 12 salt rounds; passwords never returned in API responses (`select: false`)
- **JWT authentication** — Signed tokens with server-side secret; 30-day expiry
- **Role-based access control** — `protect` middleware (authentication) + `authorize` middleware (authorization by role)
- **Input validation** — Mongoose schema validation (required fields, enum constraints, min/max values, regex patterns)
- **CORS** — Configured for cross-origin requests
- **Environment variables** — Secrets stored in `.env` (not committed to Git); production secrets in Render/Vercel dashboard
- **Payload size limit** — 100mb JSON limit for base64 image uploads
- **Ownership checks** — Pet/Product/Listing updates/deletes verify `userId === req.user._id` or admin role

### Performance
- **Database indexing** — Text indexes on Product (name, description), 2dsphere indexes on Listing and LostFound (location), compound unique index on Follow
- **Query optimization** — Population (`.populate()`) used judiciously; field selection (`.select('-password')`)
- **Streaming AI responses** — SSE for token-by-token delivery instead of waiting for full response
- **Pagination-ready** — Sort + limit patterns in controllers
- **Promise.all** — Parallel DB queries in AI controller for faster data fetching

### Reliability
- **Error handling** — try/catch in every controller with appropriate HTTP status codes
- **Background scheduler** — Cron-based service for reminder notifications
- **Socket.io** — Real-time connection with room-based messaging for notifications and chat
- **Fallback UI** — Pet Hub shows default categories when API returns empty

---

## 8. Edge Cases & Error Handling

| Edge Case | How It's Handled |
|-----------|-----------------|
| Booking appointment for deleted/non-existent pet | Returns 404 "Pet not found" |
| Booking appointment for someone else's pet | Returns 403 "Not authorized - not your pet" |
| Pet without owner (userId missing) | Returns 403 "Pet has no owner assigned" |
| Scheduling conflict (same doctor, same date/time) | Returns 400 "Time slot already booked" |
| Doctor name as free text vs ObjectId | Auto-detects format: 24-hex → ObjectId lookup; else → stored as `doctorName` string |
| Duplicate email registration | Returns 400 "User already exists" |
| Invalid/expired JWT token | Returns 401 "Not authorized, token failed" |
| Missing JWT token | Returns 401 "Not authorized, no token" |
| Unauthorized role access | Returns 403 "User role X is not authorized" |
| Editing/deleting another user's pet/product | Returns 403 "Not authorized" |
| Missing required fields | Mongoose validation error with field-specific messages |
| AI API key missing | Returns 500 "AI configuration error: API Key missing" + console error |
| AI service unavailable | Returns 500 "AI Service currently unavailable" with error details |
| AI streaming failure | Frontend catches error, shows "I'm having trouble connecting right now" |
| Empty product/category API response | Pet Hub shows fallback default categories |
| Large image uploads | 100mb payload limit; base64 conversion with file size awareness |
| Marketplace listing with no images | Shows placeholder emoji (🐾) |
| Duplicate microchip number | Not currently enforced (no unique index) — **known limitation** |

---

## 9. Implementation Status

### ✅ Completed Features
- User registration with role selection (Pet Parent, Seller, Doctor, Admin)
- JWT login/logout with token persistence
- Pet CRUD (add, view, edit, delete) with ownership validation
- Pet vaccination records and medical history
- Product CRUD with seller assignment, reviews, and ratings
- Category management
- Shopping cart and checkout flow
- Order creation and tracking (6-stage status flow)
- Appointment booking with scheduling conflict detection
- Doctor diagnosis and prescription (auto-updates pet medical history)
- Marketplace listings (sell/adopt/boarding) with geo-location
- Pet Hub with category-based product browsing
- Pet Social network (posts, groups, events, stories, DMs)
- Lost & Found pets with geo-spatial search
- Service bookings (vet, grooming, walking, training, etc.)
- Subscriptions (weekly/biweekly/monthly auto-delivery)
- AI Veterinary Assistant with real-time user data integration
- Admin panel with statistics, user management, content moderation
- Real-time chat via Socket.io
- Reminder system with background scheduler
- Custom paw cursor and animated loading screen
- Responsive glassmorphism UI design

### ⏳ Pending Features
- OTP verification (Twilio/email integration) — endpoints exist but are placeholders
- Forgot/Reset password — endpoints exist but are placeholders
- Video consultation integration (Daily.co/Twilio room creation)
- Payment gateway integration (Stripe/bKash/Nagad) — models ready, logic pending
- Email/SMS notification delivery — scheduler checks reminders but sending not implemented
- Pet story creation UI — model exists (TTL auto-expire), frontend pending
- Prescription PDF generation
- Order tracking number integration with courier APIs

### 🐛 Known Issues
- AI widget on Vercel/Render deployment gives generic responses if backend not redeployed with latest code
- `api.js` default URL needs to be toggled between localhost and production for local vs deployed testing
- Duplicate product names allowed (no unique constraint on Product.name)
- Microchip field has no unique validation
- Pet medical history is a String field instead of structured array (partially addressed by appointment auto-update)
- Some controllers lack pagination (all results returned)

---

## 10. Future Enhancements

| Enhancement | Description | Priority |
|------------|-------------|----------|
| **Email/SMS Notifications** | Twilio/SendGrid integration for appointment reminders, order updates, vaccination due dates | High |
| **Payment Gateway** | Stripe (cards) + bKash/Nagad (local BD payment) integration for checkout and subscriptions | High |
| **Mobile App (React Native)** | Native mobile version with push notifications and camera integration | Medium |
| **Pet Boarding/Daycare Module** | Dedicated module with availability calendar, booking management, and provider profiles | Medium |
| **Video Consultation** | Daily.co/Twilio integration for live vet video calls with recording | Medium |
| **Prescription PDF** | Auto-generate prescription PDFs from appointment data for download | Medium |
| **Advanced Analytics Dashboard** | Charts for revenue, popular products, pet demographics, appointment trends | Medium |
| **Multi-language Support** | Full i18n for Bengali (bn), Hindi (hi), English (en) — language field already in User model | Low |
| **Push Notifications** | Web push + mobile push for real-time alerts | Low |
| **AI Image Diagnosis** | Upload pet photo for AI-powered skin/eye condition detection | Low |
| **Pet Insurance Integration** | Partner with pet insurance providers for policy management | Low |
| **Community Forum** | Q&A forum for pet care discussions beyond social posts | Low |
| **Automated Testing** | Unit tests (Jest), integration tests (Supertest), E2E tests (Cypress) | Low |
| **CI/CD Pipeline** | GitHub Actions for automated testing and deployment | Low |
| **Docker Containerization** | Docker Compose for consistent dev/prod environments | Low |

---

## 11. API Endpoints Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login user |
| GET | `/api/auth/me` | Required | Get current user |
| GET | `/api/auth/logout` | Required | Logout |
| POST | `/api/auth/send-otp` | Public | Send OTP (placeholder) |
| POST | `/api/auth/verify-otp` | Public | Verify OTP (placeholder) |
| POST | `/api/auth/forgot-password` | Public | Forgot password (placeholder) |
| PUT | `/api/auth/reset-password` | Public | Reset password (placeholder) |
| POST | `/api/pets` | Required | Create pet |
| GET | `/api/pets` | Required | List pets (filter: type, breed, price) |
| GET | `/api/pets/:id` | Required | Get single pet |
| PUT | `/api/pets/:id` | Required (owner/admin) | Update pet |
| DELETE | `/api/pets/:id` | Required (owner/admin) | Delete pet |
| POST | `/api/products` | Required (seller/admin) | Create product |
| GET | `/api/products` | Public | List products (filter: category, petType, price, search) |
| GET | `/api/products/:id` | Public | Get product detail |
| PUT | `/api/products/:id` | Required (seller/admin) | Update product |
| DELETE | `/api/products/:id` | Required (seller/admin) | Delete product |
| POST | `/api/products/:id/reviews` | Required | Add product review |
| POST | `/api/categories` | Required (admin) | Create category |
| GET | `/api/categories` | Public | List categories |
| PUT | `/api/categories/:id` | Required (admin) | Update category |
| DELETE | `/api/categories/:id` | Required (admin) | Delete category |
| POST | `/api/marketplace/listings` | Required | Create listing |
| GET | `/api/marketplace/listings` | Public | Search listings (geo + filters) |
| GET | `/api/marketplace/listings/:id` | Public | Get listing detail |
| PUT | `/api/marketplace/listings/:id` | Required (owner/admin) | Update listing |
| DELETE | `/api/marketplace/listings/:id` | Required (owner/admin) | Delete listing |
| POST | `/api/appointments` | Required | Book appointment |
| GET | `/api/appointments` | Required | List appointments (role-filtered) |
| GET | `/api/appointments/:id` | Required (owner/doctor/admin) | Get appointment |
| PUT | `/api/appointments/:id` | Required (doctor/admin) | Update appointment (diagnosis, prescription, status) |
| POST | `/api/orders` | Required | Create order |
| GET | `/api/orders` | Required | List user's orders |
| GET | `/api/orders/:id` | Required | Get order detail |
| PUT | `/api/orders/:id` | Required (admin) | Update order status |
| POST | `/api/bookings` | Required | Create service booking |
| GET | `/api/bookings` | Required | List bookings |
| PUT | `/api/bookings/:id` | Required | Update booking |
| POST | `/api/subscriptions` | Required | Create subscription |
| GET | `/api/subscriptions` | Required | List subscriptions |
| PUT | `/api/subscriptions/:id` | Required | Update subscription |
| POST | `/api/lostfound` | Required | Report lost/found pet |
| GET | `/api/lostfound` | Public | Search lost/found pets |
| PUT | `/api/lostfound/:id` | Required | Update report |
| POST | `/api/ai/chat` | Optional | AI chat (non-streaming) |
| POST | `/api/ai/chat?stream=true` | Optional | AI chat (streaming SSE) |
| GET | `/api/admin/stats` | Required (admin) | Platform statistics |
| GET | `/api/admin/users` | Required (admin) | List all users |
| PUT | `/api/admin/users/:userId/status` | Required (admin) | Activate/deactivate user |
| GET | `/api/admin/listings` | Required (admin) | List all marketplace listings |
| GET | `/api/admin/social-posts` | Required (admin) | List all social posts |
| POST | `/api/pet-social/posts` | Required | Create social post |
| GET | `/api/pet-social/posts` | Public | List social posts |
| POST | `/api/pet-social/posts/:id/like` | Required | Like/unlike post |
| POST | `/api/pet-social/posts/:id/comment` | Required | Comment on post |
| POST | `/api/pet-social/groups` | Required | Create group |
| GET | `/api/pet-social/groups` | Public | List groups |
| POST | `/api/pet-social/groups/:id/join` | Required | Join group |
| POST | `/api/pet-social/events` | Required | Create event |
| POST | `/api/pet-social/events/:id/rsvp` | Required | RSVP to event |
| POST | `/api/pet-social/follow` | Required | Follow user |
| GET | `/api/pet-social/conversations` | Required | List conversations |
| POST | `/api/pet-social/conversations/:id/messages` | Required | Send message |
| GET | `/api/pet-social/notifications` | Required | Get notifications |
| GET | `/api/health` | Public | Health check |

---

## 12. Frontend Pages Summary

| Page | Route | Auth | Description |
|------|-------|------|-------------|
| Home | `/` | Public | Landing page with hero, features, pet categories |
| Login | `/login` | Public | Email + password login form |
| Register | `/register` | Public | Registration with role selection + OTP |
| Products | `/products` | Public | Product catalog with filters |
| Product Detail | `/products/:id` | Public | Single product with reviews |
| Cart | `/cart` | Public | Shopping cart |
| Checkout | `/checkout` | Required | Order placement |
| My Orders | `/my-orders` | Required | Order history |
| Pet Marketplace | `/pets` | Public | Browse pets for sale |
| Pet Detail | `/pets/:id` | Public | Single pet profile |
| My Pets | `/my-pets` | Required | User's pet list + add pet |
| Appointments | `/appointments` | Required | Book/view appointments |
| Dashboard | `/dashboard` | Required | User hub with quick links |
| Admin Panel | `/admin` | Admin only | Platform management |
| Pet Hub | `/pet-hub` | Public | Pet type → category → products |
| Marketplace Hub | `/marketplace-pro` | Public | Sell/Adopt/Boarding listings |
| Pet Social | `/pet-social` | Public | Social network (posts, groups, events, chat) |
| Lost & Found | `/lost-found` | Public | Report/search lost/found pets |

**Global Components:**
- `Navbar` — Navigation with auth-aware links
- `AIChatWidget` — Floating AI vet assistant (always visible)
- `ChatButton` — Direct messaging button
- `ProtectedRoute` — Auth guard wrapper
- `AdminRoute` — Admin-only guard wrapper
- `PawCursor` — Custom paw-shaped cursor
- `BgCanvas` — Animated background orbs + pet silhouettes
- `Loader` — Animated loading screen with dog walk

---

*Report generated for PawVerse Pet Care Platform — CSE412 Project*
*Last updated: April 2026*

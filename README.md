# KonnectG

> A hyperlocal business discovery and community directory platform connecting people with trusted local businesses and services.

**Status:** Pre-Launch / Active Development

KonnectG is a hyperlocal business discovery platform designed to help people discover, explore, and connect with businesses and service providers in their local communities.

The platform is initially focused on the Matigara and Siliguri region, with the architecture designed to scale to larger communities and thousands of businesses.

---

## 🚀 Overview

Finding reliable local businesses and service providers can be difficult, especially in rural, suburban, and developing areas where businesses may have little or no digital presence.

KonnectG aims to solve this by providing a centralized platform where users can:

- Discover nearby businesses and services
- Search businesses by name or keyword
- Browse businesses by category
- Filter businesses by area
- Find verified businesses
- Discover featured businesses and offers
- View business details and contact information
- Explore businesses on a map
- Leave reviews and ratings

Businesses can use KonnectG to establish their digital presence, manage their listings, and reach customers in their local area.

---

## ✨ Features

### 👤 User Features

- User registration and authentication
- Email verification
- JWT-based authentication
- Business discovery
- Business search
- Category-based browsing
- Area-based filtering
- Verified business filtering
- Featured business filtering
- Sorting and pagination
- Business detail pages
- Business ratings and reviews
- Business view tracking
- Map-based business discovery
- User profile

### 🏪 Merchant Features

Merchants can manage their businesses through a dedicated merchant dashboard.

- Merchant authentication
- Merchant dashboard
- Add new businesses
- Manage business listings
- Business approval status
- Business verification status
- Manage offers
- Offer creation and editing
- Offer activation/deactivation
- Offer usage tracking
- Business insights
- Merchant account management

New businesses submitted by merchants enter a pending approval state and must be approved by an administrator before becoming publicly visible.

### 🛡️ Admin Features

The admin system provides tools for managing the KonnectG platform.

- Admin dashboard
- Business management
- Business approval
- Business rejection
- Business verification
- Merchant management
- User management
- Category management
- Offer management
- Review management
- Analytics
- Featured business management
- Business activation/deactivation
- Owner management

### 🗺️ Maps

KonnectG uses **Leaflet** with **OpenStreetMap** for map-based business discovery.

The map supports:

- Local area selection
- Business markers
- Business popups
- Business detail navigation
- Location-based business visualization

No Google Maps API key is required for the current implementation.

---

## 🏗️ Architecture

KonnectG follows a MERN-based architecture.

```text
┌───────────────────────────────┐
│           Frontend            │
│                               │
│      React + Vite             │
│      Tailwind CSS             │
│      React Router             │
│      Leaflet / OpenStreetMap  │
└───────────────┬───────────────┘
                │
                │ REST API
                ▼
┌───────────────────────────────┐
│           Backend             │
│                               │
│      Node.js                  │
│      Express.js               │
│      JWT Authentication       │
│      Role-Based Authorization │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│          Database             │
│                               │
│         MongoDB               │
│         MongoDB Atlas         │
└───────────────────────────────┘


# Get Ease v3 — Master Implementation Specification

> **Primary Goal**
>
> Build a **production-ready LMS** called **Get Ease** with an original premium UI inspired by the clean educational experience of **takeuforward.org** and Apple's Human Interface Design. **Do not copy** any branding, assets, code, illustrations, or exact layouts. Use the inspiration only for simplicity, usability, and premium feel.

---

# Design Philosophy

The application should feel like an Apple product:

- Premium
- Minimal
- Fast
- Elegant
- Glassmorphism
- Rounded floating cards
- Dynamic Island inspired top components
- Smooth micro-animations (150–250ms)
- Dark Mode First
- Mobile-first
- Plenty of whitespace
- Premium typography
- Consistent spacing

Avoid heavy effects or clutter.

---

# Landing Page

The landing page is the **only page** allowed to use a cinematic fullscreen background video.

Video:
- `/public/videos/intro.mp4`
- autoplay
- muted
- loop
- playsInline
- object-fit: cover
- subtle black gradient overlay (45–60%)
- no controls
- poster image while loading (`/public/images/hero-poster.webp`)

Hero includes:
- Glass navbar
- Search
- Premium CTA
- Featured courses
- Smooth reveal animations
- Scroll indicator

All remaining pages should use premium glass cards and gradients only (no background videos).

---

# Typography

Primary:
- SF Pro Display (or licensed equivalent)
Fallback:
- Inter

Modern, clean, readable.

---

# Tech Stack

Frontend
- React
- Vite
- TypeScript
- Tailwind CSS v4
- Framer Motion
- React Router
- Zustand
- Lucide React

Backend
- Node.js
- Express
- TypeScript
- MySQL
- JWT Authentication
- Zod Validation

Storage
- Bunny Stream (videos)
- Cloudflare R2 (PDFs, ZIPs, thumbnails, certificates)

Payments
- Razorpay

---

# Environment Variables

Frontend

```env
VITE_API_URL=
VITE_RAZORPAY_KEY_ID=rzp_test_T9Xb8rZmmyXAjg
```

Backend

```env
BUNNY_LIBRARY_ID=702994
BUNNY_CDN_HOSTNAME=vz-5b312f3d-747.b-cdn.net
BUNNY_API_KEY=<from .env>

RAZORPAY_KEY_ID=rzp_test_T9Xb8rZmmyXAjg
RAZORPAY_KEY_SECRET=<from .env>

DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=getease

JWT_SECRET=
JWT_REFRESH_SECRET=

R2_ACCOUNT_ID=
R2_ACCESS_KEY=
R2_SECRET_KEY=
R2_BUCKET_NAME=
```

Never hardcode secrets.

---

# User Roles

- Student
- Instructor (future ready)
- Admin

---

# Public Pages

- Landing
- Courses
- Course Details
- Pricing
- Contact
- About
- FAQ

---

# Student Pages

- Dashboard
- Continue Learning
- My Courses
- Course Player
- Notes
- Certificates
- Profile
- Settings

---

# Admin CMS

- Dashboard
- Courses
- Course Builder
- Lessons
- Media Library
- Categories
- Students
- Payments
- Coupons
- Reviews
- Certificates
- Notifications
- Analytics
- Audit Logs
- Website Settings

---

# Course Builder

Multi-step wizard:

1. Basic Details
2. Lessons
3. Resources
4. Pricing
5. SEO
6. Publish

Lesson supports:
- Bunny upload
- Description
- PDF notes
- ZIP
- Assignment
- External links
- Preview toggle

Automatic lesson numbering.
Drag & drop ordering.
Draft auto-save.
Preview before publish.

Statuses:
- Draft
- Private
- Published
- Archived

---

# Bunny Stream

Workflow:

Admin Upload
→ Backend
→ Bunny Upload
→ Processing
→ Save Bunny Video ID
→ Signed Playback URL
→ Student Streaming

Store only Bunny Video IDs.

Never store permanent playback URLs.

Implement upload queue and progress.

---

# Cloudflare R2

Store:
- PDFs
- ZIP
- Images
- Assignments
- Thumbnails
- Certificates

---

# Razorpay

Use:
- Key ID: rzp_test_T9Xb8rZmmyXAjg
- Secret from .env

Implement:
- Order creation
- Signature verification
- Payment records
- Webhooks
- Auto enrollment

---

# Security

- Helmet
- Rate Limiting
- CORS
- Secure Cookies
- httpOnly JWT
- Refresh Tokens
- Single Active Session (one device login at a time)
- Audit Logs
- Input validation
- SQL Injection protection
- XSS protection

---

# Analytics

Per Course:
- Revenue
- Students
- Completion
- Watch Time
- Reviews

Dashboard:
- Revenue
- Active Students
- Enrollments
- Best Sellers

---

# API

API-first architecture.

Frontend must never contain hardcoded course data.

Everything comes from REST APIs.

---

# Phases

## Phase 1
Project setup
Design system
Apple-inspired UI kit
Navigation
Cards
Typography

**STOP and wait for approval before continuing.**

## Phase 2
Authentication
JWT
Roles
Protected routes

## Phase 3
Admin CMS
Course Builder
Media Library

## Phase 4
Bunny Stream integration

## Phase 5
Cloudflare R2

## Phase 6
Razorpay

## Phase 7
Student Dashboard

## Phase 8
Analytics
Notifications
Certificates

## Phase 9
Optimization
Accessibility
Responsive polish

## Phase 10
Testing
Deployment
Documentation

---

# Coding Rules

- Production-ready only
- SOLID principles
- Modular architecture
- Clean folder structure
- Strong TypeScript typing
- Reusable components
- Error handling
- Loading states
- Empty states
- API-first
- Responsive
- Lighthouse >95

The AI must finish each phase completely, update IMPLEMENTATION.md with progress, then stop and wait for approval before starting the next phase.

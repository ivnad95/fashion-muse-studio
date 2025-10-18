# Fashion Muse Studio - Technical Documentation

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Design System](#design-system)
5. [Database Schema](#database-schema)
6. [API Structure](#api-structure)
7. [Authentication Flow](#authentication-flow)
8. [Image Generation Pipeline](#image-generation-pipeline)
9. [Credit System](#credit-system)
10. [Payment Integration](#payment-integration)
11. [File Structure](#file-structure)
12. [Deployment](#deployment)
13. [Environment Variables](#environment-variables)

---

## 1. Project Overview

### **Name**: Fashion Muse Studio
### **Purpose**: AI-powered fashion photography generation platform
### **Core Functionality**: Transform regular photos into professional fashion photography using Google Gemini AI

### **Key Features**
- 🎨 AI-powered image generation with style customization
- 👤 User authentication via Manus OAuth (Google)
- 💳 Credit-based payment system with Stripe integration
- 📊 Generation history tracking
- 🎯 Multiple image generation (1, 2, 4, 6, or 8 images)
- 📱 Responsive mobile-first design
- ⚡ Real-time generation status updates
- 🗑️ Image management (download, share, delete)

---

## 2. Architecture

### **Architecture Pattern**: Full-Stack Monolithic Application

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT (React)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │   Home   │  │ Results  │  │ History  │  │Settings │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
│         │              │              │            │     │
│         └──────────────┴──────────────┴────────────┘     │
│                        │                                 │
│                   tRPC Client                            │
└────────────────────────┼────────────────────────────────┘
                         │
                    HTTP/JSON
                         │
┌────────────────────────┼────────────────────────────────┐
│                   tRPC Server                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │   Auth   │  │  Gens    │  │ Credits  │  │  Plans  │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
│         │              │              │            │     │
│         └──────────────┴──────────────┴────────────┘     │
│                        │                                 │
│                   SERVER (Express)                       │
└────────────────────────┼────────────────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼
    ┌─────────┐    ┌─────────┐    ┌─────────┐
    │ MySQL   │    │ Gemini  │    │ Stripe  │
    │Database │    │   AI    │    │   API   │
    └─────────┘    └─────────┘    └─────────┘
          │              │              │
          │              │              │
    ┌─────────┐    ┌─────────┐    ┌─────────┐
    │  Manus  │    │   S3    │    │  OAuth  │
    │ Storage │    │Storage  │    │  Manus  │
    └─────────┘    └─────────┘    └─────────┘
```

### **Component Architecture**

#### **Frontend (Client)**
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: tRPC + React Query
- **UI Components**: Custom glassmorphism components
- **Styling**: Tailwind CSS + Custom CSS

#### **Backend (Server)**
- **Framework**: Express.js with TypeScript
- **API Layer**: tRPC (type-safe RPC)
- **Database ORM**: Drizzle ORM
- **Authentication**: Manus OAuth SDK
- **File Upload**: Multipart form handling

#### **External Services**
- **AI Generation**: Google Gemini 2.5 Flash Image Preview
- **Storage**: Manus Forge Storage / AWS S3
- **Payments**: Stripe (Live mode)
- **Authentication**: Manus OAuth Platform
- **Database**: MySQL (TiDB Cloud)

---

## 3. Technology Stack

### **Frontend Technologies**

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI framework |
| TypeScript | 5.6.2 | Type safety |
| Vite | 7.1.9 | Build tool & dev server |
| Tailwind CSS | 3.4.17 | Utility-first CSS |
| tRPC | 11.0.0 | Type-safe API client |
| React Query | 5.64.2 | Data fetching & caching |
| Wouter | 3.5.2 | Client-side routing |
| Lucide React | 0.469.0 | Icon library |
| Sonner | 1.7.3 | Toast notifications |

### **Backend Technologies**

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 22.13.0 | Runtime environment |
| Express | 5.0.1 | Web server framework |
| TypeScript | 5.6.2 | Type safety |
| tRPC | 11.0.0 | Type-safe API server |
| Drizzle ORM | 0.39.3 | Database ORM |
| MySQL2 | 3.12.0 | MySQL driver |
| Zod | 3.24.1 | Schema validation |

### **AI & External Services**

| Service | Purpose | API Version |
|---------|---------|-------------|
| Google Gemini | Image generation | 2.5-flash-image-preview |
| Stripe | Payment processing | 2024-12-18.acacia |
| Manus OAuth | Authentication | Latest |
| Manus Storage | File storage | Latest |
| AWS S3 | Alternative storage | Latest |

---

## 4. Design System

### **Design Philosophy**: Minimalist Glassmorphism

### **Color Palette**

```css
/* Primary Colors */
--primary-dark: #0A133B;      /* Deep navy background */
--primary-blue: #002857;      /* Rich blue */
--accent-blue: #0A76AF;       /* Bright blue accent */
--accent-dark-blue: #004b93;  /* Dark blue accent */

/* Neutral Colors */
--text-primary: #F5F7FA;      /* Off-white text */
--text-secondary: #C8CDD5;    /* Light gray text */
--text-muted: #8A92A0;        /* Muted gray text */

/* Glassmorphism */
--glass-bg: rgba(255, 255, 255, 0.05);
--glass-border: rgba(255, 255, 255, 0.1);
--glass-shadow: rgba(0, 0, 0, 0.3);
```

### **Typography**

```css
/* Font Family */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 
             'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 
             'Fira Sans', 'Droid Sans', 'Helvetica Neue', 
             sans-serif;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
```

### **Glassmorphism Components**

#### **Glass Surface**
```css
.glass-3d-surface {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}
```

#### **Glass Button**
```css
.glass-3d-button {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.05)
  );
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-3d-button:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.glass-3d-button:active {
  transform: translateY(0);
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}
```

### **Animations**

```css
/* Shimmer Loading */
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

.shimmer {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.05) 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}

/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

/* Pulse */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

### **Responsive Breakpoints**

```css
/* Mobile First */
--mobile: 0px;        /* Default */
--tablet: 640px;      /* sm: */
--laptop: 768px;      /* md: */
--desktop: 1024px;    /* lg: */
--wide: 1280px;       /* xl: */
--ultra-wide: 1536px; /* 2xl: */
```

---

## 5. Database Schema

### **Database**: MySQL (TiDB Cloud)
### **ORM**: Drizzle ORM
### **Migration Tool**: Drizzle Kit

### **Schema Diagram**

```
┌─────────────────┐         ┌──────────────────┐
│     users       │         │   generations    │
├─────────────────┤         ├──────────────────┤
│ id (PK)         │◄────────│ userId (FK)      │
│ name            │         │ id (PK)          │
│ email           │         │ originalUrl      │
│ loginMethod     │         │ imageUrls        │
│ role            │         │ imageCount       │
│ credits         │         │ aspectRatio      │
│ subscriptionPlan│         │ prompt           │
│ createdAt       │         │ style            │
│ lastSignedIn    │         │ cameraAngle      │
└─────────────────┘         │ lighting         │
                            │ status           │
                            │ processingTime   │
                            │ createdAt        │
                            │ completedAt      │
                            └──────────────────┘
                                     │
                                     │
                            ┌────────▼──────────┐
                            │creditTransactions │
                            ├───────────────────┤
                            │ id (PK)           │
                            │ userId (FK)       │
                            │ generationId (FK) │
                            │ amount            │
                            │ type              │
                            │ description       │
                            │ balanceAfter      │
                            │ createdAt         │
                            └───────────────────┘

┌──────────────────┐
│subscriptionPlans │
├──────────────────┤
│ id (PK)          │
│ name             │
│ displayName      │
│ description      │
│ monthlyCredits   │
│ priceMonthly     │
│ priceYearly      │
│ features (JSON)  │
│ isActive         │
│ sortOrder        │
│ createdAt        │
└──────────────────┘
```

### **Table: users**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(64) | PRIMARY KEY | Unique user identifier from Manus OAuth |
| name | TEXT | NULL | User's full name |
| email | VARCHAR(320) | NULL | User's email address |
| loginMethod | VARCHAR(64) | NULL | OAuth provider (e.g., "google") |
| role | ENUM | NOT NULL, DEFAULT 'user' | User role: user, admin, super_admin |
| credits | INT | NOT NULL, DEFAULT 10 | Available generation credits |
| subscriptionPlan | ENUM | NOT NULL, DEFAULT 'free' | Plan: free, basic, pro, unlimited |
| subscriptionStatus | ENUM | NOT NULL, DEFAULT 'active' | Status: active, cancelled, expired |
| subscriptionExpiresAt | TIMESTAMP | NULL | Subscription expiration date |
| createdAt | TIMESTAMP | DEFAULT NOW() | Account creation timestamp |
| lastSignedIn | TIMESTAMP | DEFAULT NOW() | Last login timestamp |

**Indexes**:
- PRIMARY KEY: `id`
- INDEX: `email`

### **Table: generations**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(64) | PRIMARY KEY | UUID for generation |
| userId | VARCHAR(64) | NOT NULL | Foreign key to users.id |
| originalUrl | TEXT | NOT NULL | S3 URL of uploaded image |
| imageUrls | TEXT | NOT NULL | JSON array of generated image URLs |
| imageCount | INT | NOT NULL | Number of images requested |
| aspectRatio | VARCHAR(32) | NOT NULL, DEFAULT 'portrait' | portrait, landscape, square |
| prompt | TEXT | NOT NULL | AI generation prompt |
| style | VARCHAR(128) | NULL | Style preset (e.g., "Editorial") |
| cameraAngle | VARCHAR(128) | NULL | Camera angle (e.g., "Hero low angle") |
| lighting | VARCHAR(128) | NULL | Lighting setup (e.g., "Rembrandt") |
| status | ENUM | NOT NULL, DEFAULT 'pending' | pending, processing, completed, failed |
| errorMessage | TEXT | NULL | Error details if failed |
| processingTime | INT | NULL | Time taken in milliseconds |
| modelUsed | VARCHAR(128) | NOT NULL, DEFAULT 'gemini-2.5-flash' | AI model identifier |
| isFavorite | INT | NOT NULL, DEFAULT 0 | Boolean: 0 or 1 |
| isPublic | INT | NOT NULL, DEFAULT 0 | Boolean: 0 or 1 |
| views | INT | NOT NULL, DEFAULT 0 | View count |
| downloads | INT | NOT NULL, DEFAULT 0 | Download count |
| createdAt | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updatedAt | TIMESTAMP | DEFAULT NOW() | Last update timestamp |
| completedAt | TIMESTAMP | NULL | Completion timestamp |

**Indexes**:
- PRIMARY KEY: `id`
- INDEX: `userId`
- INDEX: `status`
- INDEX: `createdAt`

### **Table: creditTransactions**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(64) | PRIMARY KEY | UUID for transaction |
| userId | VARCHAR(64) | NOT NULL | Foreign key to users.id |
| amount | INT | NOT NULL | Credit change (positive or negative) |
| type | ENUM | NOT NULL | purchase, subscription, generation, refund, bonus |
| description | TEXT | NULL | Transaction description |
| generationId | VARCHAR(64) | NULL | Related generation ID |
| balanceAfter | INT | NOT NULL | Credit balance after transaction |
| createdAt | TIMESTAMP | DEFAULT NOW() | Transaction timestamp |

**Indexes**:
- PRIMARY KEY: `id`
- INDEX: `userId`
- INDEX: `createdAt`

### **Table: subscriptionPlans**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(64) | PRIMARY KEY | Plan identifier |
| name | VARCHAR(64) | NOT NULL | Internal plan name |
| displayName | VARCHAR(128) | NOT NULL | User-facing plan name |
| description | TEXT | NULL | Plan description |
| monthlyCredits | INT | NOT NULL | Credits per month |
| priceMonthly | INT | NOT NULL | Monthly price in pence (£) |
| priceYearly | INT | NOT NULL | Yearly price in pence (£) |
| features | TEXT | NOT NULL | JSON array of features |
| isActive | INT | NOT NULL, DEFAULT 1 | Boolean: 0 or 1 |
| sortOrder | INT | NOT NULL, DEFAULT 0 | Display order |
| createdAt | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updatedAt | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Indexes**:
- PRIMARY KEY: `id`
- INDEX: `isActive`, `sortOrder`

---

## 6. API Structure

### **API Framework**: tRPC (Type-Safe RPC)

### **API Endpoints**

```typescript
// API Router Structure
appRouter = {
  system: {
    // System health and info
  },
  
  auth: {
    me: publicProcedure,           // Get current user
    logout: publicProcedure,        // Logout user
  },
  
  credits: {
    getBalance: protectedProcedure, // Get user credits
    addBonus: protectedProcedure,   // Add bonus credits (admin)
    getPackages: publicProcedure,   // Get credit packages
    createCheckout: protectedProcedure, // Create Stripe checkout
  },
  
  plans: {
    list: publicProcedure,          // List subscription plans
    seedPlans: protectedProcedure,  // Seed initial plans (admin)
  },
  
  generations: {
    list: publicProcedure,          // List user generations
    get: publicProcedure,           // Get single generation
    create: protectedProcedure,     // Create new generation
    delete: publicProcedure,        // Delete generation
    toggleFavorite: protectedProcedure, // Toggle favorite status
  },
}
```

### **API Endpoint Details**

#### **auth.me**
```typescript
// GET /api/trpc/auth.me
// Returns current authenticated user or null

Response: {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "super_admin";
  credits: number;
  subscriptionPlan: "free" | "basic" | "pro" | "unlimited";
  createdAt: Date;
}
```

#### **generations.create**
```typescript
// POST /api/trpc/generations.create
// Create new AI generation

Input: {
  originalUrl: string;      // Base64 data URI
  imageCount: number;       // 1-8
  aspectRatio: "portrait" | "landscape" | "square";
  style?: string;           // e.g., "Editorial"
  cameraAngle?: string;     // e.g., "Hero low angle"
  lighting?: string;        // e.g., "Rembrandt"
  prompt: string;           // AI prompt
}

Response: {
  id: string;               // Generation UUID
  status: "processing";
}
```

#### **generations.list**
```typescript
// GET /api/trpc/generations.list
// List user's generations

Response: Array<{
  id: string;
  userId: string;
  originalUrl: string;
  imageUrls: string[];      // Parsed JSON
  imageCount: number;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: Date;
  completedAt?: Date;
}>
```

#### **credits.createCheckout**
```typescript
// POST /api/trpc/credits.createCheckout
// Create Stripe checkout session

Input: {
  packageId: string;        // Credit package ID
}

Response: {
  url: string;              // Stripe checkout URL
}
```

---

## 7. Authentication Flow

### **Authentication Provider**: Manus OAuth Platform
### **OAuth Method**: Google Sign-In

### **Authentication Sequence**

```
┌──────┐                    ┌──────┐                    ┌──────┐
│Client│                    │Server│                    │Manus │
└──┬───┘                    └──┬───┘                    └──┬───┘
   │                           │                           │
   │ 1. Click "Sign In"        │                           │
   ├──────────────────────────►│                           │
   │                           │                           │
   │ 2. Redirect to Manus      │                           │
   │◄──────────────────────────┤                           │
   │                           │                           │
   │ 3. OAuth Authorization    │                           │
   ├───────────────────────────┼──────────────────────────►│
   │                           │                           │
   │ 4. Google Sign-In         │                           │
   │◄──────────────────────────┼───────────────────────────┤
   │                           │                           │
   │ 5. Redirect with code     │                           │
   ├──────────────────────────►│                           │
   │                           │                           │
   │                           │ 6. Exchange code for token│
   │                           ├──────────────────────────►│
   │                           │                           │
   │                           │ 7. Return user data       │
   │                           │◄──────────────────────────┤
   │                           │                           │
   │                           │ 8. Create/update user DB  │
   │                           ├──────────┐                │
   │                           │          │                │
   │                           │◄─────────┘                │
   │                           │                           │
   │                           │ 9. Set session cookie     │
   │                           ├──────────┐                │
   │                           │          │                │
   │                           │◄─────────┘                │
   │                           │                           │
   │ 10. Redirect to app       │                           │
   │◄──────────────────────────┤                           │
   │                           │                           │
   │ 11. Authenticated!        │                           │
   │                           │                           │
```

### **Session Management**

```typescript
// Cookie Configuration
const sessionCookie = {
  name: "manus_session",
  httpOnly: true,
  secure: true,           // HTTPS only
  sameSite: "lax",
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
}

// Authentication Middleware
async function createContext(opts) {
  let user = null;
  
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null; // Authentication optional for public procedures
  }
  
  return { req, res, user };
}
```

### **Protected Procedures**

```typescript
// Protected procedure requires authentication
const protectedProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required"
    });
  }
  
  return next({
    ctx: {
      ...ctx,
      user: ctx.user, // Type-safe user
    },
  });
});
```

---

## 8. Image Generation Pipeline

### **AI Model**: Google Gemini 2.5 Flash Image Preview
### **Generation Method**: Image-to-Image with Prompt

### **Generation Flow**

```
┌────────────────────────────────────────────────────────┐
│ 1. USER UPLOAD                                         │
│    • User selects image from device                    │
│    • Image converted to base64 data URI                │
│    • User selects image count (1, 2, 4, 6, or 8)      │
│    • User optionally sets style, angle, lighting       │
└────────────────┬───────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────┐
│ 2. FRONTEND VALIDATION                                 │
│    • Check image file exists                           │
│    • Check user has sufficient credits                 │
│    • Show loading state                                │
└────────────────┬───────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────┐
│ 3. API REQUEST (tRPC)                                  │
│    POST /api/trpc/generations.create                   │
│    {                                                    │
│      originalUrl: "data:image/jpeg;base64,/9j/4AA...", │
│      imageCount: 4,                                     │
│      style: "Editorial",                                │
│      cameraAngle: "Hero low angle",                     │
│      lighting: "Rembrandt",                             │
│      prompt: "professional fashion photography"         │
│    }                                                    │
└────────────────┬───────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────┐
│ 4. BACKEND PROCESSING                                  │
│    • Authenticate user (Manus OAuth)                   │
│    • Check credit balance                              │
│    • Extract base64 from data URI                      │
│    • Upload original to S3/Manus Storage               │
│    • Create generation record in database              │
│    • Deduct credits from user account                  │
│    • Return generation ID immediately                  │
└────────────────┬───────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────┐
│ 5. ASYNC GENERATION (Background)                       │
│    FOR each image (1 to imageCount):                   │
│      • Build fashion prompt with style parameters      │
│      • Call Gemini API with:                           │
│        - Reference image (base64)                      │
│        - Fashion prompt                                │
│        - Model: gemini-2.5-flash-image-preview         │
│        - Config: { responseModalities: ['IMAGE'] }     │
│      • Receive generated image (base64)                │
│      • Convert to buffer                               │
│      • Upload to S3/Manus Storage                      │
│      • Add URL to imageUrls array                      │
│    END FOR                                             │
└────────────────┬───────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────┐
│ 6. DATABASE UPDATE                                     │
│    UPDATE generations SET                              │
│      status = 'completed',                             │
│      imageUrls = JSON.stringify(urls),                 │
│      completedAt = NOW(),                              │
│      processingTime = elapsed                          │
│    WHERE id = generationId                             │
└────────────────┬───────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────┐
│ 7. CLIENT AUTO-REFRESH                                 │
│    • Results page polls every 2 seconds                │
│    • Fetches generation status                         │
│    • Shows loading placeholders while processing       │
│    • Displays images when completed                    │
│    • Shows error message if failed                     │
└────────────────────────────────────────────────────────┘
```

### **Gemini API Integration**

```typescript
// Gemini Configuration
const model = "gemini-2.5-flash-image-preview";

const generationConfig = {
  responseModalities: ["IMAGE"],
  temperature: 1.0,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
};

// Fashion Prompt Builder
function buildFashionPrompt(params) {
  const { style, cameraAngle, lighting } = params;
  
  return `Transform this image into professional fashion photography.
  
Style: ${style || "Editorial"}
Camera Angle: ${cameraAngle || "Hero low angle"}
Lighting: ${lighting || "Rembrandt"}

Requirements:
- Maintain the person's identity and features
- Professional fashion photography aesthetic
- High-quality, magazine-worthy composition
- Natural and realistic lighting
- Clean, professional background
- Fashion-forward styling`;
}

// API Call
async function generateImagesWithGemini(params) {
  const { prompt, imageBase64, mimeType } = params;
  
  const result = await model.generateContent({
    contents: [{
      role: "user",
      parts: [
        { text: prompt },
        {
          inlineData: {
            mimeType: mimeType,
            data: imageBase64,
          },
        },
      ],
    }],
    generationConfig,
  });
  
  // Extract generated image
  const imageData = result.response.candidates[0]
    .content.parts[0].inlineData.data;
  
  return { images: [imageData] };
}
```

### **Storage Strategy**

```typescript
// Storage Configuration
const storage = {
  provider: "manus-forge", // or "s3"
  
  paths: {
    originals: "originals/{userId}/{generationId}.{ext}",
    generated: "generations/{generationId}/image-{index}-{timestamp}.png",
  },
  
  upload: async (path, buffer, contentType) => {
    // Upload to Manus Forge Storage or S3
    const url = await storagePut(path, buffer, contentType);
    return { url };
  },
};
```

---

## 9. Credit System

### **Credit Model**: Pay-per-Generation
### **Credit Cost**: 1 credit = 1 generated image

### **Credit Flow**

```
┌─────────────────────────────────────────────────────┐
│ NEW USER REGISTRATION                               │
│  • User signs in via Manus OAuth                    │
│  • System creates user record                       │
│  • Initial credits: 10 (free)                       │
│  • Subscription: "free"                             │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ CREDIT DEDUCTION                                    │
│  • User requests 4 images                           │
│  • System checks: credits >= 4                      │
│  • Deduct 4 credits                                 │
│  • Record transaction:                              │
│    - amount: -4                                     │
│    - type: "generation"                             │
│    - balanceAfter: 6                                │
│  • Create generation record                         │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ CREDIT PURCHASE (Stripe)                            │
│  • User selects package (e.g., 100 credits for £9)  │
│  • System creates Stripe checkout                   │
│  • User completes payment                           │
│  • Webhook receives payment confirmation            │
│  • Add credits to user account                      │
│  • Record transaction:                              │
│    - amount: +100                                   │
│    - type: "purchase"                               │
│    - balanceAfter: 106                              │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ SUBSCRIPTION CREDITS (Future)                       │
│  • User subscribes to Pro plan                      │
│  • Monthly credits: 500                             │
│  • Credits added automatically each month           │
│  • Record transaction:                              │
│    - amount: +500                                   │
│    - type: "subscription"                           │
│    - balanceAfter: 606                              │
└─────────────────────────────────────────────────────┘
```

### **Credit Packages**

```typescript
const CREDIT_PACKAGES = [
  {
    id: "starter",
    name: "Starter Pack",
    credits: 25,
    price: 4.99,
    priceInPence: 499,
    currency: "GBP",
    popular: false,
    bestValue: false,
  },
  {
    id: "popular",
    name: "Popular Pack",
    credits: 100,
    price: 14.99,
    priceInPence: 1499,
    currency: "GBP",
    popular: true,
    bestValue: false,
  },
  {
    id: "pro",
    name: "Pro Pack",
    credits: 250,
    price: 29.99,
    priceInPence: 2999,
    currency: "GBP",
    popular: false,
    bestValue: true,
  },
  {
    id: "ultimate",
    name: "Ultimate Pack",
    credits: 500,
    price: 49.99,
    priceInPence: 4999,
    currency: "GBP",
    popular: false,
    bestValue: false,
  },
];
```

### **Super Admin Privileges**

```typescript
// Super admins have unlimited credits
function getUserCredits(userId) {
  const user = await getUser(userId);
  
  if (user.role === "super_admin") {
    return Infinity; // Unlimited
  }
  
  return user.credits;
}

// Skip credit deduction for super admins
function deductCredits(userId, amount, generationId) {
  const user = await getUser(userId);
  
  if (user.role === "super_admin") {
    return true; // No deduction
  }
  
  // Normal deduction logic
  // ...
}
```

---

## 10. Payment Integration

### **Payment Provider**: Stripe
### **Mode**: Live (Production)
### **Currency**: British Pounds (£ GBP)

### **Stripe Configuration**

```typescript
// Stripe API Keys
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
});

// Publishable Key (Frontend)
const publishableKey = process.env.VITE_STRIPE_PUBLISHABLE_KEY;

// Webhook Secret
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
```

### **Checkout Flow**

```
┌────────────────────────────────────────────────────┐
│ 1. USER INITIATES PURCHASE                         │
│    • User clicks "Buy" on credit package           │
│    • Frontend calls createCheckout mutation        │
└────────────────┬───────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────┐
│ 2. CREATE STRIPE CHECKOUT SESSION                  │
│    const session = await stripe.checkout.sessions  │
│      .create({                                      │
│        payment_method_types: ['card'],             │
│        line_items: [{                              │
│          price_data: {                             │
│            currency: 'gbp',                        │
│            product_data: {                         │
│              name: '100 Credits',                  │
│              description: 'Fashion Muse Credits',  │
│            },                                       │
│            unit_amount: 1499, // £14.99 in pence   │
│          },                                         │
│          quantity: 1,                              │
│        }],                                          │
│        mode: 'payment',                            │
│        success_url: '{APP_URL}/settings?success',  │
│        cancel_url: '{APP_URL}/settings?canceled',  │
│        metadata: {                                 │
│          userId: user.id,                          │
│          packageId: 'popular',                     │
│          credits: '100',                           │
│        },                                           │
│      });                                            │
└────────────────┬───────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────┐
│ 3. REDIRECT TO STRIPE                              │
│    window.location.href = session.url;             │
└────────────────┬───────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────┐
│ 4. USER COMPLETES PAYMENT                          │
│    • User enters card details                      │
│    • Stripe processes payment                      │
│    • Stripe redirects to success_url               │
└────────────────┬───────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────┐
│ 5. STRIPE WEBHOOK NOTIFICATION                     │
│    POST /api/stripe/webhook                        │
│    Event: checkout.session.completed               │
│    {                                                │
│      metadata: {                                   │
│        userId: "user123",                          │
│        packageId: "popular",                       │
│        credits: "100"                              │
│      }                                              │
│    }                                                │
└────────────────┬───────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────┐
│ 6. PROCESS PAYMENT SUCCESS                         │
│    • Verify webhook signature                      │
│    • Extract metadata                              │
│    • Add credits to user account                   │
│    • Create credit transaction record              │
│    • Send confirmation email (future)              │
└────────────────┬───────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────┐
│ 7. USER SEES SUCCESS                               │
│    • Redirected to /settings?success=true          │
│    • Toast notification: "Credits added!"          │
│    • Updated credit balance displayed              │
└────────────────────────────────────────────────────┘
```

### **Webhook Handler**

```typescript
// POST /api/stripe/webhook
async function handleStripeWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  const rawBody = req.body; // Raw buffer
  
  let event;
  
  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      webhookSecret
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Handle checkout.session.completed
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    const { userId, packageId, credits } = session.metadata;
    
    // Add credits to user
    await addCredits(
      userId,
      parseInt(credits),
      "purchase",
      `Purchased ${credits} credits`
    );
    
    console.log(`[Stripe] Added ${credits} credits to user ${userId}`);
  }
  
  res.json({ received: true });
}
```

---

## 11. File Structure

```
fashion-muse-app/
├── client/                          # Frontend application
│   ├── public/                      # Static assets
│   │   ├── logo.png                 # App logo
│   │   └── pmlogo1(1).png          # Fashion Muse Studio logo
│   │
│   ├── src/                         # Source code
│   │   ├── _core/                   # Core utilities
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.tsx     # Authentication hook
│   │   │   └── sdk.ts              # Manus SDK wrapper
│   │   │
│   │   ├── components/              # Reusable components
│   │   │   └── ui/
│   │   │       └── button.tsx      # Button component
│   │   │
│   │   ├── lib/                     # Libraries
│   │   │   └── trpc.ts             # tRPC client setup
│   │   │
│   │   ├── pages/                   # Page components
│   │   │   ├── Home.tsx            # Home/Generation page
│   │   │   ├── ResultsPage.tsx     # Results display page
│   │   │   ├── HistoryPage.tsx     # Generation history
│   │   │   ├── SettingsPage.tsx    # User settings
│   │   │   └── PlansPage.tsx       # Subscription plans (deprecated)
│   │   │
│   │   ├── App.tsx                  # Main app component
│   │   ├── main.tsx                 # Entry point
│   │   ├── const.ts                 # Constants
│   │   ├── glass-ui.css            # Glassmorphism styles
│   │   └── index.css               # Global styles
│   │
│   ├── index.html                   # HTML template
│   ├── vite.config.ts              # Vite configuration
│   └── tsconfig.json               # TypeScript config
│
├── server/                          # Backend application
│   ├── _core/                       # Core server modules
│   │   ├── context.ts              # tRPC context
│   │   ├── cookies.ts              # Cookie utilities
│   │   ├── env.ts                  # Environment variables
│   │   ├── geminiImageGen.ts       # Gemini AI integration
│   │   ├── index.ts                # Server entry point
│   │   ├── oauth.ts                # OAuth routes
│   │   ├── sdk.ts                  # Manus SDK
│   │   ├── stripe.ts               # Stripe integration
│   │   ├── stripeWebhook.ts        # Stripe webhook handler
│   │   ├── systemRouter.ts         # System routes
│   │   ├── trpc.ts                 # tRPC setup
│   │   └── vite.ts                 # Vite middleware
│   │
│   ├── db.ts                        # Database operations
│   ├── routers.ts                   # API routes
│   └── storage.ts                   # File storage
│
├── drizzle/                         # Database schema
│   └── schema.ts                    # Drizzle ORM schema
│
├── dist/                            # Build output
│   ├── public/                      # Frontend build
│   └── index.js                     # Server build
│
├── .env                             # Environment variables
├── .env.example                     # Environment template
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
├── drizzle.config.ts               # Drizzle config
├── vercel.json                      # Vercel deployment config
│
├── DEPLOYMENT.md                    # Deployment guide
├── DEPLOY_NOW.md                    # Quick deploy guide
├── FIXES_APPLIED.md                 # Bug fixes log
├── REDESIGN_SUMMARY.md              # Redesign documentation
└── TECHNICAL_DOCUMENTATION.md       # This file
```

---

## 12. Deployment

### **Recommended Platform**: Vercel
### **Alternative Platforms**: Railway, Render, Fly.io

### **Deployment Steps (Vercel)**

1. **Connect Repository**
   ```bash
   # Via Vercel Dashboard
   https://vercel.com/new
   # Import: ivnad95/fashion-muse-studio
   ```

2. **Configure Build Settings**
   ```json
   {
     "buildCommand": "pnpm run build",
     "outputDirectory": "dist/public",
     "installCommand": "pnpm install",
     "framework": null
   }
   ```

3. **Add Environment Variables**
   ```
   GEMINI_API_KEY=<your_key>
   DATABASE_URL=<your_mysql_url>
   VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
   VITE_APP_ID=<your_app_id>
   STRIPE_SECRET_KEY=<your_stripe_key>
   STRIPE_WEBHOOK_SECRET=<your_webhook_secret>
   VITE_STRIPE_PUBLISHABLE_KEY=<your_publishable_key>
   NODE_ENV=production
   ```

4. **Deploy**
   ```bash
   # Automatic deployment on git push
   git push origin master
   ```

### **Production Checklist**

- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Stripe webhook endpoint configured
- [ ] OAuth callback URLs updated
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Error monitoring setup (Sentry)
- [ ] Analytics configured (PostHog, etc.)

---

## 13. Environment Variables

### **Required Variables**

```bash
# Database
DATABASE_URL=mysql://user:pass@host:port/database

# Google Gemini AI
GEMINI_API_KEY=AIzaSy...

# Manus OAuth
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
VITE_APP_ID=your_app_id

# Stripe (Production)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Application
NODE_ENV=production
VITE_APP_URL=https://your-domain.com
```

### **Optional Variables**

```bash
# AWS S3 (Alternative Storage)
S3_ENDPOINT=s3.amazonaws.com
S3_ACCESS_KEY_ID=your_key
S3_SECRET_ACCESS_KEY=your_secret
S3_BUCKET=your_bucket
S3_REGION=us-east-1

# Admin
OWNER_ID=your_user_id  # For super admin privileges
```

### **Development Variables**

```bash
# Development Mode
NODE_ENV=development
VITE_APP_URL=http://localhost:3000

# Stripe Test Mode
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 📚 Additional Resources

### **Documentation Links**
- [Google Gemini API Docs](https://ai.google.dev/gemini-api/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [tRPC Documentation](https://trpc.io/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team/docs)
- [Manus Platform](https://manus.im)

### **Development Tools**
- [Drizzle Studio](https://orm.drizzle.team/drizzle-studio) - Database GUI
- [Stripe Dashboard](https://dashboard.stripe.com) - Payment management
- [Vercel Dashboard](https://vercel.com/dashboard) - Deployment management

---

**Last Updated**: October 18, 2025  
**Version**: 1.0.0  
**Author**: Fashion Muse Studio Team


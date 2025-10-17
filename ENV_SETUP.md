# Environment Variables Setup Guide

This document explains all environment variables needed for Fashion Muse Studio and how to obtain them.

## Quick Start

The following secrets are **already configured** in the Manus platform and automatically injected:

✅ `BUILT_IN_FORGE_API_KEY` - Storage API key  
✅ `BUILT_IN_FORGE_API_URL` - Storage API URL  
✅ `GEMINI_API_KEY` - Gemini API key (you provided this)  
✅ `JWT_SECRET` - Session secret  
✅ `OAUTH_SERVER_URL` - OAuth backend URL  
✅ `VITE_OAUTH_PORTAL_URL` - OAuth frontend URL  
✅ `OWNER_OPEN_ID` - Owner ID  
✅ `OWNER_NAME` - Owner name  
✅ `VITE_APP_ID` - App ID  
✅ `VITE_APP_TITLE` - App title  
✅ `VITE_APP_LOGO` - App logo  
✅ `VITE_ANALYTICS_ENDPOINT` - Analytics endpoint  
✅ `VITE_ANALYTICS_WEBSITE_ID` - Analytics website ID  

## For External Deployment (Vercel, Railway, etc.)

If you're deploying outside the Manus platform, you'll need to set these variables manually:

### 1. GEMINI_API_KEY (Required)
**What it does:** Enables AI image generation with Gemini  
**How to get it:**
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Get API Key" or "Create API Key"
4. Copy the generated key

**Set as:** `GEMINI_API_KEY=your_actual_key_here`

---

### 2. DATABASE_URL (Required)
**What it does:** Connects to your MySQL/TiDB database  
**Format:** `mysql://username:password@host:port/database`

**Options:**

**Option A: PlanetScale (Recommended)**
1. Go to [planetscale.com](https://planetscale.com)
2. Create a free account
3. Create a new database
4. Get connection string from "Connect" tab
5. Use the MySQL format connection string

**Option B: Railway**
1. Go to [railway.app](https://railway.app)
2. Create a MySQL database
3. Copy the `DATABASE_URL` from variables

**Option C: Local MySQL**
```bash
# Install MySQL locally
# Create database: CREATE DATABASE fashion_muse;
DATABASE_URL=mysql://root:password@localhost:3306/fashion_muse
```

---

### 3. JWT_SECRET (Required)
**What it does:** Secures user session cookies  
**How to generate:**

```bash
# Option 1: Using OpenSSL
openssl rand -base64 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Use any random 32+ character string
```

**Set as:** `JWT_SECRET=your_generated_secret_here`

---

### 4. OAUTH_SERVER_URL (Required for Auth)
**What it does:** Backend OAuth server URL  
**Default:** `https://api.manus.im`

If using custom OAuth provider, replace with your OAuth backend URL.

---

### 5. VITE_OAUTH_PORTAL_URL (Required for Auth)
**What it does:** Frontend OAuth login portal  
**Default:** `https://oauth.manus.im`

If using custom OAuth provider, replace with your OAuth frontend URL.

---

### 6. Storage Configuration (Required for Image Uploads)

**Option A: Use Manus Built-in Storage (Easiest)**
- Already configured if deployed on Manus platform
- `BUILT_IN_FORGE_API_URL` and `BUILT_IN_FORGE_API_KEY` are auto-injected

**Option B: Use Your Own S3 Storage**
1. Get AWS S3 credentials or compatible service (Cloudflare R2, DigitalOcean Spaces)
2. Update `server/storage.ts` with your credentials:
```typescript
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'auto',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  endpoint: process.env.S3_ENDPOINT, // For R2/Spaces
});
```

3. Set environment variables:
```
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=fashion-muse-images
S3_ENDPOINT=https://your-endpoint.com  # Optional, for R2/Spaces
```

---

### 7. Application Configuration

**VITE_APP_ID** (Optional)
- Default: `fashion-muse-studio`
- Used for app identification

**VITE_APP_TITLE** (Optional)
- Default: `Fashion Muse Studio`
- Shown in browser tab and login dialog

**VITE_APP_LOGO** (Optional)
- Default: `/logo.png`
- Path to your logo image

---

### 8. Owner Configuration (Optional)

**OWNER_OPEN_ID** - Your user ID (for admin features)  
**OWNER_NAME** - Your display name

---

### 9. Analytics (Optional)

**VITE_ANALYTICS_ENDPOINT** - Analytics service endpoint  
**VITE_ANALYTICS_WEBSITE_ID** - Your website ID

---

## Complete .env File Example

```bash
# Required
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
DATABASE_URL=mysql://user:pass@host:3306/fashion_muse
JWT_SECRET=random_32_character_secret_string_here

# Auth (use defaults or customize)
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im

# Storage (if using Manus platform, these are auto-injected)
BUILT_IN_FORGE_API_URL=https://storage.manus.im
BUILT_IN_FORGE_API_KEY=your_storage_key

# Optional
VITE_APP_ID=fashion-muse-studio
VITE_APP_TITLE=Fashion Muse Studio
VITE_APP_LOGO=/logo.png
OWNER_OPEN_ID=your_user_id
OWNER_NAME=Your Name
```

---

## Platform-Specific Setup

### Vercel
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add each variable with its value
4. Redeploy

### Railway
1. Go to your project
2. Click "Variables" tab
3. Add each variable
4. Railway auto-redeploys

### Render
1. Go to your web service
2. Navigate to "Environment"
3. Add each variable
4. Trigger manual deploy

### Docker
Create a `.env` file in your project root with all variables, then:
```bash
docker run --env-file .env your-image
```

---

## Security Notes

⚠️ **Never commit `.env` files to Git**  
⚠️ **Keep API keys secret**  
⚠️ **Use different secrets for dev/staging/production**  
⚠️ **Rotate secrets regularly**  

---

## Testing Your Setup

1. Set all required variables
2. Run: `pnpm install`
3. Run: `pnpm db:push` (to create database tables)
4. Run: `pnpm dev`
5. Visit `http://localhost:3000`
6. Try uploading an image and generating

If you see errors, check:
- All required variables are set
- Database is accessible
- Gemini API key is valid
- Storage credentials are correct

---

## Need Help?

- Gemini API: [Google AI Documentation](https://ai.google.dev/gemini-api/docs)
- Database: Check your provider's documentation
- OAuth: [Manus OAuth Guide](https://docs.manus.im)
- Storage: [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)


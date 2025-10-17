# Current Environment Variables

This document shows the environment variables currently configured for this Fashion Muse Studio project.

## ✅ Active Configuration

```bash
# AI Image Generation
GEMINI_API_KEY=AIzaSyBDNXNgs-mRx7XsK8XbvYcpAcegNfALe4M
BFL_API_KEY=31d686f1-2060-493c-9c14-fba0641354c5

# Database
DATABASE_URL=mysql://2ESUfcCjWJhUrBb.root:yMyuNsowbhO61C7774Rb@gateway02.us-east-1.prod.aws.tidbcloud.com:4000/jAQfzu8vwEfKbBJhYmWQ6L?ssl={"rejectUnauthorized":true}

# Authentication
JWT_SECRET=W362eTYBja4g4QNDULSKfF
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im

# Storage (S3)
BUILT_IN_FORGE_API_URL=https://forge.manus.ai
BUILT_IN_FORGE_API_KEY=LeHnYX3pNzoBDtbo3im6Nn

# Application
VITE_APP_ID=jAQfzu8vwEfKbBJhYmWQ6L
VITE_APP_TITLE=Fashion Muse Studio
VITE_APP_LOGO=https://files.manuscdn.com/user_upload_by_module/web_dev_logo/310419663032473858/viDwcPcnHdrScTis.png

# Owner
OWNER_OPEN_ID=BJQA2m349v5k8rHGkNeH9r
OWNER_NAME=Elijah Carter

# Analytics
VITE_ANALYTICS_ENDPOINT=https://manus-analytics.com
VITE_ANALYTICS_WEBSITE_ID=bd3a8c0a-01f8-4f15-a7f7-7b50589775e4
```

## 📋 Summary

| Variable | Purpose | Status |
|----------|---------|--------|
| `GEMINI_API_KEY` | Gemini AI image generation | ✅ Configured |
| `BFL_API_KEY` | FLUX AI (alternative) | ✅ Configured |
| `DATABASE_URL` | TiDB Cloud MySQL database | ✅ Configured |
| `JWT_SECRET` | Session cookie encryption | ✅ Configured |
| `OAUTH_SERVER_URL` | Manus OAuth backend | ✅ Configured |
| `VITE_OAUTH_PORTAL_URL` | Manus OAuth frontend | ✅ Configured |
| `BUILT_IN_FORGE_API_URL` | Storage API endpoint | ✅ Configured |
| `BUILT_IN_FORGE_API_KEY` | Storage API key | ✅ Configured |
| `VITE_APP_ID` | Application ID | ✅ Configured |
| `VITE_APP_TITLE` | App display name | ✅ Configured |
| `VITE_APP_LOGO` | App logo URL | ✅ Configured |
| `OWNER_OPEN_ID` | Owner user ID | ✅ Configured |
| `OWNER_NAME` | Owner display name | ✅ Configured |
| `VITE_ANALYTICS_ENDPOINT` | Analytics service | ✅ Configured |
| `VITE_ANALYTICS_WEBSITE_ID` | Analytics website ID | ✅ Configured |

## 🔐 Security Notes

⚠️ **IMPORTANT:** These are production secrets. Do not share publicly or commit to Git.

- The Gemini API key is active and will be charged for usage
- The database URL contains credentials for TiDB Cloud
- The JWT secret secures all user sessions
- Storage API key controls file uploads

## 🚀 Using These Variables

### For Local Development
Copy these to your `.env` file:
```bash
cp CURRENT_ENV.md .env
# Then edit .env to use the values above
```

### For External Deployment
Set these in your hosting platform's environment variables section:
- **Vercel:** Project Settings → Environment Variables
- **Railway:** Project → Variables tab
- **Render:** Web Service → Environment
- **Netlify:** Site Settings → Environment Variables

## 📝 Notes

- **Database:** Using TiDB Cloud (MySQL-compatible serverless database)
- **Storage:** Using Manus Forge API (S3-compatible)
- **Auth:** Using Manus OAuth system
- **Image Gen:** Primary = Gemini, Fallback = FLUX (BFL)
- **Owner:** Elijah Carter (admin user)

---

**Last Updated:** Generated from current running environment


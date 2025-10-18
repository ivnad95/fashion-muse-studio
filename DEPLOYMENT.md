# Fashion Muse Studio - Deployment Guide

## 🚀 Deploy to Vercel

### Prerequisites
- GitHub repository: `https://github.com/ivnad95/fashion-muse-studio`
- Vercel account connected to GitHub
- Environment variables (API keys)

### Step 1: Import Project to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Click "Import Project"
3. Select your GitHub repository: `ivnad95/fashion-muse-studio`
4. Configure project settings:
   - **Framework Preset**: Other
   - **Build Command**: `pnpm run build`
   - **Output Directory**: `dist/public`
   - **Install Command**: `pnpm install`

### Step 2: Configure Environment Variables

Add the following environment variables in Vercel Dashboard → Settings → Environment Variables:

#### Required Variables:

```bash
# Manus OAuth (for authentication)
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
VITE_APP_ID=your_manus_app_id

# Gemini AI (for image generation)
GEMINI_API_KEY=your_gemini_api_key

# Database (Neon Postgres or similar)
DATABASE_URL=your_postgres_connection_string

# S3 Storage (for image uploads)
S3_ENDPOINT=your_s3_endpoint
S3_ACCESS_KEY_ID=your_s3_access_key
S3_SECRET_ACCESS_KEY=your_s3_secret_key
S3_BUCKET=your_s3_bucket_name
S3_REGION=your_s3_region

# Stripe (optional - for payments)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Node Environment
NODE_ENV=production
```

### Step 3: Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Your app will be live at: `https://fashion-muse-studio.vercel.app`

### Step 4: Configure Custom Domain (Optional)

1. Go to Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

---

## 🔧 Alternative: Deploy via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Add environment variables
vercel env add GEMINI_API_KEY
vercel env add DATABASE_URL
# ... add all other variables
```

---

## 📝 Environment Variables Reference

### Current Configuration

The app requires these services:
- **Manus OAuth**: User authentication
- **Google Gemini API**: AI image generation
- **Neon Postgres**: Database storage
- **S3 Compatible Storage**: Image file storage
- **Stripe** (optional): Payment processing

### Where to Get API Keys

1. **Gemini API**: https://ai.google.dev/
2. **Neon Database**: https://neon.tech/
3. **S3 Storage**: AWS S3, Cloudflare R2, or DigitalOcean Spaces
4. **Stripe**: https://stripe.com/

---

## ✅ Post-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations run
- [ ] S3 bucket created and accessible
- [ ] OAuth redirect URLs updated
- [ ] Stripe webhooks configured (if using payments)
- [ ] Test image generation
- [ ] Test user authentication
- [ ] Verify mobile responsiveness

---

## 🐛 Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Verify all dependencies are in package.json
- Ensure pnpm-lock.yaml is committed

### Runtime Errors
- Check environment variables are set correctly
- Verify database connection string
- Check S3 credentials and permissions

### Image Generation Fails
- Verify GEMINI_API_KEY is valid
- Check API quota limits
- Review server logs

---

## 📞 Support

For issues, check:
- GitHub Issues: https://github.com/ivnad95/fashion-muse-studio/issues
- Vercel Logs: Dashboard → Deployments → View Logs


# MongoDB Connection Fix Guide

## Issue: "Database connection unavailable" - 503 Error

The backend is returning a 503 error because it cannot connect to MongoDB Atlas. This is a common issue when deploying to Vercel.

## Root Causes

1. **MongoDB Atlas IP Whitelist** - Vercel uses dynamic IPs that need to be whitelisted
2. **Connection String Issues** - Incorrect or expired credentials
3. **Network Access Settings** - MongoDB Atlas firewall blocking connections
4. **Serverless Cold Starts** - Connection timing out on first request

## Solution Steps

### Step 1: Fix MongoDB Atlas Network Access (CRITICAL)

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Select your cluster: **Sample-Data**
3. Click on **Network Access** in the left sidebar
4. Click **Add IP Address**
5. Select **"Allow Access from Anywhere"** (0.0.0.0/0)
   - This is necessary for Vercel since it uses dynamic IPs
   - Click **Confirm**

**Important:** This is the most common cause of the 503 error!

### Step 2: Verify Database User Credentials

1. In MongoDB Atlas, go to **Database Access**
2. Verify user: `jenilrupapara340_db_user`
3. If the user doesn't exist or password is wrong:
   - Click **Add New Database User**
   - Username: `jenilrupapara340_db_user`
   - Password: `gPaASk6ZOa4Wa44L` (or create a new one)
   - Database User Privileges: **Read and write to any database**
   - Click **Add User**

### Step 3: Update Connection String (if needed)

If you created a new user or changed the password, update the connection string:

**Current connection string in code:**
```
mongodb+srv://jenilrupapara340_db_user:gPaASk6ZOa4Wa44L@sample-data.vyal4lo.mongodb.net/bavadiya-realty?retryWrites=true&w=majority
```

**To get the correct connection string:**
1. In MongoDB Atlas, click **Connect** on your cluster
2. Choose **Connect your application**
3. Copy the connection string
4. Replace `<password>` with your actual password
5. Replace `<dbname>` with `bavadiya-realty`

### Step 4: Set Environment Variable in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your backend project: **bavadiya-realty-backend**
3. Go to **Settings** → **Environment Variables**
4. Add or update:
   ```
   MONGO_URI=mongodb+srv://jenilrupapara340_db_user:gPaASk6ZOa4Wa44L@sample-data.vyal4lo.mongodb.net/bavadiya-realty?retryWrites=true&w=majority
   ```
5. Make sure it's enabled for **Production**, **Preview**, and **Development**
6. Click **Save**

### Step 5: Redeploy Backend

After making changes to environment variables:

```bash
cd backend
vercel --prod
```

Or trigger a redeploy from Vercel Dashboard:
1. Go to **Deployments**
2. Click the three dots on the latest deployment
3. Click **Redeploy**

### Step 6: Test the Connection

#### Test Health Endpoint
```bash
curl https://bavadiya-realty-backend.vercel.app/api/health
```

**Expected Response (Success):**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-19T13:11:00.000Z",
  "database": {
    "state": "connected",
    "stateCode": 1,
    "userCount": 1
  },
  "environment": "production"
}
```

**If Still Failing:**
```json
{
  "status": "unhealthy",
  "timestamp": "2025-11-19T13:11:00.000Z",
  "database": {
    "state": "disconnected",
    "stateCode": 0
  },
  "environment": "production"
}
```

#### Test Login Endpoint
```bash
curl -X POST https://bavadiya-realty-backend.vercel.app/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"DharmeshBavadiya","password":"BavadiyaRealtyAdmin!2024"}'
```

## Common Error Messages and Solutions

### Error: "MongoServerSelectionError: connection timed out"
**Solution:** Add 0.0.0.0/0 to MongoDB Atlas Network Access (Step 1)

### Error: "Authentication failed"
**Solution:** Verify database user credentials (Step 2)

### Error: "Database connection unavailable"
**Solution:** 
1. Check Vercel logs: `vercel logs bavadiya-realty-backend --prod`
2. Verify MONGO_URI environment variable is set correctly
3. Ensure MongoDB cluster is not paused (check Atlas dashboard)

### Error: "MongooseServerSelectionError: Could not connect to any servers"
**Solution:**
1. Verify connection string format
2. Check if MongoDB cluster is running (not paused)
3. Verify network access settings

## Checking Vercel Logs

To see detailed error messages:

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# View logs
vercel logs bavadiya-realty-backend --prod
```

Look for messages like:
- `✅ MongoDB connected` (Success)
- `❌ MongoDB connection error` (Failure - check the error message)

## MongoDB Atlas Cluster Status

Make sure your cluster is not paused:
1. Go to MongoDB Atlas Dashboard
2. Check if cluster shows "Paused"
3. If paused, click **Resume** button

## Alternative: Test Connection Locally

To test if the connection string works:

```bash
cd backend
node -e "
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://jenilrupapara340_db_user:gPaASk6ZOa4Wa44L@sample-data.vyal4lo.mongodb.net/bavadiya-realty?retryWrites=true&w=majority')
  .then(() => { console.log('✅ Connected'); process.exit(0); })
  .catch(err => { console.error('❌ Error:', err.message); process.exit(1); });
"
```

## Quick Checklist

- [ ] MongoDB Atlas Network Access allows 0.0.0.0/0
- [ ] Database user exists with correct credentials
- [ ] MONGO_URI environment variable is set in Vercel
- [ ] MongoDB cluster is not paused
- [ ] Backend has been redeployed after env variable changes
- [ ] Health endpoint returns "connected" status

## Still Not Working?

If you've completed all steps and it's still not working:

1. **Check MongoDB Atlas Status Page:** https://status.cloud.mongodb.com/
2. **Verify Vercel Status:** https://www.vercel-status.com/
3. **Create a new MongoDB cluster** and update the connection string
4. **Contact Support:**
   - MongoDB Atlas Support: https://support.mongodb.com/
   - Vercel Support: https://vercel.com/support

## Success Indicators

You'll know it's working when:
1. Health endpoint returns `"state": "connected"`
2. Login endpoint returns a JWT token
3. Frontend can successfully log in
4. No 503 errors in browser console

## Code Changes Made

The following improvements were made to handle serverless connections better:

1. **Connection Caching** - Reuses existing connections in serverless environment
2. **Automatic Reconnection** - Attempts to reconnect if connection is lost
3. **Better Error Messages** - Detailed logging for debugging
4. **Health Check Endpoint** - Easy way to verify connection status
5. **Optimized Timeouts** - Faster failure detection and retry logic

## Environment Variables Checklist

Make sure these are set in Vercel:

```bash
MONGO_URI=mongodb+srv://jenilrupapara340_db_user:gPaASk6ZOa4Wa44L@sample-data.vyal4lo.mongodb.net/bavadiya-realty?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_123456789
NODE_ENV=production
DEFAULT_ADMIN_USERNAME=DharmeshBavadiya
DEFAULT_ADMIN_PASSWORD=BavadiyaRealtyAdmin!2024
DEFAULT_ADMIN_EMAIL=admin@bavadiyarealty.com
BCRYPT_ROUNDS=12
JWT_EXPIRES_IN=24h
ALLOWED_ORIGINS=https://bavadiyarealty.vercel.app
PORT=3000
```

## Next Steps After Fix

Once the connection is working:
1. Test login from frontend
2. Verify data operations (create, read, update, delete)
3. Monitor Vercel logs for any issues
4. Consider setting up monitoring/alerts for database connectivity

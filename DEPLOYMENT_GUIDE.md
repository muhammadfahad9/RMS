# Restaurant Management System - Deployment Guide

## **Part 1: Backend Deployment (Render)**

### **Step 1: Prepare Backend Files**

**Create/Update `backend/.env` file:**
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_here
PORT=5000
```

**Create `backend/.gitignore` (if not exists):**
```
node_modules/
.env
.DS_Store
```

**Verify `backend/package.json` has these scripts:**
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "type": "module"
}
```

### **Step 2: Deploy to Render**

1. **Create Render Account:**
   - Go to https://render.com
   - Sign up with GitHub account (recommended)

2. **Connect GitHub Repository:**
   - Create a GitHub repo for your RMS project
   - Push your code: `git push origin main`

3. **Create New Web Service:**
   - Click "New +" → "Web Service"
   - Select your GitHub repository
   - Fill in details:
     - **Name:** `rms-backend` (or your choice)
     - **Environment:** Node
     - **Region:** Choose closest to you
     - **Build Command:** `npm install`
     - **Start Command:** `node backend/server.js`

4. **Add Environment Variables:**
   - In Render dashboard, go to your service
   - Click "Environment"
   - Add these variables:
     ```
     MONGO_URI = your_mongodb_connection_string
     JWT_SECRET = your_secret_key
     ```

5. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Your backend URL: `https://rms-backend.onrender.com`

---

## **Part 2: Frontend Deployment (Netlify)**

### **Step 1: Update Frontend API URLs**

**Edit `frontend/src/components/Dashboard.jsx`:**
Replace all `http://localhost:5000` with `https://rms-backend.onrender.com`

Find and replace:
```javascript
// OLD
const res = await axios.get('http://localhost:5000/api/menu');

// NEW
const res = await axios.get('https://rms-backend.onrender.com/api/menu');
```

**Update in these key functions:**
- `fetchMenu()`
- `fetchOrders()`
- `fetchUsers()`
- `fetchTables()`
- `placeOrder()`
- `handleAddItem()`
- `handleAddUser()`
- `handleAddTable()`
- `updateOrderStatus()`
- `fetchAnalytics()`
- `fetchReviews()`
- `handleAddReview()`
- `handleReplyToReview()`

**Quick Find:**
1. Press `Ctrl+H` in VS Code
2. Find: `http://localhost:5000`
3. Replace: `https://rms-backend.onrender.com`
4. Replace All

### **Step 2: Create Netlify Configuration**

**Create `frontend/netlify.toml`:**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Create `frontend/.env.production`:**
```
VITE_API_URL=https://rms-backend.onrender.com
```

### **Step 3: Update Vite Config**

**Edit `frontend/vite.config.js`:**
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
```

### **Step 4: Deploy to Netlify**

**Option A: GitHub Integration (Recommended)**

1. **Create Netlify Account:**
   - Go to https://netlify.com
   - Sign up with GitHub

2. **Connect Repository:**
   - Click "New site from Git"
   - Select your GitHub repository
   - Configure settings:
     - **Base directory:** `frontend`
     - **Build command:** `npm run build`
     - **Publish directory:** `frontend/dist`

3. **Add Environment Variables:**
   - In Netlify dashboard → Site settings → Build & deploy → Environment
   - Add: `VITE_API_URL=https://rms-backend.onrender.com`

4. **Deploy:**
   - Click "Deploy site"
   - Your frontend URL: `https://your-site-name.netlify.app`

**Option B: Drag & Drop**

1. Build frontend locally:
   ```bash
   cd frontend
   npm run build
   ```

2. Go to netlify.com, drag & drop the `frontend/dist` folder

---

## **Step 5: Update Backend CORS Settings**

**Edit `backend/server.js`:**
```javascript
import cors from 'cors';

app.use(cors({
  origin: ['https://your-site-name.netlify.app', 'http://localhost:3000'],
  credentials: true
}));
```

Replace `your-site-name` with your actual Netlify domain.

---

## **Step 6: Database Setup**

**If using MongoDB Atlas:**

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Add to Render environment variables as `MONGO_URI`

**Format:** 
```
mongodb+srv://username:password@cluster.mongodb.net/rms?retryWrites=true&w=majority
```

---

## **Complete Checklist**

### **Backend (Render):**
- ✅ `.env` file with MONGO_URI and JWT_SECRET
- ✅ `package.json` with correct scripts
- ✅ `server.js` uses `process.env.PORT`
- ✅ GitHub repository created and pushed
- ✅ Render web service created
- ✅ Environment variables added
- ✅ Deployment successful (check logs)

### **Frontend (Netlify):**
- ✅ All `http://localhost:5000` replaced with `https://rms-backend.onrender.com`
- ✅ `netlify.toml` created
- ✅ `.env.production` created
- ✅ GitHub connected to Netlify
- ✅ Build command: `npm run build`
- ✅ Publish directory: `frontend/dist`
- ✅ Environment variables set
- ✅ Deployment successful (check build logs)

---

## **Testing After Deployment**

1. **Test Backend:**
   ```
   https://rms-backend.onrender.com/
   Should show: { "message": "API is running..." }
   ```

2. **Test Frontend:**
   ```
   https://your-site-name.netlify.app
   Should load normally
   ```

3. **Test API Calls:**
   - Try login
   - Try placing order
   - Try fetching menu
   - Check browser console for errors

---

## **Troubleshooting**

**Frontend shows blank page:**
- Check browser console (F12)
- Verify API URL is correct
- Check Netlify build logs

**API calls fail (CORS error):**
- Update CORS in backend/server.js
- Redeploy backend
- Wait 2-3 minutes for Render update

**Build fails on Netlify:**
- Check build logs in Netlify dashboard
- Ensure `npm run build` works locally
- Verify all imports are correct

**MongoDB connection error:**
- Check connection string in Render environment
- Verify IP whitelist in MongoDB Atlas (allow all IPs for now)
- Test connection string locally

---

## **Important Notes**

⚠️ **For Production:**
- Change `JWT_SECRET` to a strong random key
- Set up proper MongoDB user with restricted permissions
- Enable IP whitelist in MongoDB Atlas
- Use environment variables for all secrets
- Enable HTTPS (both platforms do this by default)

---

## **Cost Estimate:**
- **Render:** Free tier available (sleeps after 15 min inactivity)
- **Netlify:** Free tier available (up to 100GB/month)
- **MongoDB Atlas:** Free tier available (512MB storage)

To avoid Render free tier sleep, upgrade to $7/month paid tier.

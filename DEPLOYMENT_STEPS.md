# 🚀 RMS Deployment Steps - Complete Guide

## **Summary of Changes Made for Deployment**

### **Files Created:**
1. ✅ `frontend/src/config.js` - API URL configuration
2. ✅ `frontend/.env.development` - Dev environment vars
3. ✅ `frontend/.env.production` - Production environment vars
4. ✅ `frontend/netlify.toml` - Netlify build config
5. ✅ `backend/.gitignore` - Git ignore rules
6. ✅ `backend/.env.example` - Example environment vars

### **Files Modified:**
1. ✅ `frontend/src/components/Dashboard.jsx` - Added API_BASE_URL import, updated fetch functions

---

## **Quick Deployment Checklist**

### **Phase 1: Prepare GitHub Repository**

```bash
# In your project root
git init
git add .
git commit -m "Initial commit - RMS ready for deployment"
git remote add origin https://github.com/YOUR_USERNAME/rms.git
git push -u origin main
```

**⚠️ Before pushing:**
- Create `.env` files locally (NOT in git)
- Verify `.gitignore` files exist
- Don't commit sensitive data

---

## **Phase 2: Deploy Backend to Render**

### **Step 1: Create Render Account**
1. Go to https://render.com
2. Sign up with GitHub
3. Grant access to your repository

### **Step 2: Create MongoDB Atlas Database (FREE)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Click "Create Database"
4. Choose **M0 (Free Tier)**
5. Region: Choose closest to you
6. Create user:
   - Username: `admin`
   - Password: `RandomSecurePassword123!`
7. Copy connection string:
   ```
   mongodb+srv://admin:RandomSecurePassword123!@cluster0.xxxxx.mongodb.net/rms?retryWrites=true&w=majority
   ```

### **Step 3: Deploy Backend to Render**

**In Render Dashboard:**

1. Click **"New +"** → **"Web Service"**

2. Select your GitHub repository (your RMS repo)

3. Fill in Configuration:
   ```
   Name: rms-backend
   Region: (choose closest)
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: node server.js
   ```

4. **Add Environment Variables:**
   - Click **"Environment"**
   - Add three variables:
   ```
   MONGO_URI = mongodb+srv://admin:RandomSecurePassword123!@cluster0.xxxxx.mongodb.net/rms?retryWrites=true&w=majority
   JWT_SECRET = SuperSecureRandomKey12345678901234567890
   NODE_ENV = production
   ```

5. Click **"Create Web Service"**

6. Wait for deployment (2-3 minutes)

7. **Get Your Backend URL** (something like):
   ```
   https://rms-backend.onrender.com
   ```

✅ **Test Backend:**
```
Visit: https://rms-backend.onrender.com
Should see: { "message": "API is running..." }
```

---

## **Phase 3: Deploy Frontend to Netlify**

### **Step 1: Update Frontend Configuration**

**Your `.env.production` already has:**
```
VITE_API_URL=https://rms-backend.onrender.com
```

**If you need to change it:**
1. Edit `frontend/.env.production`
2. Replace with your actual Render backend URL
3. Save & commit

### **Step 2: Create Netlify Account**
1. Go to https://netlify.com
2. Sign up with GitHub

### **Step 3: Deploy Frontend**

**In Netlify Dashboard:**

1. Click **"Add new site"** → **"Import an existing project"**

2. Select **"GitHub"**

3. Select your RMS repository

4. Configure Build Settings:
   ```
   Base directory: frontend
   Build command: npm run build
   Publish directory: frontend/dist
   ```

5. **Add Environment Variables:**
   - Click **"Environment"**
   - Add one variable:
   ```
   VITE_API_URL = https://rms-backend.onrender.com
   ```

6. Click **"Deploy"**

7. Wait for deployment (1-2 minutes)

8. **Get Your Frontend URL** (something like):
   ```
   https://rms-abc123.netlify.app
   ```

✅ **Test Frontend:**
```
Visit: https://rms-abc123.netlify.app
Should load normally and let you login
```

---

## **Phase 4: Update Backend CORS (IMPORTANT!)**

Your backend needs to allow requests from Netlify frontend.

**Edit `backend/server.js`:**

```javascript
import cors from 'cors';

const allowedOrigins = [
  'https://rms-abc123.netlify.app',  // Your Netlify domain
  'http://localhost:3000'             // Local development
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
```

**Then redeploy backend on Render:**
1. Push changes to GitHub:
   ```bash
   git add .
   git commit -m "Update CORS for Netlify deployment"
   git push origin main
   ```
2. Render auto-deploys when GitHub changes detected
3. Wait 2-3 minutes for Render to rebuild

---

## **Phase 5: Final Testing**

### **Test Login Flow:**
1. Visit: `https://rms-abc123.netlify.app`
2. Click "Login"
3. Try with test account (email: `test@gmail.com`, password: `testpass` - or one you created)
4. Should successfully login and see Dashboard

### **Test Order Placement:**
1. As customer, go to Menu
2. Add items to cart
3. Click "Place Order"
4. Should succeed and show in Orders list

### **Test Admin Features:**
1. Login as admin
2. Go to "Analytics" tab
3. Should see sales data
4. Try adding menu items
5. Try managing users

### **If Something Fails:**
- Open browser DevTools (F12)
- Check **Console** tab for JavaScript errors
- Check **Network** tab - see if API calls succeed
- Common issues:
  - API URL wrong → Check `.env.production`
  - CORS error → Update `server.js` CORS config
  - Build failed → Check Netlify build logs

---

## **Production Environment Variables Summary**

### **Backend (Render):**
```
MONGO_URI = mongodb+srv://admin:password@cluster.xxxxx.mongodb.net/rms
JWT_SECRET = SuperSecureRandomKey
NODE_ENV = production
```

### **Frontend (Netlify):**
```
VITE_API_URL = https://rms-backend.onrender.com
```

---

## **Important Notes for Production**

⚠️ **Security:**
- Change JWT_SECRET to a strong, random value
- Don't hardcode passwords
- Use environment variables for all secrets
- Never commit `.env` files to git

⚠️ **Performance:**
- Render free tier sleeps after 15 minutes inactivity
- Upgrade to $7/month paid tier to avoid sleep
- Netlify free tier: 100GB bandwidth/month (plenty for small apps)

⚠️ **MongoDB:**
- Free tier M0: 512MB storage
- Add IP whitelist (for now allow all 0.0.0.0/0)
- Create separate DB users per service

---

## **Cost Estimate:**
- **Render:** $7/month (paid) or Free (with sleep)
- **Netlify:** Free (or $20/month pro)
- **MongoDB Atlas:** Free (512MB)
- **Total:** $7-27/month

---

## **Useful Links**
- Render Docs: https://render.com/docs
- Netlify Docs: https://docs.netlify.com
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- Git/GitHub: https://github.com

---

## **Troubleshooting Common Issues**

| Issue | Solution |
|-------|----------|
| CORS Error | Update CORS in backend/server.js with Netlify domain |
| API calls failing | Check API_BASE_URL in frontend/config.js |
| Build fails on Netlify | Check build logs, ensure npm run build works locally |
| MongoDB won't connect | Verify connection string, check IP whitelist in Atlas |
| Frontend shows blank | Check browser console (F12), look for errors |
| Orders not saving | Check backend logs on Render dashboard |

---

## **Next Steps After Deployment**

1. ✅ Test all features thoroughly
2. ✅ Share URL with others
3. ✅ Monitor Render logs for errors
4. ✅ Backup MongoDB regularly
5. ✅ Consider upgrading Render to paid for better performance
6. ✅ Set up custom domain (optional, costs ~$10-15/year)

---

**Congratulations! Your RMS is now live! 🎉**

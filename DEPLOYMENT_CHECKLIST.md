# ✅ Deployment Checklist - Step by Step

## **Phase 0: Local Testing (5 min)**

```
☐ npm run dev (backend) - works without errors
☐ npm run dev (frontend) - works without errors
☐ Can login with test account
☐ Can place orders
☐ Can view analytics (admin)
☐ No console errors in browser (F12)
```

---

## **Phase 1: Prepare for Deployment (10 min)**

### **A. Complete API URL Updates in Dashboard.jsx**
```
Method 1 (Quick):
1. Open Dashboard.jsx
2. Ctrl+H (Find & Replace)
3. Find: 'http://localhost:5000
4. Replace: `${API_BASE_URL}
5. Replace All
6. Save

Method 2 (Manual):
- Follow instructions in API_URL_UPDATES.md
- Replace ~20 API calls one by one
```

### **B. Create GitHub Repository**
```bash
git init
git add .
git commit -m "Initial commit - RMS ready for deployment"
git remote add origin https://github.com/YOUR_USERNAME/rms.git
git branch -M main
git push -u origin main
```

### **C. Verify Files Exist**
```
☐ frontend/.env.development exists
☐ frontend/.env.production exists  
☐ frontend/netlify.toml exists
☐ frontend/src/config.js exists
☐ backend/.env exists (local only, not in git)
☐ backend/.gitignore exists
☐ backend/server.js updated with CORS
```

---

## **Phase 2: Backend Deployment on Render (15 min)**

### **Step 2.1: Create MongoDB Atlas Database**
```
☐ Go to https://www.mongodb.com/cloud/atlas
☐ Create free account
☐ Click "Create Database" 
☐ Select M0 (Free Tier)
☐ Choose region closest to you
☐ Create database user (admin / password)
☐ Copy connection string:
   mongodb+srv://admin:password@cluster.xxxxx.mongodb.net/rms

⚠️ Save this - you'll need it for Render
```

### **Step 2.2: Create Render Account**
```
☐ Go to https://render.com
☐ Sign up with GitHub
☐ Authorize GitHub access
```

### **Step 2.3: Deploy Backend**
```
In Render Dashboard:
☐ Click "New +" → "Web Service"
☐ Select your GitHub repository
☐ Fill in:
   Name: rms-backend
   Root Directory: backend
   Build Command: npm install
   Start Command: node server.js
☐ Click "Create Web Service"
☐ Wait for deployment (2-3 min)

Check Status:
☐ Deployment says "Live"
☐ No red error messages
☐ Copy your backend URL (looks like: https://rms-backend.onrender.com)
```

### **Step 2.4: Add Environment Variables to Render**
```
In Render Dashboard → Your Service → Environment:
☐ Add MONGO_URI = mongodb+srv://admin:password@...
☐ Add JWT_SECRET = (generate random: https://www.random.org/strings/)
☐ Add NODE_ENV = production
☐ Save

Backend should redeploy automatically
```

### **Step 2.5: Test Backend**
```
☐ Visit: https://your-rms-backend.onrender.com/
☐ Should see: { "message": "API is running..." }
☐ If error: Check Render logs for details
```

---

## **Phase 3: Frontend Deployment on Netlify (15 min)**

### **Step 3.1: Update Production Environment File**
```
Edit frontend/.env.production:
☐ Replace with your actual backend URL from Render
   VITE_API_URL=https://your-rms-backend.onrender.com

☐ Commit to GitHub:
   git add frontend/.env.production
   git commit -m "Update backend URL for production"
   git push origin main
```

### **Step 3.2: Create Netlify Account**
```
☐ Go to https://netlify.com
☐ Sign up with GitHub
☐ Authorize GitHub access
```

### **Step 3.3: Deploy Frontend**
```
In Netlify Dashboard:
☐ Click "Add new site" → "Import an existing project"
☐ Click "GitHub"
☐ Select your RMS repository

Configure:
☐ Base directory: frontend
☐ Build command: npm run build
☐ Publish directory: frontend/dist
☐ Click "Deploy"
☐ Wait for deployment (1-2 min)

Copy your Frontend URL (looks like: https://your-site.netlify.app)
```

### **Step 3.4: Add Environment Variables to Netlify**
```
In Netlify Dashboard → Site Settings → Build & deploy → Environment:
☐ Add VITE_API_URL = https://your-rms-backend.onrender.com
☐ Save

Site should redeploy automatically
```

### **Step 3.5: Test Frontend**
```
☐ Visit: https://your-site.netlify.app
☐ Should load normally
☐ If blank: Check Netlify build logs
☐ Check browser console (F12) for errors
```

---

## **Phase 4: Connect Frontend & Backend (10 min)**

### **Step 4.1: Update Backend CORS**
```
Edit backend/server.js:

Add CORS configuration with Netlify URL:
const allowedOrigins = [
  'https://your-site.netlify.app',  // ← Your Netlify domain
  'http://localhost:3000'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

Commit and push:
git add backend/server.js
git commit -m "Update CORS for production domains"
git push origin main
```

### **Step 4.2: Render Auto-Redeploys**
```
☐ Render detects GitHub change automatically
☐ Wait 2-3 minutes for backend to redeploy
☐ Check Render dashboard - should say "Live"
```

---

## **Phase 5: Final Testing (15 min)**

### **Test Login**
```
☐ Visit frontend URL
☐ Try login with any test account
   Email: test@gmail.com
   Password: testpass8 (or create new user)
☐ Should successfully login
☐ Should see Dashboard
```

### **Test Customer Features**
```
☐ Browse menu items
☐ Add items to cart
☐ Place order (select table optional)
☐ Order appears in "My Orders"
☐ View order details
```

### **Test Admin Features** (login as admin)
```
☐ Go to Analytics tab - should show sales data
☐ Go to Orders - should see all orders
☐ Try adding menu item
☐ Try managing users
☐ Try managing tables
☐ View unreplied reviews badge
```

### **Test Reviews**
```
☐ As customer: Write review for menu item
☐ As admin: Reply to review
☐ Customer should see reply
```

### **Check for Errors**
```
☐ Open browser DevTools (F12)
☐ Check Console tab - no red errors
☐ Check Network tab - API calls showing 200 status
☐ No CORS errors
```

---

## **If Something Goes Wrong**

### **Frontend Blank Page**
```
1. Open DevTools (F12)
2. Check Console for errors
3. Check Network tab - are API calls failing?
4. Check Netlify build logs - did it build?
5. Check .env.production has correct API URL
```

### **CORS Error**
```
1. Error message includes "CORS" or "Access-Control"
2. Update backend/server.js with correct Netlify domain
3. Commit and push to GitHub
4. Wait 2-3 min for Render to redeploy
5. Hard refresh frontend (Ctrl+Shift+R)
```

### **API Calls Failing (404 or 500)**
```
1. Check backend logs on Render dashboard
2. Verify MONGO_URI is correct on Render
3. Verify JWT_SECRET is set on Render
4. Check if backend has correct base URL in frontend
```

### **Can't Login**
```
1. Check MongoDB connection working (Render logs)
2. Verify users exist in MongoDB
3. Check JWT_SECRET matches backend
4. Try creating new user first
```

---

## **Success Indicators** ✅

When everything is working:

```
✅ Frontend URL loads without blank page
✅ Backend URL returns JSON message
✅ Can login successfully
✅ Can place orders
✅ Orders appear in list
✅ Analytics show data
✅ No red errors in console (F12)
✅ No CORS errors
✅ Reviews work
✅ Admin features work
```

---

## **Cost After Deployment**

```
Monthly costs:
- Render (paid tier to avoid sleep): $7/month
- Netlify: Free (100GB/month)
- MongoDB Atlas: Free (512MB)
Total: ~$7/month
```

---

## **Useful URLs to Know**

```
GitHub: https://github.com/YOUR_USERNAME/rms

Render Dashboard: https://render.com/dashboard
- View logs
- Manage environment variables
- Monitor performance

Netlify Dashboard: https://netlify.com
- View build logs
- Manage environment variables
- Monitor analytics

MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- View database
- Manage users
- Monitor usage
```

---

## **🎉 You're Done!**

Your RMS is now deployed and live on the internet!

**Share URLs:**
- Frontend: `https://your-site.netlify.app`
- Backend: `https://your-rms-backend.onrender.com`

**Next:**
- Test thoroughly with friends/family
- Monitor for errors daily first week
- Consider upgrading Render if you get slow responses
- Add custom domain if you want (costs ~$10-15/year)

---

**Questions? Check:**
- DEPLOYMENT_GUIDE.md - Technical details
- DEPLOYMENT_STEPS.md - Step-by-step instructions  
- API_URL_UPDATES.md - API configuration

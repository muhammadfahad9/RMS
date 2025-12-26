# 🚀 Quick Deployment Reference Card

## **In 3 Steps:**

### **1️⃣ Update API URLs** (5 min)
```
Dashboard.jsx → Ctrl+H
Find: 'http://localhost:5000
Replace: `${API_BASE_URL}
Replace All ✓
```

### **2️⃣ Deploy Backend** (10 min)
```
Render.com → New Web Service
Root: backend
Start: node server.js
Env: MONGO_URI, JWT_SECRET
✓ Copy backend URL
```

### **3️⃣ Deploy Frontend** (5 min)
```
Netlify.com → New Site
Base: frontend
Build: npm run build
Publish: frontend/dist
Env: VITE_API_URL=backend-url
✓ Done!
```

---

## **Files You Need**

```
✓ frontend/src/config.js (CREATED)
✓ frontend/.env.production (CREATED)
✓ frontend/netlify.toml (CREATED)
✓ backend/server.js (UPDATED - CORS)
✓ backend/.env (LOCAL ONLY)
```

---

## **Environment Variables**

### **Render Backend:**
```
MONGO_URI = mongodb+srv://admin:pass@cluster.xxxxx.mongodb.net/rms
JWT_SECRET = RandomSecureKey123456789
NODE_ENV = production
```

### **Netlify Frontend:**
```
VITE_API_URL = https://rms-backend.onrender.com
```

---

## **Test URLs**

```
Backend: https://rms-backend.onrender.com
(Should show: { "message": "API is running..." })

Frontend: https://your-site.netlify.app
(Should load normally)
```

---

## **Common Fixes**

| Issue | Fix |
|-------|-----|
| Blank frontend | Check VITE_API_URL in Netlify env |
| CORS error | Update server.js CORS with Netlify domain, redeploy |
| Build fails | Check base=frontend, build=npm run build |
| Orders not saving | Check MONGO_URI on Render |

---

## **Commands**

```bash
# Push to GitHub
git add .
git commit -m "Deploy setup"
git push origin main

# Build locally (test)
npm run build  # from frontend

# Check backend locally
npm run dev    # from backend
```

---

## **Checklist**

```
Backend Deployment:
☐ Render account created
☐ MongoDB connection string copied
☐ Backend deployed
☐ Env vars added
☐ Backend URL copied

Frontend Deployment:
☐ Netlify account created  
☐ .env.production updated
☐ Frontend deployed
☐ VITE_API_URL added
☐ Frontend URL working

Testing:
☐ Login works
☐ Orders work
☐ Analytics work
☐ No console errors
☐ No CORS errors
```

---

## **Important Files to Check**

```
frontend/src/config.js
└─ const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

backend/server.js (CORS section)
└─ app.use(cors({ origin: [...] }))

frontend/.env.production
└─ VITE_API_URL=https://rms-backend.onrender.com
```

---

**Full guides: Check DEPLOYMENT_CHECKLIST.md**

# 🔥 Firebase Setup Instructions

## 1. Create Firebase Project

1. Go to https://console.firebase.google.com/
2. Click "Create a project"
3. Name: `magic-christmas`
4. Click "Create project"
5. Wait for project to be created

## 2. Get Firebase Config

1. In Firebase Console, click Settings icon (⚙️) → Project settings
2. Under "Your apps", click "Web" (</>)
3. Copy the config object
4. Update `index.html` around line 175 with your config:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

## 3. Enable Services in Firebase Console

### Authentication
1. Go to "Build" → "Authentication"
2. Click "Get Started"
3. Enable "Anonymous" sign-in method

### Firestore Database
1. Go to "Build" → "Firestore Database"
2. Click "Create database"
3. Select "Start in test mode"
4. Select region closest to you

### Cloud Storage
1. Go to "Build" → "Storage"
2. Click "Get Started"
3. Use default bucket
4. Keep test rules (allow anyone to access)

## 4. Deploy to Server

```bash
# Local - commit and push changes
git add .
git commit -m "Add Firebase integration"
git push

# On Server
ssh root@hieuit.top
cd /root/magic-christmas
git pull
```

## 5. Verify on hieuit.top

- ✅ Upload photos (should save to Firebase Storage)
- ✅ Change YouTube link (should persist in Firestore)
- ✅ Refresh page (data should still be there)

## Features

- 📸 Photos stored in Firebase Storage
- 💾 YouTube link persisted in Firestore
- ⚡ Real-time sync across devices
- 🔐 Secure anonymous access
- 🌍 Global CDN for fast image loading

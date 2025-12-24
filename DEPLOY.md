# Magic Christmas - Deployment Guide

## 🚀 Quick Deploy (Production)

### Prerequisites
- Server: Ubuntu 20.04+ with Nginx
- Domain: Configured DNS A record pointing to server IP
- SSH access: `root@hieuit.top`
- Git installed on server

---

## 📋 Deployment Steps

### 1. **Push Code to GitHub**
```bash
# From local development directory
cd d:\development\projects\personal\merry\giang_sinh_an_lanh-main\merry

# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: Your feature description"

# Push to main branch
git push origin main
```

### 2. **Deploy to Server**
```bash
# Connect to server via SSH
ssh root@hieuit.top

# Navigate to web root (actual nginx root directory)
cd /root/magic-christmas

# Verify current version
git log --oneline -1

# Force update to latest (discards local changes)
git reset --hard origin/main

# Verify files
ls -la

# Reload Nginx to clear cache
systemctl reload nginx
```

### 3. **Quick Update (Pull Changes)**
One-line command from local machine:
```bash
ssh root@hieuit.top 'cd /root/magic-christmas && git reset --hard origin/main && systemctl reload nginx'
```

**Important:** Nginx serves from `/root/magic-christmas/` (not `/var/www/html`).

---

## 🔒 HTTPS Setup (Let's Encrypt)

### First-Time SSL Certificate Setup
```bash
# SSH to server
ssh root@hieuit.top

# Run HTTPS setup script (included in repo)
cd /var/www/html/scripts
chmod +x enable_https_nginx.sh
./enable_https_nginx.sh
```

**What it does:**
- Installs Certbot via snap
- Issues Let's Encrypt certificate for hieuit.top
- Configures Nginx with HTTPS
- Enables HTTP → HTTPS redirect
- Sets up auto-renewal (every 60 days)

**Manual verification:**
```bash
# Test certificate renewal
certbot renew --dry-run

# Check certificate expiry
certbot certificates

# Verify HTTPS
curl -I https://hieuit.top
```

---

## 📁 Project Structure on Server

```
/root/magic-christmas/         # ← Actual Nginx root directory
├── index.html                 # Main application
├── index ver1.0.html         # Version history
├── index ver1.2.html         # Version history
├── audio/                    # Audio assets (optional)
├── images/                   # Static images
├── .github/
│   └── copilot-instructions.md
├── FIREBASE_SETUP.md         # Firebase config guide
├── firestore.indexes.json    # Firestore indexes
└── DEPLOY.md                 # This file
```

**Nginx Config:** `/etc/nginx/sites-available/magic-christmas`  
**Document Root:** `/root/magic-christmas`

---

## 🔧 Server Configuration

### Nginx Config Location
- Main config: `/etc/nginx/sites-enabled/magic-christmas`
- Logs: `/var/log/nginx/access.log`, `/var/log/nginx/error.log`

### Useful Commands
```bash
# Reload Nginx (after config changes)
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# Test Nginx configuration
sudo nginx -t

# View logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 🧪 Local Development

### Run Python HTTP Server
```bash
# From project directory
cd d:\development\projects\personal\merry\giang_sinh_an_lanh-main\merry

# Start server on port 8000
python -m http.server 8000

# Access at http://localhost:8000
```

**Note:** Camera features require HTTPS or localhost to work (MediaPipe security requirement).

---

## 🎯 Key Features

### Storage System
- **Type:** IndexedDB (replaced localStorage)
- **Capacity:** 50MB-1GB (browser-dependent)
- **Database Name:** `MagicChristmas`
- **Stores:**
  - `photos` - Compressed user photos
  - `config` - YouTube link, timestamps

### Image Compression
- **Max Width:** 800px (auto-resize)
- **Quality:** 60% JPEG
- **Average Reduction:** ~90% (5MB → 500KB)
- **Function:** `compressImage(file)` in index.html

### Hand Gesture States
- **TREE** - Christmas tree (fist gesture)
- **EXPLODE** - Particles burst (open hand)
- **HEART** - Heart shape (two hands)
- **PHOTO** - Photo zoom (pinch gesture)

---

## 🐛 Troubleshooting

### Issue: SSL Certificate Fails
```bash
# Check DNS propagation
nslookup hieuit.top

# Verify port 80/443 open
ufw status
ufw allow 'Nginx Full'

# Re-run Certbot
certbot --nginx -d hieuit.top --force-renewal
```

### Issue: Changes Not Showing
```bash
# 1. Clear browser cache (Ctrl+Shift+R or Ctrl+F5)
# 2. Check console version (F12): Should show v1.3.0+

# 3. Force reload on server (correct directory)
ssh root@hieuit.top 'cd /root/magic-christmas && git reset --hard origin/main && systemctl reload nginx'

# 4. Verify deployed version
ssh root@hieuit.top 'cd /root/magic-christmas && git log --oneline -1'
```

**Common Cause:** Browser cache or wrong deployment directory. Nginx serves from `/root/magic-christmas/`.

### Issue: IndexedDB Not Working
- Check browser console (F12)
- Verify HTTPS is active (required for full IndexedDB quota)
- Clear site data: DevTools → Application → Clear storage

---

## 📊 Monitoring

### Check Deployment Status
```bash
# From local machine
curl -I https://hieuit.top

# Should return:
# HTTP/2 200
# server: nginx
# content-type: text/html
```

### View Recent Git Changes on Server
```bash
ssh root@hieuit.top 'cd /root/magic-christmas && git log --oneline -5'
```

### Check Version Info
Open https://hieuit.top and press F12 (Console) to see:
- Version number (e.g., v1.3.0)
- Build date
- Feature list

---

## 🔄 Auto-Deployment (Optional)

### GitHub Actions (Future Enhancement)
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Server
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@master
        with:
          host: hieuit.top
          username: root
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /root/magic-christmas
            git pull origin main
            systemctl reload nginx
```

---

## 📞 Support

- **Production URL:** https://hieuit.top
- **Repository:** https://github.com/hieubagiang/magic-christmas
- **SSL Cert Expiry:** Check with `certbot certificates`
- **Server Status:** `systemctl status nginx`

---

## 🎄 Version History

- **v1.3** - Aspect-ratio photos + rounded frames + version logging (Dec 24, 2025)
- **v1.2** - IndexedDB + Image Compression (Dec 24, 2025)
- **v1.0** - Initial release with localStorage
- **Current:** Fixed deployment path to `/root/magic-christmas/`

---

**Last Updated:** December 24, 2025  
**Maintained by:** Hiếu Bá Giang

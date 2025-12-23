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

# Navigate to web root
cd /var/www

# Backup current version (optional)
mv html html.backup.$(date +%Y%m%d_%H%M%S)

# Clone fresh copy from GitHub
git clone https://github.com/hieubagiang/magic-christmas.git html

# Verify files
cd html
ls -la

# Check Nginx status
systemctl status nginx
```

### 3. **Quick Update (Pull Changes)**
If repository already exists on server:
```bash
ssh root@hieuit.top 'cd /var/www/html && git pull origin main'
```

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
/var/www/html/
├── index.html                 # Main application
├── index ver1.0.html         # Version history
├── index ver1.2.html         # Version history
├── audio/                    # Audio assets (optional)
├── images/                   # Static images
├── scripts/
│   └── enable_https_nginx.sh # SSL setup script
├── .github/
│   └── copilot-instructions.md
├── FIREBASE_SETUP.md         # Firebase config guide
├── firestore.indexes.json    # Firestore indexes
└── DEPLOY.md                 # This file
```

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
# Clear browser cache (Ctrl+Shift+R)
# Or force reload on server
ssh root@hieuit.top 'cd /var/www/html && git reset --hard origin/main && git pull'
```

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
ssh root@hieuit.top 'cd /var/www/html && git log --oneline -5'
```

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
            cd /var/www/html
            git pull origin main
```

---

## 📞 Support

- **Production URL:** https://hieuit.top
- **Repository:** https://github.com/hieubagiang/magic-christmas
- **SSL Cert Expiry:** Check with `certbot certificates`
- **Server Status:** `systemctl status nginx`

---

## 🎄 Version History

- **v1.2** - IndexedDB + Image Compression (Dec 24, 2025)
- **v1.0** - Initial release with localStorage
- **Current:** IndexedDB storage, HTTPS enabled, auto-renewal configured

---

**Last Updated:** December 24, 2025  
**Maintained by:** Hiếu Bá Giang

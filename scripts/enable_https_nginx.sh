#!/usr/bin/env bash
set -euo pipefail

# Configuration
DOMAIN="hieuit.top"
EMAIL="${EMAIL:-}"

echo "=== Enabling HTTPS for ${DOMAIN} (Nginx + Let's Encrypt) ==="

export DEBIAN_FRONTEND=noninteractive

if ! command -v apt-get >/dev/null 2>&1; then
  echo "This script expects an Ubuntu/Debian server with apt-get. Aborting."
  exit 1
fi

apt-get update -y
apt-get install -y snapd

# Ensure snap core and certbot
snap install core
snap refresh core
snap install --classic certbot
ln -sf /snap/bin/certbot /usr/bin/certbot

# Ensure Nginx is installed and running
if ! command -v nginx >/dev/null 2>&1; then
  apt-get install -y nginx
fi
systemctl enable --now nginx

# Open firewall for HTTPS if UFW exists
if command -v ufw >/dev/null 2>&1; then
  ufw allow 'Nginx Full' || true
  ufw delete allow 'Nginx HTTP' || true
fi

AGREE_FLAGS=("--agree-tos" "-n")
if [[ -n "$EMAIL" ]]; then
  EMAIL_FLAGS=("--email" "$EMAIL")
else
  echo "No EMAIL provided; proceeding without email registration."
  EMAIL_FLAGS=("--register-unsafely-without-email")
fi

# Obtain and install certificate with automatic HTTP->HTTPS redirect
certbot --nginx --redirect -d "$DOMAIN" "${AGREE_FLAGS[@]}" "${EMAIL_FLAGS[@]}"

# Validate and reload Nginx
nginx -t
systemctl reload nginx

echo "Certificate files for $DOMAIN:"
ls -l "/etc/letsencrypt/live/$DOMAIN" || true

echo "Testing auto-renewal (dry-run)..."
certbot renew --dry-run || true

echo "=== Done. HTTPS should now be active for https://$DOMAIN ==="

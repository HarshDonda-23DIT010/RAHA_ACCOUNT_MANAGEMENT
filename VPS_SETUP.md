# VPS Setup Guide — Rhea Account Manager

## 1. Get a VPS

Recommended providers (cheapest to most):
- **Hostinger VPS** — ~$5/month (good for India)
- **DigitalOcean Droplet** — $6/month
- **Hetzner** — $4/month (cheapest, EU-based)
- **AWS Lightsail** — $5/month

**Recommended OS:** Ubuntu 22.04 LTS

---

## 2. Connect to Your VPS

```bash
ssh root@YOUR_VPS_IP
```

---

## 3. Install Docker & Nginx on VPS

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose plugin
sudo apt install docker-compose-plugin -y

# Install Nginx + Certbot (for SSL)
sudo apt install nginx certbot python3-certbot-nginx -y
```

---

## 4. Clone Your Code on VPS

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git /opt/rheaaccount
cd /opt/rheaaccount
```

Or manually upload with SCP:
```bash
# Run this on your LOCAL machine
scp -r "d:\Raha Bueaty\AcountManager" root@YOUR_VPS_IP:/opt/rheaaccount
```

---

## 5. Set Environment Variables on VPS

```bash
cd /opt/rheaaccount
cat > .env << EOF
JWT_SECRET=YourSuperSecretKeyHere2024ChangeThis
EOF
```

---

## 6. Start the Server with Docker

```bash
cd /opt/rheaaccount
docker compose -f vps-docker-compose.yml up -d --build
```

Verify it's running:
```bash
docker compose -f vps-docker-compose.yml ps
curl http://localhost:5000
# Should return: Bharat Beauty API is running ✅
```

---

## 7. Setup Nginx Reverse Proxy (if you have a domain)

### With a domain (e.g. api.yourdomain.com)

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/rheaaccount
```

Paste:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/rheaaccount /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Get free SSL certificate
sudo certbot --nginx -d api.yourdomain.com
```

### Without a domain (just IP address)

Your API URL will be: `http://YOUR_VPS_IP:5000/api`
- No SSL possible without a domain
- Update `.env.mobile` with this URL

---

## 8. Seed Default Users

```bash
curl -X POST http://localhost:5000/api/auth/seed
# or with domain:
curl -X POST https://api.yourdomain.com/api/auth/seed
```

---

## 9. Update Mobile App to Use VPS

Edit `client/.env.mobile`:
```
# Change this line:
VITE_API_URL=http://YOUR_VPS_IP:5000/api
# or with domain + SSL:
VITE_API_URL=https://api.yourdomain.com/api
```

Then rebuild & sync:
```bash
cd client
npm run build:mobile
npx cap sync
```

---

## 10. Build Android APK

**Requirements:** Android Studio installed on your Windows PC

```bash
# In client/ folder:
npx cap open android
```

In Android Studio:
1. Wait for Gradle sync to finish
2. **Build** → **Generate Signed Bundle/APK**
3. Choose APK → Create new keystore → Fill details
4. Build → Install on device or share APK

---

## 11. Build iOS App (Requires Mac)

```bash
npx cap open ios
```

In Xcode:
1. Set your Apple Developer Team
2. Product → Build
3. Product → Archive (for App Store)

---

## Quick Reference — Ports

| Service | Port | Access |
|---|---|---|
| MongoDB | 27017 | Internal only |
| Express Server | 5000 | Via Nginx → public |
| Nginx | 80/443 | Public |


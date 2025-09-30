# SpeakEng Deployment Guide

Complete guide for deploying SpeakEng as a free, always-on PWA.

## Architecture

- **Frontend**: React PWA with service worker (installable, offline-capable)
- **Backend**: PocketBase (SQLite-based, self-hosted)
- **LLM**: Groq API (14,400 free requests/day) or Ollama (self-hosted)
- **TTS/STT**: Web Speech API (browser-based, free)
- **Hosting**: Oracle Cloud (free tier) or any VPS
- **Reverse Proxy**: Caddy (automatic HTTPS)

## Prerequisites

- Oracle Cloud account (or any cloud provider with free tier)
- Domain name (optional, but recommended for HTTPS)
- Groq API key from https://console.groq.com (free)

## Quick Start with Docker

### 1. Clone and Configure

```bash
git clone https://github.com/yourusername/speakeng.git
cd speakeng

# Copy and configure environment
cp .env.example .env
nano .env  # Update with your values
```

### 2. Deploy with Docker Compose

```bash
# Development mode (without Caddy)
docker-compose up -d

# Production mode (with Caddy for HTTPS)
docker-compose --profile production up -d
```

### 3. Access the Application

- Frontend: http://localhost:3000
- PocketBase Admin: http://localhost:8090/_/
- With Caddy: https://yourdomain.com

## Manual Deployment

### Step 1: Prepare Your Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login to apply docker group
```

### Step 2: Deploy PocketBase

```bash
# Create directories
mkdir -p ~/speakeng/{pb_data,pb_migrations,pb_hooks}
cd ~/speakeng

# Download PocketBase
wget https://github.com/pocketbase/pocketbase/releases/latest/download/pocketbase_linux_amd64.zip
unzip pocketbase_linux_amd64.zip
chmod +x pocketbase

# Run PocketBase (use systemd for production)
./pocketbase serve --http="0.0.0.0:8090"
```

### Step 3: Build and Deploy Frontend

```bash
# Clone repository
git clone https://github.com/yourusername/speakeng.git
cd speakeng

# Install dependencies and build
npm install
npm run build

# Copy dist to web server (nginx example)
sudo cp -r dist/* /var/www/html/

# Or use Docker
docker build -t speakeng-frontend .
docker run -d -p 3000:80 speakeng-frontend
```

### Step 4: Configure Reverse Proxy (Caddy)

```bash
# Install Caddy
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy

# Copy Caddyfile
sudo cp Caddyfile /etc/caddy/Caddyfile

# Edit and update domain
sudo nano /etc/caddy/Caddyfile

# Start Caddy
sudo systemctl enable caddy
sudo systemctl start caddy
```

## Oracle Cloud Free Tier Deployment

### Resources (Always Free)

- 2 AMD-based Compute instances (1/8 OCPU, 1 GB memory each)
- OR 4 Arm-based Ampere A1 cores (24 GB memory total)
- 200 GB Block Volume
- 10 TB outbound data transfer per month

### Step-by-Step

1. **Create Compute Instance**

```bash
# In Oracle Cloud Console:
# - Create Compute Instance (Ubuntu 22.04, Ampere A1)
# - Open ports 80, 443, 8090 in security lists
# - Generate SSH keys and connect
```

2. **Install Dependencies**

```bash
ssh ubuntu@your-instance-ip

# Update and install
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose git

# Clone and deploy
git clone https://github.com/yourusername/speakeng.git
cd speakeng
cp .env.example .env
nano .env  # Configure

# Deploy
docker-compose --profile production up -d
```

3. **Configure DNS**

```bash
# Point your domain to Oracle instance IP
# In your DNS provider:
# A    @          your-instance-ip
# A    www        your-instance-ip
```

## Environment Variables

### Required

```env
# PocketBase
POCKETBASE_ADMIN_EMAIL=admin@yourdomain.com
POCKETBASE_ADMIN_PASSWORD=secure_password

# Groq API (get from https://console.groq.com)
GROQ_API_KEY=gsk_your_key_here

# Frontend URLs
VITE_POCKETBASE_URL=https://api.yourdomain.com
VITE_GROQ_API_KEY=${GROQ_API_KEY}
```

### Optional

```env
# Ollama (if using local LLM)
OLLAMA_URL=http://localhost:11434
VITE_OLLAMA_URL=${OLLAMA_URL}
VITE_LLM_MODEL=llama3.1:8b

# Development
VITE_DEV_MODE=false
VITE_LOG_LEVEL=info
```

## Setting Up Ollama (Optional Local LLM)

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull model
ollama pull llama3.1:8b

# Run Ollama service
ollama serve
```

## Monitoring and Maintenance

### Check Service Status

```bash
# Docker services
docker ps
docker-compose logs -f

# Caddy
sudo systemctl status caddy
sudo journalctl -u caddy -f

# PocketBase
curl http://localhost:8090/api/health
```

### Backup PocketBase Data

```bash
# Backup database
cp -r pb_data pb_data_backup_$(date +%Y%m%d)

# Or use PocketBase backup
./pocketbase backup
```

### Update Application

```bash
cd ~/speakeng
git pull origin main
docker-compose down
docker-compose build
docker-compose --profile production up -d
```

## Troubleshooting

### Service Worker Not Registering

```bash
# Check browser console for errors
# Ensure HTTPS is enabled (service workers require HTTPS)
# Check nginx/Caddy configuration for /sw.js caching
```

### PocketBase Connection Error

```bash
# Check PocketBase is running
curl http://localhost:8090/api/health

# Check firewall
sudo ufw status
sudo ufw allow 8090/tcp

# Check Docker network
docker network inspect speakeng_default
```

### Groq API Rate Limits

```bash
# Free tier: 14,400 requests/day
# Monitor usage at https://console.groq.com
# Consider caching responses or switching to Ollama for high usage
```

## Performance Optimization

### Enable Compression

Already configured in nginx.conf and Caddyfile

### Configure Caching

- Service Worker: Automatic caching for static assets
- IndexedDB: Offline storage for conversations
- PocketBase: Built-in SQLite performance

### Scale Resources

- Oracle Cloud: Upgrade to 4 ARM cores (still free)
- Add Redis for session caching (optional)
- Use CDN for static assets (optional)

## Security Considerations

1. **Change Default Passwords**
   ```bash
   # Update in .env
   POCKETBASE_ADMIN_PASSWORD=use_strong_password_here
   ```

2. **Enable HTTPS**
   ```bash
   # Caddy handles this automatically
   # Or use Certbot for nginx
   ```

3. **Configure CORS**
   ```bash
   # Already configured in nginx.conf and PocketBase
   ```

4. **Regular Updates**
   ```bash
   # Update system and Docker images regularly
   sudo apt update && sudo apt upgrade -y
   docker-compose pull
   docker-compose up -d
   ```

## Cost Breakdown

- **Hosting**: $0 (Oracle Cloud free tier)
- **Domain**: $0-12/year (optional, use Freenom or paid domain)
- **Groq API**: $0 (14,400 requests/day free)
- **PocketBase**: $0 (open source)
- **Ollama**: $0 (open source)
- **Total**: **$0-12/year**

## Support

- GitHub Issues: https://github.com/yourusername/speakeng/issues
- Documentation: https://github.com/yourusername/speakeng/wiki
- PocketBase Docs: https://pocketbase.io/docs
- Groq API Docs: https://console.groq.com/docs
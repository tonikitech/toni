#!/bin/bash

# Simple AI News Deploy
# Run on VPS as root

set -e

DOMAIN="${1:-ai-news.toni-ki.tech}"
DEPLOY_PATH="/var/www/ai-news"

echo "🚀 Deploying to $DOMAIN"

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "📦 Installing Node.js..."
  curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
  apt-get install -y nodejs
fi

# Check npm
if ! command -v npm &> /dev/null; then
  echo "❌ npm not found. Install Node.js first."
  exit 1
fi

# Create dirs
mkdir -p "$DEPLOY_PATH"
cd "$DEPLOY_PATH"

# Copy from OpenClaw
echo "📁 Copying files..."
cp -r /data/.openclaw/workspace/projects/ai-news-blog/* .
cp -r /data/.openclaw/workspace/projects/ai-news-blog/.* . 2>/dev/null || true

# Install deps
echo "📦 Installing npm packages..."
npm install --production

# Create first HTML
echo "🔄 Generating initial news..."
npm start

# Nginx config
echo "🔧 Configuring Nginx..."
mkdir -p /etc/nginx/sites-available

cat > /etc/nginx/sites-available/$DOMAIN << EOF
server {
    listen 80;
    server_name $DOMAIN;
    root $DEPLOY_PATH/public;
    index index.html;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;
    root $DEPLOY_PATH/public;
    index index.html;
    
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    location / {
        try_files \$uri \$uri/ =404;
    }
    
    location ~* \.(js|css|png|jpg|jpeg|gif|svg)$ {
        expires 30d;
    }
}
EOF

ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

echo "✅ Nginx configured"

# SSL
echo "🔐 Setting up SSL..."
if ! certbot certificates 2>/dev/null | grep -q "$DOMAIN"; then
  certbot certonly --webroot -w "$DEPLOY_PATH/public" -d "$DOMAIN" \
    --non-interactive --agree-tos --register-unsafely-without-email 2>/dev/null || echo "⚠️ SSL setup skipped"
  nginx -t && systemctl reload nginx 2>/dev/null || true
fi

# PM2
echo "👷 Setting up daemon..."
npm install -g pm2
cd "$DEPLOY_PATH"

cat > ecosystem.config.js << 'EOFPM2'
module.exports = {
  apps: [{
    name: 'ai-news',
    script: './daemon.js',
    instances: 1,
    exec_mode: 'fork',
    env: { NODE_ENV: 'production' },
    error_file: './logs/error.log',
    out_file: './logs/out.log'
  }]
};
EOFPM2

mkdir -p logs
pm2 start ecosystem.config.js
pm2 save
pm2 startup -u root --hp /root

echo ""
echo "✅ Done!"
echo "🌐 https://$DOMAIN"
echo "📋 pm2 logs ai-news"

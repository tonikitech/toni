#!/bin/bash

# AI News Blog Deployment Script for Hostinger VPS
# Usage: bash deploy.sh your-domain.com

set -e

DOMAIN="${1:-ai-news.toni-ki.tech}"
DEPLOY_PATH="/var/www/ai-news"
USER="www-data"

echo "🚀 Deploying AI News Blog to $DOMAIN"
echo "📁 Destination: $DEPLOY_PATH"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo "❌ This script must be run as root (use sudo)"
  exit 1
fi

# 1. Create directory
echo "📂 Creating deployment directory..."
mkdir -p "$DEPLOY_PATH"
cd "$DEPLOY_PATH"

# 2. Copy project files (if not already there via git)
if [ ! -f "package.json" ]; then
  echo "📥 You need to copy the project files first:"
  echo "   scp -r ai-news-blog/* root@your-ip:$DEPLOY_PATH/"
  echo "   Then run: cd $DEPLOY_PATH && npm install"
  exit 1
fi

# 3. Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# 4. Create Nginx config
echo "🔧 Configuring Nginx..."
cat > /etc/nginx/sites-available/$DOMAIN << EOF
server {
    listen 80;
    server_name $DOMAIN;
    root $DEPLOY_PATH/public;
    index index.html;

    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;
    
    # SSL Certificates (add after certbot)
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    root $DEPLOY_PATH/public;
    index index.html;
    
    # Serve static files
    location / {
        try_files \$uri \$uri/ =404;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

echo "✅ Nginx configured"

# 5. SSL Certificate (Let's Encrypt)
echo "🔐 Setting up SSL Certificate..."
if ! certbot certificates | grep -q "$DOMAIN"; then
  echo "📝 Getting SSL certificate for $DOMAIN..."
  certbot certonly --webroot -w "$DEPLOY_PATH/public" -d "$DOMAIN" --non-interactive --agree-tos -m admin@$DOMAIN || true
  nginx -t && systemctl reload nginx
fi

# 6. Install PM2 globally
echo "👷 Installing PM2 for process management..."
npm install -g pm2

# 7. Create PM2 ecosystem file
cat > "$DEPLOY_PATH/ecosystem.config.js" << 'EOF'
module.exports = {
  apps: [{
    name: 'ai-news',
    script: './daemon.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    restart_delay: 4000,
    max_memory_restart: '200M'
  }]
};
EOF

mkdir -p "$DEPLOY_PATH/logs"

# 8. Start with PM2
echo "🚀 Starting daemon with PM2..."
cd "$DEPLOY_PATH"
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# 9. Summary
echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Status:"
echo "  🌐 Domain: https://$DOMAIN"
echo "  📁 Path: $DEPLOY_PATH"
echo "  🔄 Updates: Daily at 09:00 (Europe/Berlin)"
echo ""
echo "📋 Useful commands:"
echo "  pm2 status                    # Check daemon status"
echo "  pm2 logs ai-news              # View logs"
echo "  pm2 stop ai-news              # Stop daemon"
echo "  npm start                     # Manual update"
echo ""
echo "🎉 Done! Your site is live at https://$DOMAIN"

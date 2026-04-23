# Deployment auf toni-ki.tech

## 1. Auf Hostinger VPS deployen

### Schritt 1: SSH ins VPS
```bash
ssh your-hostinger-user@your-hostinger-ip
cd /var/www/toni-ki.tech  # oder dein path
```

### Schritt 2: Projekt kopieren
```bash
# Von lokal oder via git
git clone <your-repo> ai-news
cd ai-news
npm install
```

### Schritt 3: Nginx konfigurieren

```nginx
server {
    listen 80;
    server_name ai-news.toni-ki.tech;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ai-news.toni-ki.tech;
    
    ssl_certificate /etc/letsencrypt/live/ai-news.toni-ki.tech/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ai-news.toni-ki.tech/privkey.pem;
    
    root /var/www/toni-ki.tech/ai-news/public;
    index index.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
}
```

### Schritt 4: SSL Certificate (Let's Encrypt)
```bash
sudo certbot certonly --standalone -d ai-news.toni-ki.tech
# OR wenn Nginx läuft:
sudo certbot certonly --webroot -w /var/www/toni-ki.tech/ai-news/public -d ai-news.toni-ki.tech
```

### Schritt 5: Daemon starten
```bash
# Im VPS (z.B. mit screen/tmux)
cd /var/www/toni-ki.tech/ai-news
npm run daemon

# Oder mit PM2 (persistent)
npm install -g pm2
pm2 start daemon.js --name "ai-news"
pm2 save
pm2 startup
```

## 2. Oder: Direkt auf toni-ki.tech (root domain)

Wenn du lieber auf `toni-ki.tech` hosting möchtest, ersetze:
- `ai-news.toni-ki.tech` → `toni-ki.tech`
- Und nutze eine eigene Subdomain für andere Services

## 3. Testing

```bash
# Lokal testen
npm start

# Daemon testen
npm run daemon
```

## 4. Logs anschauen

```bash
# Mit PM2
pm2 logs ai-news

# Oder tail
tail -f /var/www/toni-ki.tech/ai-news/public/index.html
```

## Updates

Die Website aktualisiert sich automatisch jeden Tag um 09:00 Uhr (Europe/Berlin).

Für manuelle Updates:
```bash
npm start
```

---

**Fertig!** 🚀

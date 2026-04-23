# 🚀 Quick Deployment Guide

## Voraussetzungen
- Hostinger VPS mit Ubuntu/Debian
- SSH-Zugriff
- Domain (z.B. `ai-news.toni-ki.tech`)
- Node.js 16+ installiert

## Step 1: Projekt zum VPS kopieren

```bash
# Lokal (von deinem Computer)
scp -r /data/.openclaw/workspace/projects/ai-news-blog/* root@your-hostinger-ip:/var/www/ai-news/
```

Oder via Git:
```bash
ssh root@your-hostinger-ip
git clone <dein-repo> /var/www/ai-news
cd /var/www/ai-news
```

## Step 2: Dependencies installieren

```bash
ssh root@your-hostinger-ip
cd /var/www/ai-news
npm install
```

## Step 3: Deployment starten

```bash
bash deploy.sh ai-news.toni-ki.tech
```

Das Script wird:
- ✅ Nginx konfigurieren
- ✅ SSL-Zertifikat einrichten (Let's Encrypt)
- ✅ PM2 installieren für persistent daemon
- ✅ Daemon starten (läuft dann auto jeden Tag um 09:00)

## Step 4: Überprüfen

```bash
# Status
pm2 status

# Logs anschauen
pm2 logs ai-news

# Manuell updaten
cd /var/www/ai-news && npm start
```

## Fertig! 🎉

Deine Site läuft jetzt auf:
```
https://ai-news.toni-ki.tech
```

Und updated sich automatisch jeden Tag um 09:00 Uhr.

---

## Troubleshooting

**"SSL certificate not found"**
→ Certbot wird automatisch aufgefordert, neue zu erstellen

**"Port 80/443 in use"**
→ Andere Services auf diesen Ports. Stoppe diese oder änder Port in Nginx config

**"PM2 daemon nicht am Laufen"**
```bash
pm2 restart ai-news
pm2 logs ai-news  # Logs anschauen
```

**Manuelle Update testen**
```bash
cd /var/www/ai-news
npm start
```

---

**Fragen?** Schreib mir! 🚀

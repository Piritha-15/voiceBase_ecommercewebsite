# 🚀 VoiceCart Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying VoiceCart to production environments, including cloud platforms, containerization, and CI/CD setup.

## Deployment Options

### 1. Cloud Platform Deployment
- **Heroku**: Simple deployment with Git integration
- **AWS**: Scalable cloud infrastructure
- **Google Cloud Platform**: Managed services
- **DigitalOcean**: Cost-effective VPS hosting
- **Vercel/Netlify**: Frontend-focused deployment

### 2. Containerized Deployment
- **Docker**: Container-based deployment
- **Docker Compose**: Multi-service orchestration
- **Kubernetes**: Container orchestration at scale

### 3. Traditional Server Deployment
- **VPS/Dedicated Server**: Full control deployment
- **Shared Hosting**: Budget-friendly option

## Prerequisites

### System Requirements
- **Python 3.8+**
- **Node.js 16+**
- **PostgreSQL 12+** (production database)
- **Redis** (caching and sessions)
- **Nginx** (web server/reverse proxy)
- **SSL Certificate** (HTTPS)

### Domain & DNS
- Domain name registered
- DNS configured to point to server
- SSL certificate obtained (Let's Encrypt recommended)

## Production Configuration

### Environment Variables

Create production environment files:

#### Backend (.env)
```bash
# Django Settings
DEBUG=False
SECRET_KEY=your-super-secret-production-key-here
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/voicecart_prod

# Redis
REDIS_URL=redis://localhost:6379/0

# Email Configuration
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Payment Gateways
STRIPE_PUBLIC_KEY=pk_live_your_stripe_public_key
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Security
SECURE_SSL_REDIRECT=True
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=True
SECURE_HSTS_PRELOAD=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True

# CORS
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Media Storage (AWS S3)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_STORAGE_BUCKET_NAME=voicecart-media
AWS_S3_REGION_NAME=us-east-1
```

#### Frontend (.env.production)
```bash
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_ENVIRONMENT=production
REACT_APP_SENTRY_DSN=your_sentry_dsn_here
GENERATE_SOURCEMAP=false
```

### Django Production Settings

Update `backend/voicecart/settings.py`:

```python
import os
from decouple import config
import dj_database_url

# Production settings
DEBUG = config('DEBUG', default=False, cast=bool)
SECRET_KEY = config('SECRET_KEY')
ALLOWED_HOSTS = config('ALLOWED_HOSTS', cast=lambda v: [s.strip() for s in v.split(',')])

# Database
DATABASES = {
    'default': dj_database_url.parse(config('DATABASE_URL'))
}

# Static files (AWS S3)
if config('USE_S3', default=False, cast=bool):
    AWS_ACCESS_KEY_ID = config('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = config('AWS_SECRET_ACCESS_KEY')
    AWS_STORAGE_BUCKET_NAME = config('AWS_STORAGE_BUCKET_NAME')
    AWS_S3_REGION_NAME = config('AWS_S3_REGION_NAME', default='us-east-1')
    AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com'
    
    # Static files
    STATICFILES_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
    STATIC_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/static/'
    
    # Media files
    DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
    MEDIA_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/media/'

# Security settings
SECURE_SSL_REDIRECT = config('SECURE_SSL_REDIRECT', default=True, cast=bool)
SECURE_HSTS_SECONDS = config('SECURE_HSTS_SECONDS', default=31536000, cast=int)
SECURE_HSTS_INCLUDE_SUBDOMAINS = config('SECURE_HSTS_INCLUDE_SUBDOMAINS', default=True, cast=bool)
SECURE_HSTS_PRELOAD = config('SECURE_HSTS_PRELOAD', default=True, cast=bool)
SESSION_COOKIE_SECURE = config('SESSION_COOKIE_SECURE', default=True, cast=bool)
CSRF_COOKIE_SECURE = config('CSRF_COOKIE_SECURE', default=True, cast=bool)

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': '/var/log/voicecart/django.log',
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

## Docker Deployment

### Dockerfile (Backend)

```dockerfile
# backend/Dockerfile
FROM python:3.9-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-client \
        build-essential \
        libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . /app/

# Collect static files
RUN python manage.py collectstatic --noinput

# Create log directory
RUN mkdir -p /var/log/voicecart

# Expose port
EXPOSE 8000

# Run gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "voicecart.wsgi:application"]
```

### Dockerfile (Frontend)

```dockerfile
# frontend/Dockerfile
FROM node:16-alpine as build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built app
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  db:
    image: postgres:13
    volumes:
      - postgres_data:/var/lib/postgresql/data/
    environment:
      POSTGRES_DB: voicecart_prod
      POSTGRES_USER: voicecart
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    restart: unless-stopped

  redis:
    image: redis:6-alpine
    restart: unless-stopped

  backend:
    build: ./backend
    volumes:
      - static_volume:/app/staticfiles
      - media_volume:/app/media
      - ./logs:/var/log/voicecart
    environment:
      - DEBUG=False
      - DATABASE_URL=postgresql://voicecart:${DB_PASSWORD}@db:5432/voicecart_prod
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - static_volume:/usr/share/nginx/html/static
      - media_volume:/usr/share/nginx/html/media
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
  static_volume:
  media_volume:
```

### Nginx Configuration

```nginx
# frontend/nginx.conf
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

    upstream backend {
        server backend:8000;
    }

    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name yourdomain.com www.yourdomain.com;

        # SSL configuration
        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # Frontend
        location / {
            root /usr/share/nginx/html;
            index index.html index.htm;
            try_files $uri $uri/ /index.html;
        }

        # API endpoints
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Admin endpoints (rate limited)
        location /admin/ {
            limit_req zone=login burst=5 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Static files
        location /static/ {
            alias /usr/share/nginx/html/static/;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Media files
        location /media/ {
            alias /usr/share/nginx/html/media/;
            expires 1y;
            add_header Cache-Control "public";
        }
    }
}
```

## Cloud Platform Deployments

### Heroku Deployment

#### 1. Prepare for Heroku

Create `Procfile`:
```
web: gunicorn voicecart.wsgi --log-file -
release: python manage.py migrate
```

Create `runtime.txt`:
```
python-3.9.18
```

Update `requirements.txt`:
```
# Add Heroku-specific packages
gunicorn==20.1.0
dj-database-url==1.0.0
whitenoise==6.2.0
psycopg2-binary==2.9.3
```

#### 2. Deploy to Heroku

```bash
# Install Heroku CLI
# Create Heroku app
heroku create voicecart-app

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# Add Redis addon
heroku addons:create heroku-redis:hobby-dev

# Set environment variables
heroku config:set DEBUG=False
heroku config:set SECRET_KEY=your-secret-key
heroku config:set ALLOWED_HOSTS=voicecart-app.herokuapp.com

# Deploy
git push heroku main

# Run migrations
heroku run python manage.py migrate

# Create superuser
heroku run python manage.py createsuperuser

# Load sample data
heroku run python manage.py loaddata sample_data.json
```

#### 3. Frontend Deployment (Netlify)

```bash
# Build settings
Build command: npm run build
Publish directory: build

# Environment variables
REACT_APP_API_URL=https://voicecart-app.herokuapp.com
```

### AWS Deployment

#### 1. EC2 Instance Setup

```bash
# Launch EC2 instance (Ubuntu 20.04 LTS)
# Connect via SSH

# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y python3-pip python3-venv nginx postgresql postgresql-contrib redis-server

# Create application user
sudo adduser voicecart
sudo usermod -aG sudo voicecart

# Switch to application user
sudo su - voicecart

# Clone repository
git clone https://github.com/yourusername/voicecart.git
cd voicecart
```

#### 2. Database Setup

```bash
# Configure PostgreSQL
sudo -u postgres psql

CREATE DATABASE voicecart_prod;
CREATE USER voicecart WITH PASSWORD 'your_password';
ALTER ROLE voicecart SET client_encoding TO 'utf8';
ALTER ROLE voicecart SET default_transaction_isolation TO 'read committed';
ALTER ROLE voicecart SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE voicecart_prod TO voicecart;
\q
```

#### 3. Application Setup

```bash
# Backend setup
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with production values

# Run migrations
python manage.py migrate
python manage.py collectstatic
python manage.py createsuperuser

# Frontend setup
cd ../frontend
npm install
npm run build
```

#### 4. Systemd Service

Create `/etc/systemd/system/voicecart.service`:

```ini
[Unit]
Description=VoiceCart Django Application
After=network.target

[Service]
Type=notify
User=voicecart
Group=voicecart
RuntimeDirectory=voicecart
WorkingDirectory=/home/voicecart/voicecart/backend
Environment=PATH=/home/voicecart/voicecart/backend/venv/bin
ExecStart=/home/voicecart/voicecart/backend/venv/bin/gunicorn --workers 3 --bind unix:/run/voicecart/voicecart.sock voicecart.wsgi:application
ExecReload=/bin/kill -s HUP $MAINPID
KillMode=mixed
TimeoutStopSec=5
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

Enable and start service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable voicecart
sudo systemctl start voicecart
```

#### 5. Nginx Configuration

Create `/etc/nginx/sites-available/voicecart`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location = /favicon.ico { access_log off; log_not_found off; }
    
    location /static/ {
        root /home/voicecart/voicecart/backend;
    }

    location /media/ {
        root /home/voicecart/voicecart/backend;
    }

    location /api/ {
        include proxy_params;
        proxy_pass http://unix:/run/voicecart/voicecart.sock;
    }

    location /admin/ {
        include proxy_params;
        proxy_pass http://unix:/run/voicecart/voicecart.sock;
    }

    location / {
        root /home/voicecart/voicecart/frontend/build;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/voicecart /etc/nginx/sites-enabled
sudo nginx -t
sudo systemctl restart nginx
```

#### 6. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v2
    
    - name: Set up Python
      uses: actions/setup-python@v2
      with:
        python-version: 3.9
    
    - name: Install dependencies
      run: |
        cd backend
        pip install -r requirements.txt
    
    - name: Run tests
      run: |
        cd backend
        python manage.py test
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/postgres
    
    - name: Set up Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
    
    - name: Install frontend dependencies
      run: |
        cd frontend
        npm ci
    
    - name: Run frontend tests
      run: |
        cd frontend
        npm test -- --coverage --watchAll=false

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.4
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /home/voicecart/voicecart
          git pull origin main
          
          # Backend deployment
          cd backend
          source venv/bin/activate
          pip install -r requirements.txt
          python manage.py migrate
          python manage.py collectstatic --noinput
          
          # Frontend deployment
          cd ../frontend
          npm install
          npm run build
          
          # Restart services
          sudo systemctl restart voicecart
          sudo systemctl reload nginx
```

## Monitoring & Logging

### Application Monitoring

#### 1. Sentry Integration

Install Sentry:
```bash
pip install sentry-sdk[django]
```

Configure in `settings.py`:
```python
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

sentry_sdk.init(
    dsn=config('SENTRY_DSN'),
    integrations=[DjangoIntegration()],
    traces_sample_rate=1.0,
    send_default_pii=True
)
```

#### 2. Health Check Endpoint

Create `backend/health/views.py`:
```python
from django.http import JsonResponse
from django.db import connection
from django.core.cache import cache
import redis

def health_check(request):
    status = {
        'status': 'healthy',
        'database': 'unknown',
        'cache': 'unknown'
    }
    
    # Check database
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        status['database'] = 'healthy'
    except Exception:
        status['database'] = 'unhealthy'
        status['status'] = 'unhealthy'
    
    # Check cache
    try:
        cache.set('health_check', 'ok', 30)
        if cache.get('health_check') == 'ok':
            status['cache'] = 'healthy'
        else:
            status['cache'] = 'unhealthy'
    except Exception:
        status['cache'] = 'unhealthy'
    
    return JsonResponse(status)
```

#### 3. Log Aggregation

Configure structured logging:
```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'json': {
            'format': '{"time": "%(asctime)s", "level": "%(levelname)s", "logger": "%(name)s", "message": "%(message)s"}',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': '/var/log/voicecart/django.log',
            'maxBytes': 1024*1024*10,  # 10MB
            'backupCount': 5,
            'formatter': 'json',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
        'voicecart': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

### System Monitoring

#### 1. Server Monitoring Script

Create `scripts/monitor.sh`:
```bash
#!/bin/bash

# System monitoring script
LOG_FILE="/var/log/voicecart/system.log"

# Function to log with timestamp
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> $LOG_FILE
}

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    log_message "WARNING: Disk usage is ${DISK_USAGE}%"
fi

# Check memory usage
MEMORY_USAGE=$(free | awk 'NR==2{printf "%.2f", $3*100/$2}')
if (( $(echo "$MEMORY_USAGE > 80" | bc -l) )); then
    log_message "WARNING: Memory usage is ${MEMORY_USAGE}%"
fi

# Check if services are running
if ! systemctl is-active --quiet voicecart; then
    log_message "ERROR: VoiceCart service is not running"
    systemctl start voicecart
fi

if ! systemctl is-active --quiet nginx; then
    log_message "ERROR: Nginx service is not running"
    systemctl start nginx
fi

# Check application health
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/health/)
if [ "$HEALTH_STATUS" != "200" ]; then
    log_message "ERROR: Application health check failed (HTTP $HEALTH_STATUS)"
fi

log_message "System check completed"
```

Add to crontab:
```bash
# Run every 5 minutes
*/5 * * * * /home/voicecart/scripts/monitor.sh
```

## Backup Strategy

### Database Backup

Create `scripts/backup_db.sh`:
```bash
#!/bin/bash

BACKUP_DIR="/home/voicecart/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="voicecart_prod"
DB_USER="voicecart"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create database backup
pg_dump -U $DB_USER -h localhost $DB_NAME | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# Keep only last 7 days of backups
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +7 -delete

echo "Database backup completed: db_backup_$DATE.sql.gz"
```

### Media Files Backup

```bash
#!/bin/bash

BACKUP_DIR="/home/voicecart/backups"
MEDIA_DIR="/home/voicecart/voicecart/backend/media"
DATE=$(date +%Y%m%d_%H%M%S)

# Create media backup
tar -czf $BACKUP_DIR/media_backup_$DATE.tar.gz -C $MEDIA_DIR .

# Keep only last 30 days of media backups
find $BACKUP_DIR -name "media_backup_*.tar.gz" -mtime +30 -delete

echo "Media backup completed: media_backup_$DATE.tar.gz"
```

## Security Checklist

### Pre-Deployment Security

- [ ] Change all default passwords
- [ ] Generate strong SECRET_KEY
- [ ] Configure HTTPS/SSL
- [ ] Set up firewall rules
- [ ] Enable fail2ban
- [ ] Configure secure headers
- [ ] Set up rate limiting
- [ ] Enable CSRF protection
- [ ] Configure CORS properly
- [ ] Set secure cookie flags

### Post-Deployment Security

- [ ] Regular security updates
- [ ] Monitor access logs
- [ ] Set up intrusion detection
- [ ] Regular backup testing
- [ ] Security audit schedule
- [ ] Vulnerability scanning
- [ ] SSL certificate renewal
- [ ] Database security review

## Performance Optimization

### Database Optimization

```python
# Database connection pooling
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'OPTIONS': {
            'MAX_CONNS': 20,
            'OPTIONS': {
                'MAX_CONNS': 20,
            }
        },
    }
}

# Query optimization
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}
```

### Frontend Optimization

```javascript
// Code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const CartPage = lazy(() => import('./pages/CartPage'));

// Service worker for caching
// public/sw.js
const CACHE_NAME = 'voicecart-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});
```

## Troubleshooting

### Common Issues

#### 1. Static Files Not Loading
```bash
# Check static files configuration
python manage.py collectstatic --dry-run
python manage.py findstatic admin/css/base.css

# Verify nginx configuration
sudo nginx -t
```

#### 2. Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -U voicecart -d voicecart_prod -h localhost
```

#### 3. SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew --dry-run
```

#### 4. Application Not Starting
```bash
# Check service logs
sudo journalctl -u voicecart -f

# Check application logs
tail -f /var/log/voicecart/django.log
```

### Performance Issues

#### 1. Slow Database Queries
```python
# Enable query logging
LOGGING['loggers']['django.db.backends'] = {
    'level': 'DEBUG',
    'handlers': ['file'],
}

# Use database indexes
class Product(models.Model):
    name = models.CharField(max_length=200, db_index=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, db_index=True)
```

#### 2. High Memory Usage
```bash
# Monitor memory usage
htop
free -h

# Optimize gunicorn workers
# In systemd service file:
ExecStart=/path/to/gunicorn --workers 2 --max-requests 1000 --max-requests-jitter 100
```

## Maintenance

### Regular Maintenance Tasks

#### Daily
- [ ] Check application logs
- [ ] Monitor system resources
- [ ] Verify backup completion
- [ ] Check SSL certificate status

#### Weekly
- [ ] Update system packages
- [ ] Review security logs
- [ ] Database maintenance
- [ ] Performance monitoring

#### Monthly
- [ ] Security audit
- [ ] Backup restoration test
- [ ] Dependency updates
- [ ] SSL certificate renewal check

### Update Procedure

```bash
# 1. Backup current state
./scripts/backup_db.sh
./scripts/backup_media.sh

# 2. Update code
git pull origin main

# 3. Update dependencies
cd backend
source venv/bin/activate
pip install -r requirements.txt

cd ../frontend
npm install

# 4. Run migrations
cd ../backend
python manage.py migrate

# 5. Collect static files
python manage.py collectstatic --noinput

# 6. Build frontend
cd ../frontend
npm run build

# 7. Restart services
sudo systemctl restart voicecart
sudo systemctl reload nginx

# 8. Verify deployment
curl -I https://yourdomain.com/api/health/
```

---

This deployment guide ensures a secure, scalable, and maintainable production deployment of the VoiceCart platform.
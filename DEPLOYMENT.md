# Deployment Guide 🚀

This guide covers deploying Project Co-Pilot to various platforms and environments.

## Prerequisites

Before deployment, ensure you have:
- [ ] All API keys configured
- [ ] MongoDB database set up
- [ ] Environment variables configured
- [ ] Domain name (for production)

## Local Development Deployment

### Quick Start
```bash
# Clone and setup
git clone https://github.com/yourusername/project-co-pilot.git
cd project-co-pilot

# Install dependencies
npm run install-all

# Setup environment
cp backend/env_example.txt backend/.env
# Edit backend/.env with your API keys

# Start all services
npm start
```

### Individual Services
```bash
# Backend only
cd backend && python main.py

# Frontend only
cd src && npm start

# Extension
# Load extension/ folder in Chrome
```

## Production Deployment

### Backend Deployment

#### Option 1: Heroku
```bash
# Install Heroku CLI
heroku create your-app-name
heroku config:set ASSEMBLYAI_API_KEY=your_key
heroku config:set GOOGLE_GEMINI_API_KEY=your_key
heroku config:set MONGODB_URL=your_mongodb_url
heroku config:set JWT_SECRET_KEY=your_secret
git push heroku main
```

#### Option 2: DigitalOcean App Platform
1. Connect your GitHub repository
2. Set environment variables in the dashboard
3. Deploy automatically on push

#### Option 3: AWS EC2
```bash
# SSH into your EC2 instance
sudo apt update
sudo apt install python3 python3-pip nginx

# Clone repository
git clone https://github.com/yourusername/project-co-pilot.git
cd project-co-pilot/backend

# Setup virtual environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Setup environment variables
cp env_example.txt .env
# Edit .env with your values

# Run with gunicorn
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8001
```

#### Option 4: Docker
```dockerfile
# Dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY backend/requirements.txt .
RUN pip install -r requirements.txt

COPY backend/ .
EXPOSE 8001

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
```

```bash
# Build and run
docker build -t project-co-pilot .
docker run -p 8001:8001 --env-file backend/.env project-co-pilot
```

### Frontend Deployment

#### Option 1: Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd src
vercel
```

#### Option 2: Netlify
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Deploy automatically

#### Option 3: GitHub Pages
```bash
# Add to package.json
"homepage": "https://yourusername.github.io/project-co-pilot",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"
}

# Deploy
npm run deploy
```

### Chrome Extension Deployment

#### Chrome Web Store
1. Create a developer account at [Chrome Web Store](https://chrome.google.com/webstore/devconsole/)
2. Package your extension:
   ```bash
   cd extension
   zip -r project-co-pilot.zip . -x "*.git*" "node_modules/*"
   ```
3. Upload to Chrome Web Store
4. Submit for review

#### Manual Distribution
1. Package the extension
2. Share the `.zip` file
3. Users load it manually in Chrome

## Environment Configuration

### Production Environment Variables
```env
# Production settings
DEBUG=False
HOST=0.0.0.0
PORT=8001

# Use production MongoDB
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/project_co_pilot

# Production API keys
ASSEMBLYAI_API_KEY=your_production_key
GOOGLE_GEMINI_API_KEY=your_production_key

# Secure JWT secret
JWT_SECRET_KEY=your_very_secure_production_secret

# Production OAuth callbacks
GITHUB_CLIENT_ID=your_production_github_client_id
GITHUB_CLIENT_SECRET=your_production_github_client_secret
GOOGLE_CLIENT_ID=your_production_google_client_id
GOOGLE_CLIENT_SECRET=your_production_google_client_secret

# CORS for production domain
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### SSL/HTTPS Setup
```bash
# Using Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com

# Using Cloudflare
# Enable SSL/TLS encryption mode to "Full"
```

## Monitoring and Logging

### Application Monitoring
```python
# Add to main.py
import logging
from fastapi import FastAPI

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Add health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now()}
```

### Error Tracking
```python
# Add Sentry for error tracking
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn="your_sentry_dsn",
    integrations=[FastApiIntegration()],
    traces_sample_rate=1.0,
)
```

## Performance Optimization

### Backend Optimization
```python
# Use connection pooling
from motor.motor_asyncio import AsyncIOMotorClient

client = AsyncIOMotorClient(
    MONGODB_URL,
    maxPoolSize=10,
    minPoolSize=1
)

# Enable caching
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend

FastAPICache.init(RedisBackend(redis), prefix="fastapi-cache")
```

### Frontend Optimization
```javascript
// Enable service worker for caching
// Add to public/manifest.json
{
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff"
}
```

## Security Checklist

### Before Production
- [ ] Change all default passwords and secrets
- [ ] Enable HTTPS/SSL
- [ ] Configure proper CORS
- [ ] Set up firewall rules
- [ ] Enable rate limiting
- [ ] Configure backup strategy
- [ ] Set up monitoring and alerting
- [ ] Test security measures

### Ongoing Security
- [ ] Regular dependency updates
- [ ] Security audits
- [ ] API key rotation
- [ ] Log monitoring
- [ ] Backup verification

## Troubleshooting

### Common Deployment Issues

1. **Port Already in Use**
   ```bash
   # Find process using port
   lsof -i :8001
   # Kill process
   kill -9 <PID>
   ```

2. **Environment Variables Not Loading**
   ```bash
   # Check if .env is loaded
   python -c "import os; print(os.getenv('ASSEMBLYAI_API_KEY'))"
   ```

3. **CORS Errors**
   ```python
   # Update CORS configuration
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["https://yourdomain.com"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

4. **Database Connection Issues**
   ```bash
   # Test MongoDB connection
   python -c "
   import motor.motor_asyncio
   import asyncio
   async def test():
       client = motor.motor_asyncio.AsyncIOMotorClient('your_mongodb_url')
       await client.admin.command('ping')
       print('Connected!')
   asyncio.run(test())
   "
   ```

## Support

For deployment issues:
1. Check this documentation
2. Review error logs
3. Test components individually
4. Create an issue on GitHub
5. Check platform-specific documentation

---

**Happy Deploying!** 🚀 
# LegalMind Frontend Deployment Guide

This guide provides comprehensive instructions for deploying the LegalMind Frontend application across multiple platforms.

## 🚀 Quick Start

The easiest way to deploy is using our deployment script:

```bash
# Make the script executable (if not already done)
chmod +x deploy.sh

# Run comprehensive deployment check
./deploy.sh all

# Deploy to your preferred platform
./deploy.sh docker      # Docker deployment
./deploy.sh vercel      # Vercel deployment
./deploy.sh netlify     # Netlify deployment
```

## 📋 Prerequisites

### Required Tools
- **Node.js** (v20 or higher)
- **pnpm** (v10.4.1 or higher)
- **Git**

### Platform-Specific Requirements
- **Docker**: Docker and Docker Compose
- **Vercel**: Vercel CLI (`npm install -g vercel`)
- **Netlify**: Netlify CLI (`npm install -g netlify-cli`)

## 🐳 Docker Deployment

### Option 1: Docker Run
```bash
# Build and run with Docker
./deploy.sh docker

# Or manually:
docker build -t legalmind-frontend .
docker run -d -p 3000:80 --name legalmind-frontend legalmind-frontend
```

### Option 2: Docker Compose
```bash
# Deploy with Docker Compose
./deploy.sh compose

# Or manually:
docker-compose up -d
```

### Access Your Application
- **Local**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

## ☁️ Cloud Platform Deployments

### Vercel Deployment

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   ./deploy.sh vercel
   ```

3. **Manual Setup**:
   - Connect your GitHub repository to Vercel
   - Configure build settings:
     - Build Command: `pnpm run build`
     - Output Directory: `dist`
     - Install Command: `pnpm install`

### Netlify Deployment

1. **Install Netlify CLI** (if not already installed):
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy**:
   ```bash
   ./deploy.sh netlify
   ```

3. **Manual Setup**:
   - Connect your repository to Netlify
   - Build settings are automatically configured via `netlify.toml`

## 🏗️ Manual Deployment

### 1. Build the Application
```bash
# Install dependencies
pnpm install

# Run linting
pnpm run lint

# Build for production
pnpm run build
```

### 2. Deploy Static Files
The built files are in the `dist/` directory. You can deploy these to any static hosting service:

- **Nginx**: Copy `dist/` contents to your web root
- **Apache**: Copy `dist/` contents to your web root
- **CDN**: Upload `dist/` contents to your CDN

## 🔧 Configuration

### Environment Variables
Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Key variables:
- `VITE_API_BASE_URL`: Backend API URL
- `VITE_API_TIMEOUT`: API request timeout
- `VITE_ENABLE_ANALYTICS`: Enable analytics
- `VITE_ENABLE_DEBUG`: Enable debug mode

### API Configuration
The application expects a backend API at `/api/legalmind`. Configure your reverse proxy or hosting platform to route API requests to your backend service.

## 🚦 Health Checks

### Application Health
- **Endpoint**: `/health`
- **Response**: `healthy`
- **Status Code**: 200

### Docker Health Check
```bash
# Check container health
docker ps

# View health check logs
docker logs legalmind-frontend
```

## 🔒 Security Considerations

### Headers
The application includes security headers:
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

### HTTPS
Ensure HTTPS is enabled in production:
- **Vercel/Netlify**: Automatic HTTPS
- **Docker**: Configure SSL certificates
- **Manual**: Use Let's Encrypt or similar

## 📊 Performance Optimization

### Caching
- Static assets are cached for 1 year
- API responses should be cached appropriately
- Use CDN for global distribution

### Compression
- Gzip compression is enabled
- Minified JavaScript and CSS
- Optimized images

## 🐛 Troubleshooting

### Common Issues

1. **Build Fails**:
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   pnpm run build
   ```

2. **Docker Build Fails**:
   ```bash
   # Check Docker is running
   docker --version
   
   # Clean Docker cache
   docker system prune -a
   ```

3. **API Connection Issues**:
   - Check `VITE_API_BASE_URL` configuration
   - Verify backend service is running
   - Check CORS settings

### Logs
```bash
# Docker logs
docker logs legalmind-frontend

# Docker Compose logs
docker-compose logs -f

# Vercel logs
vercel logs

# Netlify logs
netlify logs
```

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install -g pnpm
      - run: pnpm install
      - run: pnpm run build
      - run: pnpm install -g vercel
      - run: vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

## 📈 Monitoring

### Recommended Tools
- **Uptime Monitoring**: UptimeRobot, Pingdom
- **Error Tracking**: Sentry, LogRocket
- **Analytics**: Google Analytics, Mixpanel
- **Performance**: Web Vitals, Lighthouse

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section
2. Review application logs
3. Verify configuration settings
4. Check platform-specific documentation

## 📝 Deployment Checklist

- [ ] Dependencies installed (`pnpm install`)
- [ ] Linting passes (`pnpm run lint`)
- [ ] Build successful (`pnpm run build`)
- [ ] Environment variables configured
- [ ] API endpoints configured
- [ ] Security headers enabled
- [ ] HTTPS enabled (production)
- [ ] Health checks working
- [ ] Monitoring configured
- [ ] Backup strategy in place

---

**Ready to deploy?** Run `./deploy.sh all` to get started! 🚀
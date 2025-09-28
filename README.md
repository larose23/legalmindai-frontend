# LegalMind AI Frontend

This repository contains the LegalMind AI Frontend application.

## Project Structure

```
/
├── legalmind-frontend/     # Main React application
│   ├── src/               # Source code
│   ├── public/            # Static assets
│   ├── dist/              # Build output
│   └── package.json       # Frontend dependencies
├── netlify.toml           # Netlify configuration
├── build.sh              # Build script for Netlify
└── package.json          # Workspace configuration
```

## Quick Deploy to Netlify

1. **Connect your repository** to Netlify
2. **Build settings** will be automatically detected from `netlify.toml`
3. **Deploy** - Netlify will run the build script automatically

## Manual Build

```bash
# Install dependencies
cd legalmind-frontend
pnpm install

# Build the application
pnpm run build

# The built files will be in legalmind-frontend/dist/
```

## Development

```bash
# Start development server
cd legalmind-frontend
pnpm run dev
```

## Deployment Options

- **Netlify**: Automatic deployment via `netlify.toml`
- **Vercel**: Use `cd legalmind-frontend && pnpm run deploy:vercel`
- **Docker**: Use `cd legalmind-frontend && pnpm run deploy:docker`

For detailed deployment instructions, see `legalmind-frontend/DEPLOYMENT.md`.
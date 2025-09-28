#!/bin/bash

# LegalMind Frontend Deployment Script
# This script provides multiple deployment options

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to build the application
build_app() {
    print_status "Building application..."
    
    if ! command_exists pnpm; then
        print_error "pnpm is not installed. Please install pnpm first."
        exit 1
    fi
    
    # Install dependencies
    print_status "Installing dependencies..."
    pnpm install
    
    # Run linting
    print_status "Running linter..."
    pnpm run lint
    
    # Build application
    print_status "Building for production..."
    pnpm run build
    
    print_success "Application built successfully!"
}

# Function to deploy with Docker
deploy_docker() {
    print_status "Deploying with Docker..."
    
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Build Docker image
    print_status "Building Docker image..."
    docker build -t legalmind-frontend .
    
    # Run container
    print_status "Starting container..."
    docker run -d -p 3000:80 --name legalmind-frontend legalmind-frontend
    
    print_success "Application deployed with Docker on port 3000!"
    print_status "Access your application at: http://localhost:3000"
}

# Function to deploy with Docker Compose
deploy_docker_compose() {
    print_status "Deploying with Docker Compose..."
    
    if ! command_exists docker-compose; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Start services
    print_status "Starting services..."
    docker-compose up -d
    
    print_success "Application deployed with Docker Compose!"
    print_status "Access your application at: http://localhost:3000"
}

# Function to prepare for Vercel deployment
deploy_vercel() {
    print_status "Preparing for Vercel deployment..."
    
    if ! command_exists vercel; then
        print_warning "Vercel CLI is not installed. Installing globally..."
        npm install -g vercel
    fi
    
    # Build application
    build_app
    
    # Deploy to Vercel
    print_status "Deploying to Vercel..."
    vercel --prod
    
    print_success "Application deployed to Vercel!"
}

# Function to prepare for Netlify deployment
deploy_netlify() {
    print_status "Preparing for Netlify deployment..."
    
    if ! command_exists netlify; then
        print_warning "Netlify CLI is not installed. Installing globally..."
        npm install -g netlify-cli
    fi
    
    # Build application
    build_app
    
    # Deploy to Netlify
    print_status "Deploying to Netlify..."
    netlify deploy --prod --dir=dist
    
    print_success "Application deployed to Netlify!"
}

# Function to show help
show_help() {
    echo "LegalMind Frontend Deployment Script"
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  build              Build the application only"
    echo "  docker             Deploy using Docker"
    echo "  compose            Deploy using Docker Compose"
    echo "  vercel             Deploy to Vercel"
    echo "  netlify            Deploy to Netlify"
    echo "  all                Run all deployment checks and build"
    echo "  help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 build           # Build the application"
    echo "  $0 docker          # Deploy with Docker"
    echo "  $0 vercel          # Deploy to Vercel"
}

# Main script logic
case "${1:-help}" in
    "build")
        build_app
        ;;
    "docker")
        build_app
        deploy_docker
        ;;
    "compose")
        build_app
        deploy_docker_compose
        ;;
    "vercel")
        deploy_vercel
        ;;
    "netlify")
        deploy_netlify
        ;;
    "all")
        print_status "Running comprehensive deployment check..."
        build_app
        print_success "Application is ready for deployment!"
        print_status "You can now deploy using any of the following methods:"
        print_status "  ./deploy.sh docker     # Docker deployment"
        print_status "  ./deploy.sh compose    # Docker Compose deployment"
        print_status "  ./deploy.sh vercel     # Vercel deployment"
        print_status "  ./deploy.sh netlify    # Netlify deployment"
        ;;
    "help"|*)
        show_help
        ;;
esac
#!/bin/bash

# Production Deployment Script for ContentSync
# This script handles the complete deployment process with proper checks and rollback capabilities

set -e  # Exit on any error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_FILE="$PROJECT_ROOT/logs/deployment.log"
BACKUP_DIR="$PROJECT_ROOT/backups"
DEPLOYMENT_ID=$(date +%Y%m%d_%H%M%S)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    # Create log directory if it doesn't exist
    mkdir -p "$(dirname "$LOG_FILE")"
    
    # Color output based on level
    case $level in
        "ERROR")
            echo -e "${RED}[$timestamp] [ERROR] $message${NC}" | tee -a "$LOG_FILE"
            ;;
        "WARN")
            echo -e "${YELLOW}[$timestamp] [WARN] $message${NC}" | tee -a "$LOG_FILE"
            ;;
        "SUCCESS")
            echo -e "${GREEN}[$timestamp] [SUCCESS] $message${NC}" | tee -a "$LOG_FILE"
            ;;
        "INFO")
            echo -e "${BLUE}[$timestamp] [INFO] $message${NC}" | tee -a "$LOG_FILE"
            ;;
        *)
            echo "[$timestamp] $message" | tee -a "$LOG_FILE"
            ;;
    esac
}

# Error handler
error_exit() {
    log "ERROR" "Deployment failed: $1"
    log "ERROR" "Check the logs for more details: $LOG_FILE"
    exit 1
}

# Check prerequisites
check_prerequisites() {
    log "INFO" "Checking prerequisites..."
    
    # Check if required commands exist
    local required_commands=("node" "npm" "git" "docker" "psql")
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            error_exit "Required command not found: $cmd"
        fi
    done
    
    # Check Node.js version
    local node_version=$(node --version | cut -d'v' -f2)
    local required_version="18.0.0"
    if ! node -e "process.exit(require('semver').gte('$node_version', '$required_version') ? 0 : 1)" 2>/dev/null; then
        error_exit "Node.js version $required_version or higher is required. Current: $node_version"
    fi
    
    # Check if we're in the correct directory
    if [[ ! -f "$PROJECT_ROOT/package.json" ]]; then
        error_exit "package.json not found. Please run this script from the project root."
    fi
    
    log "SUCCESS" "Prerequisites check passed"
}

# Validate environment variables
validate_environment() {
    log "INFO" "Validating environment variables..."
    
    local required_vars=(
        "DATABASE_URL"
        "REDIS_URL"
        "NEXTAUTH_SECRET"
        "GEMINI_API_KEY"
        "CRON_SECRET"
    )
    
    local missing_vars=()
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            missing_vars+=("$var")
        fi
    done
    
    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        error_exit "Missing required environment variables: ${missing_vars[*]}"
    fi
    
    # Validate environment file
    if [[ ! -f "$PROJECT_ROOT/.env.production" ]]; then
        log "WARN" ".env.production file not found. Using environment variables only."
    fi
    
    log "SUCCESS" "Environment validation passed"
}

# Run tests
run_tests() {
    log "INFO" "Running tests..."
    
    cd "$PROJECT_ROOT"
    
    # Install dependencies if needed
    if [[ ! -d "node_modules" ]]; then
        log "INFO" "Installing dependencies..."
        npm ci || error_exit "Failed to install dependencies"
    fi
    
    # Run linting
    log "INFO" "Running linter..."
    npm run lint || error_exit "Linting failed"
    
    # Run unit tests
    log "INFO" "Running unit tests..."
    npm run test:unit || error_exit "Unit tests failed"
    
    # Run integration tests
    log "INFO" "Running integration tests..."
    npm run test:integration || error_exit "Integration tests failed"
    
    log "SUCCESS" "All tests passed"
}

# Build application
build_application() {
    log "INFO" "Building application..."
    
    cd "$PROJECT_ROOT"
    
    # Clean previous build
    rm -rf .next
    
    # Build the application
    npm run build || error_exit "Build failed"
    
    log "SUCCESS" "Application built successfully"
}

# Database migration
migrate_database() {
    log "INFO" "Running database migrations..."
    
    cd "$PROJECT_ROOT"
    
    # Run the production migration script
    node scripts/migrate-production.js || error_exit "Database migration failed"
    
    log "SUCCESS" "Database migration completed"
}

# Deploy to production
deploy_to_production() {
    log "INFO" "Deploying to production..."
    
    local deployment_method=${DEPLOYMENT_METHOD:-"docker"}
    
    case $deployment_method in
        "docker")
            deploy_with_docker
            ;;
        "vercel")
            deploy_with_vercel
            ;;
        "pm2")
            deploy_with_pm2
            ;;
        *)
            error_exit "Unknown deployment method: $deployment_method"
            ;;
    esac
    
    log "SUCCESS" "Deployment completed"
}

# Docker deployment
deploy_with_docker() {
    log "INFO" "Deploying with Docker..."
    
    cd "$PROJECT_ROOT"
    
    # Build Docker image
    docker build -t contentsync:$DEPLOYMENT_ID . || error_exit "Docker build failed"
    docker tag contentsync:$DEPLOYMENT_ID contentsync:latest
    
    # Stop existing container
    if docker ps -q -f name=contentsync-prod; then
        log "INFO" "Stopping existing container..."
        docker stop contentsync-prod || true
        docker rm contentsync-prod || true
    fi
    
    # Start new container
    docker run -d \
        --name contentsync-prod \
        --restart unless-stopped \
        -p 3000:3000 \
        --env-file .env.production \
        contentsync:latest || error_exit "Failed to start Docker container"
    
    # Wait for container to be ready
    log "INFO" "Waiting for container to be ready..."
    sleep 10
    
    # Health check
    if ! curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        error_exit "Health check failed after deployment"
    fi
}

# Vercel deployment
deploy_with_vercel() {
    log "INFO" "Deploying with Vercel..."
    
    cd "$PROJECT_ROOT"
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        error_exit "Vercel CLI not found. Install with: npm i -g vercel"
    fi
    
    # Deploy to Vercel
    vercel --prod || error_exit "Vercel deployment failed"
}

# PM2 deployment
deploy_with_pm2() {
    log "INFO" "Deploying with PM2..."
    
    cd "$PROJECT_ROOT"
    
    # Check if PM2 is installed
    if ! command -v pm2 &> /dev/null; then
        error_exit "PM2 not found. Install with: npm i -g pm2"
    fi
    
    # Start or restart the application
    pm2 start ecosystem.config.js --env production || error_exit "PM2 deployment failed"
    pm2 save
}

# Post-deployment verification
verify_deployment() {
    log "INFO" "Verifying deployment..."
    
    local base_url=${BASE_URL:-"http://localhost:3000"}
    
    # Health check
    log "INFO" "Running health check..."
    local health_response=$(curl -s -o /dev/null -w "%{http_code}" "$base_url/api/health")
    if [[ "$health_response" != "200" ]]; then
        error_exit "Health check failed. HTTP status: $health_response"
    fi
    
    # Readiness check
    log "INFO" "Running readiness check..."
    local ready_response=$(curl -s -o /dev/null -w "%{http_code}" "$base_url/api/ready")
    if [[ "$ready_response" != "200" ]]; then
        error_exit "Readiness check failed. HTTP status: $ready_response"
    fi
    
    # Basic functionality test
    log "INFO" "Testing basic functionality..."
    # Add more specific tests here based on your application
    
    log "SUCCESS" "Deployment verification passed"
}

# Cleanup old deployments
cleanup_old_deployments() {
    log "INFO" "Cleaning up old deployments..."
    
    # Clean up old Docker images (keep last 3)
    if command -v docker &> /dev/null; then
        local old_images=$(docker images contentsync --format "table {{.Tag}}" | grep -E '^[0-9]{8}_[0-9]{6}$' | sort -r | tail -n +4)
        if [[ -n "$old_images" ]]; then
            echo "$old_images" | xargs -I {} docker rmi contentsync:{} || true
        fi
    fi
    
    # Clean up old backups (keep last 7 days)
    if [[ -d "$BACKUP_DIR" ]]; then
        find "$BACKUP_DIR" -name "backup-*.sql" -mtime +7 -delete || true
    fi
    
    # Clean up old logs (keep last 30 days)
    if [[ -d "$PROJECT_ROOT/logs" ]]; then
        find "$PROJECT_ROOT/logs" -name "*.log" -mtime +30 -delete || true
    fi
    
    log "SUCCESS" "Cleanup completed"
}

# Main deployment function
main() {
    log "INFO" "Starting deployment process (ID: $DEPLOYMENT_ID)..."
    
    # Parse command line arguments
    local skip_tests=false
    local skip_migration=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-tests)
                skip_tests=true
                shift
                ;;
            --skip-migration)
                skip_migration=true
                shift
                ;;
            --help|-h)
                echo "Usage: $0 [options]"
                echo "Options:"
                echo "  --skip-tests       Skip running tests"
                echo "  --skip-migration   Skip database migration"
                echo "  --help, -h         Show this help message"
                echo ""
                echo "Environment Variables:"
                echo "  DEPLOYMENT_METHOD  Deployment method (docker|vercel|pm2)"
                echo "  BASE_URL          Base URL for verification (default: http://localhost:3000)"
                exit 0
                ;;
            *)
                error_exit "Unknown option: $1"
                ;;
        esac
    done
    
    # Execute deployment steps
    check_prerequisites
    validate_environment
    
    if [[ "$skip_tests" != true ]]; then
        run_tests
    else
        log "WARN" "Skipping tests as requested"
    fi
    
    build_application
    
    if [[ "$skip_migration" != true ]]; then
        migrate_database
    else
        log "WARN" "Skipping database migration as requested"
    fi
    
    deploy_to_production
    verify_deployment
    cleanup_old_deployments
    
    log "SUCCESS" "Deployment completed successfully! (ID: $DEPLOYMENT_ID)"
    log "INFO" "Application is now running and ready to serve requests."
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

#!/bin/bash

# Giran Article Reader - Deployment Script
echo "🚀 Starting Giran Article Reader deployment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Function to show help
show_help() {
    echo "Usage: ./deploy.sh [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start     Build and start all services"
    echo "  stop      Stop all services"
    echo "  restart   Restart all services"
    echo "  logs      Show logs from all services"
    echo "  clean     Stop and remove all containers, networks, and images"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./deploy.sh start"
    echo "  ./deploy.sh logs"
    echo "  ./deploy.sh clean"
}

# Function to start services
start_services() {
    echo "📦 Building and starting all services..."
    docker-compose up --build -d
    
    if [ $? -eq 0 ]; then
        echo "✅ All services started successfully!"
        echo "🌐 Application is available at: http://localhost"
        echo ""
        echo "Services running:"
        docker-compose ps
    else
        echo "❌ Failed to start services. Check the logs:"
        docker-compose logs
    fi
}

# Function to stop services
stop_services() {
    echo "🛑 Stopping all services..."
    docker-compose down
    echo "✅ All services stopped."
}

# Function to restart services
restart_services() {
    echo "🔄 Restarting all services..."
    stop_services
    start_services
}

# Function to show logs
show_logs() {
    echo "📋 Showing logs from all services..."
    docker-compose logs -f
}

# Function to clean up
clean_up() {
    echo "🧹 Cleaning up all containers, networks, and images..."
    docker-compose down --rmi all --volumes --remove-orphans
    echo "✅ Cleanup completed."
}

# Main command handling
case "$1" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    logs)
        show_logs
        ;;
    clean)
        clean_up
        ;;
    help|--help|-h)
        show_help
        ;;
    "")
        echo "📚 Giran Article Reader"
        echo "No command specified. Use './deploy.sh help' for usage information."
        echo ""
        show_help
        ;;
    *)
        echo "❌ Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac

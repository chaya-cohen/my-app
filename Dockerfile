# 1. Build Stage
FROM node:18-alpine AS build

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json for dependency installation
COPY package.json ./

# Install dependencies
RUN npm install 

# Copy the entire project
COPY . .

# Build the React app
RUN npm run build

FROM debian:latest

# Update package lists and install Nginx
RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/*

# Remove default Nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy built React files from the build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 8100 for web traffic
EXPOSE 8100

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
 
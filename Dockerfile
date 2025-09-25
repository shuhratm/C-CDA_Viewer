FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Create medical-records directory
RUN mkdir -p /app/medical-records

# Expose port (will be overridden by docker-compose)
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
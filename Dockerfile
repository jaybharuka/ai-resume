# Base image
FROM node:18-bullseye

# Install dependencies for Tectonic and general build tools
RUN apt-get update && apt-get install -y \
    curl \
    libfontconfig1 \
    libgraphite2-dev \
    libharfbuzz-dev \
    libicu-dev \
    libssl-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Tectonic (LaTeX engine)
RUN curl --proto '=https' --tlsv1.2 -fsSL https://drop-sh.fullyjustified.net |sh

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node dependencies
RUN npm install

# Copy source code
COPY . .

# Build the Next.js application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]

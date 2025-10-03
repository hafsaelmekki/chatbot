# Use the official Node.js 20 image with Debian
FROM node:20-slim

# Directory inside the container
WORKDIR /app

# Install system dependencies for sharp and tesseract.js
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      build-essential \
      ca-certificates \
      python3 \
      tesseract-ocr && \
    rm -rf /var/lib/apt/lists/*

# Copy package manifests and install dependencies
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./

RUN if [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm install --frozen-lockfile; \
    elif [ -f yarn.lock ]; then npm install -g yarn && yarn install --frozen-lockfile; \
    else npm install; fi

# Copy the application code
COPY . .

# Build the production bundle
RUN npm run build

# Expose the Next.js port
EXPOSE 3000

# Run the Next.js server
CMD ["npm", "run", "start"]
